# Agentic-preflight y su interacción con ArchSentinel

Última revisión: 2026-11-12. Referencia: copias locales revisadas de ambos
proyectos, con `package.json` en versión 0.3.0.

Esta guía explica el comportamiento **implementado**. Las mejoras propuestas se
identifican expresamente y se siguen en el [roadmap](../ROADMAP.md). Debe
actualizarse en la misma entrega que cambie el funcionamiento descrito.

Para implementar, usar las [unidades de trabajo para IA](roadmap-unidades-ia.md)
y comprobar primero la [auditoría de ramas locales](auditoria-archsentinel.md).
El número 0.3.0 no basta para identificar capacidades: `main` y `develop` de
ArchSentinel declaran esa versión pero no tienen el mismo funcionamiento.

## 1. Resumen

**Agentic-preflight** permite a una persona o a un agente ejecutar los controles
de calidad definidos por un proyecto. Dispone de CLI y servidor MCP. Decide
qué comandos ejecutar a partir de `agentic-preflight.json`, recoge sus resultados
y guarda un informe.

**ArchSentinel** analiza si el código respeta un contrato de arquitectura definido
en `architecture.yaml`. También tiene CLI y MCP. Su base es análisis estático;
puede añadir una revisión semántica mediante un modelo local o remoto compatible.

Son herramientas distintas y complementarias:

| Responsabilidad | Preflight | ArchSentinel |
| --- | --- | --- |
| Ejecutar tests, lint, build y otros comandos del proyecto | Sí | No es su responsabilidad |
| Decidir qué ejecutables puede seleccionar el agente | Desde la configuración del proyecto | No sustituye esa configuración |
| Detectar dependencias de capas e imports prohibidos | Solo si ejecuta una herramienta que lo haga | Sí |
| Detectar ciclos y métricas de código | Solo mediante checks externos | Sí |
| Revisar responsabilidades con IA | No incorpora un modelo propio | Opcional |
| Guardar el último informe de los checks | Sí | Su CLI/MCP devuelve su propio resultado |

**Estado de la integración:** preflight puede ejecutar la CLI de ArchSentinel
como cualquier otro comando permitido. No incorpora todavía un cliente de su
MCP ni una fusión estructurada de los dos informes. La configuración reproducible
y verificada de ese recorrido es la entrega F1 del roadmap; el puente MCP es F2.

## 2. Qué significa un aprobado

En preflight significa que todos los checks seleccionados han terminado con
código de salida cero y sin timeout. La calidad de esa señal depende de los
comandos configurados y de lo que realmente comprueben.

No acredita por sí solo cobertura suficiente, ausencia de errores funcionales,
cumplimiento de toda la arquitectura ni ejecución de todos los checks posibles.
Una ejecución de un subconjunto solo informa de ese subconjunto.

En ArchSentinel significa que los hallazgos del alcance analizado cumplen la
política `quality_gate`. Puede haber hallazgos permitidos por esa política: un
`PASS` no significa necesariamente cero hallazgos.

Ninguna de las dos herramientas obliga al agente a invocarla. Para bloquear una
integración hay que ejecutar los controles requeridos desde CI y configurar la
política de integración del repositorio. Una skill orienta al agente, no impone
por sí sola ese bloqueo.

## 3. Configuración y ejecución de preflight

### Instalación desde una copia local

Requiere Node.js 20 o posterior y las herramientas de los checks configurados.
Desde el repositorio de preflight:

```bash
npm install
npm run build
node dist/cli.js --help
```

Para analizar otro proyecto con esa copia ya compilada:

```bash
AGENTIC_PREFLIGHT_ROOT="/ruta/absoluta/al/proyecto" \
  node /ruta/absoluta/a/agentic-preflight/dist/cli.js init

AGENTIC_PREFLIGHT_ROOT="/ruta/absoluta/al/proyecto" \
  node /ruta/absoluta/a/agentic-preflight/dist/cli.js check
```

Las rutas son ejemplos y deben sustituirse. Sin `AGENTIC_PREFLIGHT_ROOT`, se usa
el directorio de trabajo del proceso. `init` no sobrescribe una configuración
existente.

### Archivo `agentic-preflight.json`

Ejemplo para un proyecto npm que ya tenga los scripts `test` y `typecheck`:

```json
{
  "version": 1,
  "checks": {
    "test": {
      "command": "npm",
      "args": ["run", "test"],
      "description": "Ejecutar las pruebas"
    },
    "typecheck": {
      "command": "npm",
      "args": ["run", "typecheck"],
      "description": "Comprobar tipos",
      "timeoutMs": 120000
    }
  },
  "security": {
    "allowedExecutables": ["npm"],
    "maxTimeoutMs": 300000
  }
}
```

Cada check define un ejecutable y sus argumentos. El ejecutable debe estar en
`allowedExecutables`. `maxTimeoutMs` es obligatorio y no puede superar 30 minutos;
un timeout individual no puede superar ese máximo. No hay actualmente un campo
especial `archsentinel`, un bloque de configuración LLM ni un tipo de check MCP.

### Qué descubre `init`

1. Si encuentra `pom.xml`, genera checks Maven con `./mvnw` si existe o `mvn`.
   El check `test` ejecuta `test`; `verify` ejecuta `verify -DskipTests`.
2. En Node detecta npm, pnpm o Yarn y scripts presentes para tests, lint, tipos,
   build, formato, integración y end-to-end. pnpm/Yarn se invocan mediante Corepack.
3. Si no reconoce checks compatibles, configura `git status --short`.

El último caso solo comprueba que Git puede inspeccionar el proyecto. No ejecuta
pruebas ni falla por el mero hecho de que haya archivos modificados.

### CLI pública actual

| Comando | Resultado |
| --- | --- |
| `init` | Crea la configuración inicial. |
| `check` | Ejecuta todos los checks configurados. |
| `check test typecheck` | Ejecuta los checks seleccionados en ese orden. |
| `test` | Ejecuta el check llamado exactamente `test`. |
| `report` | Muestra el último informe guardado. |
| `mcp` | Inicia el servidor MCP stdio. |

Los checks se ejecutan secuencialmente. Un resultado fallido de un proceso no
impide intentar el siguiente; un error técnico que lance una excepción puede
interrumpir el recorrido y evitar guardar un nuevo informe.

## 4. Uso de preflight desde un agente mediante MCP

Ejemplo de configuración de cliente con una copia local compilada:

```json
{
  "mcpServers": {
    "agentic-preflight": {
      "command": "node",
      "args": ["/ruta/absoluta/a/agentic-preflight/dist/cli.js", "mcp"],
      "env": {
        "AGENTIC_PREFLIGHT_ROOT": "/ruta/absoluta/al/proyecto"
      }
    }
  }
}
```

La sintaxis exterior de configuración depende del cliente. El protocolo del
servidor usa stdio; los argumentos de las herramientas actuales son:

| Herramienta | Entrada | Función |
| --- | --- | --- |
| `list_checks` | `{}` | Lista nombres, descripciones, ejecutables y argumentos. |
| `run_check` | `{"name":"test"}` | Ejecuta un check y persiste el informe. |
| `run_preflight` | `{}` o `{"checks":["test","typecheck"]}` | Ejecuta todos o el subconjunto seleccionado. |
| `latest_report` | `{}` | Lee el informe persistido más reciente. |

Una lista `checks` vacía ejecuta todos los checks, igual que omitirla. El agente
no aporta comandos arbitrarios a través de estas herramientas.

En `run_check` y `run_preflight`, un informe con `passed: false` se devuelve con
`isError: true`. Los errores técnicos también usan `isError: true`, pero pueden
devolver un mensaje sin informe estructurado. Este contrato difiere del MCP de
ArchSentinel, descrito en la sección 9.

Las skills `generate-tests`, `review-changes` y `preflight-pr` contienen
instrucciones reutilizables para el agente. Deben copiarse o referenciarse desde
su configuración; no se ejecutan automáticamente ni son el prompt de ArchSentinel.

## 5. Informes y límites de ejecución

El último informe se guarda en `.agentic-preflight/latest-report.json`, dentro
del proyecto analizado. Incluye versión, raíz, fechas, `passed` y resultados por
check con nombre, estado, exit code, duración, stdout y stderr.

- Estados por check: `passed`, `failed` o `timed_out`.
- Se conserva únicamente el último informe en esa ruta; no hay historial integrado.
- Leer `report` no vuelve a ejecutar nada ni prueba que el código siga igual.
- `report` muestra el contenido guardado; no es el comando para imponer un gate
  en CI. Para ello debe usarse `check`, cuyo resultado fallido fija salida 1.
- La salida capturada se limita por flujo; el runner marca el truncamiento al
  alcanzar aproximadamente 200.000 caracteres. Un JSON externo grande puede
  quedar incompleto dentro de stdout.
- Los comandos reciben `CI=true` salvo que ya exista un valor de `CI`.

Los procesos se lanzan sin shell. Esto evita interpolar tuberías y redirecciones
en la llamada del runner, pero no es un sandbox: los comandos y scripts permitidos
siguen siendo código de confianza del proyecto y heredan el entorno del proceso.

## 6. Funcionamiento de ArchSentinel

El código está en el repositorio independiente
[Snake12Doc/ArchSentinel](https://github.com/Snake12Doc/ArchSentinel).
Los detalles de instalación y soporte por versión se mantienen allí.

### Qué revisión contiene cada capacidad

La [auditoría local](auditoria-archsentinel.md) distingue estas revisiones:

- `main` en `ba2d2d9`: CLI/MCP, TypeScript/Python, reglas de capas, ciclos y métricas.
- `develop` en `fd5cba7`: añade alcance Git y revisión semántica OpenAI-compatible.
- Árbol local de `feature/vue-frontend-analysis`: contiene además el analizador
  Vue y su registro CLI/MCP sin commit. Los hooks de extensión TS ya están en develop.

Las secciones sobre Git e IA de esta guía describen `develop` y el árbol local
revisado, **no** las capacidades de `main` estable. Las referencias `origin/*`
se han inspeccionado localmente, sin actualizar ni comprobar el servidor GitHub.
Antes de integrar hay que elegir una revisión que incluya la capacidad requerida.

### Contrato de arquitectura

`architecture.yaml` define capas, rutas de archivos, dependencias permitidas,
imports externos prohibidos, umbrales de métricas y política de aprobación.
Su esquema actual solo acepta el estilo `hexagonal`, aunque las capas y sus
nombres se pueden personalizar.

Ejemplo de contrato completo compatible con el esquema revisado:

```yaml
version: 1
architecture:
  style: hexagonal
  layers:
    domain:
      paths: [src/domain/**]
      can_depend_on: []
    application:
      paths: [src/application/**]
      can_depend_on: [domain]
    infrastructure:
      paths: [src/infrastructure/**]
      can_depend_on: [domain, application]
rules:
  domain:
    forbidden_imports: [express, typeorm]
clean_code:
  excluded_paths: [test/**, tests/**]
  max_method_lines: { warning: 30, error: 60 }
  max_class_lines: { warning: 200, error: 300 }
  max_parameters: { warning: 4, error: 6 }
  max_cyclomatic_complexity: { warning: 10, error: 20 }
quality_gate:
  fail_on: [CRITICAL]
  max_major: 3
  semantic_confidence_threshold: 0.8
```

Con ese contrato, un archivo de dominio que importe uno de infraestructura
produce una infracción crítica. Las dependencias dentro de una misma capa se
permiten. Los archivos sin capa siguen en el grafo de ciclos, pero no generan
automáticamente infracciones de política entre capas.

### Análisis estático y hallazgos

| Regla | Qué detecta |
| --- | --- |
| `HEX-001` | Dependencia directa entre capas no permitida. |
| `HEX-002` | Import externo prohibido en una capa. |
| `DEP-001` | Ciclo de dependencias entre archivos. |
| `MAP-001` | Un archivo coincide con varias capas. |
| `CC-001` a `CC-004` | Exceso de parámetros, líneas de callable, líneas de clase o complejidad. |
| `SEM-001` | Responsabilidad mal ubicada propuesta por el modelo, si se habilita IA. |

El gate falla si hay una severidad incluida en `fail_on` o si los hallazgos
`MAJOR` superan `max_major`. Los ciclos son `MAJOR`; no todo ciclo hace fallar
necesariamente cualquier política configurada.

Límites actuales relevantes:

- Grafo de imports entre archivos, no grafo general de llamadas en ejecución.
- Políticas de dependencias directas, sin inferencia general de violaciones transitivas.
- No hay todavía reglas generales entre clases concretas, especialmente dentro
  de un mismo archivo.
- TypeScript analiza imports estáticos y re-exports; no `require()` ni `import()` dinámico.
- Python usa AST sin ejecutar los módulos del proyecto; no analiza imports dinámicos.
- TypeScript y Python están implementados. Vue aparece en la copia local revisada,
  con cambios sin commit: confirmar que la versión instalada lo contiene.

### Selección por Git

`--changed` selecciona hallazgos relacionados con cambios respecto a `HEAD`.
`--base <ref>` usa el merge base con la referencia y también activa alcance por
cambios. Se analiza el proyecto completo y después se filtran hallazgos; no es
un análisis exclusivo de líneas del diff ni una baseline de infracciones nuevas.

Los cambios del contrato pueden ampliar el alcance a todo el proyecto; en
TypeScript, cambios JSON también lo amplían de forma conservadora. Errores de
sintaxis, resolución o configuración no desaparecen por estar fuera del diff.

## 7. Revisión semántica: cómo usa la IA

No sustituye las reglas estáticas. El flujo actual es:

```text
Contrato + código → análisis estático → hallazgos deterministas
                                      ↓
                       revisión semántica, si se solicita
                                      ↓
                     combinación de hallazgos → quality gate
```

Se activa con `--semantic` en CLI o `semantic: true` en MCP. Se envían el contrato,
lenguaje, contenidos de archivos seleccionados, capas, imports y hallazgos
deterministas relevantes. Solo se revisan archivos asignados inequívocamente a
una capa y no excluidos; el alcance Git también limita los archivos enviados.

Hay un prompt interno que pide responsabilidades concretas mal ubicadas, evidencia
textual y respuesta JSON. No pide inventar requisitos ni repetir infracciones
estáticas. El adaptador valida rutas, líneas y evidencia y filtra propuestas por
`semantic_confidence_threshold`. El modelo no puede borrar los hallazgos estáticos.

### Configuración del proveedor

| Variable | Uso / valor por defecto |
| --- | --- |
| `ARCHSENTINEL_LLM_MODEL` | Modelo requerido si se realiza una petición. |
| `ARCHSENTINEL_LLM_BASE_URL` | API compatible con OpenAI; por defecto `https://api.openai.com/v1`. |
| `ARCHSENTINEL_LLM_API_KEY` | Obligatoria para el endpoint de OpenAI; opcional para endpoints propios. |
| `ARCHSENTINEL_LLM_TIMEOUT_MS` | Timeout de petición/lectura; 60.000 ms. |
| `ARCHSENTINEL_LLM_MAX_INPUT_BYTES` | Límite del cuerpo completo de petición; 262.144 bytes. |

El endpoint debe aceptar Chat Completions y `response_format: json_object`.
Un servidor local compatible puede usarse con una base como
`http://localhost:11434/v1`; ArchSentinel no instala ni inicia el modelo.

No hay búsqueda web de reglas, recuperación semántica avanzada ni división
automática del contexto en varias peticiones. Un exceso del límite de entrada
es un error, no un truncamiento silencioso. Las respuestas también tienen límites
de tamaño y número de propuestas.

**Comportamiento ante fallo:** si se solicita IA y falla conexión, timeout,
validación o tamaño, el check devuelve error. Aunque el análisis estático ya se
haya calculado, no se devuelve automáticamente como un informe final de respaldo.
La política de continuidad está pendiente en F3. Sin `--semantic` no se necesita
el modelo. Si no hay archivos elegibles, se omite la petición.

La confianza declarada por el modelo no es una probabilidad calibrada de acierto.
Las pruebas de transporte y validación no demuestran su precisión arquitectónica;
la evaluación real de modelos está prevista en F7.

## 8. Interacción actual: ejecutar la CLI desde preflight

El runner existente puede ejecutar ArchSentinel como un check. Ejemplo de
configuración **manual**, con rutas a adaptar, no un asistente de integración
ya incorporado. Requiere ambos proyectos instalados, ArchSentinel compilado y un
`architecture.yaml` válido en el proyecto objetivo:

```json
{
  "version": 1,
  "checks": {
    "test": {
      "command": "npm",
      "args": ["run", "test"]
    },
    "architecture": {
      "command": "node",
      "args": [
        "/ruta/absoluta/a/ArchSentinel/dist/cli.js",
        "check",
        "--language",
        "typescript",
        "--format",
        "json"
      ],
      "description": "Comprobar arquitectura con ArchSentinel"
    }
  },
  "security": {
    "allowedExecutables": ["npm", "node"],
    "maxTimeoutMs": 300000
  }
}
```

Preflight usa la raíz del proyecto como directorio de trabajo. ArchSentinel
encuentra allí el contrato y el código. Las variables del proveedor se heredan
del proceso si se añade `--semantic` a los argumentos configurados.

```text
Persona o agente
    ↓ CLI/MCP de preflight
Check architecture
    ↓ proceso node + CLI de ArchSentinel
Contrato + código + revisión IA opcional
    ↓ exit code y salida
Informe genérico de preflight
```

| Resultado de ArchSentinel CLI | Tratamiento actual en preflight |
| --- | --- |
| Exit 0: gate aprobado | Check `passed`. |
| Exit 1: gate fallido | Check `failed`. |
| Exit 2: error técnico/configuración/análisis | Check `failed`, distinguible por `exitCode` y salida. |
| Tiempo máximo excedido | Check `timed_out`. |

El JSON de ArchSentinel queda como texto de stdout; los errores JSON de su CLI
se escriben en stderr. Preflight no interpreta todavía esos objetos como
hallazgos propios. F1 añadirá un ejemplo autocontenido y validación conjunta de
este recorrido; F2 sustituirá esa limitación con la integración estructurada.

## 9. Interacción MCP: actual y prevista

### Disponible hoy: dos servidores independientes

El agente puede configurar ambos servidores y llamar a cada uno. ArchSentinel
expone `archsentinel_list_languages`, `archsentinel_check` y `archsentinel_init`.
El check admite `project_root`, `language`, `changed`, `base` y `semantic`.

Ese conjunto de argumentos corresponde a `develop` auditado. En el `main`
`ba2d2d9`, el check solo admite `project_root` y `language`; no enviarle las opciones
Git/IA como si las aceptara. Verificar capacidades antes de usar el proxy previsto.

**Diferencia importante:** en el MCP de ArchSentinel, `status: FAIL` es una
respuesta válida de la herramienta y no implica `isError: true`. Un consumidor
debe leer el estado del informe, no solo el indicador técnico MCP.

### Previsto en F2: un único punto de entrada

```text
Agente → MCP de preflight → cliente MCP interno → MCP de ArchSentinel
                    ↓
          Informe conjunto estructurado
```

Ese cliente, sus opciones, las nuevas herramientas y el esquema del informe
todavía no existen. Sus nombres definitivos se decidirán durante F2. Los ejemplos
de esta guía no deben incorporar campos o nombres propuestos como si ya fueran
compatibles.

## 10. Qué queda por implementar

El detalle y la aceptación están en el [roadmap](../ROADMAP.md):

- F1–F2: recorrido conjunto verificado y puente MCP nativo.
- F3: estados semánticos incompletos y política ante fallo del modelo.
- F4: perfiles arquitectónicos adicionales y reglas explícitas.
- F5: restricciones entre clases/símbolos.
- F6: contexto y peticiones múltiples para proyectos grandes.
- F7: evaluación de modelos locales y remotos con resultados medidos.
- F8: documentación externa convertida en propuestas trazables de contrato.
- F9: compatibilidad, validación e instrucciones de entrega conjunta.

Un monolito puede ser hexagonal. Los futuros perfiles deben declarar restricciones
concretas, no deducir la validez de un proyecto únicamente por su etiqueta.

## 11. Mantenimiento de esta guía

El flujo de contribución está en [CONTRIBUTING.md](../CONTRIBUTING.md) y sigue
Git Flow, igual que ArchSentinel: `feature/*` desde `develop`, PR a `develop`,
release desde develop a main y posterior sincronización con develop. Una rama
agrupa una entrega revisable, que puede contener varias unidades del roadmap.
Completar una casilla no equivale a haber integrado un PR. Los commits, la
publicación de ramas y los PR se realizan con petición expresa.

Actualizar este documento cuando cambien comandos, herramientas MCP, configuración,
formatos de informe, estados, políticas de fallo, reglas, lenguajes, contexto del
modelo o integración entre proyectos. En cada entrega:

1. Identificar qué sección queda afectada.
2. Describir el comportamiento ejecutable, con sus prerrequisitos y límites.
3. Actualizar ejemplos si cambian contratos o argumentos.
4. Verificar el recorrido relevante y registrar su resultado en el roadmap.
5. Marcar solo las tareas completadas y actualizar la fecha de revisión.

Para el seguimiento, marcar primero la unidad hoja del catálogo y después su
entrega padre únicamente cuando estén verificadas todas sus unidades. Conservar
en la auditoría la distinción entre estable, develop y cambios locales.

Si el cambio está en ArchSentinel, actualizar también su documentación propia y
contrastar versiones antes de anunciarlo aquí como disponible. Las instrucciones
de este repositorio están en [AGENTS.md](../AGENTS.md); mantener los documentos
requiere que las personas/agentes sigan ese flujo, no hay sincronización automática
entre repositorios.

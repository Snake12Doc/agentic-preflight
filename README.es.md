# agentic-preflight

[English](README.md) | **Español**

Controles de calidad locales para agentes de programación con IA, disponibles
tanto mediante una CLI como a través de un servidor MCP.

`agentic-preflight` permite al responsable de un proyecto definir exactamente
qué pruebas, compilaciones, análisis estáticos y comprobaciones de formato puede
ejecutar un agente. Los agentes seleccionan las comprobaciones por nombre y
nunca proporcionan comandos de shell arbitrarios.

## Motivación

El desarrollo asistido por IA es más rápido cuando los resultados llegan antes
de abrir una pull request, pero la velocidad no debería exigir que se omitan
controles de calidad deterministas. Este proyecto permite a los agentes
descubrir y ejecutar las comprobaciones existentes de un proyecto, mientras la
selección de comandos permanece bajo el control del repositorio.

## Características

- CLI para inicializar, ejecutar y consultar las comprobaciones del proyecto.
- Servidor MCP con cuatro herramientas específicas.
- Lista de ejecutables permitidos, tiempos de espera limitados y sin
  interpolación de shell.
- Informes JSON persistentes para su revisión por agentes y personas.
- Configuración inicial automática para proyectos Maven, npm, pnpm y Yarn.
- Skills reutilizables para generar pruebas, revisar código y comprobar pull
  requests.
- Ejemplo completo con Spring Boot.

## Requisitos

- Node.js 20 o posterior.
- Las herramientas de compilación requeridas por las comprobaciones configuradas.

## Inicio rápido

```bash
npm install --save-dev agentic-preflight
npx agentic-preflight init
npx agentic-preflight check
```

Hasta que el paquete esté publicado, clona el repositorio y utiliza la
compilación local:

```bash
npm install
npm run build
node dist/cli.js --help
```

## Configuración

`agentic-preflight init` crea `agentic-preflight.json` en el proyecto actual.
Una configuración para Maven puede tener este aspecto:

En proyectos Node.js, la inicialización detecta los scripts de pruebas, lint,
tipos, build, formato, integración y end-to-end cuando están presentes.

```json
{
  "version": 1,
  "checks": {
    "test": {
      "command": "./mvnw",
      "args": ["test"],
      "description": "Run unit and integration tests",
      "timeoutMs": 300000
    },
    "quality": {
      "command": "./mvnw",
      "args": ["verify", "-Pquality"],
      "description": "Run static analysis and quality rules"
    }
  },
  "security": {
    "allowedExecutables": ["./mvnw"],
    "maxTimeoutMs": 300000
  }
}
```

Los comandos se ejecutan directamente, sin un shell. Por diseño, no se admiten
funciones como tuberías, redirecciones, sustitución de comandos o `sh -c`.
Las comprobaciones reciben `CI=true` por defecto para evitar preguntas
interactivas; se conserva cualquier valor existente de la variable `CI`.

## CLI

```text
agentic-preflight init               Crea una configuración inicial
agentic-preflight check              Ejecuta todas las comprobaciones configuradas
agentic-preflight check test quality Ejecuta en orden las comprobaciones seleccionadas
agentic-preflight test               Ejecuta la comprobación llamada "test"
agentic-preflight report             Muestra el último informe guardado
agentic-preflight mcp                Inicia el servidor MCP mediante stdio
```

Define `AGENTIC_PREFLIGHT_ROOT` cuando el cliente MCP inicie el servidor desde
un directorio diferente.

## Servidor MCP

Ejemplo de configuración del cliente después de instalar el paquete:

```json
{
  "mcpServers": {
    "agentic-preflight": {
      "command": "npx",
      "args": ["-y", "agentic-preflight", "mcp"],
      "env": {
        "AGENTIC_PREFLIGHT_ROOT": "/absolute/path/to/project"
      }
    }
  }
}
```

Para utilizar una copia local, sustituye `npx` por `node` y proporciona la ruta
absoluta a `dist/cli.js` antes del argumento `mcp`.

### Herramientas

| Herramienta | Propósito |
| --- | --- |
| `list_checks` | Enumera las comprobaciones que puede ejecutar un agente. |
| `run_check` | Ejecuta una comprobación por su nombre y guarda el informe. |
| `run_preflight` | Ejecuta todas las comprobaciones o un subconjunto seleccionado. |
| `latest_report` | Lee el informe persistente más reciente. |

## Skills

El directorio `skills` contiene flujos de trabajo independientes del proveedor:

- `generate-tests` crea pruebas específicas y las verifica.
- `review-changes` revisa un diff y ejecuta controles deterministas.
- `preflight-pr` confirma que los cambios están listos antes de abrir una pull
  request.

Copia o referencia estas skills desde la configuración del agente que utilice
tu proyecto. Solo dependen de las herramientas MCP documentadas anteriormente.

## Ejemplo con Spring Boot

```bash
npm run build
AGENTIC_PREFLIGHT_ROOT="$PWD/examples/spring-boot-demo" \
  node dist/cli.js check
```

El ejemplo muestra comprobaciones de pruebas y empaquetado con Maven sin
necesidad de utilizar código privado de una aplicación.

## Fixture de arquitectura TypeScript

`examples/archsentinel-demo` contiene un caso de uso mínimo de pedidos. La capa
de aplicación depende de dominio; dominio no admite dependencias de otras
capas. El contrato `architecture.yaml` declara esas fronteras y límites de calidad.

Prepara el ejemplo con Node.js 20 o posterior, Git y pnpm 10.27.0 disponibles.
Clonar ArchSentinel requiere acceso al repositorio y credenciales SSH de GitHub operativas.
Desde la raíz de preflight, elige un destino absoluto nuevo fuera de este clon,
cuyo directorio padre ya exista (shell POSIX):

```bash
npm ci
npm run build

export ARCHSENTINEL_ROOT="/absolute/path/to/new/ArchSentinel-f1"
git clone --no-checkout git@github.com:Snake12Doc/ArchSentinel.git "$ARCHSENTINEL_ROOT"
git -C "$ARCHSENTINEL_ROOT" checkout --detach ba2d2d92d45c69cbedb780b7faecf35c26a8ebf9
pnpm --dir "$ARCHSENTINEL_ROOT" install --frozen-lockfile
pnpm --dir "$ARCHSENTINEL_ROOT" build
export ARCHSENTINEL_CLI="$ARCHSENTINEL_ROOT/dist/cli.js"
```

Así se fija ArchSentinel 0.3.0 por commit y se compila por separado, conservando
cualquier trabajo existente en ArchSentinel. Provisiona pnpm antes de empezar;
Node.js no siempre incluye Corepack. Solo la preparación necesita descargas.

Para comprobar arquitectura directamente, ejecuta desde
`examples/archsentinel-demo` usando la ruta absoluta exportada:

```bash
node "$ARCHSENTINEL_CLI" check --language typescript --format json
```

El fixture válido produce `status: "PASS"` sin hallazgos. La comprobación se
ejecuta directamente con ArchSentinel y dependencias ya instaladas. Para comprobar
los tipos del fixture desde la raíz de preflight después de `npm ci`:

```bash
node node_modules/typescript/bin/tsc --project examples/archsentinel-demo/tsconfig.json
```

El fixture también define los checks `test`, `typecheck` y `architecture` de
preflight. Después de instalar las dependencias de la raíz y compilar preflight,
ejecuta los tres desde la raíz del repositorio (shell POSIX):

```bash
AGENTIC_PREFLIGHT_ROOT="$PWD/examples/archsentinel-demo" \
  node dist/cli.js check
```

`ARCHSENTINEL_CLI` la lee el script auxiliar del ejemplo; preflight no interpola
esa variable. Debe apuntar a la CLI compilada por separado indicada arriba. El
script invoca Node sin shell y conserva el código de salida de la CLI de
arquitectura. La configuración no contiene rutas personales y utiliza las
dependencias TypeScript/tsx de la raíz: el ejemplo se ejecuta dentro de este clon.
No se descargan paquetes durante los checks. El informe se guarda en
`.agentic-preflight/latest-report.json` dentro del ejemplo.

### Resultados e informes

La CLI tiene dos niveles de códigos de salida: `check` de preflight devuelve `0`
si todos los checks seleccionados pasan y `1` en caso contrario; cada entrada de
`results[]` conserva el `exitCode` del proceso externo. Estos resultados se han
verificado con el ejemplo y la CLI de ArchSentinel fijada arriba:

| Escenario | `status` del check | `exitCode` del proceso | Ubicación del diagnóstico | Exit de `check` de preflight | Último informe |
| --- | --- | --- | --- | --- | --- |
| Arquitectura válida | `passed` | `0` | stdout del check: JSON `PASS` | `0` | Nuevo, `passed: true` |
| Dependencia entre capas prohibida | `failed` | `1` | stdout del check: JSON `FAIL` con `HEX-001` | `1` | Nuevo, `passed: false` |
| Contrato de arquitectura inválido | `failed` | `2` | stderr del check: JSON `ERROR` de tipo `configuration` | `1` | Nuevo, `passed: false` |
| Ejecutable no arranca, sin informe previo | Sin resultado nuevo | — | stderr de la CLI preflight: `Unable to run … ENOENT` | `1` | Ausente |
| Ejecutable no arranca, con informe previo | Sin resultado nuevo | — | stderr de la CLI preflight: `Unable to run … ENOENT` | `1` | Se conserva el anterior |
| Timeout del check externo | `timed_out` | `null` en la captura POSIX | Salida parcial en stdout/stderr del check | `1` | Nuevo, `passed: false` |

Aquí, stdout/stderr del check son las cadenas guardadas en el informe, no los
streams de la propia CLI de preflight. Preflight escribe resúmenes legibles en su
stdout y, para un check no aprobado, muestra además su stderr o, si está vacío,
su stdout. Por eso el JSON del contrato inválido se guarda en **stderr del check**
pero se muestra en **stdout de la CLI preflight**. La salida de los checks aprobados
queda en el informe. El stdout de preflight no es un informe JSON y el JSON
arquitectónico sigue siendo una cadena dentro del resultado genérico del check.

`timed_out` identifica el timeout: el código del proceso puede ser null o variar
según plataforma y forma de terminación. La captura de timeout usa un proceso
controlado, no una revisión de ArchSentinel completada; la salida parcial no tiene
por qué ser JSON. Los checks restantes continúan. En POSIX, el runner envía SIGTERM
al grupo y programa SIGKILL 500 ms después aunque el proceso inmediato termine
antes. Windows utiliza `taskkill /t /f`.

Una excepción al iniciar el ejecutable aborta antes de guardar un informe nuevo;
— indica que no existe resultado del proceso, no un exitCode null registrado. Un
informe anterior puede seguir describiendo una ejecución antigua aprobada. Revisa
`startedAt`, `finishedAt` y los resultados seleccionados al leer
`.agentic-preflight/latest-report.json`. El comando `report` solo muestra el
informe guardado y devuelve `0` si puede leerlo, incluso con `passed: false`;
utiliza `check`, no `report`, como gate de CI.

Los significados JSON `PASS`/`FAIL`/`ERROR` anteriores pertenecen a ArchSentinel en
modo JSON. Preflight no interpreta el código `2` como una categoría universal de
error para todas las herramientas: otros comandos o fallos del script auxiliar
pueden devolver diagnósticos de texto plano.

## Modelo de seguridad

- Los argumentos MCP pueden seleccionar comprobaciones por nombre, pero no
  ejecutables ni argumentos.
- Cada ejecutable configurado debe aparecer en una lista explícita de
  ejecutables permitidos.
- Las rutas relativas y los enlaces simbólicos no pueden escapar de la raíz del
  proyecto; las rutas absolutas deben estar permitidas explícitamente.
- Los procesos secundarios se ejecutan sin un shell y con un tiempo de espera
  máximo configurable.
- Los errores de las herramientas se depuran y la salida estándar se reserva
  para el protocolo MCP.

La configuración del repositorio continúa considerándose código de confianza.
Revisa los cambios en `agentic-preflight.json` antes de ejecutar comprobaciones
procedentes de una rama que no sea de confianza.

## Desarrollo

Sigue las [instrucciones de contribución](AGENTS.md#ramas-y-contribución) para usar el mismo Git Flow que
ArchSentinel: el trabajo planificado parte de `develop` en ramas `feature/*`
y vuelve a `develop` mediante PR. `main` mantiene la línea estable de producción.

Una rama puede agrupar varias unidades relacionadas que formen una entrega
revisable. Las releases parten de `develop` y se integran en `main`; los hotfixes
parten de `main`. Ambos se sincronizan después con `develop`. CI valida las rutas
de los PR. GitHub borra automáticamente las ramas de origen tras fusionar los PR;
las ramas release/hotfix se conservan hasta ambas integraciones siguiendo AGENTS.
Los roadmaps y notas de trabajo se conservan solo en local y se excluyen del
control de versiones.

```bash
npm install
npm run check
```

El conjunto de pruebas cubre la validación de la configuración, los resultados
correctos, los errores, los tiempos de espera y un recorrido completo entre un
cliente y un servidor MCP reales mediante stdio.

Las pruebas de integración con la CLI externa de ArchSentinel son opt-in. Para
incluirlas, indica la ruta absoluta a la CLI compilada por separado descrita arriba:

```bash
ARCHSENTINEL_CLI="$ARCHSENTINEL_ROOT/dist/cli.js" npm run check
```

Estas pruebas copian el ejemplo a directorios temporales y comprueban un proyecto
válido y otro con una dependencia prohibida de dominio a infraestructura. En el
segundo caso, los tests funcionales y los tipos pasan, pero el gate arquitectónico
falla. Sin `ARCHSENTINEL_CLI`, se omiten estos casos de integración; la suite
habitual sigue sin necesitar una instalación de ArchSentinel. Una ruta configurada
inválida hace fallar la preparación.

La suite también comprueba contratos de arquitectura inválidos. La
[matriz de resultados](#resultados-e-informes) detalla códigos, streams e informes.
Las pruebas de lanzamiento fallido y timeout usan procesos controlados y se
ejecutan sin ArchSentinel instalado; incluyen la conservación del informe anterior
y la comprobación del arranque y terminación de los procesos.

## Licencia

MIT

# Unidades de trabajo para una IA

Última revisión: 2026-11-12. Parte ejecutable del [roadmap](../ROADMAP.md).
Punto de partida: [auditoría local](auditoria-archsentinel.md).

## Contrato de una sesión

Las fases y entregas padre del roadmap se conservan. **Solo las casillas de las
tablas de este documento son unidades de ejecución**; `F2.3.1` pertenece a F2.3.
F0.1–F0.6 ya documentan su propio trabajo. No se presupone que implementar una fase entera
quepa en una sesión.

Cada fila fija dependencias, cambio, aceptación y verificación. Se aplica además:

1. Comprobar que las dependencias están completadas. Una dependencia padre
   significa todas sus hojas más la aceptación de la entrega. `—` no elimina
   la obligación de leer instrucciones, guía y auditoría.
2. Revalidar código y ramas antes de tocar nada. Si la capacidad ya existe,
   verificarla y registrar reutilización; no implementarla de nuevo.
3. Modificar un comportamiento principal por sesión, con sus pruebas pertinentes.
   Las tareas de contrato/documentación terminan en un documento concreto, sin
   añadir código ni opciones públicas aún no implementadas.
4. Una fila de implementación incluye sus pruebas y la actualización de la guía
   si cambia comportamiento público. Las filas documentales finales comprueban
   coherencia global, no permiten posponer toda la documentación hasta el final.
5. Trabajar en el repositorio indicado. «P» = preflight; «A» = ArchSentinel.
   Los directorios propuestos nuevos se crean dentro de su estructura actual.
6. Si al entrar aparecen decisiones abiertas que alteran la aceptación, preguntar
   al usuario y registrar el bloqueo. No adivinar proveedor, credenciales,
   presupuesto de ejecución real ni política de aprobación.
7. Si la fila exige varios cambios independientes o no puede verificarse en una
   sesión, dividirla **antes** de implementarla, conservando su ID como padre.
   El tamaño es un objetivo operativo, no una garantía de tiempo del modelo.
8. Cerrar con: ID, archivos, resultado, verificación ejecutada, límites y siguiente
   unidad desbloqueada. Actualizar casilla e historial del roadmap.

Estado inicial: las unidades funcionales F1–F9 están pendientes. La auditoría no
equivale a completar sus integraciones.

## Verificación y localización

En las tablas, `D` significa revisión del entregable y contraste con el código,
sin pruebas nuevas que repitan documentación. `R` significa recorrido real con
los procesos/versiones indicados y resultados registrados.

Para pruebas se usa el prefijo del repositorio y una ruta relativa:

- `P:<ruta>`: `npm exec vitest run -- <ruta>` desde preflight.
- `A:<ruta>`: `pnpm exec vitest run <ruta>` desde ArchSentinel.
- Las rutas de prueba que aún no existen son **destinos a crear**, no comandos
  anunciados como disponibles hoy. Añadir las pruebas en ese archivo o, si el
  diseño aprobado cambia su ubicación, actualizar esta fila antes de trabajar.
- Al cambiar tipos: ejecutar también `npm run typecheck` (P) o `pnpm typecheck` (A).
- Cierre funcional P: `npm run check`. Cierre funcional A: checks de
  `CONTRIBUTING.md`, incluido `pnpm preflight`; registrar por separado los checks
  que necesiten binarios compilados, MCP o empaquetado.

Las dependencias usan IDs estables, no números de sesión. El orden de filas es
de lectura: ejecutar solo hojas desbloqueadas. Las extensiones EXT no bloquean F9.

## F0.7 — Adopción del Git Flow de ArchSentinel

Repositorio P. Entrega solicitada por el usuario antes de continuar F1.1.1.
Reutilizar la política de ArchSentinel, adaptando los checks a npm y conservando
las plataformas ya verificadas por preflight.

| Unidad | Depende de | Cambio acotado y aceptación | Verificación |
| --- | --- | --- | --- |
| [x] F0.7.1 | F0.6 | Documentar rutas feature/release/hotfix, agrupación de unidades por entrega y plantilla PR. Actualizar instrucciones de agentes y guía. | D contra CONTRIBUTING de ArchSentinel y scripts reales de P. |
| [x] F0.7.2 | F0.7.1 | Crear develop local desde main y una feature desde develop, conservando cambios existentes. No publicar ni crear commits/PR. | `git branch -avv`, estado y SHA de las bases. |
| [x] F0.7.3 | F0.7.1 | Añadir job Git Flow con las mismas rutas y eventos de PR que ArchSentinel. Conservar los jobs npm/Windows/Maven. Probar rutas admitidas y rechazadas ejecutando el script real. | P:test/git-flow-workflow.test.ts (nuevo). |
| [x] F0.7.4 | F0.7.2, F0.7.3 | Ejecutar check completo, registrar ramas locales frente a referencias remotas y actualizar estado del roadmap. | `npm run check`, revisión documental y `git diff --check`. |

## F1 — Recorrido CLI

Repositorio P. Zonas: `examples/archsentinel-demo/` (nuevo), `test/architecture-cli.test.ts`
(nuevo), guía. Reutilizar `src/runner.ts`; no crear otro ejecutor ni parser AST.

| Unidad | Depende de | Cambio acotado y aceptación | Verificación |
| --- | --- | --- | --- |
| [ ] F1.1.1 | F0.6, F0.7 | Registrar SHA/base de ArchSentinel a usar, herramientas y pasos de build. Diferenciar estático estable de semántico en develop y Vue local. Entregable: sección de compatibilidad del ejemplo. | D contra auditoría y ayuda CLI. |
| [ ] F1.1.2 | F1.1.1 | Comprobar los binarios elegidos sin modificar ramas: lenguaje admitido y contrato válido. Registrar instalación reproducible o bloqueo si depende de trabajo local ajeno. | R: `--help`, `--version` y check estático. |
| [ ] F1.2.1 | F1.1 | Crear fixture TypeScript mínimo con dominio y aplicación y contrato válido. Debe pasar ArchSentinel directamente, sin npm descargando paquetes durante el check. | R: CLI ArchSentinel exit 0. |
| [ ] F1.2.2 | F1.2.1 | Añadir config preflight y un test funcional mínimo al fixture. La ruta al binario se resuelve de forma documentada, sin rutas personales guardadas. | R: test y arquitectura desde preflight. |
| [ ] F1.3.1 | F1.2 | Automatizar caso válido y caso dominio→infraestructura prohibido sobre copias temporales del fixture. Esperar exit 0/1 y resultado `passed`/`failed`. | P:test/architecture-cli.test.ts. |
| [ ] F1.4.1 | F1.3 | Añadir contrato inválido al recorrido conjunto. El exit 2 de ArchSentinel queda visible en el resultado de preflight, sin confundirlo con una infracción. | P:test/architecture-cli.test.ts. |
| [ ] F1.4.2 | F1.4.1 | Verificar ejecutable ausente usando el runner existente; no prometer que siempre se guarda informe en una excepción. Registrar el diagnóstico observable en el recorrido conjunto. | P:test/runner.test.ts y recorrido del ejemplo. |
| [ ] F1.4.3 | F1.4.2 | Verificar timeout del check externo y terminación del proceso hijo usando el runner existente; conservar `timed_out` en el resultado. | P:test/runner.test.ts y recorrido del ejemplo. |
| [ ] F1.5.1 | F1.3, F1.4 | Documentar el mapeo 0/1/2/timeout y stdout/stderr con salidas capturadas del ejemplo. | D contra resultados guardados de F1.3/F1.4. |
| [ ] F1.6.1 | F1.5 | Incorporar el ejemplo verificado a la guía; otra ejecución siguiendo esos pasos obtiene los mismos resultados estáticos. | R y `npm run check`. |

## F2 — Puente MCP

Repositorio P salvo indicación. Zonas nuevas propuestas: `src/architecture/`,
`test/architecture-client.test.ts`, `test/architecture-integration.test.ts`.
Zonas existentes: `src/config.ts`, `src/types.ts`, `src/server.ts`, `src/runner.ts`,
`src/cli.ts`. El servidor A ya existe: reutilizarlo sin duplicar sus tres herramientas.

| Unidad | Depende de | Cambio acotado y aceptación | Verificación |
| --- | --- | --- | --- |
| [ ] F2.1.1 | F1 | Escribir ADR de transporte y compatibilidad: servidor soportado, negociación de herramientas/argumentos y entorno. No depender solo de que ambos paquetes declaren 0.3.0. | D contra contrato real MCP de main/develop. |
| [ ] F2.1.2 | F2.1.1 | Escribir contrato propuesto de herramientas proxy, sus entradas y selección de checks/arquitectura. Resolver nombres y alcance antes de implementar schema. | D contra herramientas actuales y ejemplos de llamada previstos. |
| [ ] F2.1.3 | F2.1.2 | Escribir contrato del informe conjunto y tabla PASS/FAIL/error, con un ejemplo de cada payload previsto. | D: todos los estados tienen tratamiento inequívoco. |
| [ ] F2.2.1 | F2.1 | Documentar lectura de config/informes antiguos y estrategia de versión. Definir qué ocurre sin arquitectura configurada. | D con fixtures JSON antiguos de preflight. |
| [ ] F2.2.2 | F2.2.1 | Añadir tipos del resultado arquitectónico acordado, sin transporte ni cambios de CLI. Los campos antiguos siguen interpretándose según el ADR. | P:test/architecture-result.test.ts (nuevo) y typecheck. |
| [ ] F2.3.1 | F2.1, F2.2 | Definir interfaz del cliente con conectar/listar/invocar/cerrar y errores discriminados. Un consumidor de prueba compila sin conocer el SDK MCP. | P:test/architecture-client.test.ts y typecheck. |
| [ ] F2.3.2 | F2.3.1 | Implementar conexión stdio y descubrimiento de las herramientas existentes; añadir el SDK cliente como dependencia de ejecución si procede. Detectar servidor incompatible antes del check. | P:test/architecture-client.test.ts con servidor controlado. |
| [ ] F2.3.3 | F2.3.2, F2.7 | Implementar una llamada a `archsentinel_check` y validar la respuesta con el adaptador de F2.7. No aceptar un cuerpo sin estado válido. | P:test/architecture-client.test.ts. |
| [ ] F2.3.4 | F2.3.3 | Añadir timeout por llamada y caso servidor sin respuesta. La promesa finaliza y se devuelve error técnico identificable. | P:test/architecture-client.test.ts. |
| [ ] F2.3.5 | F2.3.4 | Añadir cancelación/cierre en éxito, error y timeout. Probar cierre repetido y ausencia de proceso hijo al terminar. | P:test/architecture-client.test.ts con proceso real. |
| [ ] F2.4.1 | F2.2 | Ampliar schema de config con el bloque de conexión acordado. Rechazar campos inválidos y conservar la config anterior sin arquitectura. | P:test/config.test.ts. |
| [ ] F2.4.2 | F2.4.1, F2.3 | Construir el cliente desde configuración confiable: ejecutable permitido, args, raíz y entorno. Ninguna llamada MCP del agente puede sustituir el ejecutable. | P:test/architecture-client.test.ts y test/config.test.ts. |
| [ ] F2.5.1 | F2.4 | Exponer solo la operación proxy de lenguajes con el nombre acordado; devolver exactamente los lenguajes del servidor conectado. | P:test/mcp.test.ts. |
| [ ] F2.5.2 | F2.5.1 | Exponer el check proxy; pasar lenguaje, Git y semantic solo si están admitidos/configurados según ADR. No implementar de nuevo esas funciones en P. | P:test/mcp.test.ts, servidor controlado con capacidades distintas. |
| [ ] F2.5.3 | F2.5.1 | Exponer init proxy sin sobrescritura; conservar un contrato preexistente byte a byte. | P:test/mcp.test.ts. |
| [ ] F2.6.1 | F2.4, F2.7 | Integrar una ejecución arquitectónica en la orquestación y combinar el aprobado con los checks. Verificar una matriz mínima de test PASS/FAIL × arquitectura PASS/FAIL. | P:test/architecture-integration.test.ts. |
| [ ] F2.6.2 | F2.6.1 | Persistir/leer la sección estructurada del resultado y mostrarla en CLI. La lectura de informes anteriores sigue funcionando. | P:test/architecture-integration.test.ts. |
| [ ] F2.6.3 | F2.6.2, F2.5 | Conectar `run_preflight`/`latest_report` al informe conjunto; la respuesta inmediata y la persistida coinciden. | P:test/mcp.test.ts. |
| [ ] F2.7.1 | F2.2 | Implementar adaptador puro PASS/FAIL/ERROR usando `structuredContent` y el formato admitido por ADR. FAIL con `isError` ausente sigue siendo fallo de calidad. | P:test/architecture-result.test.ts. |
| [ ] F2.7.2 | F2.7.1 | Rechazar payload incompleto/contradictorio y distinguir error de transporte de fallo del gate. Conservar diagnósticos sin credenciales. | P:test/architecture-result.test.ts. |
| [ ] F2.8.1 | F2.6 | Ejecutar regresión con configuración antigua y únicamente comandos. No se inicia ningún servidor A ni cambia el significado del resultado. | P:test/config.test.ts, test/runner.test.ts, test/mcp.test.ts. |
| [ ] F2.9.1 | F2.3, F2.5, F2.6, F2.8 | Recorrido con cliente agente→P MCP→A MCP reales: proyecto válido y violación. Registrar SHA de ambos; fallar si solo se ha usado un mock. | P:test/architecture-integration.test.ts y R con ambos builds. |
| [ ] F2.9.2 | F2.9.1 | Verificar caída/reinicio de A y cierre del cliente agente sin procesos huérfanos. Registrar comportamiento de recuperación real. | P:test/architecture-integration.test.ts. |
| [ ] F2.10.1 | F2.9 | Revisar ejemplos de configuración de un único MCP y matriz de compatibilidad; eliminar opciones propuestas que no llegaron al código. | D y `npm run check`. |

## F3 — Fallo semántico sin pérdida del resultado estático

Repositorio A salvo filas P. Zonas A: `application/validate-project/`, tipos de
revisión, config y adaptadores CLI/MCP. **Ya existen** timeout, validación de JSON,
límites y sanitización básica del proveedor: reutilizar sus pruebas.

| Unidad | Depende de | Cambio acotado y aceptación | Verificación |
| --- | --- | --- | --- |
| [ ] F3.1.1 | F2 | Registrar ADR con política obligatoria/opcional, valor por defecto y matriz de gate/completitud. Resolver con el usuario cualquier cambio de política pública. | D: casos estático PASS/FAIL × IA éxito/fallo/no solicitada. |
| [ ] F3.1.2 | F3.1.1 | Añadir opción validada de política, sin cambiar todavía el resultado del análisis. Configs antiguas conservan la política anterior del ADR. | A:test/core/architecture-configuration.test.ts. |
| [ ] F3.2.1 | F3.1 | Separar el resultado estático calculado de la llamada semántica para poder conservarlo; revisión exitosa mantiene el mismo conjunto de hallazgos. | A:test/application/semantic-project-analysis.test.ts. |
| [ ] F3.2.2 | F3.2.1, F3.3.1 | Aplicar la política al capturar un error semántico; una infracción estática sigue fallando aunque la IA no responda. | A:test/application/semantic-project-analysis.test.ts. |
| [ ] F3.3.1 | F3.1 | Añadir estado semántico y completitud al modelo del informe. Diferenciar no solicitado, sin archivos, completado y fallido. | A:test/application/semantic-project-analysis.test.ts y typecheck. |
| [ ] F3.4.1 | F3.2 | Asociar código/causa pública al fallo incompleto reutilizando errores del proveedor. No guardar API key ni cuerpo HTTP sensible en el informe. | A:test/infrastructure/openai-semantic-reviewer.test.ts y test/application/semantic-project-analysis.test.ts. |
| [ ] F3.5.1 | F3.3, F3.4 | Renderizar estado/completitud en consola y JSON CLI, con exit codes según ADR. | A:test/cli/semantic-check.test.ts. |
| [ ] F3.5.2 | F3.5.1 | Propagar campos y política por MCP A sin convertir un FAIL de calidad en un éxito del gate. | A:test/mcp/mcp-server.test.ts. |
| [ ] F3.5.3 | F3.5.2 | P: adaptar validador y presentación del informe conjunto a los nuevos campos; seguir leyendo servidores compatibles anteriores. | P:test/architecture-result.test.ts y test/architecture-integration.test.ts. |
| [ ] F3.6.1 | F3.5 | Reutilizar los errores ya cubiertos y añadir matriz de continuidad para timeout, desconexión y HTTP 500. Ningún caso se presenta como revisión completa. | A:test/application/semantic-project-analysis.test.ts. |
| [ ] F3.6.2 | F3.6.1 | Verificar continuidad ante JSON/evidencia inválidos y exceso de entrada; conservar intactos los controles estrictos del adaptador. | A:test/application/semantic-project-analysis.test.ts. |
| [ ] F3.7.1 | F3.6 | P: actualizar guía con matriz observada y revisar recorrido de error conjunto. | D, R y checks de ambos repositorios. |

## F4 — Perfiles sin duplicar el motor de capas

Repositorio A. Zonas: `core/config/`, inicialización, reglas solo cuando falte una
restricción, fixtures por perfil. Ya hay capas arbitrarias, glob paths, imports
prohibidos y políticas de gate; no reimplementarlos. P solo actualiza su guía.

| Unidad | Depende de | Cambio acotado y aceptación | Verificación |
| --- | --- | --- | --- |
| [ ] F4.1.1 | F1 | ADR que separa estilo, módulos y despliegue. Identificar qué perfiles son plantillas de reglas existentes y cuáles requieren reglas nuevas. | D con un monolito hexagonal como contraejemplo. |
| [ ] F4.2.1 | F4.1 | Especificar matriz de dependencias y dos ejemplos para layered; indicar qué regla existente detecta cada infracción. | D, sin modificar motor. |
| [ ] F4.2.2 | F4.2.1 | Especificar matriz y dos ejemplos clean; mantener explícitas sus diferencias con la plantilla hexagonal actual. | D. |
| [ ] F4.2.3 | F4.2.2 | Especificar fronteras y dos ejemplos de monolito modular. Si exige excepciones a imports intra-capa, registrarlas como restricción nueva antes de codificar. | D; regla y resultado esperado por ejemplo. |
| [ ] F4.3.1 | F4.2 | Ampliar esquema de perfiles y estrategia de versión según ADR. Aceptar contrato antiguo y rechazar perfil desconocido. | A:test/core/architecture-configuration.test.ts. |
| [ ] F4.3.2 | F4.3.1 | Conectar perfil con la política efectiva de capas/imports existente, sin cambiar la evaluación de contratos antiguos. Esta hoja no incorpora un motor nuevo ni dependencias transitivas. | A:test/core/architecture-rules.test.ts. |
| [ ] F4.4.1 | F4.3 | Añadir selección de plantilla layered al inicializador y CLI; no sobrescribir contratos. | A:test/application/initialize-project.test.ts y test/cli/cli.test.ts. |
| [ ] F4.4.2 | F4.4.1 | Añadir únicamente la plantilla clean y su configuración generada válida. | A:test/application/initialize-project.test.ts. |
| [ ] F4.4.3 | F4.4.2 | Añadir únicamente la plantilla modular aprobada, declarando módulos/capas concretos mediante el contrato existente ampliado. | A:test/application/initialize-project.test.ts. |
| [ ] F4.4.4 | F4.4.3 | Exponer selección de las plantillas ya implementadas en init MCP; conservar no sobrescritura. | A:test/mcp/mcp-server.test.ts. |
| [ ] F4.5.1 | F4.1 | ADR con política de archivos sin capa y alcance directo/transitivo. Mantener el comportamiento actual salvo cambio explícitamente aprobado. | D con fixture `unassigned-files` existente. |
| [ ] F4.5.2 | F4.5.1, F4.3 | Implementar solo la opción aprobada para archivos sin capa, con valor por defecto compatible. Si no se acuerda un cambio, verificar y documentar lo existente. | A:test/core/layer-mapper.test.ts y test/application/project-analysis.test.ts. |
| [ ] F4.6.1 | F4.4.1 | Fixture layered válido y con una frontera prohibida; gate esperado 0/1. | A:test/application/project-analysis.test.ts. |
| [ ] F4.6.2 | F4.4.2 | Fixture clean válido e inválido, sin copiar el motor de reglas. | A:test/application/project-analysis.test.ts. |
| [ ] F4.6.3 | F4.4.3 | Fixture modular válido e inválido con módulos concretos; verificar que no es solo otro valor aceptado de `style`. | A:test/application/project-analysis.test.ts. |
| [ ] F4.7.1 | F4.6, F4.5 | Revisar prompt existente con los nuevos contratos; mantener evidencia y prohibición de inventar requisitos. No añadir un segundo proveedor. | A:test/infrastructure/openai-semantic-reviewer.test.ts. |
| [ ] F4.7.2 | F4.7.1 | P: documentar perfiles implementados, plantillas y restricciones reales; reflejar soporte en proxy si cambia init. | D y R de inicialización por perfil. |

## F5 — Símbolos y clases, primera entrega TypeScript

Repositorio A salvo documentación P. Zonas: `core/analysis/source-model.ts`,
analizador TS y nuevas reglas de símbolos; no cambiar todavía Python/Vue. Los
imports/aliases entre archivos ya se resuelven: extender resolución de símbolos.

| Unidad | Depende de | Cambio acotado y aceptación | Verificación |
| --- | --- | --- | --- |
| [ ] F5.1.1 | F4 | ADR con dependencias incluidas: tipo declarado, extends/implements, `new` y referencia estática a miembro. Excluir reflexión, DI runtime y llamadas dinámicas; fijar formato de identificación. | D con un caso positivo/negativo por clase de dependencia. |
| [ ] F5.2.1 | F5.1 | Añadir identidad estable archivo+símbolo y localización al modelo, conservando métricas/imports previos. Dos clases homónimas de archivos distintos no colisionan. | A:test/core/symbol-model.test.ts (nuevo). |
| [ ] F5.2.2 | F5.2.1 | Extraer clases/interfaces del mismo archivo y resolver una referencia local por símbolo. | A:test/infrastructure/typescript-symbols.test.ts (nuevo). |
| [ ] F5.2.3 | F5.2.2 | Resolver símbolos importados con alias usando el resolver TS existente. El destino es la declaración original, no el nombre local del alias. | A:test/infrastructure/typescript-symbols.test.ts. |
| [ ] F5.2.4 | F5.2.3 | Resolver símbolos a través de re-exports. El destino sigue siendo la declaración original aunque atraviese un barrel. | A:test/infrastructure/typescript-symbols.test.ts. |
| [ ] F5.3.1 | F5.2 | Extraer dependencias de anotaciones de tipos de propiedades y parámetros, sin inferir llamadas runtime. | A:test/infrastructure/typescript-symbols.test.ts. |
| [ ] F5.3.2 | F5.3.1 | Extraer `extends`/`implements` con destino y localización. | A:test/infrastructure/typescript-symbols.test.ts. |
| [ ] F5.3.3 | F5.3.2 | Extraer construcción `new B()` como dependencia de A, también dentro del mismo archivo. | A:test/infrastructure/typescript-symbols.test.ts. |
| [ ] F5.3.4 | F5.3.3 | Extraer referencia estática `B.metodo` o `B.propiedad` según ADR; no confundir una variable homónima con la clase. | A:test/infrastructure/typescript-symbols.test.ts. |
| [ ] F5.4.1 | F5.1 | Añadir schema de prohibiciones entre símbolos y validar patrones/identidades desconocidas según ADR. Config sin nuevas reglas sigue válida. | A:test/core/architecture-configuration.test.ts. |
| [ ] F5.4.2 | F5.3, F5.4.1 | Evaluar una prohibición y generar hallazgo con origen, destino y línea. No cambiar la regla de imports de archivos. | A:test/core/symbol-rules.test.ts (nuevo). |
| [ ] F5.5.1 | F5.4 | Hacer explícito el tratamiento acordado para referencias no resolubles/dinámicas, sin considerarlas pruebas de ausencia de dependencia. | A:test/infrastructure/typescript-symbols.test.ts y D de límites. |
| [ ] F5.6.1 | F5.5 | Fixture de dos clases del mismo archivo con uso permitido/prohibido; validar hallazgo de extremo a extremo. | A:test/application/symbol-project-analysis.test.ts (nuevo). |
| [ ] F5.6.2 | F5.6.1 | Fixture con homónimos, alias y re-export; verificar que no aparecen falsos destinos. | A:test/application/symbol-project-analysis.test.ts. |
| [ ] F5.7.1 | F5.6 | Medir mismo fixture representativo con/sin reglas de símbolos; registrar archivos, entorno, duración y regresiones observadas. | R, sin umbral de rendimiento inventado. |
| [ ] F5.7.2 | F5.7.1 | Verificar hallazgo por CLI y MCP A; añadir adaptación solo si el contrato nuevo la exige. | A:test/cli/cli.test.ts y test/mcp/mcp-server.test.ts. |
| [ ] F5.7.3 | F5.7.2 | P: conservar los hallazgos nuevos al persistir informe conjunto, sin perder destino/línea. | P:test/architecture-integration.test.ts. |
| [ ] F5.8.1 | F5.7 | P: documentar clases de dependencia soportadas y exclusiones; no atribuir soporte a Python/Vue por compartir interfaces. | D y R del fixture del mismo archivo. |

## F6 — Contexto y lotes de revisión

Repositorio A salvo guía P. Zonas: revisor semántico y nueva planificación de
lotes. Reutilizar filtro Git, exclusiones, validación de evidencia, deduplicación
y límites por petición existentes. No añadir RAG/embeddings en esta entrega.

| Unidad | Depende de | Cambio acotado y aceptación | Verificación |
| --- | --- | --- | --- |
| [ ] F6.1.1 | F3 | ADR con bytes por petición, máximo de peticiones, tiempo total y concurrencia inicial 1; especificar coste y error al agotar presupuesto. No prometer equivalencia bytes/tokens. | D con ejemplo que excede cada presupuesto. |
| [ ] F6.1.2 | F6.1.1 | Añadir settings validados del planificador manteniendo los límites actuales del proveedor. Valores inválidos fallan antes de llamar a la API. | A:test/infrastructure/semantic-batches.test.ts (nuevo). |
| [ ] F6.2.1 | F6.1 | Empaquetar archivos completos en lotes deterministas midiendo el cuerpo real serializado, incluido prompt/contrato. No superar bytes por añadir overhead. | A:test/infrastructure/semantic-batches.test.ts. |
| [ ] F6.2.2 | F6.2.1 | Dividir un archivo que no cabe mediante rangos con líneas originales; definir contexto mínimo y política si tampoco cabe. | A:test/infrastructure/semantic-batches.test.ts. |
| [ ] F6.2.3 | F6.2.2 | Validar propuestas de cada rango contra fuente original completa, conservando evidencia y números de línea. | A:test/infrastructure/openai-semantic-reviewer.test.ts. |
| [ ] F6.3.1 | F6.2 | Seleccionar dependencias directas del archivo objetivo desde el grafo existente dentro del presupuesto; ordenar y limitar determinísticamente. | A:test/infrastructure/semantic-batches.test.ts. |
| [ ] F6.3.2 | F6.3.1 | Marcar contexto auxiliar como no objetivo; impedir que propuestas de esos archivos cuenten como si se hubieran revisado. | A:test/application/semantic-project-analysis.test.ts. |
| [ ] F6.4.1 | F6.3 | Añadir manifiesto de archivos/rangos revisados, contexto auxiliar y omitidos con motivo. Diferenciar análisis estático completo de cobertura semántica. | A:test/application/semantic-project-analysis.test.ts. |
| [ ] F6.5.1 | F6.4 | Ejecutar lotes secuencialmente a través del proveedor existente, manteniendo el análisis estático una sola vez. | A:test/infrastructure/semantic-batches.test.ts con proveedor controlado. |
| [ ] F6.5.2 | F6.5.1 | Agregar propuestas entre lotes reutilizando `createSemanticFindings`; duplicados por solapamiento cuentan una vez y el orden es estable. | A:test/core/semantic-findings.test.ts y test/application/semantic-project-analysis.test.ts. |
| [ ] F6.6.1 | F6.5 | Aplicar política F3 al fallo de un lote: preservar resultados válidos y declarar rangos no revisados. No transformar un fallo parcial en revisión completa. | A:test/application/semantic-project-analysis.test.ts. |
| [ ] F6.6.2 | F6.6.1 | Detener nuevas peticiones al agotar tiempo/peticiones y cancelar una petición activa según ADR. Reflejar presupuesto agotado en manifiesto. | A:test/infrastructure/semantic-batches.test.ts. |
| [ ] F6.7.1 | F6.6 | Fixture mayor que una petición con hallazgos en primer y último lote; ambos aparecen con líneas originales. | A:test/application/semantic-project-analysis.test.ts. |
| [ ] F6.7.2 | F6.7.1 | Regresión de exclusiones y `changed/base`: ningún archivo excluido se envía, tampoco como contexto auxiliar si la política lo excluye. | A:test/application/changed-project-analysis.test.ts y test/application/semantic-project-analysis.test.ts. |
| [ ] F6.8.1 | F6.7 | P: conservar manifiesto/completitud en informe integrado y documentación de límites. No presentar selección de dependencias como comprensión completa del repositorio. | P:test/architecture-integration.test.ts y D. |

## F7 — Evaluación real, separada de los tests normales

Repositorio A salvo guía P. Zonas nuevas propuestas: `evaluation/` y
`scripts/evaluate-semantic.mjs`; pruebas nuevas de métricas en `test/evaluation/`.
El adaptador HTTP ya está probado: no sustituir una evaluación por más mocks.

| Unidad | Depende de | Cambio acotado y aceptación | Verificación |
| --- | --- | --- | --- |
| [ ] F7.1.1 | F1 | Definir formato de caso con fuente, contrato, hallazgos esperados, ambiguos y criterio de emparejamiento. Acordar qué cuenta como acierto semántico. | D con tres casos etiquetados. |
| [ ] F7.1.2 | F7.1.1 | Añadir primer conjunto pequeño: al menos tres casos correctos y tres infracciones semánticas que no sean solo imports prohibidos. Revisar etiquetas. | D y validador de corpus en test/evaluation/corpus.test.ts. |
| [ ] F7.1.3 | F7.1.2 | Añadir tres casos ambiguos y tres con ruido/instrucciones en comentarios; no imponer una única respuesta correcta en casos indeterminados. | A:test/evaluation/corpus.test.ts. |
| [ ] F7.2.1 | F7.1 | Definir ejecución opt-in separada de `pnpm test` y validación offline del corpus. Los tests normales no requieren red/modelo. | A:test/evaluation/corpus.test.ts y revisión de scripts package.json. |
| [ ] F7.3.1 | F7.2 | Crear runner para un único caso y proveedor configurado, reutilizando el revisor existente. Registrar modelo solicitado, versión disponible, prompt/contexto y SHA sin secretos. | A:test/evaluation/runner.test.ts (nuevo), proveedor controlado. |
| [ ] F7.3.2 | F7.3.1 | Recorrer un corpus y repetir N veces por caso con IDs de ejecución, resultados y errores separados. Fallos técnicos no cuentan como respuestas vacías correctas. | A:test/evaluation/runner.test.ts. |
| [ ] F7.4.1 | F7.3 | Implementar emparejamiento y precisión/recall/falsos positivos desde resultados etiquetados; definir denominadores cero y casos ambiguos. | A:test/evaluation/metrics.test.ts (nuevo). |
| [ ] F7.4.2 | F7.4.1 | Añadir estabilidad entre repeticiones y latencia por caso. No mezclar repetibilidad del parser con estabilidad del modelo. | A:test/evaluation/metrics.test.ts. |
| [ ] F7.6.1 | F7.4 | Proponer y acordar umbrales y presupuesto antes de evaluar modelos reales. Registrar decisión del usuario si debe condicionar el gate. | D: umbrales, corpus, repeticiones y coste máximo. |
| [ ] F7.5.1 | F7.6, F6 | Ejecutar corpus con un modelo local disponible; registrar identificador/build, hardware, contexto, latencia y resultados crudos. Si falta modelo/hardware, bloquear esta hoja y preguntar. | R: informe local reproducible, no mock. |
| [ ] F7.5.2 | F7.6, F6 | Ejecutar el mismo corpus con modelo remoto autorizado; registrar proveedor, modelo, tokens/uso disponibles y coste. Si faltan credenciales/presupuesto, bloquear y preguntar. | R: informe remoto reproducible. |
| [ ] F7.7.1 | F7.5 | Comparar resultados con umbrales acordados, incluyendo omisiones y errores. Una evaluación negativa es un resultado válido, no una razón para ocultar casos. | D contra resultados crudos y métricas. |
| [ ] F7.8.1 | F7.7 | P: actualizar guía con modelos efectivamente evaluados, fechas, condiciones y limitaciones; no convertir recomendaciones en garantía. | D y enlaces a informes reales. |

## F8 — Documentación externa a propuestas

Repositorio A salvo integración P. Zonas nuevas propuestas: puertos de búsqueda y
propuestas en aplicación, adaptadores de fuentes en infraestructura, formato de
propuesta en core. El check ordinario seguirá sin buscar reglas automáticamente.

| Unidad | Depende de | Cambio acotado y aceptación | Verificación |
| --- | --- | --- | --- |
| [ ] F8.1.1 | F4, F6, F7 | ADR con proveedor/fuentes, límites, credenciales y política sin red. Si no hay preferencia aprobada, preguntar antes de elegir un servicio con coste. | D: contrato de búsqueda y presupuesto. |
| [ ] F8.1.2 | F8.1.1 | Definir puerto de búsqueda/lectura y modelo de fuente: URL, fecha, título y fragmento. No acoplarlo al proveedor del LLM. | A:test/core/rule-proposal.test.ts (nuevo) y typecheck. |
| [ ] F8.2.1 | F8.1 | Implementar lectura de una URL explícita con límites/timeout y texto utilizable; conservar procedencia. | A:test/infrastructure/documentation-sources.test.ts (nuevo), HTTP controlado. |
| [ ] F8.2.2 | F8.2.1 | Implementar solo el adaptador del buscador elegido; resultados ordenados/limitados con URLs que alimenten el lector existente. | A:test/infrastructure/documentation-sources.test.ts. |
| [ ] F8.3.1 | F8.2 | Definir schema de propuesta con reglas, explicación y citas de fuentes. No puede incluir comandos ejecutables. | A:test/core/rule-proposal.test.ts. |
| [ ] F8.3.2 | F8.3.1 | Añadir generación de propuesta con fuentes como datos usando el proveedor existente y un prompt específico; no alterar prompt del check normal. | A:test/application/propose-rules.test.ts (nuevo), proveedor controlado. |
| [ ] F8.4.1 | F8.3 | Validar propuesta contra schema de arquitectura y citas conocidas; rechazar reglas/citas inventadas o contrato inválido. | A:test/core/rule-proposal.test.ts. |
| [ ] F8.5.1 | F8.4 | Persistir propuesta y diff determinista en archivo separado. Una propuesta no modifica `architecture.yaml`. | A:test/application/propose-rules.test.ts. |
| [ ] F8.6.1 | F8.5 | Aplicar explícitamente una propuesta sobre la versión esperada del contrato; rechazar si el contrato cambió desde que se generó. | A:test/application/apply-rule-proposal.test.ts (nuevo). |
| [ ] F8.6.2 | F8.6.1 | Ejecutar check estático del contrato aplicado y devolver resultado separado del éxito de escritura. No declarar gate aprobado solo por guardar el YAML. | A:test/application/apply-rule-proposal.test.ts. |
| [ ] F8.7.1 | F8.6 | Verificar fuentes contradictorias, instrucciones incrustadas y respuesta inválida; no aceptar instrucciones externas como órdenes del proceso. | A:test/application/propose-rules.test.ts. |
| [ ] F8.7.2 | F8.7.1 | Recorrido con fuente real y proveedor autorizado, conservando URL/fecha/citas; límites de coste acordados antes de ejecutar. | R; bloquear/preguntar si falta acceso. |
| [ ] F8.8.1 | F8.7 | Exponer generar/aplicar propuestas en CLI A con los nombres aprobados, sin modificar `check` para hacer búsqueda automática. | A:test/cli/rule-proposals.test.ts (nuevo). |
| [ ] F8.8.2 | F8.8.1 | Exponer las mismas operaciones en MCP A, distinguiendo propuesta de aplicación con escritura. | A:test/mcp/mcp-server.test.ts. |
| [ ] F8.8.3 | F8.8.2 | P: añadir proxy de las nuevas operaciones según contrato F2 y documentar el flujo completo. | P:test/mcp.test.ts y D. |

## F9 — Cierre y entrega reproducible

Cada fila indica repositorio. Ninguna incluye publicar ni crear commits/PR.

| Unidad | Depende de | Cambio acotado y aceptación | Verificación |
| --- | --- | --- | --- |
| [ ] F9.1.1 | F2, F3, F4, F5, F6, F7, F8 | P: consolidar matriz SHA/versión/capacidades sin asumir que número de paquete implica soporte. Identificar capacidades aún solo locales. | D contra ambos árboles y resultados de integración. |
| [ ] F9.2.1 | F9.1 | P: preparar proyecto de referencia y pasos desde instalación limpia sin rutas personales. El proyecto incluye un test y una frontera arquitectónica. | R: instalación/build/check en directorio temporal. |
| [ ] F9.3.1 | F9.2 | P: ejecutar tests+arquitectura por CLI y MCP para PASS y FAIL, y comparar informe inmediato/persistido. | P:test/architecture-integration.test.ts con A real. |
| [ ] F9.3.2 | F9.3.1 | P: ejecutar fallo de modelo obligatorio/opcional y comprobar completitud/informe guardado según política final. | P:test/architecture-integration.test.ts con fallo controlado del proveedor. |
| [ ] F9.4.1 | F9.3 | P: documentar ejemplo CI con `check`, exit codes y artefactos; diferenciar ejecución del check y reglas de bloqueo configuradas en GitHub. | D contra `.github/workflows/ci.yml` y recorrido CLI. |
| [ ] F9.5.1 | F9.4 | P: revisar skills y guía contra herramientas finales; corregir referencias desfasadas. | D: cada herramienta/argumento citado existe en schema. |
| [ ] F9.5.2 | F9.5.1 | A: revisar README, contratos, migraciones y ejemplos de IA/perfiles; mantener límites por lenguaje visibles. | D contra CLI/MCP/config finales. |
| [ ] F9.6.1 | F9.5 | A: ejecutar checks de CONTRIBUTING sobre la entrega final y registrar cada resultado; arreglos encontrados necesitan nueva hoja, no cambios ocultos. | R: preflight, self-check, smoke MCP y empaquetado requeridos. |
| [ ] F9.6.2 | F9.6.1 | P: ejecutar check completo y recorrido conjunto con el SHA A anterior; registrar ambos SHAs. | `npm run check` y R conjunto. |
| [ ] F9.7.1 | F9.6 | P: preparar notas de entrega con cambios, compatibilidad, límites y migraciones. La publicación queda fuera de esta unidad y requiere petición expresa. | D contra tareas completadas y resultados. |

## Extensiones — no bloquean la entrega F1–F9

El roadmap mantiene EXT.1–EXT.3 fuera de la estimación principal. No hay evidencia
de baseline/SARIF en las ramas auditadas. Cada ampliación de alcance necesita
aceptación y estimación propias antes de empezar.

| Unidad | Depende de | Cambio acotado y aceptación | Verificación |
| --- | --- | --- | --- |
| [ ] EXT.1.1 | F9 | A: ADR con identidad de hallazgo, baseline, renames y regresiones. Un hallazgo nuevo no puede desaparecer por coincidir solo en número de línea. | D con ejemplos de cambio de código. |
| [ ] EXT.1.2 | EXT.1.1 | A: serializar/leer baseline versionada y rechazar versión desconocida. | A:test/core/baseline.test.ts (nuevo). |
| [ ] EXT.1.3 | EXT.1.2 | A: comparar hallazgos actuales y baseline según ADR, conservando los nuevos/regresiones. | A:test/core/baseline.test.ts. |
| [ ] EXT.1.4 | EXT.1.3 | A: exponer crear/usar baseline en CLI y MCP sin activar ocultación por defecto. | A:test/cli/baseline.test.ts (nuevo) y test/mcp/mcp-server.test.ts. |
| [ ] EXT.1.5 | EXT.1.4 | P: propagar alcance y conteos de baseline al informe y guía, sin reinterpretar el gate. | P:test/architecture-integration.test.ts y D. |
| [ ] EXT.2.1 | F9 | A: definir mapeo de reglas, severidades, ubicaciones y relatedFiles a SARIF. | D con un hallazgo de ciclo y uno semántico. |
| [ ] EXT.2.2 | EXT.2.1 | A: exportar informe SARIF válido, sin secretos ni rutas absolutas personales. | A:test/infrastructure/sarif.test.ts (nuevo), validación contra esquema SARIF acordado. |
| [ ] EXT.2.3 | EXT.2.2 | A: exponer formato SARIF en CLI preservando exit codes. | A:test/cli/sarif.test.ts (nuevo). |
| [ ] EXT.2.4 | EXT.2.3 | P: documentar generación/subida de artefacto CI; no asumir disponibilidad de anotaciones en cualquier plan GitHub. | D y R del formato exportado. |
| [ ] EXT.3.1 | F5, F9 | A: evaluar qué dependencias entre símbolos admite AST Python y documentar primera subentrega. | D con correspondencias y exclusiones frente a TS. |
| [ ] EXT.3.2.1 | EXT.3.1 | A: extraer identidad de clases y dependencias de herencia Python de la subentrega aprobada. | A:test/infrastructure/python-symbols.test.ts (nuevo). |
| [ ] EXT.3.2.2 | EXT.3.2.1 | A: extraer construcción Python con destino resoluble; documentar la ambigüedad entre llamada a función y constructor. | A:test/infrastructure/python-symbols.test.ts. |
| [ ] EXT.3.3 | EXT.3.2 | A: conectar esos símbolos al evaluador F5 y probar prohibición dentro de un archivo Python. | A:test/application/symbol-project-analysis.test.ts. |
| [ ] EXT.3.4 | F5, F9 | A: evaluar reutilización TS en SFC Vue y fijar identidad/localización original de símbolos. | D con fixture SFC existente, sin inventar soporte de template/auto-import. |
| [ ] EXT.3.5 | EXT.3.4 | A: exponer dependencias de símbolos del script SFC usando el analizador local existente, no un parser Vue nuevo. | A:test/infrastructure/vue-source-analyzer.test.ts. |
| [ ] EXT.3.6 | EXT.3.3, EXT.3.5 | P: actualizar matriz real de paridad y probar preservación de hallazgos Python/Vue en informe conjunto. | P:test/architecture-integration.test.ts y D. |

## Próxima unidad

La siguiente unidad funcional es **F1.1.1**, tras F0.6 y F0.7. Preparar su rama
según CONTRIBUTING: la entrega F0 está en `feature/git-flow-workflow` y todavía
no está integrada en develop. Resolver esa integración con autorización antes
de arrastrar cambios a otra entrega. No cambiar la rama de ArchSentinel para
empezar F1 sin registrar primero la capacidad y revisión que se van a utilizar.

# Auditoría local de capacidades y ramas

Fecha: 2026-11-12. Objetivo: no volver a desarrollar capacidades existentes al
ejecutar el [roadmap](../ROADMAP.md).

## Alcance y evidencia Git

Para ArchSentinel se revisaron el árbol de trabajo, todas las ramas locales y las
referencias `origin/*` ya disponibles, sin fetch ni consulta a GitHub: esas
referencias no certifican el estado actual del servidor. No se han cambiado sus
ramas ni alterado sus cambios. Para preflight, durante la publicación autorizada
de F0 se hizo fetch y se crearon las ramas remotas y el PR indicados abajo.

| Repositorio / referencia local | Commit | Observación |
| --- | --- | --- |
| Preflight `main`, `origin/main` | `5271108` | Línea estable local; sin puente MCP de arquitectura en `src`. |
| Preflight `develop`, `origin/develop` | `5271108` | Base publicada durante la entrega F0; pendiente de integrar el PR. |
| Preflight `feature/git-flow-workflow` | `52573d6` (entrega F0) | Rama publicada; [PR #1](https://github.com/Snake12Doc/agentic-preflight/pull/1) hacia develop. Puede incluir commits posteriores de seguimiento documental. |
| ArchSentinel `main`, `origin/main` | `ba2d2d9` | Línea estable local, versión declarada 0.3.0. |
| ArchSentinel `develop`, `origin/develop` | `fd5cba7` | Contiene Git diff, revisión semántica y preparación del analizador Vue. |
| `feature/git-diff-analysis` | `dbe1e63` | Integrada en `develop`; no es trabajo nuevo pendiente. |
| `feature/semantic-llm-review` | `704b526` | Integrada en `develop`; no es trabajo nuevo pendiente. |
| `feature/git-flow-workflow` | `d7b9613` | Integrada en `develop`; reglas de contribución y CI existentes. |
| `feature/vue-frontend-analysis` (HEAD) | `fd5cba7` | Mismo commit que `develop`; ahead 1 respecto a su referencia `origin/feature/vue-frontend-analysis` en `542b92c`. Ese commit ya está en la referencia local `origin/develop`: no implica una función inédita. |
| `backup/pre-rewrite-main-20260904` | `d0ae7e5` | Historia anterior: CLI, contrato, análisis TypeScript y grafo. No aporta las funciones nuevas ausentes descritas abajo. |

Además, en el árbol de trabajo de ArchSentinel hay código y pruebas Vue sin
commit, registro del lenguaje en CLI/MCP, dependencia `@vue/compiler-sfc` y guía
frontend. La existencia del merge llamado «Vue» no significa que el analizador
completo esté guardado en ese commit: `main..develop` contiene los hooks del
analizador TypeScript; el archivo `vue-source-analyzer.ts` sigue sin seguimiento.

## Matriz de disponibilidad

«No observado» significa ausente del código y contratos revisados en las ramas
locales, no una afirmación sobre clones, stashes, forks o ramas solo en GitHub.

| Capacidad | `main` ArchSentinel | `develop` | Árbol local | Tratamiento en el roadmap |
| --- | --- | --- | --- | --- |
| CLI, MCP, init sin sobrescribir | Sí | Sí | Sí | Reutilizar. |
| Capas personalizadas, imports prohibidos y ciclos | Sí | Sí | Sí | Reutilizar; no reimplementar el motor en F4. |
| Métricas y exclusiones clean-code | Sí | Sí | Sí | Reutilizar. |
| TypeScript y Python | Sí | Sí | Sí | Reutilizar; respetar límites de cada analizador. |
| Git `changed` / `base` | No | Sí | Sí | Integrar/pasar argumentos; no crear otro analizador Git. |
| API OpenAI-compatible y modelo local | No | Sí | Sí | Reutilizar adaptador y configuración. |
| Prompt y contexto con contrato, código, capas, imports y hallazgos | No | Sí | Sí | Reutilizar; ampliar solo en F6. |
| Validación de evidencia, confianza, deduplicación y orden semántico | No | Sí | Sí | Reutilizar; F6 solo añade agregación entre lotes. |
| Timeout, límites de bytes, errores de proveedor y rechazo de JSON inválido | No para IA | Sí | Sí | Reutilizar; F3 cambia la política final, no el transporte. |
| Exclusiones semánticas y selección por Git | No | Sí | Sí | Reutilizar y conservar en F6. |
| Vue: scripts SFC, imports, alias y localizaciones | No | Solo hooks de extensión | Sí, sin commit | Verificar/estabilizar lo existente; no reescribir. |
| Continuar con informe estático tras fallo semántico | No | No | No observado | Trabajo nuevo F3. |
| Perfiles distintos de `hexagonal` | No | No | No observado | Trabajo nuevo F4; capas configurables ya existen. |
| Reglas entre clases/símbolos concretos | No | No | No observado | Trabajo nuevo F5; el modelo actual de clase solo tiene nombre, línea y tamaño. |
| Varias peticiones/contexto por dependencias | No | No | No observado | Trabajo nuevo F6. Los chunks de lectura HTTP no son lotes de revisión. |
| Corpus y métricas de precisión de modelos reales | No | No | No observado | Trabajo nuevo F7; las pruebas actuales usan respuestas controladas. |
| Búsqueda web y propuestas de contrato | No | No | No observado | Trabajo nuevo F8. |
| Baseline y SARIF | No | No | No observado | Extensiones separadas. |

Preflight ya permite ejecutar comandos externos. F1 entrega un recorrido conjunto
reproducible, no un runner nuevo. El cliente MCP, las herramientas proxy y el
informe arquitectónico integrado siguen ausentes en preflight: trabajo nuevo F2.

## Archivos y pruebas que sustentan la revisión

Rutas relativas al repositorio ArchSentinel:

- `src/mcp/server.ts`: contrato de herramientas y diferencia entre `FAIL` e `isError`.
- `src/core/config/architecture-configuration.ts`: `style: hexagonal` y capas personalizadas.
- `src/core/analysis/source-model.ts`: imports por archivo y métricas de clases.
- `src/application/validate-project/validate-project.ts`: estático antes de semántico.
- `src/application/validate-project/semantic-project-review.ts`: selección existente y errores propagados.
- `src/core/semantic/semantic-findings.ts`: umbral, deduplicación y orden existentes.
- `src/infrastructure/semantic/*`: prompt, API, contexto, límites y validación.
- `src/infrastructure/git/git-project-changes-gateway.ts`: selección Git existente.
- `src/infrastructure/analysis/vue-source-analyzer.ts`: implementación local sin commit.
- `test/application/semantic-project-analysis.test.ts`,
  `test/infrastructure/openai-semantic-reviewer.test.ts`,
  `test/infrastructure/vue-source-analyzer.test.ts`: comportamiento cubierto actualmente.

Pruebas repetidas sobre los árboles locales el 2026-11-12:

| Repositorio | Comando | Resultado |
| --- | --- | --- |
| Preflight | `npm exec vitest run` | 3 archivos, 17 pruebas correctas. El recorrido MCP usa el `dist` local existente. |
| ArchSentinel | `npm test` | 24 archivos, 218 pruebas correctas, incluido Vue local. |

No se han ejecutado las suites por separado sobre cada rama ni evaluado un modelo
real. La clasificación por ramas procede de historial, árboles y diferencias de
código; los resultados anteriores corresponden exclusivamente al árbol local.

Tras la adopción Git Flow F0.7, `npm run check` en preflight vuelve a comprobar
tipos, build, MCP y empaquetado: **36 pruebas correctas** (las 17 anteriores y
19 rutas de PR). Las pruebas del script Bash se ejecutan en macOS/Linux; se omiten
en Windows, mientras el job de política de GitHub se ejecuta en Ubuntu. Este
resultado local no certifica una ejecución del workflow en GitHub.

Actualización F0.7.5: la ejecución real de Windows detectó CRLF en el checkout.
Corregido en `f78b57a` y añadidas dos pruebas LF/CRLF: `npm run check` local pasa
con 38 tests. El [run 43252110956](https://github.com/Snake12Doc/agentic-preflight/actions/runs/43252110956)
confirma Git Flow, Ubuntu Node 20/24, Windows Node 24 y Spring Boot correctos.

## Revalidación antes de cada tarea

1. Consultar rama, SHA y cambios locales de ambos repositorios.
2. Buscar la capacidad en implementación y pruebas, no solo en README o nombres de ramas.
3. Si ya existe, reutilizar y verificar. Registrar la evidencia; no marcar la
   entrega de preflight como terminada hasta validar su integración.
4. Si se necesita trabajo previo sin commit de otra persona, aislar el cambio o
   preguntar antes de mezclarlo. No guardar, revertir ni mover ese trabajo para
   «limpiar» el repositorio.
5. Si cambian las referencias o se consulta GitHub después, actualizar esta foto.

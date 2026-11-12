# Roadmap: agentic-preflight + ArchSentinel

Última revisión: 2026-11-12.

## Objetivo

Dar al agente un punto de entrada para ejecutar los controles del proyecto y
comprobar su arquitectura, con resultados trazables, análisis estático como base
y revisión semántica opcional. Completar también perfiles arquitectónicos,
dependencias entre clases, contexto para repositorios grandes, evaluación de
modelos y propuestas de reglas basadas en documentación.

La explicación del funcionamiento **actual** está en
[la guía funcional](docs/agentic-preflight-y-archsentinel.md). Este documento
describe trabajo y criterios de entrega: no convierte las propuestas en APIs
disponibles.

## Cómo mantener el progreso

Las casillas F1.1–F9.7 de este documento son **entregas padre**, no órdenes para
una sesión. Sus unidades ejecutables están en
[el catálogo de tareas para IA](docs/roadmap-unidades-ia.md). Antes de implementar,
consultar también [la auditoría de ramas y capacidades](docs/auditoria-archsentinel.md).

- `[ ]` significa pendiente. `[x]` significa implementado **y verificado**.
- Cada fase tiene un estado explícito: pendiente, en curso, bloqueada o completada.
- Al empezar una tarea, cambiar el estado de su fase a «en curso».
- Marcar cada casilla al completar su criterio, no al escribir el primer código.
- Adjuntar la verificación y el commit/PR cuando existan; no inventar referencias.
- Registrar bloqueos, cambios de alcance y trabajo parcial en el historial.
- Si cambia el comportamiento público, actualizar la guía en la misma entrega.
- Las fases compartidas no se completan hasta verificar ambos repositorios.
- Ejecutar una unidad hoja del catálogo cada vez. Una entrega padre se marca
  solo cuando todas sus hojas estén completadas y su aceptación conjunta verificada.

Los identificadores son estables: deben conservarse aunque cambie el orden.
La secuencia es orientativa, no un compromiso de fechas.

## Punto de partida comprobado

| Capacidad existente | Situación |
| --- | --- |
| Preflight CLI y servidor MCP | Implementados; cuatro herramientas MCP. |
| Comandos configurados, allowlist, límites de tiempo e informe JSON | Implementados. |
| Inicialización Maven y npm/pnpm/Yarn | Implementada. |
| Skills de pruebas, revisión y pre-PR | Disponibles para que el agente las adopte. |
| ArchSentinel CLI y MCP | Implementados por separado. |
| Reglas de capas, imports, ciclos y métricas | Implementadas en ArchSentinel. |
| Análisis TypeScript y Python | Implementado en ArchSentinel. |
| Revisión semántica OpenAI-compatible y selección por Git | Implementadas en `develop` de ArchSentinel; ausentes de su `main` local. |
| Vue en ArchSentinel | Presente en la copia local revisada con cambios sin commit; confirmar versión antes de depender de ella. |
| Cliente MCP de ArchSentinel dentro de preflight | Pendiente. |
| Respaldo automático al fallar la IA | Pendiente. |
| Perfiles distintos de `hexagonal` | Pendientes. |
| Búsqueda de reglas en internet | Pendiente. |

Verificación inicial del 2026-11-12: 17 pruebas de preflight y 218 de
ArchSentinel correctas; typecheck correcto en ambos. Son datos de las copias
locales revisadas, no una certificación de versiones publicadas ni de precisión
de un modelo real. Las siguientes entregas deben registrar sus propios resultados.

## Resumen de fases

| Fase | Entrega | Repositorio principal | Dependencias | Estado | Esfuerzo orientativo |
| --- | --- | --- | --- | --- | --- |
| F0 | Documentación y flujo de contribución | Preflight | — | Completada | Esta entrega |
| F1 | Integración ejecutable por CLI | Preflight | F0 | Pendiente | 2–6 h |
| F2 | Integración nativa MCP e informe conjunto | Preflight + ArchSentinel | F1 | Pendiente | 16–32 h |
| F3 | Política de fallo de IA y revisión incompleta | ArchSentinel + Preflight | F2 | Pendiente | 4–8 h |
| F4 | Perfiles y contratos de arquitectura | ArchSentinel | F1 | Pendiente | 16–32 h |
| F5 | Dependencias entre símbolos/clases | ArchSentinel | F4 | Pendiente | 24–60 h |
| F6 | Contexto de IA para repositorios grandes | ArchSentinel | F3 | Pendiente | 32–64 h |
| F7 | Evaluación reproducible de modelos | ArchSentinel | Arrancar tras F1; cierre tras F6 | Pendiente | 24–60 h |
| F8 | Documentación externa a propuestas de reglas | ArchSentinel + Preflight | F4, F6, F7 | Pendiente | 40–80 h |
| F9 | Estabilización y entrega conjunta | Ambos | F2–F8 | Pendiente | 16–32 h |

Estimación del alcance completo F1–F9: **174–374 horas**, aproximadamente
**8.700–29.920 €** a 50–80 €/hora, sin IVA, API ni hardware. Es una estimación de
ingeniería, no un presupuesto cerrado. Incluye trabajo que los escenarios
reducidos de la evaluación inicial no cubrían. Reestimar al cerrar F2, F5 y F7.
El desglose en hojas no valida esas estimaciones: son rangos agregados anteriores
al diseño detallado. Reutilizar funciones de develop/local evita reimplementarlas,
pero comprobar compatibilidad y estabilizar trabajo sin commit sigue teniendo coste.

## F0 — Documentación y seguimiento

Estado: completada. Responsable: repositorio agentic-preflight.

- [x] F0.1 Publicar este roadmap con fases, dependencias y aceptación.
- [x] F0.2 Publicar la guía del funcionamiento real y la interacción con ArchSentinel.
- [x] F0.3 Enlazar ambos documentos desde los README inglés y español.
- [x] F0.4 Añadir instrucciones persistentes para mantener documentación y progreso.
- [x] F0.5 Revisar enlaces, ejemplos y separación entre implementado y previsto.
- [x] F0.6 Auditar ramas locales y desglosar todas las entregas en unidades ejecutables por IA.
- [x] F0.7 Adoptar localmente el Git Flow de ArchSentinel: documentación, ramas y validación CI.

F0.7 responde a la decisión del usuario de usar el mismo flujo en ambos proyectos.
Sus unidades están en el catálogo. La publicación de ramas y apertura de PR
requieren petición expresa; la adopción local no implica publicación en GitHub.

### Rama de la entrega documental y Git Flow

- Rama local: `feature/git-flow-workflow`, creada desde `develop` en `5271108`.
- Incluye F0.1–F0.7: documentación, desglose, auditoría y adopción del flujo.
- Aceptación conjunta: documentación enlazada, progreso trazable, rutas de PR
  iguales a ArchSentinel y checks existentes preservados y correctos.
- Destino del PR: `develop`. Commit de la entrega: `52573d6`.
  `develop` y la feature están publicadas; [PR #1](https://github.com/Snake12Doc/agentic-preflight/pull/1)
  abierto, pendiente de revisión e integración.
- F1.1.1 sigue pendiente; su entrega es distinta y debe comenzar en una feature
  adecuada desde develop cuando esté disponible su base documental integrada.

Aceptación: una persona puede entender qué ejecuta cada herramienta, instalar la
configuración actual y distinguir la integración disponible de la futura.

## F1 — Primer recorrido conjunto por CLI

Estado: pendiente. Responsable: Preflight. Dependencia: F0.

- [ ] F1.1 Elegir y documentar una versión compatible de ArchSentinel y su instalación.
- [ ] F1.2 Añadir un ejemplo reproducible con código, `architecture.yaml` y un check `architecture` de preflight.
- [ ] F1.3 Verificar el recorrido real CLI con proyecto válido y violación arquitectónica.
- [ ] F1.4 Verificar configuración inválida, ejecutable ausente y timeout.
- [ ] F1.5 Documentar cómo aparecen los exit codes y la salida JSON en el informe de preflight.
- [ ] F1.6 Actualizar la guía con el ejemplo verificado y sus prerrequisitos.

Aceptación: una única ejecución de preflight ejecuta tests y ArchSentinel; un
fallo arquitectónico hace fallar el conjunto. No se necesita aún un cliente MCP.
Esta fase aprovecha el runner existente y no exige nuevos campos de configuración.

## F2 — Integración nativa con el MCP de ArchSentinel

Estado: pendiente. Responsables: ambos repositorios. Dependencia: F1.

- [ ] F2.1 Diseñar y registrar el contrato de integración: configuración, versiones, herramientas y formato del informe.
- [ ] F2.2 Definir compatibilidad/migración de los esquemas actuales antes de ampliarlos.
- [ ] F2.3 Implementar el cliente MCP stdio con conexión, timeout, cancelación y cierre del proceso.
- [ ] F2.4 Configurar ejecutable, argumentos y raíz desde configuración de confianza del proyecto.
- [ ] F2.5 Exponer desde preflight las operaciones arquitectónicas acordadas: lenguajes, check e inicialización sin sobrescritura.
- [ ] F2.6 Añadir el análisis arquitectónico a `run_preflight` y al informe persistente con hallazgos estructurados.
- [ ] F2.7 Distinguir `PASS`, `FAIL` y error técnico; no interpretar `isError: false` como aprobación arquitectónica.
- [ ] F2.8 Conservar comportamiento de proyectos que solo usan checks de comandos.
- [ ] F2.9 Verificar con dos servidores/procesos MCP reales, incluyendo reinicio y liberación de recursos.
- [ ] F2.10 Actualizar guía, README y ejemplos de configuración del agente.

Aceptación: el agente solo configura preflight como servidor y puede obtener
el resultado arquitectónico estructurado. Un `FAIL` de ArchSentinel debe hacer
fallar el preflight aunque la llamada MCP haya sido técnicamente correcta.

Decisión pendiente: nombres de las nuevas herramientas y estructura exacta del
informe. No documentarlos como API estable hasta implementarlos.

## F3 — Fallos de IA y resultados incompletos

Estado: pendiente. Responsables: ambos. Dependencia: F2.

- [ ] F3.1 Definir políticas explícitas para revisión semántica obligatoria u opcional y su valor por defecto.
- [ ] F3.2 Preservar los hallazgos estáticos cuando falle la revisión semántica.
- [ ] F3.3 Representar por separado el resultado estático, el estado semántico y la completitud de la ejecución.
- [ ] F3.4 Mostrar la causa del fallo sin incluir credenciales ni respuestas sensibles del proveedor.
- [ ] F3.5 Propagar la política y el estado por CLI, MCP e informe de preflight.
- [ ] F3.6 Verificar proveedor desconectado, timeout, HTTP de error, JSON inválido y exceso de contexto.
- [ ] F3.7 Actualizar la guía con la matriz de resultados y política elegida.

Aceptación: un fallo del modelo nunca elimina una violación estática ni aparece
como «revisión semántica completada sin problemas». Si se permite continuar,
el informe deja explícito qué parte no pudo ejecutarse.

## F4 — Perfiles arquitectónicos y contrato explícito

Estado: pendiente. Responsable: ArchSentinel. Dependencia: F1.

- [ ] F4.1 Separar estilo arquitectónico, organización modular y forma de despliegue en el diseño.
- [ ] F4.2 Definir restricciones verificables para hexagonal, layered, clean y monolito modular.
- [ ] F4.3 Ampliar validación y versionado del contrato preservando configuraciones existentes.
- [ ] F4.4 Añadir plantillas de inicialización y personalización explícita de capas/reglas.
- [ ] F4.5 Definir política para archivos sin capa y aclarar dependencias directas frente a transitivas.
- [ ] F4.6 Crear fixtures válidos e inválidos por perfil, con resultados esperados.
- [ ] F4.7 Actualizar prompt semántico y guía para reflejar los contratos admitidos.

Aceptación: cada perfil tiene reglas documentadas y ejemplos que prueban esas
reglas. No basta con aceptar otro valor de `style`. Un monolito puede ser hexagonal.

## F5 — Dependencias entre clases y símbolos

Estado: pendiente. Responsable: ArchSentinel. Dependencia: F4.

- [ ] F5.1 Acotar una primera entrega TypeScript y especificar qué cuenta como dependencia.
- [ ] F5.2 Modelar identidades de símbolos, alias, re-exports y localizaciones de origen.
- [ ] F5.3 Resolver dependencias por tipos, herencia, construcción y uso según el alcance acordado.
- [ ] F5.4 Añadir reglas declarativas «A no puede depender de B» y hallazgos con evidencia.
- [ ] F5.5 Definir y documentar el tratamiento de dependencias dinámicas/no resolubles.
- [ ] F5.6 Verificar clases en un mismo archivo, alias, interfaces, herencia y re-exports.
- [ ] F5.7 Medir coste de análisis y exponer resultados por CLI/MCP/preflight.
- [ ] F5.8 Actualizar la guía con soporte y límites por lenguaje.

Aceptación: detectar una dependencia prohibida entre dos clases del mismo archivo,
caso que un grafo de imports por sí solo no puede resolver. Python y Vue requieren
estimación propia si se amplía esta primera entrega; no prometer paridad automática.

## F6 — Contexto semántico para repositorios grandes

Estado: pendiente. Responsable: ArchSentinel. Dependencia: F3.

- [ ] F6.1 Definir presupuestos de bytes/tokens, peticiones, tiempo y concurrencia.
- [ ] F6.2 Dividir el trabajo por módulos/archivos sin perder líneas ni evidencias.
- [ ] F6.3 Seleccionar dependencias relevantes y registrar qué contexto se aportó.
- [ ] F6.4 Distinguir archivos analizados estáticamente, revisados por IA y omitidos.
- [ ] F6.5 Agregar y deduplicar resultados manteniendo los hallazgos estáticos.
- [ ] F6.6 Gestionar fallos parciales usando la política de F3.
- [ ] F6.7 Verificar repositorios que exceden el límite de una petición, exclusiones y alcance Git.
- [ ] F6.8 Actualizar guía con presupuestos, contexto y límites restantes.

Aceptación: procesar un proyecto mayor que una petición sin truncamiento
silencioso y con un informe reproducible del alcance real. Decidir con mediciones
si hace falta un índice persistente; no introducir embeddings solo por defecto.

## F7 — Fiabilidad de modelos locales y remotos

Estado: pendiente. Responsable: ArchSentinel. Comenzar tras F1; cierre tras F6.

- [ ] F7.1 Crear un corpus versionado con casos correctos, infracciones y casos ambiguos.
- [ ] F7.2 Separar pruebas de transporte de evaluación real del razonamiento del modelo.
- [ ] F7.3 Añadir un runner opt-in con modelo, versión, parámetros, prompt y contexto registrados.
- [ ] F7.4 Evaluar precisión, recall, falsos positivos y estabilidad entre ejecuciones.
- [ ] F7.5 Medir latencia, consumo y coste con al menos un modelo local y uno remoto.
- [ ] F7.6 Acordar umbrales de aceptación antes de usarlos como criterio de entrega.
- [ ] F7.7 Publicar resultados y recomendaciones, diferenciando confianza declarada de precisión medida.
- [ ] F7.8 Actualizar la guía con modelos evaluados y limitaciones observadas.

Aceptación: poder responder con datos qué modelo detecta qué infracciones y a qué
coste. Las pruebas normales deben seguir siendo reproducibles sin API ni GPU;
la evaluación real se ejecuta aparte y registra fecha y versión.

## F8 — Fuentes externas y propuestas de reglas

Estado: pendiente. Responsables: ArchSentinel y su integración en preflight.
Dependencias: F4, F6 y F7.

- [ ] F8.1 Acotar fuentes, proveedor de búsqueda, límites y comportamiento sin red.
- [ ] F8.2 Recuperar documentación y conservar URL, fecha y fragmentos usados.
- [ ] F8.3 Convertir documentación en propuestas de contrato, no en comandos ejecutables.
- [ ] F8.4 Validar propuestas contra el esquema y explicar cada regla y su procedencia.
- [ ] F8.5 Guardar propuesta/diff sin modificar automáticamente el contrato activo.
- [ ] F8.6 Añadir aplicación explícita de la propuesta y comprobación estática posterior.
- [ ] F8.7 Verificar fuentes contradictorias, respuestas inválidas y contenido que intenta dar instrucciones al modelo.
- [ ] F8.8 Exponer el flujo acordado en CLI/MCP y documentarlo en la guía.

Aceptación: a partir de una arquitectura solicitada se obtiene una propuesta
trazable y validada. El check ordinario sigue usando el contrato local; la
disponibilidad de internet no cambia silenciosamente sus reglas.

## F9 — Estabilización y entrega conjunta

Estado: pendiente. Responsables: ambos. Dependencias: F2–F8.

- [ ] F9.1 Mantener una matriz de versiones y lenguajes efectivamente soportados.
- [ ] F9.2 Verificar un proyecto de referencia completo desde instalación limpia.
- [ ] F9.3 Verificar CLI, MCP, fallos estáticos, fallo de IA y persistencia de informes de extremo a extremo.
- [ ] F9.4 Documentar uso en CI y la configuración necesaria para convertir el resultado en un bloqueo de integración.
- [ ] F9.5 Revisar ejemplos, skills, migraciones y documentación de ambos repositorios.
- [ ] F9.6 Ejecutar los checks de desarrollo requeridos y registrar resultados finales.
- [ ] F9.7 Preparar notas de versión; publicar/crear commits o PR solo cuando se solicite.

Aceptación: una persona ajena al desarrollo puede reproducir el flujo completo
con las versiones declaradas y entender todos sus estados y límites.

## Ampliaciones separadas del alcance anterior

Estas funciones figuran en el roadmap propio de ArchSentinel y se mantienen
visibles para evitar confundirlas con capacidades disponibles. No están incluidas
en la estimación F1–F9.

- [ ] EXT.1 Baseline versionada de infracciones existentes, sin ocultar regresiones.
- [ ] EXT.2 Exportación SARIF y anotaciones en plataformas CI.
- [ ] EXT.3 Paridad de reglas entre símbolos para Python/Vue si se solicita tras F5.

## Registro de progreso

| Fecha | Tarea/fase | Cambio | Verificación / referencia |
| --- | --- | --- | --- |
| 2026-11-12 | Diagnóstico inicial | Revisados código, documentación y límites de ambos proyectos. | Preflight: 17 tests; ArchSentinel: 218 tests; typecheck correcto en ambos. |
| 2026-11-12 | F0.1–F0.5 | Añadidos roadmap, guía funcional e instrucciones de mantenimiento; enlazados desde ambos README. | Enlaces locales revisados; configuración, informes y ejemplos contrastados con el código; ayuda CLI de ambos proyectos comprobada; `git diff --check` correcto. Entrega documental local, sin commit/PR. |
| 2026-11-12 | F0.6 | Auditadas todas las ramas locales y el árbol de ArchSentinel; añadidas 134 unidades principales y 16 de extensiones, conservando IDs padre. Guía e instrucciones actualizadas con diferencias main/develop/local. | Cobertura de entregas y dependencias revisadas; enlaces locales y formato comprobados; suites repetidas: P 17, A 218 correctas. `main` A: `ba2d2d9`; develop/HEAD A: `fd5cba7` más Vue sin commit. Sin fetch ni cambios en ArchSentinel. |
| 2026-11-12 | F0.7.1–F0.7.4 | Adoptado el Git Flow de ArchSentinel: CONTRIBUTING, instrucciones y plantilla PR, job de rutas y ramas locales develop/feature. Conservada la documentación previa. F1.1.1 pausada durante esta entrega. | `npm run check` correcto: tipos, build, 36 tests y empaquetado en seco. 19 casos ejecutan el script real de rutas. Formato y enlaces revisados. Base `5271108`; ramas sin publicar, sin commit/PR ni cambios en ArchSentinel. |
| 2026-11-12 | Publicación F0 | Con autorización del usuario, guardada la entrega, publicadas develop y feature y abierto el PR hacia develop. | Commit `52573d6`; [PR #1](https://github.com/Snake12Doc/agentic-preflight/pull/1). Sin fusión, tag ni publicación de paquete. |

## Criterio común de cierre

Una tarea funcional se considera terminada cuando el comportamiento está
implementado, tiene la verificación apropiada, sus errores y límites son visibles,
y la guía refleja exactamente lo entregado. No marcar una fase completa basándose
solo en un mock del proveedor o en documentación de una función aún no ejecutable.

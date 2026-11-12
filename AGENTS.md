# Instrucciones para trabajar en agentic-preflight

## Ramas y contribución

- Usar el mismo Git Flow que ArchSentinel. El trabajo planificado parte de
  `develop` en una rama `feature/*` y se integra por PR a `develop`.
- Antes de empezar, comprobar rama, base y cambios locales. Reutilizar la feature
  activa para unidades de la misma entrega; crear otra para una entrega distinta.
- Registrar qué IDs incluye la rama y su aceptación conjunta. Una unidad es una
  sesión; una rama/PR puede reunir varias unidades relacionadas y revisables.
- Usar `release/*` desde develop y `hotfix/*` desde main para integrar en main;
  sincronizar después con develop. No trabajar directamente sobre ramas permanentes.
- Conservar los cambios locales previos al crear/cambiar ramas. No publicar ramas,
  crear commits/PR, fusionar, etiquetar ni publicar paquetes sin petición expresa.

Rutas de PR admitidas:

| Origen | Base de creación | Destino del PR |
| --- | --- | --- |
| `feature/<nombre>` | `develop` | `develop` |
| `release/<versión>` | `develop` | `main`, después `develop` |
| `hotfix/<versión>` | `main` | `main`, después `develop` |
| `main` | Rama permanente | `develop` para sincronizar producción |

- Los nombres después de `/` no pueden estar vacíos. `develop` → `main` no es
  una ruta de release admitida. Integrar con merge commits y revisión de PR.
- Antes de una feature: comprobar estado, actualizar referencias y develop con
  fast-forward, y crear la rama desde esa base. No mover trabajo ajeno para ello.
- Antes de commit: revisar estado, diff e historial reciente; añadir solo archivos
  intencionados. Usar el estilo existente `feat:`, `fix:`, `docs:`, `ci:` o `chore:`.
- Antes de PR: revisar todos sus commits y diff respecto a develop. Usar `gh` y la
  plantilla PR para describir entrega, aceptación y verificación.
- En release/hotfix, actualizar `package.json`, `package-lock.json` y CHANGELOG.
  `src/version.ts` lee la versión del paquete. Etiquetar el commit fusionado en
  main como `vX.Y.Z` solo si se solicita. Publicar npm es una operación separada.
- Mantener release/hotfix hasta integrar también sus cambios en develop. Si hay
  otra release en preparación, incorporar los hotfix pertinentes y verificarla.
- CI comprueba las rutas con el job `Git Flow`; la protección obligatoria de
  ramas depende de la configuración de GitHub y no se presupone activada.

## Planificación local y documentación pública

- Los README inglés/español explican el uso público. Este AGENTS contiene las
  instrucciones compartidas para contribuir; no requiere un CONTRIBUTING separado.
- `ROADMAP.md`, `docs/`, `CONTRIBUTING.md` y `.local-docs/` son documentación de
  trabajo local, ignorada. Conservarla en disco y mantenerla al avanzar cuando
  exista; no añadirla a Git, no usar `git add -f` ni quitar sus reglas de ignore.
- No publicar nuevos documentos de roadmap, auditoría o planificación. Añadir
  instrucciones públicas necesarias a AGENTS/README y notas privadas a las rutas
  locales ignoradas. Revisar el índice antes de cada commit para evitar incluirlas.
- Si están disponibles, consultar el roadmap, el catálogo de unidades, la guía
  funcional y la auditoría local antes de desarrollar. Elegir una unidad hoja,
  revisar dependencias y revalidar ramas, SHA y cambios locales de ArchSentinel.
- Un clon nuevo no incluye esos documentos: usar la tarea y criterios entregados
  por el usuario. Si falta alcance, pedirlo; no recrear un roadmap público para
  suplir la planificación local ausente.
- Si una unidad exige varias decisiones o comportamientos independientes,
  subdividirla antes de empezar conservando su ID como padre. Preguntar cuando
  falten decisiones de producto, proveedor, credenciales o presupuesto real.
- Relacionar el trabajo con los IDs locales cuando existan. Cambiar el estado al
  empezar; marcar completado solo después de implementar y verificar. Registrar
  progreso, bloqueos, resultados y referencias de commits/PR reales localmente.
- Actualizar los README cuando cambie información pública de CLI, MCP,
  configuración, informes, errores o integración. Actualizar también la guía
  local cuando exista; no subirla al hacerlo.
- Mantener separados el funcionamiento actual y el previsto. No publicar opciones
  propuestas como si ya las aceptase el código.

## Cambios compartidos con ArchSentinel

- ArchSentinel es otro repositorio: comprobar su versión y contratos reales.
- Leer sus instrucciones de contribución antes de modificarlo. Conservar los
  cambios locales existentes de otras personas/agentes.
- Si el alcance requiere ambos repositorios, registrar la verificación de cada
  uno y mantener la fase pendiente/en curso hasta validar la integración.
- Al trabajar en ArchSentinel, incluir en el contexto la unidad y sus documentos
  de referencia de preflight; no asumir que sus agentes leen estas instrucciones.
- Un `FAIL` arquitectónico puede ser una llamada MCP correcta. No equiparar
  `isError: false` a gate aprobado.
- No anunciar como estable una capacidad observada solo en cambios locales sin
  identificar esa limitación.

## Verificación

- Para cambios funcionales de preflight, ejecutar los checks apropiados; el check
  completo del proyecto es `npm run check`.
- Requiere Node.js 20 o posterior y npm; instalar con `npm ci`. El check completo
  comprueba tipos, compila, ejecuta pruebas y verifica el paquete en seco.
- Si cambia el ejemplo Spring Boot, ejecutar además `mvn --batch-mode verify`
  desde `examples/spring-boot-demo` con Java 21 y Maven.
- Mantener la matriz CI existente: Ubuntu Node 20/24, Windows Node 24 y Spring
  Boot. Registrar los resultados por plataforma sin inferirlos del check local.
- Para documentación, revisar enlaces, rutas, comandos y ejemplos contra el
  código. No hacen falta pruebas nuevas que solo repitan el texto.
- No afirmar que un modelo es preciso basándose solo en mocks o en que la API
  responde. Las evaluaciones reales deben registrar modelo, contexto y resultados.
- No crear commits, publicar paquetes ni abrir PR sin petición expresa.

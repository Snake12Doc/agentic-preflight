# Instrucciones para trabajar en agentic-preflight

## Ramas y contribución

- Seguir `CONTRIBUTING.md`: mismo Git Flow que ArchSentinel. El trabajo planificado
  parte de `develop` en una rama `feature/*` y se integra por PR a `develop`.
- Antes de empezar, comprobar rama, base y cambios locales. Reutilizar la feature
  activa para unidades de la misma entrega; crear otra para una entrega distinta.
- Registrar qué IDs incluye la rama y su aceptación conjunta. Una unidad es una
  sesión; una rama/PR puede reunir varias unidades relacionadas y revisables.
- Usar `release/*` desde develop y `hotfix/*` desde main para integrar en main;
  sincronizar después con develop. No trabajar directamente sobre ramas permanentes.
- Conservar los cambios locales previos al crear/cambiar ramas. No publicar ramas,
  crear commits/PR, fusionar, etiquetar ni publicar paquetes sin petición expresa.

## Roadmap y documentación viva

- Antes de desarrollar funcionalidades, consultar `ROADMAP.md` y
  `docs/agentic-preflight-y-archsentinel.md`.
- Elegir una unidad hoja de `docs/roadmap-unidades-ia.md`, no una fase ni una
  entrega padre. Revisar sus dependencias y su aceptación antes de editar código.
- Revalidar la foto de `docs/auditoria-archsentinel.md` contra ramas, SHA y cambios
  locales. Reutilizar capacidades existentes, aunque aún no estén en `main`.
- Si una unidad exige varias decisiones o comportamientos independientes,
  subdividirla antes de empezar conservando su ID como padre. Preguntar cuando
  falten decisiones de producto, proveedor, credenciales o presupuesto real.
- Relacionar el trabajo con los identificadores del roadmap. Si no existe una
  tarea adecuada, añadirla con alcance y aceptación antes de ampliarlo.
- Cambiar la fase a «en curso» al empezar; mantener visibles los bloqueos.
- Marcar `[x]` solo después de implementar y verificar el criterio de la tarea.
  No marcar otras tareas o repositorios como completados por inferencia.
- Registrar el progreso y la verificación en la tabla de historial. Añadir
  referencias de commits/PR solo cuando realmente existan.
- Actualizar la guía funcional en la misma entrega si cambia CLI, MCP,
  configuración, informes, errores, reglas arquitectónicas, soporte de lenguajes,
  uso del modelo o interacción con ArchSentinel. Actualizar ejemplos y fecha.
- Mantener separados el funcionamiento actual y el previsto. No publicar opciones
  propuestas como si ya las aceptase el código.
- Actualizar los README inglés y español cuando cambie su información pública.

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
- Para documentación, revisar enlaces, rutas, comandos y ejemplos contra el
  código. No hacen falta pruebas nuevas que solo repitan el texto.
- No afirmar que un modelo es preciso basándose solo en mocks o en que la API
  responde. Las evaluaciones reales deben registrar modelo, contexto y resultados.
- No crear commits, publicar paquetes ni abrir PR sin petición expresa.

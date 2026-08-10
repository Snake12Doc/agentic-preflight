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

```bash
npm install
npm run check
```

El conjunto de pruebas cubre la validación de la configuración, los resultados
correctos, los errores, los tiempos de espera y un recorrido completo entre un
cliente y un servidor MCP reales mediante stdio.

## Licencia

MIT

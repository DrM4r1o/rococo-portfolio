# La Brújula Rococó — Instrumentarium Curatorial

Portfolio personal de **Mario Esparza Pérez**, concebido no como una web al uso sino
como un **instrumento de precisión**: una brújula de mármol, bronce y pátina que ordena
cada aspecto de una carrera profesional según los cuatro puntos cardinales.

> «La belleza no es ornamento accidental, sino orden matemático iluminado por el
> espíritu.»

## Concepto

La estancia de bienvenida no muestra menús ni bloques de texto compitiendo por la
atención. Muestra un objeto: una brújula tridimensional que se convierte en el sistema
de navegación. El contenido no se explica, se descubre al alinear el cursor o tocar cada
coordenada.

La **brújula** es la metáfora central: cada dirección cardinal separa y da sentido a una
faceta distinta de la trayectoria profesional.

| Coordenada | Dirección | Contenido |
| :--------- | :-------- | :-------- |
| 000° | **Norte** | Orígenes & Genealogía — el periplo formativo y profesional, en orden cronológico. |
| 090° | **Este** | Proyectos & Obras — catálogo de vitrinas interactivas y piezas de ingeniería. |
| 180° | **Sur** | Artesanía & Obras — selección destacada del stack y del oficio full-stack. |
| 270° | **Oeste** | Filosofía & Manifiesto — crónicas, ensayos de oficio y canal epistolar. |

## Inspiración visual

Pese al nombre «Rococó», la paleta y la atmósfera se inspiran en la **Iglesia de Mármol
de Copenhague** (*Marmorkirken* / Iglesia de Federico), célebre por su gran cúpula de
cobre envejecido:

- **Verdes de pátina** — el cobre oxidado de la cúpula define el fondo atmosférico
  (`patina-bg`), con degradados radiales que evocan la profundidad del domo.
- **Bronce y pan de oro** — remates, filetes, sellos y tipografía grabada con brillo
  metálico (`gold-leaf-text`, `bronze-leaf-text`).
- **Crema de mármol** — la piedra clara del templo como color de superficie y texto.

Todo el material visual del instrumento se genera de forma **procedural** (texturas,
vetas y reflejos) sin depender de *assets* externos.

## Tecnologías

- [**Astro 7**](https://astro.build) — generación del sitio y enrutado con *View
  Transitions* (`ClientRouter`).
- [**Three.js**](https://threejs.org) — la brújula 3D, con *fallback* CSS/SVG si WebGL
  no está disponible.
- [**GSAP**](https://gsap.com) — coreografía de las travesías Norte y Sur.
- [**Tailwind CSS 4**](https://tailwindcss.com) — estilos, con el tema personalizado
  declarado en `src/styles/global.css`.
- [**MDX**](https://docs.astro.build/en/guides/integrations-guide/mdx/) y *Content
  Collections* — todo el contenido es Markdown tipado con Zod.
- **TypeScript** — tipado estricto en componentes, *scripts* y esquemas de contenido.

Tipografías: **Cinzel** (titulares grabados), **Cormorant Garamond** y **EB Garamond**
(lectura), **Inter** (cuerpo funcional) y **Material Symbols** para la iconografía.

## Estructura

```text
/
├── public/                     # favicon y estáticos
├── src/
│   ├── components/
│   │   ├── Artesania/          # vitrina Sur (obras destacadas)
│   │   ├── Compass/            # brújula 3D, nodos cardinales y fallback
│   │   ├── Origins/            # travesía Norte (genealogía)
│   │   └── UI/                 # cabecera y pie acordeón
│   ├── content/
│   │   ├── blog/               # crónicas y ensayos (Oeste)
│   │   ├── origins/            # hitos formativos y profesionales (Norte)
│   │   └── projects/           # obras y casos de estudio (Este)
│   ├── layouts/                # BaseLayout y PostLayout
│   ├── pages/                  # rutas: /, /projects, /blog y sus [slug]
│   ├── scripts/                # escena Three.js y controladores GSAP
│   ├── styles/global.css       # tema, paleta y coreografía teatral
│   └── content.config.ts       # esquemas Zod de las colecciones
├── astro.config.mjs
└── package.json
```

## Comandos

Todos los comandos se ejecutan desde la raíz del proyecto:

| Comando | Acción |
| :------ | :----- |
| `pnpm install` | Instala las dependencias. |
| `pnpm dev` | Arranca el servidor de desarrollo en `localhost:4321`. |
| `pnpm build` | Genera el sitio de producción en `./dist/`. |
| `pnpm preview` | Previsualiza el build antes de desplegar. |
| `pnpm check` | Ejecuta `astro check` (tipos y diagnóstico). |
| `pnpm astro ...` | Ejecuta la CLI de Astro (`astro add`, `astro check`, etc.). |

> En desarrollo en segundo plano: `astro dev --background`, gestionable con
> `astro dev status`, `astro dev logs` y `astro dev stop`.

## Contenido

Las tres colecciones se definen en `src/content.config.ts` con esquemas validados por
Zod:

- **`origins`** — `order`, `period`, `role`, `location`, `highlights`, `meta`.
- **`projects`** — `year`, `role`, `stack`, `url`/`repo`/`links`, `featured`.
- **`blog`** — `pubDate`, `updatedDate`, `tags`, `cover`, `draft`.

Añadir una nueva crónica, hito u obra es crear un archivo Markdown/MDX en la carpeta
correspondiente: la brújula y las listas se alimentan automáticamente de las
colecciones.

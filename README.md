# PIM · Parque Industrial Minero — sitio web

Sitio bilingüe (ES/EN) del Parque Industrial Minero (RN20, junto al Aeropuerto de San Juan). Desarrolla ZLT.

## Cómo funciona

El sitio se edita en `src/` y se **compila a un único HTML autocontenido** (fotos, videos, logos, fuentes, Leaflet, CSS y JS embebidos). No hay dependencias: alcanza con Python 3.

```
python build.py          # genera index.html (raíz) y html/PIM-WEB.html
python build.py --index  # idem, pero indexable por Google (por defecto: noindex)
```

Para verlo en local: abrir `index.html` en el navegador.

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/index.html` | Estructura y textos (pares `.l-es` / `.l-en`) |
| `src/styles.css` | Estilos y tokens de marca PIM |
| `src/app.js` | Idioma, mapa, masterplan, galerías, formulario |
| `src/data.js` | **Datos editables**: configuración, unidades/tipologías, estado de obra |
| `fotos/` | Renders definitivos (WebP 1600 px) |
| `videos/` | Animaciones Kling (H.264, sin audio) + pósters |
| `mapas/` | Aéreo del masterplan, satelitales y vistas del brochure |
| `logos/` | PIM (color, blanco, negro, isotipo), ZLT, Mercado Libre |
| `iconos/` | Iconografía oficial de servicios (SVG del manual) |
| `fuentes/` | Alexandria (OFL, marca PIM) y Urbanist (sustituto de Gilroy) |
| `brochures/` | Brochure general comprimido (se enlaza, no se embebe) |
| `vendor/` | Leaflet 1.9.4 |
| `html/` | HTML de entrega (`PIM-WEB.html`) |
| `links/` | Links y referencias del proyecto |

## Tareas habituales

- **Cargar tipologías**: completar `tipologias` en `src/data.js` con `publicar: true` → `python build.py`.
- **Actualizar estado de obra**: editar `obra.etapas` (estado, avance %, hitos, video) en `src/data.js`.
- **Conectar el formulario**: poner la URL en `config.formEndpoint` (recibe POST JSON con `perfil: inversor|empresa`). Mientras sea `null`, el envío abre WhatsApp con el mensaje armado.
- **Ubicación exacta**: reemplazar `config.parque` (hoy es aproximada).

## Notas

- Gilroy se declara pero no se embebe (licencia); Urbanist es el sustituto visual.
- Mapa: gratuito y abierto — OpenTopoMap (relieve, vista regional) y OpenStreetMap (entorno del parque), con su atribución. Sin claves ni costos; uso razonable según sus políticas.
- PIM todavía no tiene web oficial (dominios propuestos: parqueindustrialminero.com / pimsanjuan.com).
- Videos a 24 fps (frecuencia nativa de las animaciones de Kling).
- Límite de subida: 30 MB. El build avisa si se supera.

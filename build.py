#!/usr/bin/env python3
"""
PIM · Parque Industrial Minero — build del sitio.

Genera UN único HTML autocontenido (fotos, videos, logos, fuentes, Leaflet,
CSS y JS embebidos en base64) a partir de src/ y las carpetas de assets.
Solo usa la librería estándar de Python 3.

    python build.py            -> index.html (raíz, para GitHub Pages)
                                  html/PIM-WEB.html (copia de entrega)
    python build.py --index    -> permite indexación (por defecto noindex)
    python build.py --sin-login -> sin pantalla de login (por defecto lleva gate.js,
                                  copia exacta del de ZLT-WEB-V2: mismos usuarios)

Marcadores soportados en src/:
    {{include:ruta}}      inserta el archivo como texto (se procesa recursivo)
    {{asset:ruta}}        data URI base64 del archivo
    {{asset-css:ruta}}    CSS de un vendor (se inserta tal cual)
    {{asset-js:ruta}}     JS de un vendor (se inserta tal cual, escapando </script)
    {{brochure_url}}      ruta relativa al brochure PDF
    {{robots}}            meta robots
"""
import base64, mimetypes, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
BROCHURE = 'brochures/PIM-Brochure.pdf'
LIMIT_MB = 30
MIME = {'.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
        '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.pdf': 'application/pdf'}
_cache = {}


def read(rel):
    with open(os.path.join(ROOT, rel), 'r', encoding='utf-8') as f:
        return f.read()


def data_uri(rel):
    if rel not in _cache:
        p = os.path.join(ROOT, rel)
        if not os.path.isfile(p):
            sys.exit(f'ERROR: no existe el asset {rel}')
        ext = os.path.splitext(rel)[1].lower()
        mt = MIME.get(ext) or mimetypes.guess_type(p)[0] or 'application/octet-stream'
        with open(p, 'rb') as f:
            _cache[rel] = f'data:{mt};base64,' + base64.b64encode(f.read()).decode('ascii')
    return _cache[rel]


def render(text, ctx, depth=0):
    if depth > 6:
        sys.exit('ERROR: includes demasiado anidados')

    def rep(m):
        kind, arg = m.group(1), (m.group(2) or '').strip()
        if kind == 'include':
            s = read(arg)
            if arg.endswith('.svg'):
                s = re.sub(r'<\?xml.*?\?>', '', s).strip()
                s = s.replace('<svg ', '<svg aria-hidden="true" focusable="false" ', 1)
            return render(s, ctx, depth + 1)
        if kind == 'asset':
            return data_uri(arg)
        if kind == 'asset-css':
            return read(arg)
        if kind == 'asset-js':
            return read(arg).replace('</script', '<\\/script')
        if kind in ctx:
            return ctx[kind]
        sys.exit(f'ERROR: marcador desconocido {m.group(0)}')

    return re.sub(r'\{\{([a-z_-]+)(?::([^}]+))?\}\}', rep, text)


def main():
    robots = 'index,follow' if '--index' in sys.argv else 'noindex,nofollow'
    src = read('src/index.html')
    # Login: gate.js (copia exacta del de ZLT-WEB-V2) inline después de </title>,
    # antes de que se pinte nada. No modificarlo: si cambian los usuarios, copiarlo de nuevo.
    login = '--sin-login' not in sys.argv
    if login:
        if not os.path.isfile(os.path.join(ROOT, 'gate.js')):
            sys.exit('ERROR: falta gate.js (login). Copiarlo de ZLT-WEB-V2 o usar --sin-login')
        gate = read('gate.js').replace('</script', '<\\/script')
        src = src.replace('</title>', '</title>\n<script>' + gate + '</script>', 1)
    outs = [('index.html', BROCHURE), ('html/PIM-WEB.html', '../' + BROCHURE)]
    for out, bro in outs:
        html = render(src, {'brochure_url': bro, 'robots': robots})
        left = re.findall(r'\{\{[^}]+\}\}', html)
        if left:
            sys.exit(f'ERROR: quedaron marcadores sin resolver: {left[:5]}')
        p = os.path.join(ROOT, out)
        os.makedirs(os.path.dirname(p) or ROOT, exist_ok=True)
        with open(p, 'w', encoding='utf-8', newline='\n') as f:
            f.write(html)
        mb = os.path.getsize(p) / 1048576
        print(f'OK  {out}  {mb:.1f} MB' + ('  <-- SUPERA EL LIMITE DE SUBIDA' if mb > LIMIT_MB else ''))
    print(f'robots: {robots}  ·  login: {"sí (gate.js)" if login else "NO"}')


if __name__ == '__main__':
    main()

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse

ROOT = Path(__file__).resolve().parent
BLOCKED_PARTS = {'.github', '.superdesign', '.venv', '__pycache__'}
BLOCKED_NAMES = {'README.md', '.htaccess', 'serve.py'}
BLOCKED_SUFFIXES = {'.py', '.pyc', '.map', '.bak', '.old', '.orig', '.swp'}
CSP = (
    "default-src 'self'; base-uri 'self'; form-action 'self'; script-src 'self'; "
    "script-src-attr 'none'; style-src 'self'; style-src-attr 'none'; img-src 'self'; "
    "font-src 'self'; frame-src 'self'; connect-src 'self'; object-src 'none'; "
    "frame-ancestors 'none'"
)


class PortfolioHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        decoded_path = unquote(urlsplit(path).path).replace('\\', '/')
        parts = [part for part in decoded_path.split('/') if part not in ('', '.', '..')]
        if any(part.startswith('.') or part in BLOCKED_PARTS for part in parts):
            return str(ROOT / '__blocked_resource__')
        if parts and (parts[-1] in BLOCKED_NAMES or Path(parts[-1]).suffix.lower() in BLOCKED_SUFFIXES):
            return str(ROOT / '__blocked_resource__')

        candidate = ROOT.joinpath(*parts).resolve()
        if not candidate.is_relative_to(ROOT):
            return str(ROOT / '__blocked_resource__')
        return str(candidate)

    def list_directory(self, path):
        self.send_error(404)
        return None

    def end_headers(self):
        self.send_header('Content-Security-Policy', CSP)
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('X-Frame-Options', 'DENY')
        request_path = urlsplit(self.path).path
        if request_path in ('', '/') or request_path.endswith('.html'):
            self.send_header('Cache-Control', 'no-cache')
        else:
            self.send_header('Cache-Control', 'public, max-age=86400')
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description='Serve the static R_KHYN portfolio on localhost.')
    parser.add_argument('--port', type=int, default=8000)
    port = parser.parse_args().port
    server = ThreadingHTTPServer(('127.0.0.1', port), PortfolioHandler)
    print(f'R_KHYN local server: http://127.0.0.1:{port}/')
    server.serve_forever()


if __name__ == '__main__':
    main()

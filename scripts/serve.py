"""Local preview server.

Sends no-store on everything so an edit is always what you see in the browser.
Production caching is handled by vercel.json, not here.
"""
import functools, http.server, os, socketserver

ROOT = "/Users/atingarg/Documents/Indulge A2"
PORT = 4321

os.chdir(ROOT)
http.server.SimpleHTTPRequestHandler.extensions_map[".webp"] = "image/webp"


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass


socketserver.TCPServer.allow_reuse_address = True
handler = functools.partial(Handler, directory=ROOT)
with socketserver.TCPServer(("127.0.0.1", PORT), handler) as httpd:
    print(f"serving {ROOT} on http://127.0.0.1:{PORT}", flush=True)
    httpd.serve_forever()

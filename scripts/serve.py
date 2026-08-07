import os, functools, http.server, socketserver
ROOT = "/Users/atingarg/Documents/Indulge A2"
os.chdir(ROOT)
http.server.SimpleHTTPRequestHandler.extensions_map[".webp"] = "image/webp"
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", 4321), Handler) as httpd:
    print("serving on http://127.0.0.1:4321", flush=True)
    httpd.serve_forever()

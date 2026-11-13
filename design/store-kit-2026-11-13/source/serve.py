from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from urllib.request import urlopen,Request
from pathlib import Path
import os
ROOT=Path(__file__).resolve().parents[1]
os.chdir(ROOT)
class Handler(SimpleHTTPRequestHandler):
 def end_headers(self):
  self.send_header("Cache-Control","no-store")
  super().end_headers()
 def do_GET(self):
  path=self.path.split('?')[0]
  if (path.startswith(('/source/','/assets/','/rustore/','/google-play/','/app-store/')) and (ROOT/path.lstrip('/')).exists()) or path in ('/index.html','/','/preview.jpg','/UPLOAD-GUIDE.txt','/keys-store-kit.zip','/VALIDATION.json','/listing-copy.json'):
   return super().do_GET()
  target='/' + self.path.split('?',1)[1] if False else self.path
  if path=='/_app':target='/'+('?' + self.path.split('?',1)[1] if '?' in self.path else '')
  try:
   r=urlopen(Request('http://127.0.0.1:5173'+target),timeout=30);data=r.read()
   self.send_response(r.status);self.send_header('Content-Type',r.headers.get('Content-Type','application/octet-stream'));self.end_headers();self.wfile.write(data)
  except Exception as e:self.send_error(502,str(e))
 def log_message(self,*a):pass
ThreadingHTTPServer(('127.0.0.1',5194),Handler).serve_forever()

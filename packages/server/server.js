import { createServer } from 'http';
import { readFile } from 'fs/promises';
import path from 'path';

const port = 3000;

// Les types MIMES à utiliser dynamiquement

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
};

const server = createServer(async (req, res) => {
  if (req.url === '/') {

    const filePath = path.join(process.cwd(), 'public', 'index.html');
    try {
      const data = await readFile(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  } else if (req.url.endsWith('.css')) {
    const filePath = path.join(process.cwd(), 'public', req.url);
    try {
      const data = await readFile(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
      res.end(data);
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File Not Found');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(port, () => {
  console.log(`Le serveur est en écoute sur le port ${port}`);
});
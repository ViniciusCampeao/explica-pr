import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const pasta = new URL('./', import.meta.url).pathname;
const host = process.env.HOST || '127.0.0.1';
const porta = Number(process.env.PORT || 8766);
const arquivos = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/explica-pr-extensao.zip': ['explica-pr-extensao.zip', 'application/zip']
};

createServer(async (req, res) => {
  const item = arquivos[new URL(req.url, 'http://localhost').pathname];
  if (!item || (req.method !== 'GET' && req.method !== 'HEAD')) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Página não encontrada.');
    return;
  }
  try {
    const conteudo = await readFile(join(pasta, item[0]));
    res.writeHead(200, {
      'Content-Type': item[1],
      'Content-Length': conteudo.length,
      'Content-Disposition': item[0].endsWith('.zip') ? 'attachment; filename="explica-pr-extensao.zip"' : 'inline',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store'
    });
    res.end(req.method === 'HEAD' ? undefined : conteudo);
  } catch {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('O pacote da extensão ainda não está disponível.');
  }
}).listen(porta, host, () => console.log(`Página do Explica PR disponível em http://${host}:${porta}`));

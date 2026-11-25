// Servidor local para testar SEM o netlify-cli:  node dev-server.mjs
// Serve a pasta public/ e liga as rotas /api/* às mesmas funções do Netlify.
// Dados de teste ficam em .dev-data/ (apague a pasta para zerar).
import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

process.env.LOCAL_STORE_DIR ??= path.join(path.dirname(fileURLToPath(import.meta.url)), ".dev-data");
process.env.ADMIN_PASSWORD ??= "admin123";

const raiz = path.dirname(fileURLToPath(import.meta.url));
const publico = path.join(raiz, "public");
const { default: inscrever } = await import("./netlify/functions/inscrever.mjs");
const { default: admin } = await import("./netlify/functions/admin.mjs");

const TIPOS = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css",
  ".mp4": "video/mp4", ".webm": "video/webm", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml",
};

const porta = Number(process.env.PORT || 8888);

http
  .createServer(async (rq, rs) => {
    try {
      const url = new URL(rq.url, `http://localhost:${porta}`);
      if (url.pathname.startsWith("/api/")) {
        const chunks = [];
        for await (const c of rq) chunks.push(c);
        const corpo = chunks.length ? Buffer.concat(chunks) : undefined;
        const req = new Request(url, { method: rq.method, headers: rq.headers, body: ["GET", "HEAD"].includes(rq.method) ? undefined : corpo });
        const handler = url.pathname.startsWith("/api/admin/") ? admin : url.pathname === "/api/inscrever" ? inscrever : null;
        if (!handler) { rs.writeHead(404).end("Not found"); return; }
        const res = await handler(req, {});
        const cabecalhos = {};
        res.headers.forEach((v, k) => (cabecalhos[k] = v));
        rs.writeHead(res.status, cabecalhos).end(Buffer.from(await res.arrayBuffer()));
        return;
      }
      let caminho = url.pathname === "/" ? "/index.html" : url.pathname === "/admin" ? "/admin.html" : url.pathname;
      const arquivo = path.join(publico, path.normalize(caminho));
      if (!arquivo.startsWith(publico)) { rs.writeHead(403).end(); return; }
      const dados = await fs.readFile(arquivo);
      rs.writeHead(200, { "content-type": TIPOS[path.extname(arquivo)] || "application/octet-stream" }).end(dados);
    } catch (e) {
      rs.writeHead(e.code === "ENOENT" ? 404 : 500).end(e.code === "ENOENT" ? "Not found" : String(e));
    }
  })
  .listen(porta, () => {
    console.log(`\nCadastro MCMV rodando em http://localhost:${porta}`);
    console.log(`Painel admin:           http://localhost:${porta}/admin   (senha de teste: ${process.env.ADMIN_PASSWORD})\n`);
  });

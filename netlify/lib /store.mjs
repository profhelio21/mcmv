// Armazenamento das inscrições.
// Em produção usa Netlify Blobs. Para testes locais, defina LOCAL_STORE_DIR
// e os dados ficam em arquivos JSON numa pasta.
import { getStore } from "@netlify/blobs";
import { promises as fs } from "node:fs";
import path from "node:path";

function localStore(dir) {
  const arquivo = (k) => path.join(dir, encodeURIComponent(k) + ".json");
  return {
    async get(key) {
      try {
        return JSON.parse(await fs.readFile(arquivo(key), "utf8"));
      } catch {
        return null;
      }
    },
    async setJSON(key, value) {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(arquivo(key), JSON.stringify(value));
    },
    async delete(key) {
      try {
        await fs.unlink(arquivo(key));
      } catch {}
    },
    async list() {
      try {
        const nomes = await fs.readdir(dir);
        return {
          blobs: nomes
            .filter((n) => n.endsWith(".json"))
            .map((n) => ({ key: decodeURIComponent(n.slice(0, -5)) })),
        };
      } catch {
        return { blobs: [] };
      }
    },
  };
}

export function inscricoes() {
  if (process.env.LOCAL_STORE_DIR) return localStore(process.env.LOCAL_STORE_DIR);
  return getStore({ name: "inscricoes", consistency: "strong" });
}

// Lê todas as inscrições, ordena da mais antiga para a mais nova
// e numera: Interessado 1, Interessado 2, ...
export async function listarTodas(store) {
  const { blobs } = await store.list();
  const itens = [];
  const LOTE = 40;
  for (let i = 0; i < blobs.length; i += LOTE) {
    const lote = blobs.slice(i, i + LOTE);
    const lidos = await Promise.all(
      lote.map(async (b) => {
        try {
          return await store.get(b.key, { type: "json" });
        } catch {
          return null;
        }
      })
    );
    for (const x of lidos) if (x) itens.push(x);
  }
  itens.sort((a, b) => String(a.criadoEm).localeCompare(String(b.criadoEm)));
  itens.forEach((x, idx) => (x.numero = idx + 1));
  return itens;
}

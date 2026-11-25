// POST /api/inscrever — recebe o cadastro feito pelo interessado.
import { randomBytes } from "node:crypto";
import { validar } from "../lib/validar.mjs";
import { avaliar } from "../lib/faixas.mjs";
import { inscricoes } from "../lib/store.mjs";

const json = (corpo, status = 200) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

// Código curto para o interessado guardar (sem letras confusas como O/0/I/1).
function gerarProtocolo() {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let s = "";
  for (const b of bytes) s += alfabeto[b % alfabeto.length];
  return `MCMV-${s}`;
}

export default async (req) => {
  if (req.method !== "POST") return json({ erro: "Método não permitido." }, 405);

  const texto = await req.text();
  if (texto.length > 10_000) return json({ erro: "Requisição grande demais." }, 413);

  let corpo;
  try {
    corpo = JSON.parse(texto);
  } catch {
    return json({ erro: "Requisição inválida." }, 400);
  }

  // Campo-isca invisível: pessoas não preenchem, robôs sim. Finge sucesso e descarta.
  if (corpo.website) {
    return json({
      ok: true,
      protocolo: gerarProtocolo(),
      resultado: { nivel: "aprovado", faixa: null, titulo: "Cadastro aprovado!", mensagem: "Obrigado!" },
    });
  }

  const { ok, erros, dados } = validar(corpo);
  if (!ok) return json({ erro: "validacao", campos: erros }, 400);

  const store = inscricoes();
  const chave = `cpf-${dados.cpf}`; // um cadastro por CPF

  if (await store.get(chave, { type: "json" })) {
    return json(
      {
        erro: "duplicado",
        campos: { cpf: "Este CPF já está cadastrado. Se precisar atualizar seus dados, fale com a equipe no quiosque." },
      },
      409
    );
  }

  const resultado = avaliar(dados);
  const registro = {
    chave,
    protocolo: gerarProtocolo(),
    criadoEm: new Date().toISOString(),
    ...dados,
    faixa: resultado.faixa,
    resultado: resultado.nivel,
    triagem: resultado.triagem,
  };
  await store.setJSON(chave, registro);

  const { triagem, ...publico } = resultado; // triagem é só para a equipe
  return json({ ok: true, protocolo: registro.protocolo, resultado: publico });
};

export const config = { path: "/api/inscrever" };

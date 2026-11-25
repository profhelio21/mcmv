// Rotas do painel administrativo (todas sob /api/admin/*).
import { senhaConfere, criarCookie, cookieDeSaida, estaAutenticado } from "../lib/auth.mjs";
import { inscricoes, listarTodas } from "../lib/store.mjs";
import { gerarXlsx } from "../lib/xlsx.mjs";

const json = (corpo, status = 200, extra = {}) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });

const ROTULOS = {
  estadoCivil: { solteiro: "Solteiro(a)", casado: "Casado(a)", uniao_estavel: "União estável", divorciado: "Divorciado(a)", viuvo: "Viúvo(a)" },
  ocupacao: { clt: "CLT (carteira assinada)", autonomo: "Autônomo(a)", servidor: "Servidor(a) público(a)", aposentado: "Aposentado(a)/Pensionista", empresario: "Empresário(a)", sem_renda: "Sem renda", outro: "Outro" },
  simNao: { sim: "Sim", nao: "Não", nao_sei: "Não sei" },
  resultado: { aprovado: "Aprovado", otimo: "Aprovado", analise: "Aprovado" }, // otimo/analise = cadastros antigos
  triagem: { compativel: "Perfil compatível", verificar: "Verificar elegibilidade" },
};

// Cadastros feitos antes da mudança não têm "triagem": deduz do resultado antigo.
const triagemDe = (x) =>
  x.triagem || (x.resultado === "otimo" ? "compativel" : x.resultado === "analise" ? "verificar" : "");

const fmtCpf = (c) => c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
const fmtTel = (t) =>
  t.length === 11 ? t.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") : t.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
const fmtData = (iso) => (iso ? iso.split("-").reverse().join("/") : "");
const fmtDataHora = (iso) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Fortaleza",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(iso))
    .replace(",", "");

function xlsxDasInscricoes(itens) {
  const colunas = [
    { titulo: "Interessado", largura: 15 },
    { titulo: "Data/Hora do cadastro", largura: 20 },
    { titulo: "Protocolo", largura: 16 },
    { titulo: "Nome completo", largura: 34 },
    { titulo: "CPF", largura: 16 },
    { titulo: "Data de nascimento", largura: 14 },
    { titulo: "Telefone / WhatsApp", largura: 18 },
    { titulo: "E-mail", largura: 28 },
    { titulo: "Cidade", largura: 16 },
    { titulo: "Bairro", largura: 20 },
    { titulo: "Renda familiar mensal", largura: 18, tipo: "moeda" },
    { titulo: "Faixa MCMV (estimada)", largura: 16 },
    { titulo: "Pessoas na família", largura: 11 },
    { titulo: "Estado civil", largura: 16 },
    { titulo: "Ocupação", largura: 24 },
    { titulo: "Possui imóvel?", largura: 12 },
    { titulo: "Já foi beneficiado?", largura: 12 },
    { titulo: "CadÚnico?", largura: 11 },
    { titulo: "Triagem interna", largura: 24 },
    { titulo: "Resultado exibido", largura: 16 },
    { titulo: "Origem", largura: 11 },
  ];
  const linhas = itens.map((x) => [
    `Interessado ${x.numero}`,
    fmtDataHora(x.criadoEm),
    x.protocolo,
    x.nome,
    fmtCpf(x.cpf),
    fmtData(x.nascimento),
    fmtTel(x.telefone),
    x.email || "",
    x.cidade,
    x.bairro,
    x.renda,
    x.faixa || "Acima das faixas",
    x.pessoasFamilia,
    ROTULOS.estadoCivil[x.estadoCivil] || x.estadoCivil,
    ROTULOS.ocupacao[x.ocupacao] || x.ocupacao,
    ROTULOS.simNao[x.possuiImovel],
    ROTULOS.simNao[x.jaBeneficiado],
    ROTULOS.simNao[x.cadUnico],
    ROTULOS.triagem[triagemDe(x)] || "",
    ROTULOS.resultado[x.resultado] || x.resultado,
    x.origem === "quiosque" ? "Quiosque" : "Link",
  ]);
  return gerarXlsx({ aba: "Interessados", colunas, linhas });
}

export default async (req) => {
  const url = new URL(req.url);
  const rota = url.pathname.replace(/^\/api\/admin\/?/, "").replace(/\/$/, "");

  // ---- Login / logout (únicas rotas abertas) ----
  if (rota === "login" && req.method === "POST") {
    if (!process.env.ADMIN_PASSWORD)
      return json({ erro: "ADMIN_PASSWORD não está configurada no Netlify." }, 500);
    let corpo = {};
    try {
      corpo = await req.json();
    } catch {}
    if (!senhaConfere(String(corpo.senha ?? ""))) {
      await new Promise((r) => setTimeout(r, 900)); // atrasa tentativas erradas
      return json({ erro: "Senha incorreta." }, 401);
    }
    return json({ ok: true }, 200, { "set-cookie": criarCookie() });
  }
  if (rota === "logout" && req.method === "POST") {
    return json({ ok: true }, 200, { "set-cookie": cookieDeSaida() });
  }

  // ---- Daqui para baixo, só com sessão válida ----
  if (!estaAutenticado(req)) return json({ erro: "Não autorizado." }, 401);

  if (rota === "sessao" && req.method === "GET") return json({ ok: true });

  if (rota === "inscricoes" && req.method === "GET") {
    const itens = await listarTodas(inscricoes());
    return json({ total: itens.length, itens });
  }

  if (rota.startsWith("inscricoes/") && req.method === "DELETE") {
    const chave = decodeURIComponent(rota.slice("inscricoes/".length));
    if (!/^cpf-\d{11}$/.test(chave)) return json({ erro: "Chave inválida." }, 400);
    await inscricoes().delete(chave);
    return json({ ok: true });
  }

  if (rota === "exportar" && req.method === "GET") {
    const itens = await listarTodas(inscricoes());
    const arquivo = xlsxDasInscricoes(itens);
    const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Fortaleza" });
    return new Response(arquivo, {
      status: 200,
      headers: {
        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "content-disposition": `attachment; filename="interessados-mcmv-${hoje}.xlsx"`,
        "cache-control": "no-store",
      },
    });
  }

  return json({ erro: "Rota não encontrada." }, 404);
};

export const config = { path: "/api/admin/*" };

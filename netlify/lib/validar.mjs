// Validação dos dados do formulário (roda no servidor — nunca confie só no navegador).

export const soDigitos = (s) => String(s ?? "").replace(/\D/g, "");

export function cpfValido(cpf) {
  const d = soDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (base) => {
    let soma = 0;
    for (let i = 0; i < base; i++) soma += Number(d[i]) * (base + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

const ESTADO_CIVIL = ["solteiro", "casado", "uniao_estavel", "divorciado", "viuvo"];
const OCUPACAO = ["clt", "autonomo", "servidor", "aposentado", "empresario", "sem_renda", "outro"];
const SIM_NAO = ["sim", "nao"];
const CAD_UNICO = ["sim", "nao", "nao_sei"];

function idadeEm(isoData) {
  const [a, m, d] = isoData.split("-").map(Number);
  const hoje = new Date();
  let idade = hoje.getFullYear() - a;
  if (hoje.getMonth() + 1 < m || (hoje.getMonth() + 1 === m && hoje.getDate() < d)) idade--;
  return idade;
}

function dataIsoValida(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [a, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d));
  return dt.getUTCFullYear() === a && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

const limpar = (s, max) =>
  String(s ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

export function validar(body) {
  const erros = {};
  const d = {};

  d.nome = limpar(body.nome, 120);
  if (d.nome.split(" ").filter((p) => p.length > 1).length < 2) erros.nome = "Informe nome e sobrenome.";

  d.cpf = soDigitos(body.cpf);
  if (!cpfValido(d.cpf)) erros.cpf = "CPF inválido. Confira os números.";

  d.nascimento = String(body.nascimento ?? "");
  if (!dataIsoValida(d.nascimento)) erros.nascimento = "Data de nascimento inválida.";
  else {
    const idade = idadeEm(d.nascimento);
    if (idade < 18) erros.nascimento = "É preciso ter 18 anos ou mais.";
    else if (idade > 110) erros.nascimento = "Data de nascimento inválida.";
  }

  d.telefone = soDigitos(body.telefone);
  if (!(d.telefone.length === 10 || d.telefone.length === 11) || Number(d.telefone.slice(0, 2)) < 11)
    erros.telefone = "Telefone inválido. Informe com DDD.";
  else if (d.telefone.length === 11 && d.telefone[2] !== "9") erros.telefone = "Celular deve começar com 9 após o DDD.";

  d.email = limpar(body.email, 120).toLowerCase();
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) erros.email = "E-mail inválido.";

  d.cidade = limpar(body.cidade, 60);
  if (d.cidade.length < 2) erros.cidade = "Informe a cidade.";
  d.bairro = limpar(body.bairro, 80);
  if (d.bairro.length < 2) erros.bairro = "Informe o bairro.";

  d.estadoCivil = String(body.estadoCivil ?? "");
  if (!ESTADO_CIVIL.includes(d.estadoCivil)) erros.estadoCivil = "Escolha uma opção.";

  d.pessoasFamilia = Number(body.pessoasFamilia);
  if (!Number.isInteger(d.pessoasFamilia) || d.pessoasFamilia < 1 || d.pessoasFamilia > 20)
    erros.pessoasFamilia = "Informe quantas pessoas moram com você.";

  d.possuiImovel = String(body.possuiImovel ?? "");
  if (!SIM_NAO.includes(d.possuiImovel)) erros.possuiImovel = "Escolha uma opção.";
  d.jaBeneficiado = String(body.jaBeneficiado ?? "");
  if (!SIM_NAO.includes(d.jaBeneficiado)) erros.jaBeneficiado = "Escolha uma opção.";
  d.cadUnico = String(body.cadUnico ?? "");
  if (!CAD_UNICO.includes(d.cadUnico)) erros.cadUnico = "Escolha uma opção.";

  d.ocupacao = String(body.ocupacao ?? "");
  if (!OCUPACAO.includes(d.ocupacao)) erros.ocupacao = "Escolha uma opção.";

  d.renda = Number(body.renda);
  if (!Number.isFinite(d.renda) || d.renda < 0 || d.renda > 1_000_000) erros.renda = "Informe a renda familiar mensal.";
  else d.renda = Math.round(d.renda * 100) / 100;

  if (body.consentimento !== true) erros.consentimento = "É necessário aceitar para concluir.";

  d.origem = body.origem === "quiosque" ? "quiosque" : "link";

  return { ok: Object.keys(erros).length === 0, erros, dados: d };
}

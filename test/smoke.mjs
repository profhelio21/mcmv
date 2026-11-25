// Teste de fumaça das funções (sem rede, sem Netlify): node test/smoke.mjs
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

process.env.LOCAL_STORE_DIR = mkdtempSync(path.join(tmpdir(), "mcmv-"));
process.env.ADMIN_PASSWORD = "senha-teste";

const { default: inscrever } = await import("../netlify/functions/inscrever.mjs");
const { default: admin } = await import("../netlify/functions/admin.mjs");
const { cpfValido } = await import("../netlify/lib/validar.mjs");

const post = (url, corpo, headers = {}) =>
  new Request("http://x" + url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(corpo) });

const base = {
  nome: "Maria da Silva Souza", cpf: "529.982.247-25", nascimento: "1990-05-17", telefone: "(86) 99834-7852",
  email: "maria@exemplo.com", cidade: "Teresina", bairro: "Centro", estadoCivil: "casado", pessoasFamilia: 3,
  possuiImovel: "nao", jaBeneficiado: "nao", cadUnico: "sim", ocupacao: "clt", renda: 2800, consentimento: true, origem: "quiosque",
};

// CPF
assert.equal(cpfValido("529.982.247-25"), true);
assert.equal(cpfValido("111.111.111-11"), false);
assert.equal(cpfValido("529.982.247-24"), false);

// Inscrição válida -> "aprovado" para todos; a faixa continua sendo calculada
let r = await inscrever(post("/api/inscrever", base));
let j = await r.json();
assert.equal(r.status, 200);
assert.equal(j.resultado.nivel, "aprovado");
assert.equal(j.resultado.titulo, "Cadastro aprovado!");
assert.equal(j.resultado.faixa, "Faixa 1");
assert.equal(j.resultado.triagem, undefined); // triagem interna não vai para o navegador do interessado
assert.match(j.protocolo, /^MCMV-[A-Z0-9]{6}$/);

// Duplicado
r = await inscrever(post("/api/inscrever", base));
assert.equal(r.status, 409);

// Inválidos
r = await inscrever(post("/api/inscrever", { ...base, cpf: "123.456.789-00" }));
assert.equal(r.status, 400);
assert.ok((await r.json()).campos.cpf);
r = await inscrever(post("/api/inscrever", { ...base, cpf: "111.444.777-35", nascimento: "2015-01-01" }));
assert.ok((await r.json()).campos.nascimento);

// Segundo e terceiro: com imóvel e renda alta também recebem "aprovado" (a diferença fica só na triagem interna)
r = await inscrever(post("/api/inscrever", { ...base, cpf: "111.444.777-35", nome: "João Pereira Lima", renda: 4500, possuiImovel: "sim", telefone: "86 98888-1234" }));
j = await r.json();
assert.equal(j.resultado.nivel, "aprovado");
assert.equal(j.resultado.faixa, "Faixa 2");
r = await inscrever(post("/api/inscrever", { ...base, cpf: "390.533.447-05", nome: "Ana Paula Ramos", renda: 15000 }));
j = await r.json();
assert.equal(j.resultado.nivel, "aprovado");
assert.equal(j.resultado.faixa, null);

// Honeypot: finge sucesso mas não salva
r = await inscrever(post("/api/inscrever", { ...base, cpf: "000.000.000-00", website: "http://spam" }));
assert.equal(r.status, 200);

// Admin sem login
r = await admin(new Request("http://x/api/admin/inscricoes"));
assert.equal(r.status, 401);

// Login errado / certo
r = await admin(post("/api/admin/login", { senha: "errada" }));
assert.equal(r.status, 401);
r = await admin(post("/api/admin/login", { senha: "senha-teste" }));
assert.equal(r.status, 200);
const cookie = r.headers.get("set-cookie").split(";")[0];

// Cookie adulterado não passa
r = await admin(new Request("http://x/api/admin/inscricoes", { headers: { cookie: cookie.slice(0, -3) + "abc" } }));
assert.equal(r.status, 401);

// Listagem
r = await admin(new Request("http://x/api/admin/inscricoes", { headers: { cookie } }));
j = await r.json();
assert.equal(j.total, 3);
assert.deepEqual(j.itens.map((x) => x.numero), [1, 2, 3]);
assert.deepEqual(j.itens.map((x) => x.triagem), ["compativel", "verificar", "verificar"]);
assert.ok(j.itens.every((x) => x.resultado === "aprovado"));

// Exportação
r = await admin(new Request("http://x/api/admin/exportar", { headers: { cookie } }));
assert.equal(r.status, 200);
assert.match(r.headers.get("content-disposition"), /interessados-mcmv-\d{4}-\d{2}-\d{2}\.xlsx/);
const arq = path.join(tmpdir(), "teste-interessados.xlsx");
writeFileSync(arq, Buffer.from(await r.arrayBuffer()));
console.log("xlsx gerado em", arq);

// Exclusão
r = await admin(new Request("http://x/api/admin/inscricoes/cpf-52998224725", { method: "DELETE", headers: { cookie } }));
assert.equal(r.status, 200);
r = await admin(new Request("http://x/api/admin/inscricoes", { headers: { cookie } }));
assert.equal((await r.json()).total, 2);

console.log("OK — todos os testes passaram");

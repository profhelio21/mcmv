// Autenticação simples do administrador: senha única (variável ADMIN_PASSWORD)
// + cookie assinado (HMAC) que expira em 8 horas.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "mcmv_admin";
const DURACAO_SEG = 8 * 60 * 60;

const chave = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
const hash = (s) => createHash("sha256").update(String(s)).digest();

export function senhaConfere(informada) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  return timingSafeEqual(hash(informada), hash(real));
}

function assinar(texto) {
  return createHmac("sha256", chave()).update(texto).digest("hex");
}

export function criarCookie() {
  const exp = Math.floor(Date.now() / 1000) + DURACAO_SEG;
  const token = `${exp}.${assinar(String(exp))}`;
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${DURACAO_SEG}`;
}

export function cookieDeSaida() {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export function estaAutenticado(req) {
  if (!chave()) return false;
  const bruto = req.headers.get("cookie") || "";
  const par = bruto
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(COOKIE + "="));
  if (!par) return false;
  const [exp, assinatura] = par.slice(COOKIE.length + 1).split(".");
  if (!exp || !assinatura || Number(exp) < Date.now() / 1000) return false;
  const esperado = assinar(exp);
  if (esperado.length !== assinatura.length) return false;
  return timingSafeEqual(Buffer.from(esperado), Buffer.from(assinatura));
}

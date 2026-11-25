// Faixas de renda do Minha Casa, Minha Vida (imóveis urbanos).
// Valores em vigor desde abril/2026 (Portaria MCID nº 333/2026):
//   Faixa 1: até R$ 3.200      Faixa 2: até R$ 5.000
//   Faixa 3: até R$ 9.600      Faixa 4: até R$ 13.000
// Se o governo atualizar os limites, altere somente esta lista.
export const FAIXAS = [
  { numero: 1, ate: 3200, nome: "Faixa 1" },
  { numero: 2, ate: 5000, nome: "Faixa 2" },
  { numero: 3, ate: 9600, nome: "Faixa 3" },
  { numero: 4, ate: 13000, nome: "Faixa 4" },
];

export function faixaDaRenda(renda) {
  return FAIXAS.find((f) => renda <= f.ate) || null;
}

// Resultado da inscrição.
// Para o interessado: TODO cadastro concluído é "aprovado" para seguir ao atendimento presencial
// (ele é convidado a comparecer com documentos), independentemente da renda informada.
// Isto NÃO é aprovação de financiamento — esse aviso fica na tela final.
//
// Para a equipe (uso interno, aparece no painel/Excel e não na tela do interessado):
//   triagem = "compativel" -> renda dentro de uma faixa do programa e sem imóvel/benefício declarado
//   triagem = "verificar"  -> renda acima das faixas, ou declarou ter imóvel/já ter sido beneficiado
export function avaliar(d) {
  const faixa = faixaDaRenda(d.renda);
  const verificar = !faixa || d.possuiImovel === "sim" || d.jaBeneficiado === "sim";
  return {
    nivel: "aprovado",
    triagem: verificar ? "verificar" : "compativel",
    faixa: faixa ? faixa.nome : null,
    titulo: "Cadastro aprovado!",
    mensagem: "Seu imóvel está mais próximo do que você imagina.",
  };
}

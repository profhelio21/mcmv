# Cadastro de Interessados — Minha Casa, Minha Vida (Quiosque Shopping da Praça Pedro II)

Duas abas no topo:
- **Cadastro** — vídeo de apresentação, frases de motivação, formulário de 3 etapas, tela de processamento com
  porcentagem e tela final **"Cadastro aprovado!"** pedindo para comparecer ao quiosque com documento,
  comprovante de renda e comprovante de endereço.
- **Conheça o decorado** — cartões dos empreendimentos (Mix Taumaturgo, Antonino, Benedito, Guriatã e Olavo Bilac);
  ao tocar, abre um visualizador com as imagens/plantas dos totens (com zoom), a fachada e um resumo em texto; mais os vídeos.

Painel administrativo com lista de inscrições e download em Excel.

## Como publicar no Netlify (via GitHub)
1. Suba esta pasta inteira para um repositório no GitHub.
2. No Netlify: **Add new site → Import from Git** e escolha o repositório (o `netlify.toml` já configura tudo).
3. Em **Site configuration → Environment variables**, crie:
   - `ADMIN_PASSWORD` → a senha do painel (use uma senha forte)
   - `ADMIN_SECRET` → (opcional) qualquer texto longo e aleatório, usado para assinar a sessão
4. Faça o deploy. Endereços:
   - Quiosque: `https://SEU-SITE.netlify.app/?origem=quiosque`  (o `?origem=quiosque` marca o cadastro como feito no quiosque)
   - Link/QR Code para divulgação: `https://SEU-SITE.netlify.app/`
   - Painel: `https://SEU-SITE.netlify.app/admin`

Os dados ficam no **Netlify Blobs** (já incluso, sem configurar nada).

## O que editar
- `public/config.js` → nome, **endereço/horário do quiosque**, **lista do que a pessoa deve levar**, textos da tela final,
  frases, vídeos, dados dos empreendimentos do decorado e tempos de reinício.
- `public/videos/` → vídeos ilustrativos (.mp4). Veja `LEIA-ME.txt` na pasta.
- `public/decorado/` → imagens dos totens: `<id>-capa.jpg` (cartão), `<id>-p1.jpg` (fachada e dados), `<id>-p2.jpg` (imagens e plantas).
  Para um novo empreendimento: gere as 3 imagens (os PDFs originais pesam 15–55 MB; aqui foram convertidos para JPEG de ~1 MB),
  coloque na pasta e acrescente um bloco em `decorado.empreendimentos` no `config.js`.
- `netlify/lib/faixas.mjs` → limites de renda das faixas do MCMV (valores de abril/2026: 3.200 / 5.000 / 9.600 / 13.000).

## Sobre a tela "Cadastro aprovado!"
Todo cadastro concluído mostra a mesma tela positiva, independentemente de renda ou respostas: ele está **aprovado para
seguir ao atendimento presencial**. A tela traz um aviso pequeno de que o financiamento depende da análise de documentos e
de crédito (edite em `config.js → resultado.aviso`; recomendamos manter, pois a concessão é decisão da instituição financeira).

Para a equipe (e só para ela), o painel e o Excel têm a coluna **"Triagem interna"**:
`Perfil compatível` (renda dentro de uma faixa do programa e sem imóvel/benefício declarado) ou
`Verificar elegibilidade` (renda acima das faixas, ou declarou ter imóvel / já ter sido beneficiado).
A "Faixa MCMV (estimada)" também continua na planilha. Nada disso aparece na tela do interessado.

## Testar no seu computador (sem Netlify CLI)
```
npm install
node dev-server.mjs      # http://localhost:8888  (admin: /admin, senha de teste: admin123)
node test/smoke.mjs      # testes automáticos do backend
```

## Regras que o sistema já aplica
- Um cadastro por CPF (CPF validado pelos dígitos verificadores, no navegador e no servidor).
- Maior de 18 anos, telefone com DDD, aceite LGPD obrigatório.
- No quiosque, a tela limpa os dados após 2 min sem toque e 90 s depois do resultado (privacidade);
  na aba do decorado, volta ao início após 90 s sem toque (só com `?origem=quiosque`).
- Planilha: uma linha por pessoa (`Interessado 1`, `Interessado 2`…), na ordem de chegada.

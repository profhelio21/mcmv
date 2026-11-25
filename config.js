// ============================================================
//  CONFIGURAÇÕES DO QUIOSQUE — edite aqui, sem mexer no resto
// ============================================================
window.MCMV_CONFIG = {
  // Nome que aparece no topo da página
  empreendimento: "Minha Casa, Minha Vida · Centro de Teresina",

  // Onde a pessoa deve comparecer depois de concluir o cadastro
  local: {
    nome: "Quiosque MCMV — Shopping da Praça Pedro II",
    endereco: "Praça Pedro II, Centro — Teresina/PI", // CONFIRME o endereço/piso exato
    horario: "", // ex.: "Segunda a sábado, das 9h às 18h" (deixe vazio para não mostrar)
    // O que a pessoa deve levar (aparece como lista na tela final)
    levar: [
      { icone: "📄", texto: "Documento de identificação com foto" },
      { icone: "💼", texto: "Comprovante de renda" },
      { icone: "🏠", texto: "Comprovante de endereço" },
    ],
  },

  // Textos da tela final (depois de clicar em "Finalizar")
  resultado: {
    titulo: "Cadastro aprovado!",
    destaque: "Seu imóvel está mais próximo do que você imagina.",
    chamada: "Agora é só comparecer ao quiosque com os itens abaixo em mãos:",
    apoio:
      "Nossa equipe orienta você em cada etapa — e a imobiliária facilita bastante o processo para famílias de baixa renda.",
    // Aviso pequeno no rodapé da tela. Mantenha: o financiamento é decidido pela instituição financeira.
    aviso:
      "Este é um pré-cadastro de interesse. A concessão do financiamento e o enquadramento na faixa do programa dependem da análise de documentos e de crédito pela instituição financeira.",
  },

  // Vídeos (ilustrativos). Coloque os arquivos na pasta public/videos/ e liste aqui.
  //  • O primeiro vídeo toca na tela inicial (e todos aparecem na aba "Conheça o decorado").
  //  • poster = imagem de capa (opcional).  Vídeos na vertical (9:16) são reconhecidos sozinhos.
  //  • Se a lista ficar vazia, a tela inicial mostra uma animação de apresentação.
  videos: [
    {
      src: "videos/mix-olavo-bilac.mp4",
      poster: "videos/mix-olavo-bilac.jpg",
      titulo: "Mix Olavo Bilac — perto de tudo",
      retrato: true,
    },
  ],

  // Aba "Conheça o decorado": uma entrada por empreendimento.
  // As imagens ficam em public/decorado/  →  <id>-capa.jpg (cartão), <id>-p1.jpg (fachada e dados), <id>-p2.jpg (imagens e plantas)
  decorado: {
    titulo: "Conheça o decorado",
    subtitulo: "Veja como serão os apartamentos e as áreas de lazer. Toque em um empreendimento para ver as imagens e plantas.",
    aviso: "Imagens, plantas e vídeos meramente ilustrativos. Para informações atualizadas de cada empreendimento, fale com a nossa equipe no quiosque.",
    empreendimentos: [
      {
        id: "mix-taumaturgo",
        nome: "Mix Taumaturgo",
        apartamentos: 64,
        metragem: "36,13 a 55,56 m²",
        vagas: "55 vagas de estacionamento",
        lojas: "1 loja âncora (121 m²)",
        areaConstruida: "4.625,91 m²",
        ondeFica: "Esquina da R. Taumaturgo de Azevedo com a R. Dr. Área Leão, Centro",
        localizacao:
          "Na esquina da R. Taumaturgo de Azevedo com a R. Dr. Área Leão, no Centro de Teresina, a poucas quadras da Av. José dos Santos e Silva. Fica num entorno de clínicas, laboratórios e serviços de saúde, perto da Arena Sinttel e com acesso fácil às principais vias do Centro.",
        lazer: ["Piscina", "Playground", "Academia"],
        tipos: [
          { nome: "Tipo 1", area: "55,56 m²", unidades: 8 },
          { nome: "Tipo 2", area: "36,13 m²", unidades: 8 },
          { nome: "Tipo 3", area: "52,80 m²", unidades: 48 },
        ],
        pavimentos: [
          ["Cobertura", "Piscina, playground, academia"],
          ["2º ao 8º", "Apartamentos"],
          ["1º pav.", "Apartamentos"],
          ["Térreo", "Estacionamento, lojas e recepção, zeladoria, subestação e lixeira"],
          ["Subsolo", "Estacionamento"],
        ],
      },
      {
        id: "mix-antonino",
        nome: "Mix Antonino",
        chamada: "O Centro cultural de Teresina na porta de casa.",
        apartamentos: 90,
        quartos: "1 e 2 quartos",
        metragem: "25,93 a 49,63 m²",
        vagas: "85 vagas de estacionamento",
        lojas: "6 lojas (1 âncora + 5 lojas)",
        areaConstruida: "8.614 m²",
        ondeFica: "Av. Antonino Freire, em frente ao Palácio de Karnak",
        localizacao:
          "Na Av. Antonino Freire, com localização privilegiada, em frente ao Palácio de Karnak e ao lado da Igreja São Benedito e dos Correios.",
        lazer: ["Espaço gourmet", "Piscina"],
        tipos: [
          { nome: "Tipo 1", area: "39,96 m²", unidades: 36 },
          { nome: "Tipo 2", area: "25,93 m²", unidades: 18 },
          { nome: "Tipo 3", area: "41,51 m²", unidades: 24 },
          { nome: "Tipo 4", area: "49,63 m²", unidades: 12 },
        ],
        pavimentos: [
          ["1º pav.", "Apartamentos e lazer: espaço gourmet e piscina"],
          ["2º ao 6º", "Apartamentos"],
          ["Térreo", "Estacionamento, lojas e recepção, zeladoria, subestação e lixeira"],
          ["Subsolo", "Estacionamento"],
        ],
      },
      {
        id: "mix-benedito",
        nome: "Mix Benedito",
        chamada: "Com a fachada antiga preservada, mantendo o estilo e a personalidade do bairro.",
        apartamentos: 57,
        quartos: "1, 2 e 3 quartos",
        metragem: "32,44 a 62,67 m²",
        vagas: "66 vagas (57 de carro e 9 de moto)",
        lojas: "2 lojas",
        areaConstruida: "5.276,56 m²",
        ondeFica: "Em frente à Praça da Liberdade e à Igreja São Benedito",
        localizacao:
          "Localização privilegiada, em frente à Praça da Liberdade e à Igreja São Benedito, com acesso às principais vias do bairro.",
        lazer: ["Piscina", "Área gourmet", "Área fitness", "Brinquedoteca", "Playground"],
        tipos: [
          { nome: "Tipo 1", area: "32,44 m²", unidades: 28 },
          { nome: "Tipo 2 (A, B, C, D e E)", area: "49,14 a 53,13 m²", unidades: 23 },
          { nome: "Tipo 3", area: "62,67 m²", unidades: 6 },
        ],
        pavimentos: [
          ["1º ao 3º", "Apartamentos"],
          ["4º", "Apartamentos, piscina e área gourmet, área fitness, brinquedoteca, playground"],
          ["Térreo", "Estacionamento, lojas e recepção, zeladoria, lixeira"],
          ["Subsolo", "Estacionamento"],
        ],
      },
      {
        id: "mix-guriata",
        nome: "Mix Guriatã",
        apartamentos: 96,
        quartos: "2 e 3 quartos",
        metragem: "40,80 a 52,80 m²",
        vagas: "108 vagas de garagem",
        lojas: "2.201,3 m² de área comercial",
        areaConstruida: "7.794,8 m²",
        ondeFica: "Esquina da Av. Honório de Paiva com a R. Tersandro Paz",
        localizacao:
          "Esquina da Av. Honório de Paiva com a R. Tersandro Paz, a uma quadra da Av. Miguel Rosa, perto do corpo de bombeiros.",
        lazer: ["Piscina", "Playground"],
        tipos: [
          { nome: "Tipo 1", area: "40,80 m²", unidades: 48 },
          { nome: "Tipo 2", area: "52,80 m²", unidades: 48 },
        ],
        pavimentosTitulo: "Programa de necessidades",
        pavimentos: [
          ["Apartamentos", "96 apartamentos de 2 e 3 quartos"],
          ["Lazer", "Área de lazer com piscina, playground"],
          ["Edifício comercial", "Salas comerciais para aluguel"],
          ["Edifício-garagem", "Térreo mais 1 pavimento com 108 vagas"],
        ],
      },
      {
        id: "mix-olavo-bilac",
        nome: "Mix Olavo Bilac",
        chamada: "Pra morar, trabalhar e comprar no mesmo endereço, no Centro de Teresina.",
        // O totem traz "127 apartamentos" no destaque e "95 apartamentos" na tabela de tipos.
        // Enquanto isso não for confirmado, deixamos o total sem número (coloque aqui quando confirmar).
        apartamentos: null,
        metragem: "43,32 a 65,64 m²",
        vagas: "130 vagas de estacionamento",
        lojas: "7 lojas (1 loja âncora + 6 lojas e galeria no mezanino)",
        areaConstruida: "11.958 m²",
        ondeFica: "Av. José dos Santos e Silva, ao lado da Praça Conselheiro Saraiva",
        localizacao:
          "Na Av. José dos Santos e Silva, com fundos para a Rua Olavo Bilac e esquina com a Rua Barroso, ao lado da Praça Conselheiro Saraiva.",
        lazer: ["Espaço gourmet", "Piscinas adulto e infantil", "Playground", "Academia", "Quadra poliesportiva", "Coworking"],
        tipos: [
          { nome: "Tipo 1", area: "45,84 m²", unidades: 12 },
          { nome: "Tipo 2", area: "43,32 m²", unidades: 77 },
          { nome: "Tipo 3", area: "65,64 m²", unidades: 6 },
        ],
        pavimentos: [
          ["1º pav.", "Coworking e estacionamento"],
          ["2º pav.", "Apartamentos e lazer: espaço gourmet, copa, playground, deck, piscinas adulto e infantil, academia e quadra poliesportiva"],
          ["3º ao 7º", "Apartamentos"],
          ["Mezanino", "Lojas e galeria"],
          ["Térreo", "Recepção, loja âncora, sala de condomínio, zeladoria, lixeira e subestação"],
        ],
      },
    ],
  },

  // Frases de apoio e motivação (giram na tela inicial)
  frases: [
    "O sonho da casa própria pode estar mais perto do que você imagina.",
    "Sua família merece um lar para chamar de seu.",
    "Dê o primeiro passo: leva menos de 3 minutos.",
    "Chega de aluguel. Comece sua história no seu próprio lar.",
    "Muitas famílias já realizaram esse sonho. Agora é a sua vez de tentar.",
    "Cadastre-se e conte com a nossa equipe para te orientar.",
    "Casa própria é segurança, é futuro, é a sua conquista.",
  ],

  // Frase de incentivo exibida em cada etapa do formulário
  frasesEtapas: [
    "Ótimo começo! Vamos conhecer você.",
    "Falta pouco! Conte sobre a sua família.",
    "Última etapa! Seu novo lar está logo ali.",
  ],

  tempoInatividadeSeg: 120, // sem tocar na tela por esse tempo → limpa os dados (privacidade no quiosque)
  tempoInatividadeDecoradoSeg: 90, // no quiosque: sem toque na aba do decorado → volta para a tela inicial
  tempoReinicioResultadoSeg: 90, // depois do resultado, volta sozinho para a tela inicial
};

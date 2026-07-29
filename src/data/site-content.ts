const assetBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const siteContent = {
  brand: {
    name: "INEMA",
    descriptor: "Ecossistema",
    logoText: "INEMA",
    officialLogoPath: null,
    faviconPath: `${assetBasePath}/brand/favicon-inema-placeholder.svg`,
  },
  seo: {
    title: "Ecossistema INEMA | Inteligência Artificial aplicada a negócios",
    description:
      "O Ecossistema INEMA reúne educação, comunidade, experiências presenciais e construção prática com Inteligência Artificial para empresas, equipes e profissionais.",
    keywords: [
      "Ecossistema INEMA",
      "Inteligência Artificial para empresas",
      "educação em IA",
      "treinamento de IA",
      "automação com IA",
      "agentes de IA",
      "Vibe Code",
      "imersivos presenciais",
      "INEMA PRO",
      "INEMA CLUB",
    ],
  },
  contacts: {
    whatsappNumber: "5554996422265",
    whatsappContactName: "Tiza",
    whatsappMessage:
      "Olá, Tiza. Quero conhecer o Ecossistema INEMA e entender como isso pode ajudar minha empresa.",
    email: "inematds@gmail.com",
  },
  links: {
    inemaVip: null,
    inemaPro: "https://www.inema.pro/",
    inemaClub: "https://www.inema.club/",
    inematdsx: null,
  },
  edition: {
    active: false,
    name: null,
    theme: null,
    dates: null,
    schedule: null,
    seats: null,
    address: "Canela/RS e ambientes digitais do INEMA",
    investment: null,
    paymentTerms: null,
    includedBenefits: [],
    lodgingInfo: null,
    foodInfo: null,
    mentors: ["Nei Maldaner"],
    registrationStatus: "Contato comercial",
  },
  media: {
    heroImage: {
      src: `${assetBasePath}/images/imersivo-presencial-provisorio.png`,
      alt: "Pessoas trabalhando em projetos, tecnologia e Inteligência Artificial em uma experiência prática.",
      caption:
        "Educação, comunidade e construção prática com Inteligência Artificial.",
    },
  },
  navigation: [
    { label: "Visão geral", href: "#visao-geral" },
    { label: "Para empresas", href: "#empresas" },
    { label: "Método", href: "#metodo" },
    { label: "Ecossistema", href: "#ecossistema" },
    { label: "Contato", href: "#formulario" },
  ],
  hero: {
    eyebrow: "Ecossistema INEMA",
    title: "Inteligência Artificial com direção, prática e comunidade.",
    subtitle:
      "Uma estrutura de educação, conteúdo, comunidade, experiências presenciais e construção de soluções para empresas e profissionais que querem aplicar IA com clareza e resultado.",
    support: "Educação | Comunidade | Imersivos | Projetos com IA",
    primaryCta: "Falar com a Tiza",
    secondaryCta: "Conhecer o ecossistema",
    variants: [
      {
        title: "IA aplicada ao que a empresa realmente precisa resolver.",
        subtitle:
          "O INEMA ajuda equipes a entender possibilidades, priorizar caminhos e transformar tecnologia em aplicação prática.",
      },
      {
        title: "Do conteúdo à implementação, com acompanhamento próximo.",
        subtitle:
          "A proposta combina formação, repertório, comunidade, experiências presenciais e construção orientada.",
      },
    ],
  },
  positioning: {
    statement:
      "O INEMA conecta educação, estratégia e execução para que empresas e profissionais saiam do discurso sobre IA e entrem na construção de soluções reais.",
    selectedPhrases: [
      "Aprender enquanto constrói.",
      "Transformar IA em processo, produto e decisão.",
      "Conectar pessoas, ferramentas e projetos.",
    ],
  },
  quickIntro: {
    title: "Uma página para entender tudo o que o INEMA está construindo",
    text: [
      "O Ecossistema INEMA organiza diferentes frentes para acelerar a adoção prática da Inteligência Artificial: conteúdos gratuitos, trilhas estruturadas, comunidade, cursos, imersivos presenciais e projetos orientados para empresas.",
      "A proposta é ajudar pessoas e organizações a sair da curiosidade dispersa e avançar para uma aplicação com método, contexto, acompanhamento e continuidade.",
    ],
    bring: [
      "educação em IA para equipes",
      "comunidade e atualização contínua",
      "imersivos presenciais em Canela/RS",
      "construção de automações, agentes e sistemas",
      "projetos personalizados para empresas",
    ],
  },
  problems: [
    "A empresa sabe que precisa usar IA, mas ainda não sabe por onde começar.",
    "As equipes testam ferramentas soltas, sem processo, critério ou continuidade.",
    "Há muitas ideias, mas pouca priorização sobre o que realmente deve ser construído.",
    "Processos manuais poderiam evoluir com automações, agentes e fluxos mais inteligentes.",
    "Gestores precisam formar repertório para tomar decisões melhores sobre tecnologia.",
    "A organização quer capacitar pessoas sem ficar presa a palestras genéricas.",
  ],
  valueItems: [
    "educação prática em Inteligência Artificial para diferentes níveis de maturidade",
    "conteúdos, trilhas e cursos organizados para aprendizagem contínua",
    "comunidade para atualização, troca e acompanhamento de tendências",
    "experiências presenciais para acelerar clareza, foco e construção",
    "apoio para transformar ideias em automações, agentes, sistemas e produtos digitais",
    "visão estratégica para conectar tecnologia, comportamento, negócios e execução",
  ],
  methodology: [
    {
      title: "Clareza e diagnóstico",
      description:
        "Entendimento do contexto da empresa, das pessoas envolvidas, dos gargalos e das oportunidades reais de aplicação de IA.",
      items: [
        "mapeamento de necessidades",
        "identificação de oportunidades",
        "priorização de casos de uso",
        "definição de objetivos",
        "organização dos próximos passos",
      ],
    },
    {
      title: "Educação e repertório",
      description:
        "Formação das pessoas para que elas entendam ferramentas, possibilidades, limites e formas responsáveis de aplicar IA no trabalho.",
      items: [
        "trilhas de aprendizagem",
        "conteúdos práticos",
        "comunidade de atualização",
        "demonstrações aplicadas",
        "rotina de experimentação",
      ],
    },
    {
      title: "Construção e continuidade",
      description:
        "Apoio para sair da ideia e avançar em protótipos, fluxos, agentes, automações, páginas, sistemas e planos de evolução.",
      items: [
        "prototipação",
        "automação de processos",
        "agentes de IA",
        "produtos digitais",
        "plano de evolução",
      ],
    },
  ],
  audience: [
    "empresas que querem aplicar IA com direção",
    "gestores e lideranças",
    "equipes de marketing e comunicação",
    "educadores e instituições de ensino",
    "consultorias e prestadores de serviço",
    "profissionais liberais",
    "empreendedores",
    "times comerciais e de atendimento",
    "equipes administrativas e operacionais",
    "criadores de conteúdo",
    "pessoas que precisam transformar conhecimento em projeto",
  ],
  notFor: [
    "busca apenas uma palestra inspiracional sem aplicação prática",
    "quer adotar IA sem revisar processos, decisões e responsabilidades",
    "espera promessa de resultado financeiro imediato",
    "não quer envolver pessoas da equipe na aprendizagem",
    "não está disposto a testar, ajustar e construir com método",
  ],
  immersiveTypes: [
    "INEMA.CLUB: acesso gratuito a conteúdos e educação em IA",
    "INEMA.PRO: cursos, trilhas e formações organizadas",
    "INEMA.VIP: comunidade no Telegram para conexão e atualização",
    "INEMATDSX: estudos, lives, vídeos e tendências",
    "Imersivos presenciais em Canela/RS",
    "Vibe Code e criação de sistemas com IA",
    "Agentes de IA e automações para negócios",
    "Projetos personalizados para empresas",
  ],
  projectExamples: [
    "treinamento de equipes",
    "diagnóstico de oportunidades com IA",
    "agentes de atendimento",
    "automação de processos internos",
    "plataformas educacionais",
    "produtos digitais",
    "páginas comerciais e jornadas de venda",
    "operações de conteúdo com IA",
    "organização de conhecimento da empresa",
    "prototipação de ferramentas internas",
    "programas de inovação aplicada",
    "imersões presenciais para lideranças",
  ],
  vibeCode: {
    title: "Construção prática com IA para empresas",
    description:
      "Além de ensinar ferramentas, o INEMA ajuda a transformar problemas, ideias e processos em soluções aplicáveis: automações, agentes, páginas, fluxos, sistemas, produtos digitais e experiências de aprendizagem.",
    plainLanguage:
      "A empresa não precisa começar com um projeto gigante. O caminho mais inteligente costuma ser escolher um problema real, reduzir o escopo e construir uma primeira versão útil.",
    days: [
      {
        title: "Etapa 1 - Diagnóstico e foco",
        items: [
          "contexto",
          "problema",
          "público interno ou externo",
          "objetivo",
          "caso de uso prioritário",
        ],
      },
      {
        title: "Etapa 2 - Prototipação",
        items: [
          "fluxos",
          "conteúdos",
          "automações",
          "agentes",
          "telas",
          "testes",
        ],
      },
      {
        title: "Etapa 3 - Evolução",
        items: [
          "ajustes",
          "apresentação",
          "critérios de uso",
          "próximos passos",
          "plano de continuidade",
        ],
      },
    ],
  },
  canela: {
    title: "Experiências presenciais e imersivos em Canela/RS",
    quote:
      "Algumas mudanças não acontecem apenas com mais uma ferramenta. Elas precisam de tempo, direção, boas perguntas e um ambiente onde seja possível construir de verdade.",
    description:
      "O INEMA também realiza experiências presenciais e imersivos para acelerar aprendizagem, decisão e execução em um ambiente de concentração, troca e construção prática.",
    items: [
      "imersivos para equipes, lideranças e profissionais",
      "encontros focados em IA, estratégia e construção",
      "ambiente pensado para foco e proximidade",
      "possibilidade de formatos personalizados para empresas",
    ],
  },
  nei: {
    title: "Nei Maldaner",
    role: "Fundador do Ecossistema INEMA",
    description:
      "Nei Maldaner atua no encontro entre Inteligência Artificial, comportamento, estratégia e execução. Seu trabalho é ajudar pessoas e organizações a compreender possibilidades, organizar ideias e utilizar tecnologia para construir soluções aplicáveis.",
    bullets: [
      "pesquisador, criador e experimentador de tecnologias",
      "profissional focado na aplicação prática da Inteligência Artificial",
      "mentor de projetos, produtos e processos",
      "responsável por estudos, lives, cursos, comunidades e experiências de aprendizagem do INEMA",
    ],
  },
  ecosystem: [
    {
      name: "INEMA.CLUB",
      description:
        "Portal gratuito de educação em Inteligência Artificial, tecnologia, comportamento e novas formas de aprender e trabalhar.",
      hrefKey: "inemaClub",
    },
    {
      name: "INEMA.PRO",
      description:
        "Plataforma com cursos, trilhas e conteúdos organizados para quem quer aprofundar o uso de IA com método.",
      hrefKey: "inemaPro",
    },
    {
      name: "INEMA.VIP",
      description:
        "Comunidade no Telegram para conexões, novidades, materiais, avisos e acompanhamento mais próximo do movimento INEMA.",
      hrefKey: "inemaVip",
    },
    {
      name: "INEMATDSX",
      description:
        "Frente de estudos, vídeos, lives e atualizações sobre ferramentas, tendências, testes e aplicações de IA.",
      hrefKey: "inematdsx",
    },
  ],
  faqs: [
    {
      question: "O que é o Ecossistema INEMA?",
      answer:
        "É uma estrutura que reúne educação, conteúdos, comunidade, cursos, imersivos e construção prática para ajudar pessoas e empresas a aplicar Inteligência Artificial com mais clareza.",
    },
    {
      question: "O INEMA atende empresas?",
      answer:
        "Sim. O INEMA pode apoiar empresas em treinamentos, imersivos, diagnóstico de oportunidades, capacitação de equipes e construção de soluções práticas com IA.",
    },
    {
      question: "Preciso saber programar para participar?",
      answer:
        "Não necessariamente. O INEMA trabalha com diferentes níveis de maturidade e ajuda pessoas técnicas e não técnicas a entenderem como aplicar IA de forma prática.",
    },
    {
      question: "Qual é a diferença entre INEMA.CLUB, INEMA.PRO e INEMA.VIP?",
      answer:
        "O INEMA.CLUB concentra conteúdos gratuitos, o INEMA.PRO organiza cursos e trilhas de aprofundamento, e o INEMA.VIP é a comunidade no Telegram para conexão e acompanhamento mais próximo.",
    },
    {
      question: "O que uma empresa pode contratar?",
      answer:
        "Pode conversar com o INEMA sobre palestras aplicadas, treinamentos, programas de capacitação, imersivos presenciais, diagnóstico de oportunidades e projetos de construção com IA.",
    },
    {
      question: "O INEMA entrega sistemas e automações?",
      answer:
        "Dependendo do contexto, o trabalho pode envolver protótipos, automações, agentes, páginas, fluxos, produtos digitais e orientação para evolução. O formato ideal é definido após entender a necessidade.",
    },
    {
      question: "Os imersivos acontecem onde?",
      answer:
        "As experiências presenciais podem acontecer em Canela/RS ou em formatos personalizados para empresas, conforme objetivo, equipe e proposta do encontro.",
    },
    {
      question: "Como uma empresa começa?",
      answer:
        "O primeiro passo é falar com a Tiza pelo WhatsApp ou enviar uma mensagem pelo e-mail do INEMA para alinhar contexto, objetivo e melhor formato.",
    },
  ],
  form: {
    title: "Converse com o INEMA",
    description:
      "Conte rapidamente o contexto da sua empresa para a Tiza entender qual frente do ecossistema faz mais sentido: educação, comunidade, treinamento, imersivo ou projeto com IA.",
    successMessage:
      "Seu contato foi preparado. Envie a mensagem no WhatsApp para a Tiza receber o contexto e continuar a conversa.",
    aiLevels: ["Iniciante", "Intermediário", "Avançado", "Ainda não usamos IA"],
    immersiveInterests: [
      "Apresentação do Ecossistema INEMA",
      "Treinamento para empresa",
      "Imersivo presencial",
      "INEMA.PRO",
      "INEMA.CLUB",
      "INEMA.VIP",
      "Agentes de IA e automações",
      "Projeto personalizado com IA",
      "Ainda não sei",
    ],
    periodPreferences: [
      "Quero conversar nos próximos dias",
      "Este mês",
      "Próximo mês",
      "Estou pesquisando possibilidades",
      "A combinar",
    ],
  },
  finalCta: {
    title: "Leve o Ecossistema INEMA para sua empresa.",
    description:
      "Use esta página como apresentação inicial. Para formatos comerciais, treinamentos, imersivos e projetos com IA, fale com a Tiza.",
    button: "Falar com a Tiza",
  },
} as const;

export type SiteContent = typeof siteContent;
export type LinkKey = keyof typeof siteContent.links;

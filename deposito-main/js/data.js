// --- PRODUCTS DATABASE ---
// Using custom SVG generation to guarantee premium and responsive graphic representations
const products = [
    // CERVEJAS
    {
        id: 'cerveja-heineken',
        name: 'Heineken Long Neck 330ml',
        description: 'Cerveja premium lager puro malte refrescante.',
        price: 9.50,
        category: 'cervejas',
        color: '#008234',
        type: 'bottle',
        image: 'assets/images/produtos/Heineken_330ml.png'
    },
    {
        id: 'cerveja-corona',
        name: 'Corona Extra 330ml',
        description: 'Cerveja premium clara, leve e super refrescante.',
        price: 7.90,
        category: 'cervejas',
        color: '#EEB902',
        type: 'corona',
       image: 'assets/images/produtos/corona_330ml.png'
    },
    {
        id: 'cerveja-stella',
        name: 'Stella Artois Long Neck 330ml',
        description: 'Cerveja premium com amargor suave e aroma floral.',
        price: 6.90,
        category: 'cervejas',
        color: '#DCE2C8',
        type: 'stella',
        image: 'assets/images/produtos/Stella_330ml.png'
    },
    {
        id: 'cerveja-brahma-lata',
        name: 'Brahma Duplo Malte Lata 350ml',
        description: 'Cerveja puro malte saborosa e refrescante.',
        price: 4.20,
        category: 'cervejas',
        color: '#E01E22',
        type: 'can',
        image: 'assets/images/produtos/Brahma_350ml.png'
    },
    {
        id: 'cerveja-budweiser',
        name: 'Budweiser Long Neck 330ml',
        description: 'Cerveja americana do estilo Lager, clássica.',
        price: 6.50,
        category: 'cervejas',
        color: '#D6001C',
        type: 'bottle',
        image: 'assets/images/produtos/Budweiser_330ml.png'
    },

    // DESTILADOS
    {
        id: 'destilado-absolut',
        name: 'Vodka Absolut 1L',
        description: 'Vodka premium sueca produzida a partir de trigo de inverno.',
        price: 89.90,
        category: 'destilados',
        color: '#00539F',
        type: 'vodka',
        image: 'assets/images/produtos/Absolut_1L.png'
    },
    {
        id: 'destilado-red-label',
        name: 'Whisky Johnnie Walker Red Label 1L',
        description: 'Whisky escocês blended malt com notas de especiarias.',
        price: 99.90,
        category: 'destilados',
        color: '#A00D12',
        type: 'whisky',
        image: 'assets/images/produtos/WhiskyRedLabel_1L.png'
    },
    {
        id: 'destilado-tanqueray',
        name: 'Gin Tanqueray London Dry 750ml',
        description: 'Gin premium importado, quatro vezes destilado.',
        price: 119.90,
        category: 'destilados',
        color: '#005432',
        type: 'gin',
        image: 'assets/images/produtos/GinTanqueray_750ml.png'
    },
    {
        id: 'destilado-campari',
        name: 'Bitter Campari 900ml',
        description: 'Aperitivo clássico italiano, infusão de ervas amargas.',
        price: 54.90,
        category: 'destilados',
        color: '#D1001C',
        type: 'campari'
    },
    {
        id: 'destilado-cachaça-51',
        name: 'Cachaça 51 960ml',
        description: 'A cachaça mais conhecida e vendida do Brasil.',
        price: 14.90,
        category: 'destilados',
        color: '#ED7A11',
        type: 'cachaça'
    },

    // REFRIGERANTES
    {
        id: 'refri-coca-2l',
        name: 'Coca-Cola 2 Litros',
        description: 'O sabor clássico da Coca-Cola na embalagem família.',
        price: 9.50,
        category: 'refrigerantes',
        color: '#FF0000',
        type: 'pet'
    },
    {
        id: 'refri-guarana-2l',
        name: 'Guaraná Antarctica 2 Litros',
        description: 'Refrigerante sabor natural de guaraná da Amazônia.',
        price: 7.90,
        category: 'refrigerantes',
        color: '#0B6623',
        type: 'pet'
    },
    {
        id: 'refri-fanta-2l',
        name: 'Fanta Laranja 2 Litros',
        description: 'Refrigerante com suco de laranja natural e gás.',
        price: 7.50,
        category: 'refrigerantes',
        color: '#FF6F00',
        type: 'pet'
    },
    {
        id: 'refri-coca-lata',
        name: 'Coca-Cola Lata 350ml',
        description: 'Bebida gaseificada refrescante lata individual.',
        price: 4.50,
        category: 'refrigerantes',
        color: '#E31B23',
        type: 'can'
    },

    // ENERGÉTICOS
    {
        id: 'energetico-redbull',
        name: 'Red Bull Energy Drink 250ml',
        description: 'Red Bull te dá asas. Bebida energética premium.',
        price: 8.90,
        category: 'energeticos',
        color: '#002F6C',
        type: 'energy-can'
    },
    {
        id: 'energetico-monster',
        name: 'Monster Energy 473ml',
        description: 'Energético clássico Monster em lata gigante de 473ml.',
        price: 9.90,
        category: 'energeticos',
        color: '#00FF00',
        type: 'monster'
    },

    // ÁGUAS
    {
        id: 'agua-sem-gas',
        name: 'Água Mineral Crystal Sem Gás 500ml',
        description: 'Água mineral natural pura ideal para hidratar.',
        price: 2.50,
        category: 'aguas',
        color: '#0097D7',
        type: 'water'
    },
    {
        id: 'agua-com-gas',
        name: 'Água Mineral Crystal Com Gás 500ml',
        description: 'Água mineral natural levemente gaseificada.',
        price: 3.00,
        category: 'aguas',
        color: '#004A8F',
        type: 'water-sparkling'
    },

    // SUCOS
    {
        id: 'suco-prats-laranja',
        name: 'Suco Prat\'s Laranja 900ml',
        description: 'Suco 100% integral de laranja, sem açúcar e conservantes.',
        price: 12.90,
        category: 'sucos',
        color: '#FFA500',
        type: 'juice'
    },
    {
        id: 'suco-ades-uva',
        name: 'Suco Ades Uva 1 Litro',
        description: 'Bebida à base de soja com suco natural de uva.',
        price: 7.90,
        category: 'sucos',
        color: '#6F2DA8',
        type: 'juice-carton'
    },

    // GELO
    {
        id: 'gelo-cubo-5kg',
        name: 'Gelo Cubo Pacote 5kg',
        description: 'Pacote de gelo em cubos de alta durabilidade.',
        price: 15.00,
        category: 'gelo',
        color: '#9CE3FF',
        type: 'ice'
    },
    {
        id: 'gelo-coco',
        name: 'Gelo de Água de Coco Pacote',
        description: 'Gelo saborizado de coco natural ideal para destilados.',
        price: 12.00,
        category: 'gelo',
        color: '#E0F6FF',
        type: 'ice-coco'
    },

    // CARVÃO
    {
        id: 'carvao-churrasco-4kg',
        name: 'Carvão Vegetal Especial 4kg',
        description: 'Carvão vegetal selecionado para um brasa perfeita.',
        price: 19.90,
        category: 'carvao',
        color: '#333333',
        type: 'coal'
    },
    
    // CONVENIÊNCIA
    {
        id: 'conven-pringles',
        name: 'Batata Pringles Original 109g',
        description: 'A clássica batata Pringles na lata para acompanhar sua bebida.',
        price: 12.90,
        category: 'conveniencia',
        color: '#E30B5C',
        type: 'snack'
    },
    {
        id: 'conven-doritos',
        name: 'Salgadinho Doritos Queijo Nacho 140g',
        description: 'Tortilha de milho sabor queijo nacho crocante e saborosa.',
        price: 9.90,
        category: 'conveniencia',
        color: '#FF4500',
        type: 'snack'
    },
    {
        id: 'conven-copos',
        name: 'Copos Vermelhos Red Cup 400ml - 25un',
        description: 'Os clássicos copos vermelhos americanos para festas e jogos.',
        price: 14.90,
        category: 'conveniencia',
        color: '#FF0000',
        type: 'cups'
    },
    
    // ATACADO
    {
        id: 'atacado-heineken-caixa',
        name: 'Caixa Cerveja Heineken 350ml - 24 Latas',
        description: 'Caixa fechada de Heineken em latas de 350ml. Perfeita para eventos.',
        price: 99.90,
        category: 'atacado',
        color: '#008234',
        type: 'box-pack'
    },
    {
        id: 'atacado-coca-fardo',
        name: 'Fardo Coca-Cola Lata 350ml - 12un',
        description: 'Fardo promocional de refrigerante Coca-Cola original lata.',
        price: 45.00,
        category: 'atacado',
        color: '#FF0000',
        type: 'fardo'
    },
    {
        id: 'atacado-skol-caixa',
        name: 'Caixa Cerveja Skol 350ml - 24 Latas',
        description: 'Caixa de Skol lata com preço especial para atacado.',
        price: 69.90,
        category: 'atacado',
        color: '#FFCC00',
        type: 'box-pack'
    }
];


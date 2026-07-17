// --- PRODUCTS DATABASE ---
// Using custom SVG generation to guarantee premium and responsive graphic representations
const products = [
    // CERVEJAS
    {
        id: '53335bc5-1aea-4ad2-b7cf-2dcdda3c5aec',
        name: 'Heineken Long Neck 330ml',
        description: 'Cerveja premium lager puro malte refrescante.',
        price: 9.50,
        category: 'cervejas',
        color: '#008234',
        type: 'bottle',
        image: 'assets/images/produtos/Heineken_330ml.png'
    },
    {
        id: '83cdad62-a758-45d7-bf0f-494fd0afe6d3',
        name: 'Corona Extra 330ml',
        description: 'Cerveja premium clara, leve e super refrescante.',
        price: 7.90,
        category: 'cervejas',
        color: '#EEB902',
        type: 'corona',
       image: 'assets/images/produtos/corona_330ml.png'
    },
    {
        id: '752e30e1-4ab0-4481-8e6e-775f55d24b88',
        name: 'Stella Artois Long Neck 330ml',
        description: 'Cerveja premium com amargor suave e aroma floral.',
        price: 6.90,
        category: 'cervejas',
        color: '#DCE2C8',
        type: 'stella',
        image: 'assets/images/produtos/Stella_330ml.png'
    },
    {
        id: '997faf80-4fa5-4a40-8eae-c84817b2856b',
        name: 'Brahma Duplo Malte Lata 350ml',
        description: 'Cerveja puro malte saborosa e refrescante.',
        price: 4.20,
        category: 'cervejas',
        color: '#E01E22',
        type: 'can',
        image: 'assets/images/produtos/Brahma_350ml.png'
    },
    {
        id: '5d4e79ce-3969-4a62-9f1d-ad2185e31860',
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
        id: '69d41257-d995-45bf-8f5a-8d02e6a22f8e',
        name: 'Vodka Absolut 1L',
        description: 'Vodka premium sueca produzida a partir de trigo de inverno.',
        price: 89.90,
        category: 'destilados',
        color: '#00539F',
        type: 'vodka',
        image: 'assets/images/produtos/Absolut_1L.png'
    },
    {
        id: 'f2c118e3-324d-4deb-a49c-9eeb47340157',
        name: 'Whisky Johnnie Walker Red Label 1L',
        description: 'Whisky escocês blended malt com notas de especiarias.',
        price: 99.90,
        category: 'destilados',
        color: '#A00D12',
        type: 'whisky',
        image: 'assets/images/produtos/WhiskyRedLabel_1L.png'
    },
    {
        id: '8ee47b60-05b0-40f4-8ff0-2e9fc819721d',
        name: 'Gin Tanqueray London Dry 750ml',
        description: 'Gin premium importado, quatro vezes destilado.',
        price: 119.90,
        category: 'destilados',
        color: '#005432',
        type: 'gin',
        image: 'assets/images/produtos/GinTanqueray_750ml.png'
    },
    {
        id: '2ed16f7f-b88d-404e-996e-21eb50c74919',
        name: 'Bitter Campari 900ml',
        description: 'Aperitivo clássico italiano, infusão de ervas amargas.',
        price: 54.90,
        category: 'destilados',
        color: '#D1001C',
        type: 'campari'
    },
    {
        id: '7f81fc90-f84f-4ec8-b431-2f70bb02bc16',
        name: 'Cachaça 51 960ml',
        description: 'A cachaça mais conhecida e vendida do Brasil.',
        price: 14.90,
        category: 'destilados',
        color: '#ED7A11',
        type: 'cachaça'
    },

    // REFRIGERANTES
    {
        id: '34db1ef9-5a57-423a-91df-e6d9c29144a6',
        name: 'Coca-Cola 2 Litros',
        description: 'O sabor clássico da Coca-Cola na embalagem família.',
        price: 9.50,
        category: 'refrigerantes',
        color: '#FF0000',
        type: 'pet'
    },
    {
        id: 'd5f29184-6ce6-4fe1-960d-224dfb6a5b19',
        name: 'Guaraná Antarctica 2 Litros',
        description: 'Refrigerante sabor natural de guaraná da Amazônia.',
        price: 7.90,
        category: 'refrigerantes',
        color: '#0B6623',
        type: 'pet'
    },
    {
        id: '29b387ed-aa76-4ad4-b170-175e2cf0018e',
        name: 'Fanta Laranja 2 Litros',
        description: 'Refrigerante com suco de laranja natural e gás.',
        price: 7.50,
        category: 'refrigerantes',
        color: '#FF6F00',
        type: 'pet'
    },
    {
        id: 'b66f24bd-5ba5-46ae-83e5-e50d290b74d5',
        name: 'Coca-Cola Lata 350ml',
        description: 'Bebida gaseificada refrescante lata individual.',
        price: 4.50,
        category: 'refrigerantes',
        color: '#E31B23',
        type: 'can'
    },

    // ENERGÉTICOS
    {
        id: 'ded95cbe-0023-4488-8917-221c058e2801',
        name: 'Red Bull Energy Drink 250ml',
        description: 'Red Bull te dá asas. Bebida energética premium.',
        price: 8.90,
        category: 'energeticos',
        color: '#002F6C',
        type: 'energy-can'
    },
    {
        id: '8147f669-a25c-4109-9c7f-a2ba2280edde',
        name: 'Monster Energy 473ml',
        description: 'Energético clássico Monster em lata gigante de 473ml.',
        price: 9.90,
        category: 'energeticos',
        color: '#00FF00',
        type: 'monster'
    },

    // ÁGUAS
    {
        id: 'e504e533-1d33-4cbd-a101-e79f894dde72',
        name: 'Água Mineral Crystal Sem Gás 500ml',
        description: 'Água mineral natural pura ideal para hidratar.',
        price: 2.50,
        category: 'aguas',
        color: '#0097D7',
        type: 'water'
    },
    {
        id: '0d6d605f-2317-4d60-8ba1-46062abc0db1',
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
        id: '4bd02bca-cdb2-4663-992d-13f7697bee46',
        name: 'Suco Ades Uva 1 Litro',
        description: 'Bebida à base de soja com suco natural de uva.',
        price: 7.90,
        category: 'sucos',
        color: '#6F2DA8',
        type: 'juice-carton'
    },

    // GELO
    {
        id: 'da78cdc8-b5b7-47c4-90a1-72119b73e7f3',
        name: 'Gelo Cubo Pacote 5kg',
        description: 'Pacote de gelo em cubos de alta durabilidade.',
        price: 15.00,
        category: 'gelo',
        color: '#9CE3FF',
        type: 'ice'
    },
    {
        id: '7dc5c48a-3320-4f69-b523-74ec11ee4241',
        name: 'Gelo de Água de Coco Pacote',
        description: 'Gelo saborizado de coco natural ideal para destilados.',
        price: 12.00,
        category: 'gelo',
        color: '#E0F6FF',
        type: 'ice-coco'
    },

    // CARVÃO
    {
        id: 'dcc336a5-4da1-46e7-9df5-6206ab9deee6',
        name: 'Carvão Vegetal Especial 4kg',
        description: 'Carvão vegetal selecionado para um brasa perfeita.',
        price: 19.90,
        category: 'carvao',
        color: '#333333',
        type: 'coal'
    },
    
    // CONVENIÊNCIA
    {
        id: '9dd30cd8-46e8-4bb1-af57-3aa54725fdfb',
        name: 'Batata Pringles Original 109g',
        description: 'A clássica batata Pringles na lata para acompanhar sua bebida.',
        price: 12.90,
        category: 'conveniencia',
        color: '#E30B5C',
        type: 'snack'
    },
    {
        id: '955293b0-413f-42e7-bc09-a55977ab4675',
        name: 'Salgadinho Doritos Queijo Nacho 140g',
        description: 'Tortilha de milho sabor queijo nacho crocante e saborosa.',
        price: 9.90,
        category: 'conveniencia',
        color: '#FF4500',
        type: 'snack'
    },
    {
        id: '37139f14-9e86-475f-944f-a656935a9a18',
        name: 'Copos Vermelhos Red Cup 400ml - 25un',
        description: 'Os clássicos copos vermelhos americanos para festas e jogos.',
        price: 14.90,
        category: 'conveniencia',
        color: '#FF0000',
        type: 'cups'
    },
    
    // ATACADO
    {
        id: '2eb52387-8c4c-4278-84ad-f9da52fedeab',
        name: 'Caixa Cerveja Heineken 350ml - 24 Latas',
        description: 'Caixa fechada de Heineken em latas de 350ml. Perfeita para eventos.',
        price: 99.90,
        category: 'atacado',
        color: '#008234',
        type: 'box-pack'
    },
    {
        id: '2afb7a28-9651-4610-81a3-d03d3eb620b3',
        name: 'Fardo Coca-Cola Lata 350ml - 12un',
        description: 'Fardo promocional de refrigerante Coca-Cola original lata.',
        price: 45.00,
        category: 'atacado',
        color: '#FF0000',
        type: 'fardo'
    },
    {
        id: '5faa27cd-60d7-418a-b6fa-998f998450f2',
        name: 'Caixa Cerveja Skol 350ml - 24 Latas',
        description: 'Caixa de Skol lata com preço especial para atacado.',
        price: 69.90,
        category: 'atacado',
        color: '#FFCC00',
        type: 'box-pack'
    }
];


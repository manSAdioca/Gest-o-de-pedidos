const fs = require('fs');

const productsFromDb = [
  { id: '53335bc5-1aea-4ad2-b7cf-2dcdda3c5aec', name: 'Heineken Long Neck 330ml' },
  { id: '83cdad62-a758-45d7-bf0f-494fd0afe6d3', name: 'Corona Extra 330ml' },
  { id: '752e30e1-4ab0-4481-8e6e-775f55d24b88', name: 'Stella Artois Long Neck 330ml' },
  { id: '997faf80-4fa5-4a40-8eae-c84817b2856b', name: 'Brahma Duplo Malte Lata 350ml' },
  { id: '5d4e79ce-3969-4a62-9f1d-ad2185e31860', name: 'Budweiser Long Neck 330ml' },
  { id: '69d41257-d995-45bf-8f5a-8d02e6a22f8e', name: 'Vodka Absolut 1L' },
  { id: 'f2c118e3-324d-4deb-a49c-9eeb47340157', name: 'Whisky Johnnie Walker Red Label 1L' },
  { id: '8ee47b60-05b0-40f4-8ff0-2e9fc819721d', name: 'Gin Tanqueray London Dry 750ml' },
  { id: '2ed16f7f-b88d-404e-996e-21eb50c74919', name: 'Bitter Campari 900ml' },
  { id: '7f81fc90-f84f-4ec8-b431-2f70bb02bc16', name: 'Cachaça 51 960ml' },
  { id: '34db1ef9-5a57-423a-91df-e6d9c29144a6', name: 'Coca-Cola 2 Litros' },
  { id: 'd5f29184-6ce6-4fe1-960d-224dfb6a5b19', name: 'Guaraná Antarctica 2 Litros' },
  { id: '29b387ed-aa76-4ad4-b170-175e2cf0018e', name: 'Fanta Laranja 2 Litros' },
  { id: 'b66f24bd-5ba5-46ae-83e5-e50d290b74d5', name: 'Coca-Cola Lata 350ml' },
  { id: 'ded95cbe-0023-4488-8917-221c058e2801', name: 'Red Bull Energy Drink 250ml' },
  { id: '8147f669-a25c-4109-9c7f-a2ba2280edde', name: 'Monster Energy 473ml' },
  { id: 'e504e533-1d33-4cbd-a101-e79f894dde72', name: 'Água Mineral Crystal Sem Gás 500ml' },
  { id: '0d6d605f-2317-4d60-8ba1-46062abc0db1', name: 'Água Mineral Crystal Com Gás 500ml' },
  { id: '8d848bc1-1c85-418d-8e47-0c7b54f16a39', name: "Suco Prat's Laranja 900ml" },
  { id: '4bd02bca-cdb2-4663-992d-13f7697bee46', name: 'Suco Ades Uva 1 Litro' },
  { id: 'da78cdc8-b5b7-47c4-90a1-72119b73e7f3', name: 'Gelo Cubo Pacote 5kg' },
  { id: '7dc5c48a-3320-4f69-b523-74ec11ee4241', name: 'Gelo de Água de Coco Pacote' },
  { id: 'dcc336a5-4da1-46e7-9df5-6206ab9deee6', name: 'Carvão Vegetal Especial 4kg' },
  { id: '9dd30cd8-46e8-4bb1-af57-3aa54725fdfb', name: 'Batata Pringles Original 109g' },
  { id: '955293b0-413f-42e7-bc09-a55977ab4675', name: 'Salgadinho Doritos Queijo Nacho 140g' },
  { id: '37139f14-9e86-475f-944f-a656935a9a18', name: 'Copos Vermelhos Red Cup 400ml - 25un' },
  { id: '2eb52387-8c4c-4278-84ad-f9da52fedeab', name: 'Caixa Cerveja Heineken 350ml - 24 Latas' },
  { id: '2afb7a28-9651-4610-81a3-d03d3eb620b3', name: 'Fardo Coca-Cola Lata 350ml - 12un' },
  { id: '5faa27cd-60d7-418a-b6fa-998f998450f2', name: 'Caixa Cerveja Skol 350ml - 24 Latas' }
];

let dataJs = fs.readFileSync('../deposito-main/js/data.js', 'utf8');

productsFromDb.forEach(p => {
    // Find the regex that matches the product block with this name
    const regex = new RegExp(`id:\\s*'[^']+',(\\s*name:\\s*['"]${p.name}['"])`, 'g');
    dataJs = dataJs.replace(regex, `id: '${p.id}',$1`);
});

fs.writeFileSync('../deposito-main/js/data.js', dataJs);
console.log('data.js updated with UUIDs!');

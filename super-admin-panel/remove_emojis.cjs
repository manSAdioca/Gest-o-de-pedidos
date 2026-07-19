const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard/Tenants.jsx', 'utf8');

const replacements = [
  // SectionSorter
  [/{ id: 'hero', label: '🖼️ Capa Principal' }/g, "{ id: 'hero', label: 'Capa Principal' }"],
  [/{ id: 'categories', label: '🗂️ Categorias' }/g, "{ id: 'categories', label: 'Categorias' }"],
  [/{ id: 'products', label: '🛍️ Produtos' }/g, "{ id: 'products', label: 'Produtos' }"],
  [/{ id: 'about', label: 'ℹ️ Sobre Nós' }/g, "{ id: 'about', label: 'Sobre Nós' }"],
  [/{ id: 'contact', label: '📞 Contato' }/g, "{ id: 'contact', label: 'Contato' }"],
  
  // ThemeCards
  [/icon="🌑"/g, "icon={<Store size={24} color='currentColor' />} "],
  [/icon="💎"/g, "icon={<Sparkles size={24} color='currentColor' />} "],
  [/icon="☀️"/g, "icon={<LayoutDashboard size={24} color='currentColor' />} "],
  [/icon="⚡"/g, "icon={<Zap size={24} color='currentColor' />} "],
  
  // Efeitos WOW
  [/icon="✨"/g, "icon={<Sparkles size={18} color='currentColor' />} "],
  [/icon="💫"/g, "icon={<Sparkles size={18} color='currentColor' />} "],
  [/icon="🧊"/g, "icon={<Package size={18} color='currentColor' />} "],
  [/icon="🌊"/g, "icon={<Activity size={18} color='currentColor' />} "],
  [/icon="🦴"/g, "icon={<LayoutDashboard size={18} color='currentColor' />} "],
  [/icon="🏔️"/g, "icon={<ImageIcon size={18} color='currentColor' />} "],
  [/icon="🖱️"/g, "icon={<Check size={18} color='currentColor' />} "],
  [/icon="🎈"/g, "icon={<Tags size={18} color='currentColor' />} "],
  [/icon="👾"/g, "icon={<Settings size={18} color='currentColor' />} "],
  [/icon="❤️"/g, "icon={<CheckCircle size={18} color='currentColor' />} "],
  [/icon="❄️"/g, "icon={<Sparkles size={18} color='currentColor' />} "],
  
  // Headers - Remover emojis
  [/🖼️ Banner Principal \(Hero\)/g, "Banner Principal (Hero)"],
  [/🏢 Sobre Nós/g, "Sobre Nós"],
  [/📞 Contato e Localização/g, "Contato e Localização"],
  [/🌐 Redes Sociais/g, "Redes Sociais"],
  [/🎫 Banners do Rodapé/g, "Banners do Rodapé"],
  [/📝 Rodapé/g, "Rodapé"],
  [/🤖 Assistente de Vendas \(IA\)/g, "Assistente de Vendas (IA)"],
  [/🎬 Efeitos Especiais \(WOW Effects\)/g, "Efeitos Especiais (WOW Effects)"]
];

replacements.forEach(([regex, replaceWith]) => {
  code = code.replace(regex, replaceWith);
});

fs.writeFileSync('src/pages/Dashboard/Tenants.jsx', code);
console.log('Emojis removed');

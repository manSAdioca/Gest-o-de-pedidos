// Utilidades
// ==========================================================================

// --- APP STATE ---
let cart = [];
let currentCustomerType = 'cpf'; // 'cpf' or 'cnpj'

// --- SVGS TEMPLATES GENERATORS ---
function getProductSVG(type, color, name) {
    const mainColor = color || '#0047FF';
    
    // Switch styles based on product type
    if (type === 'bottle' || type === 'corona' || type === 'stella') {
        let labelColor = '#FFF';
        if (type === 'corona') labelColor = '#002C6C';
        if (type === 'stella') labelColor = '#E31B23';
        return `
        <svg viewBox="0 0 100 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="glassGrad-${type}-${color.replace('#','')}" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="${mainColor}" stop-opacity="0.9"/>
                    <stop offset="35%" stop-color="#FFF" stop-opacity="0.3"/>
                    <stop offset="70%" stop-color="${mainColor}" stop-opacity="0.7"/>
                    <stop offset="100%" stop-color="#000" stop-opacity="0.6"/>
                </linearGradient>
            </defs>
            <!-- Bottle Neck -->
            <path d="M46 15 L54 15 L54 60 L46 60 Z" fill="url(#glassGrad-${type}-${color.replace('#','')})"/>
            <!-- Bottle Cap -->
            <rect x="44" y="8" width="12" height="8" rx="2" fill="#E8A900" stroke="#FFF" stroke-width="0.5"/>
            <!-- Neck Ring -->
            <ellipse cx="50" cy="22" rx="4" ry="1.5" fill="#FFF" opacity="0.3"/>
            <!-- Bottle Body -->
            <path d="M46 60 Q40 68 36 80 L36 140 A 14 14 0 0 0 64 140 L64 80 Q60 68 54 60 Z" fill="url(#glassGrad-${type}-${color.replace('#','')})"/>
            <!-- Bottle Label -->
            <path d="M36 85 C42 87, 58 87, 64 85 L64 115 C58 113, 42 113, 36 115 Z" fill="${labelColor}"/>
            <rect x="38" y="93" width="24" height="14" fill="#0047FF" rx="1"/>
            <circle cx="50" cy="100" r="5" fill="#FFD700"/>
            <path d="M48 101 L48 99 L49 100 L50 98 L51 100 L52 99 L52 101 Z" fill="#FFA500"/>
        </svg>`;
    } else if (type === 'can' || type === 'energy-can' || type === 'monster') {
        let bandColor = '#FFF';
        if (type === 'monster') bandColor = '#00FF00';
        return `
        <svg viewBox="0 0 100 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="canGrad-${type}-${color.replace('#','')}" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="${mainColor}"/>
                    <stop offset="40%" stop-color="#FFF" stop-opacity="0.4"/>
                    <stop offset="70%" stop-color="${mainColor}"/>
                    <stop offset="100%" stop-color="#000" stop-opacity="0.5"/>
                </linearGradient>
            </defs>
            <!-- Can Top -->
            <ellipse cx="50" cy="25" rx="25" ry="8" fill="#AAA" stroke="#FFF" stroke-width="1"/>
            <ellipse cx="50" cy="25" rx="20" ry="6" fill="#777"/>
            <!-- Can Body -->
            <path d="M25 25 L25 125 A 25 10 0 0 0 75 125 L75 25 A 25 10 0 0 1 25 25 Z" fill="url(#canGrad-${type}-${color.replace('#','')})"/>
            <!-- Design Details on Can -->
            <path d="M25 45 Q50 55 75 45 L75 75 Q50 85 25 75 Z" fill="${bandColor}" opacity="0.2"/>
            <text x="50" y="85" font-family="'Outfit', sans-serif" font-size="10" font-weight="900" fill="#FFF" text-anchor="middle" letter-spacing="1">PREMIUM</text>
            <circle cx="50" cy="105" r="8" fill="#FFD700" opacity="0.8"/>
            <path d="M47 106 L47 104 L48 105 L50 102 L52 105 L53 104 L53 106 Z" fill="#FFA500"/>
        </svg>`;
    } else if (type === 'vodka' || type === 'whisky' || type === 'gin' || type === 'campari' || type === 'cachaça') {
        let labelShape = 'rect';
        let strokeCol = '#FFD700';
        return `
        <svg viewBox="0 0 100 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="glassGrad-${type}-${color.replace('#','')}" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="${mainColor}" stop-opacity="0.85"/>
                    <stop offset="30%" stop-color="#FFF" stop-opacity="0.45"/>
                    <stop offset="70%" stop-color="${mainColor}" stop-opacity="0.75"/>
                    <stop offset="100%" stop-color="#000" stop-opacity="0.75"/>
                </linearGradient>
            </defs>
            <!-- Neck -->
            <path d="M44 15 L56 15 L56 55 L44 55 Z" fill="url(#glassGrad-${type}-${color.replace('#','')})"/>
            <rect x="42" y="8" width="16" height="10" fill="#222" stroke="#FFF" stroke-width="0.5"/>
            <!-- Body -->
            <path d="M44 55 Q32 60 30 75 L30 140 A 10 10 0 0 0 40 150 L60 150 A 10 10 0 0 0 70 140 L70 75 Q68 60 56 55 Z" fill="url(#glassGrad-${type}-${color.replace('#','')})"/>
            <!-- Premium Label -->
            <rect x="35" y="75" width="30" height="45" rx="3" fill="#111" stroke="${strokeCol}" stroke-width="1.5"/>
            <text x="50" y="93" font-family="'Outfit', sans-serif" font-size="5" font-weight="bold" fill="#B8C2D1" text-anchor="middle" letter-spacing="1">IMPERATRIZ</text>
            <circle cx="50" cy="104" r="6" fill="#FFD700"/>
            <path d="M47 105 L47 103 L48 104 L50 101 L52 104 L53 103 L53 105 Z" fill="#FFA500"/>
        </svg>`;
    } else if (type === 'pet' || type === 'water' || type === 'water-sparkling') {
        return `
        <svg viewBox="0 0 100 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="petGrad-${type}-${color.replace('#','')}" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="${mainColor}" stop-opacity="0.8"/>
                    <stop offset="35%" stop-color="#FFF" stop-opacity="0.5"/>
                    <stop offset="70%" stop-color="${mainColor}" stop-opacity="0.7"/>
                    <stop offset="100%" stop-color="#000" stop-opacity="0.6"/>
                </linearGradient>
            </defs>
            <!-- Cap -->
            <rect x="45" y="10" width="10" height="8" fill="${mainColor}" stroke="#FFF" stroke-width="0.5"/>
            <!-- Neck -->
            <path d="M46 18 L54 18 L54 40 L46 40 Z" fill="url(#petGrad-${type}-${color.replace('#','')})"/>
            <!-- Body -->
            <path d="M46 40 Q38 45 34 60 Q38 80 34 100 L34 140 A 16 16 0 0 0 66 140 L66 100 Q62 80 66 60 Q62 45 54 40 Z" fill="url(#petGrad-${type}-${color.replace('#','')})"/>
            <!-- Label -->
            <rect x="34" y="70" width="32" height="20" fill="${mainColor === '#FF0000' ? '#D6001C' : '#FFF'}"/>
            <text x="50" y="83" font-family="'Outfit', sans-serif" font-size="7" font-weight="900" fill="${mainColor === '#FF0000' ? '#FFF' : '#0B6623'}" text-anchor="middle" letter-spacing="0.5">SABOR</text>
        </svg>`;
    } else if (type === 'juice' || type === 'juice-carton') {
        return `
        <svg viewBox="0 0 100 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="juiceGrad-${type}-${color.replace('#','')}" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="${mainColor}"/>
                    <stop offset="40%" stop-color="#FFF" stop-opacity="0.3"/>
                    <stop offset="85%" stop-color="${mainColor}"/>
                </linearGradient>
            </defs>
            <!-- Bottle or Carton -->
            <rect x="30" y="30" width="40" height="110" rx="8" fill="url(#juiceGrad-${type}-${color.replace('#','')})" stroke="#FFF" stroke-width="0.5"/>
            <!-- Neck and Cap -->
            <rect x="42" y="18" width="16" height="12" fill="#FFF" rx="2"/>
            <rect x="45" y="10" width="10" height="8" fill="#FF0000" rx="1"/>
            <!-- Orange graphic or Uva Graphic -->
            <circle cx="50" cy="80" r="12" fill="${mainColor === '#FFA500' ? '#FF6F00' : '#4E0E75'}"/>
            <circle cx="47" cy="77" r="2" fill="#FFF" opacity="0.7"/>
            <path d="M50 68 L52 60" stroke="#0B6623" stroke-width="2"/>
            <text x="50" y="115" font-family="'Outfit', sans-serif" font-size="7" font-weight="bold" fill="#FFF" text-anchor="middle">SUCO NATURAL</text>
        </svg>`;
    } else if (type === 'ice' || type === 'ice-coco') {
        return `
        <svg viewBox="0 0 100 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <!-- Ice bag shape -->
            <path d="M20 40 L30 140 A 10 10 0 0 0 80 140 L75 40 Z" fill="rgba(255, 255, 255, 0.2)" stroke="#9CE3FF" stroke-width="2"/>
            <path d="M20 40 Q50 35 75 40 L60 30 Q50 35 40 30 Z" fill="#9CE3FF"/>
            <!-- Ice cubes visible inside -->
            <rect x="35" y="70" width="18" height="18" rx="3" fill="#FFF" stroke="#9CE3FF" stroke-width="1" transform="rotate(15 44 79)"/>
            <rect x="52" y="85" width="18" height="18" rx="3" fill="#FFF" stroke="#9CE3FF" stroke-width="1" transform="rotate(-10 61 94)"/>
            <rect x="30" y="105" width="20" height="20" rx="3" fill="#FFF" stroke="#9CE3FF" stroke-width="1" transform="rotate(30 40 115)"/>
            <rect x="50" y="110" width="18" height="18" rx="3" fill="#FFF" stroke="#9CE3FF" stroke-width="1" transform="rotate(-25 59 119)"/>
            <text x="50" y="60" font-family="'Outfit', sans-serif" font-size="8" font-weight="bold" fill="#0047FF" text-anchor="middle">GELO CRISTAL</text>
        </svg>`;
    } else if (type === 'coal') {
        return `
        <svg viewBox="0 0 100 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <!-- Coal Bag -->
            <path d="M25 40 L20 135 L80 135 L75 40 Z" fill="#8B4513" stroke="#5C2E0B" stroke-width="2"/>
            <!-- Top fold -->
            <path d="M25 40 L30 25 L70 25 L75 40 Z" fill="#5C2E0B"/>
            <line x1="30" y1="28" x2="70" y2="28" stroke="#FFD700" stroke-width="2"/>
            <!-- Bag Label -->
            <rect x="30" y="65" width="40" height="45" fill="#E8A900" rx="2"/>
            <text x="50" y="80" font-family="'Outfit', sans-serif" font-size="8" font-weight="900" fill="#000" text-anchor="middle">CARVÃO</text>
            <text x="50" y="93" font-family="'Outfit', sans-serif" font-size="7" font-weight="bold" fill="#8B0000" text-anchor="middle">SUPREMO</text>
            <circle cx="50" cy="103" r="4" fill="#333"/>
        </svg>`;
    } else if (type === 'snack') {
        return `
        <svg viewBox="0 0 100 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="snackGrad-${color.replace('#','')}" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="${mainColor}"/>
                    <stop offset="40%" stop-color="#FFF" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="${mainColor}"/>
                </linearGradient>
            </defs>
            <!-- Snack bag -->
            <path d="M25 25 L75 25 L70 135 L30 135 Z" fill="url(#snackGrad-${color.replace('#','')})" stroke="#FFF" stroke-width="0.5"/>
            <!-- Top and bottom crimps -->
            <path d="M22 25 L78 25 L78 20 L22 20 Z" fill="#D4AF37"/>
            <path d="M28 135 L72 135 L72 140 L28 140 Z" fill="#D4AF37"/>
            <!-- Circle badge -->
            <circle cx="50" cy="80" r="15" fill="#FFF" opacity="0.9"/>
            <text x="50" y="85" font-family="'Outfit', sans-serif" font-size="10" font-weight="900" fill="#000" text-anchor="middle">SNACK</text>
        </svg>`;
    } else if (type === 'cups') {
        return `
        <svg viewBox="0 0 100 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <!-- Plastic cups stacked -->
            <path d="M30 40 L35 125 L65 125 L70 40 Z" fill="rgba(255,255,255,0.3)" stroke="#FFF" stroke-width="1"/>
            <ellipse cx="50" cy="40" rx="20" ry="5" fill="rgba(255,255,255,0.5)" stroke="#FFF" stroke-width="0.5"/>
            <path d="M31 55 L35 125 L65 125 L69 55 Z" fill="rgba(255,255,255,0.2)" stroke="#FFF" stroke-width="0.5"/>
            <ellipse cx="50" cy="55" rx="19" ry="4.5" fill="rgba(255,255,255,0.4)" stroke="#FFF" stroke-width="0.5"/>
            <text x="50" y="95" font-family="'Outfit', sans-serif" font-size="9" font-weight="bold" fill="#FFD700" text-anchor="middle">COPOS</text>
        </svg>`;
    } else if (type === 'box-pack') {
        return `
        <svg viewBox="0 0 100 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <!-- Box vector -->
            <path d="M20 50 L50 35 L80 50 L80 120 L50 135 L20 120 Z" fill="#D2B48C" stroke="#8B5A2B" stroke-width="1"/>
            <path d="M20 50 L50 65 L80 50" fill="none" stroke="#8B5A2B" stroke-width="1"/>
            <line x1="50" y1="65" x2="50" y2="135" stroke="#8B5A2B" stroke-width="1"/>
            <path d="M50 35 L50 65" stroke="#CD853F" stroke-width="6"/>
            <rect x="30" y="80" width="40" height="25" fill="${mainColor}" rx="3"/>
            <text x="50" y="96" font-family="'Outfit', sans-serif" font-size="7" font-weight="900" fill="#FFF" text-anchor="middle">ATACADO</text>
        </svg>`;
    } else if (type === 'fardo') {
        return `
        <svg viewBox="0 0 100 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="40" width="50" height="85" rx="10" fill="rgba(255,255,255,0.2)" stroke="#AAA" stroke-width="1.5"/>
            <rect x="32" y="50" width="16" height="30" rx="3" fill="${mainColor}"/>
            <rect x="52" y="50" width="16" height="30" rx="3" fill="${mainColor}"/>
            <rect x="32" y="85" width="16" height="30" rx="3" fill="${mainColor}"/>
            <rect x="52" y="85" width="16" height="30" rx="3" fill="${mainColor}"/>
            <text x="50" y="138" font-family="'Outfit', sans-serif" font-size="8" font-weight="bold" fill="#FFF" text-anchor="middle">PACK x12</text>
        </svg>`;
    }
    
    return `<svg viewBox="0 0 100 150" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="130" fill="${mainColor}" rx="10"/></svg>`;
}

// Write the category static assets (inline base64 SVGs or placeholder SVGs)
function getCategorySVG(category) {
    if (category === 'cervejas') {
        return `data:image/svg+xml;utf8,${encodeURIComponent(getProductSVG('bottle', '#008234'))}`;
    } else if (category === 'destilados') {
        return `data:image/svg+xml;utf8,${encodeURIComponent(getProductSVG('vodka', '#00539F'))}`;
    } else if (category === 'refrigerantes') {
        return `data:image/svg+xml;utf8,${encodeURIComponent(getProductSVG('pet', '#FF0000'))}`;
    } else if (category === 'energeticos') {
        return `data:image/svg+xml;utf8,${encodeURIComponent(getProductSVG('energy-can', '#002F6C'))}`;
    } else if (category === 'aguas') {
        return `data:image/svg+xml;utf8,${encodeURIComponent(getProductSVG('water', '#0097D7'))}`;
    } else if (category === 'sucos') {
        return `data:image/svg+xml;utf8,${encodeURIComponent(getProductSVG('juice', '#FFA500'))}`;
    } else if (category === 'gelo') {
        return `data:image/svg+xml;utf8,${encodeURIComponent(getProductSVG('ice', '#9CE3FF'))}`;
    } else if (category === 'carvao') {
        return `data:image/svg+xml;utf8,${encodeURIComponent(getProductSVG('coal', '#333333'))}`;
    } else if (category === 'conveniencia') {
        return `data:image/svg+xml;utf8,${encodeURIComponent(getProductSVG('snack', '#E8A900', 'Conveniência'))}`;
    } else if (category === 'atacado') {
        return `data:image/svg+xml;utf8,${encodeURIComponent(getProductSVG('box-pack', '#0047FF', 'Atacado'))}`;
    }
    return '';
}

// --- DOM ELEMENTS ---
const productsGrid = document.getElementById('products-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const categoryCards = document.querySelectorAll('.category-card');
const cartToggle = document.getElementById('cart-toggle');
const cartClose = document.getElementById('cart-close');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const cartCountBadge = document.getElementById('cart-count');
const btnCheckout = document.getElementById('btn-checkout');
const btnStartShopping = document.getElementById('btn-start-shopping');

const searchToggle = document.getElementById('search-toggle');
const searchOverlay = document.getElementById('search-overlay');
const searchInput = document.getElementById('search-input');
const closeSearch = document.getElementById('close-search');

const accountBtn = document.getElementById('account-btn');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const heroCnpjBtn = document.getElementById('hero-cnpj-btn');

// Modal Elements
const checkoutModal = document.getElementById('checkout-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const checkoutForm = document.getElementById('checkout-form');
const tabCpf = document.getElementById('tab-cpf');
const tabCnpj = document.getElementById('tab-cnpj');
const formFieldsContainer = document.getElementById('form-fields-container');

// Auth Modal Elements
const authModal = document.getElementById('auth-modal');
const authOverlay = document.getElementById('auth-overlay');
const authClose = document.getElementById('auth-close');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const linkToRegister = document.getElementById('link-to-register');
const linkToLogin = document.getElementById('link-to-login');
const btnGuestContinue = document.getElementById('btn-guest-continue');
const linkCheckoutLogin = document.getElementById('link-checkout-login');
const btnLogout = document.getElementById('btn-logout');

// Auth Views
const viewLogin = document.getElementById('auth-view-login');
const viewRegister = document.getElementById('auth-view-register');
const viewProfile = document.getElementById('auth-view-profile');

// Profile Displays
const profileNameDisplay = document.getElementById('profile-name-display');
const profileEmailDisplay = document.getElementById('profile-email-display');
const profilePhoneDisplay = document.getElementById('profile-phone-display');
const profileAddressDisplay = document.getElementById('profile-address-display');

// --- SUPABASE CONFIG ---
const SUPABASE_URL = 'https://urzxfvhyccxkkcqbyttx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyenhmdmh5Y2N4a2tjcWJ5dHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NTU1MTcsImV4cCI6MjA5OTQzMTUxN30.LT_13YxAnQKi2ODXBhcYwd0Ief7sFKmaAdEV9xL3izI';
let supabaseClient = null;
try {
    if (typeof window.supabase !== 'undefined') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.warn('Supabase SDK não está disponível.');
    }
} catch (e) {
    console.error('Falha ao inicializar o Supabase:', e);
}

// Global Auth State
let loggedInUser = null; // Representa o perfil unificado do usuário

// --- INIT APP ---
let appProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    loadLocalStorageCart();
    loadAuthUser();
    loadAppProducts();
    renderCart();
    setupEventListeners();
    setupCategoryImages();
});

function getDefaultType(category) {
    const map = {
        cervejas: 'bottle',
        destilados: 'vodka',
        refrigerantes: 'pet',
        energeticos: 'energy-can',
        aguas: 'water',
        sucos: 'juice',
        gelo: 'ice',
        carvao: 'coal',
        conveniencia: 'snack',
        atacado: 'box-pack'
    };
    return map[category] || 'bottle';
}

function getDefaultColor(category) {
    const map = {
        cervejas: '#008234',
        destilados: '#00539F',
        refrigerantes: '#FF0000',
        energeticos: '#002F6C',
        aguas: '#0097D7',
        sucos: '#FFA500',
        gelo: '#9CE3FF',
        carvao: '#333333',
        conveniencia: '#E8A900',
        atacado: '#0047FF'
    };
    return map[category] || '#0047FF';
}

async function loadAppProducts() {
    try {
        let dbProducts = [];
        
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('products')
                .select('*')
                .eq('active', true)
                .order('created_at', { ascending: false });
                
            if (error) {
                console.warn('Erro RLS ou falha ao buscar produtos:', error);
            } else if (data && data.length > 0) {
                dbProducts = data.map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    price: parseFloat(p.price),
                    category: p.category,
                    image: p.image_url || '',
                    type: getDefaultType(p.category),
                    color: getDefaultColor(p.category)
                }));
            }
        }
        
        let staticProducts = [];
        try {
            if (typeof products !== 'undefined') {
                staticProducts = products;
            }
        } catch(e) {}
        
        if (dbProducts.length > 0) {
            appProducts = dbProducts;
        } else {
            appProducts = staticProducts;
        }
        
    } catch (err) {
        console.error('Erro geral ao carregar produtos do Supabase:', err);
        try {
            if (typeof products !== 'undefined') appProducts = products;
        } catch(e) {
            appProducts = [];
        }
    }
    
    renderProducts('todos');
}

// Categorias que usam imagens reais da pasta assets/ (ex: cat_cervejas.png)
// Caso queira usar imagem real para outra categoria, basta colocar o nome dela na lista abaixo
// e salvar a imagem com formato .png correspondente na pasta assets (ex: cat_destilados.png)
const categoriesWithCustomImages = ['cervejas', 'destilados', 'gelo', 'carvao', 'refrigerantes', 'energeticos', 'aguas', 'sucos'];

// Setup fallback dynamically for category image assets since real images may not exist locally
function setupCategoryImages() {
    categoryCards.forEach(card => {
        const cat = card.dataset.category;
        const img = card.querySelector('.category-img');
        if (img) {
            // Se a categoria não estiver na lista de imagens customizadas, aplica o SVG dinâmico
            if (!categoriesWithCustomImages.includes(cat)) {
                img.src = getCategorySVG(cat);
            }
        }
    });
}

// Categorias e Catálogo
function renderProducts(filter = 'todos', searchQuery = '') {
    productsGrid.innerHTML = '';
    
    let filteredProducts = appProducts;
    
    // Category filter
    if (filter !== 'todos') {
        filteredProducts = appProducts.filter(p => p.category === filter);
    }
    
    // Search query filter
    if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
    }
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fa-solid fa-circle-info"></i>
                <p>Nenhum produto encontrado.</p>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = prod.id;
        
        // Check if there is a custom image, otherwise generate the SVG
        const imageContent = prod.image 
            ? `<img src="${prod.image}" alt="${prod.name}" class="product-img">` 
            : getProductSVG(prod.type, prod.color, prod.name);
        
        // Check if item is already in cart to display active quantity
        const cartItem = (Array.isArray(cart) ? cart : []).find(item => item && item.id === prod.id);
        const activeQty = cartItem ? cartItem.quantity : 1;
        
        card.innerHTML = `
            <div class="product-img-wrapper">
                ${imageContent}
            </div>
            <div class="product-info">
                <span class="product-category">${prod.category}</span>
                <h3 class="product-name">${prod.name}</h3>
                <p class="product-desc">${prod.description}</p>
                <div class="product-price-row">
                    <div class="product-price">
                        <span class="price-label">Preço</span>
                        <span class="price-value">R$ ${prod.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="product-qty-control">
                        <button class="qty-btn btn-minus" aria-label="Diminuir"><i class="fa-solid fa-minus"></i></button>
                        <input type="text" class="qty-input" value="${activeQty}" readonly aria-label="Quantidade">
                        <button class="qty-btn btn-plus" aria-label="Aumentar"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
                <button class="btn btn-primary btn-add-cart">
                    <i class="fa-solid fa-cart-plus"></i> Adicionar
                </button>
            </div>
        `;
        
        // Setup Card Event Listeners
        const btnMinus = card.querySelector('.btn-minus');
        const btnPlus = card.querySelector('.btn-plus');
        const qtyInput = card.querySelector('.qty-input');
        const btnAdd = card.querySelector('.btn-add-cart');
        
        btnMinus.addEventListener('click', (e) => {
            e.stopPropagation();
            let val = parseInt(qtyInput.value);
            if (val > 1) {
                qtyInput.value = val - 1;
            }
        });
        
        btnPlus.addEventListener('click', (e) => {
            e.stopPropagation();
            let val = parseInt(qtyInput.value);
            qtyInput.value = val + 1;
        });
        
        btnAdd.addEventListener('click', (e) => {
            e.stopPropagation();
            const qty = parseInt(qtyInput.value);
            addToCart(prod, qty);
        });
        
        productsGrid.appendChild(card);
    });
}

// --- CART LOGIC ---
function addToCart(product, quantity) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            color: product.color,
            type: product.type,
            image: product.image || '',
            quantity: quantity
        });
    }
    
    saveLocalStorageCart();
    renderCart();
    showToast(`Adicionado: ${quantity}x ${product.name}`);
    
    // Pulse cart button in header
    cartToggle.classList.add('pulse');
    setTimeout(() => cartToggle.classList.remove('pulse'), 500);
}

function updateCartQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(id);
    } else {
        saveLocalStorageCart();
        renderCart();
        // Also update catalogue quantity if matches
        updateCatalogueQty(id, item.quantity);
    }
}

function removeFromCart(id) {
    const item = cart.find(item => item.id === id);
    const name = item ? item.name : '';
    cart = cart.filter(item => item.id !== id);
    saveLocalStorageCart();
    renderCart();
    updateCatalogueQty(id, 1);
    if (name) showToast(`Removido: ${name}`);
}

function updateCatalogueQty(id, qty) {
    const card = document.querySelector(`.product-card[data-id="${id}"]`);
    if (card) {
        const qtyInput = card.querySelector('.qty-input');
        if (qtyInput) qtyInput.value = qty;
    }
}

function calculateSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    
    if (!Array.isArray(cart) || cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-cart-arrow-down"></i>
                <p>Seu carrinho está vazio.</p>
            </div>
        `;
        
        cartSubtotal.textContent = 'R$ 0,00';
        cartTotal.textContent = 'R$ 0,00';
        cartCountBadge.textContent = '0';
        cartCountBadge.style.display = 'none';
        return;
    }
    
    cartCountBadge.style.display = 'flex';
    cartCountBadge.textContent = cart.reduce((count, item) => count + item.quantity, 0);
    
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        
        const imageContent = item.image 
            ? `<img src="${item.image}" alt="${item.name}" class="cart-item-img">` 
            : getProductSVG(item.type, item.color, item.name);
        
        div.innerHTML = `
            <div class="cart-item-img-wrapper">
                ${imageContent}
            </div>
            <div class="cart-item-info">
                <div>
                    <h4 class="cart-item-name">${item.name}</h4>
                    <span class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="cart-item-bottom">
                    <div class="product-qty-control">
                        <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)" aria-label="Diminuir"><i class="fa-solid fa-minus"></i></button>
                        <span class="qty-input">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)" aria-label="Aumentar"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <span class="cart-item-subtotal">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Remover item"><i class="fa-solid fa-trash-can"></i></button>
        `;
        cartItemsContainer.appendChild(div);
    });
    
    const sub = calculateSubtotal();
    cartSubtotal.textContent = `R$ ${sub.toFixed(2).replace('.', ',')}`;
    cartTotal.textContent = `R$ ${sub.toFixed(2).replace('.', ',')}`;
}

// --- LOCAL STORAGE ---
function saveLocalStorageCart() {
    localStorage.setItem('distribuidora_imperatriz_cart', JSON.stringify(cart));
}

function loadLocalStorageCart() {
    const saved = localStorage.getItem('distribuidora_imperatriz_cart');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            cart = Array.isArray(parsed) ? parsed.filter(item => item !== null) : [];
        } catch (e) {
            cart = [];
        }
    }
}

// --- TOAST NOTIFICATIONS ---
function showToast(message) {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--neon-blue);"></i> <span>${message}</span>`;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toast-in 0.3s reverse forwards';
        setTimeout(() => {
            toast.remove();
            if (toastContainer.children.length === 0) toastContainer.remove();
        }, 300);
    }, 2500);
}

// --- MODAL & FORM MANAGER ---
function openCheckoutModal() {
    if (cart.length === 0) {
        showToast('Seu carrinho está vazio. Adicione produtos antes de finalizar!');
        return;
    }
    
    checkoutModal.classList.add('active');
    modalOverlay.classList.add('active');
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    
    // Render dynamic form fields based on selected type
    renderFormFields();
}

function closeCheckoutModal() {
    checkoutModal.classList.remove('active');
    modalOverlay.classList.remove('active');
}

function toggleCustomerType(type) {
    currentCustomerType = type;
    if (type === 'cpf') {
        tabCpf.classList.add('active');
        tabCnpj.classList.remove('active');
    } else {
        tabCpf.classList.remove('active');
        tabCnpj.classList.add('active');
    }
    renderFormFields();
}

function renderFormFields() {
    formFieldsContainer.innerHTML = '';
    
    if (currentCustomerType === 'cpf') {
        formFieldsContainer.innerHTML = `
            <div class="form-group">
                <label for="cpf-nome">Nome Completo *</label>
                <input type="text" id="cpf-nome" required placeholder="Digite seu nome completo">
            </div>
            <div class="form-group">
                <label for="cpf-telefone">Telefone *</label>
                <input type="tel" id="cpf-telefone" required placeholder="(99) 99999-9999">
            </div>
            <div class="form-group">
                <label for="cpf-endereco">Endereço (Rua, Nº, Apto) *</label>
                <input type="text" id="cpf-endereco" required placeholder="Ex: Rua das Flores, 123">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="cpf-bairro">Bairro *</label>
                    <input type="text" id="cpf-bairro" required placeholder="Digite seu bairro">
                </div>
                <div class="form-group">
                    <label for="cpf-cidade">Cidade *</label>
                    <input type="text" id="cpf-cidade" required value="Orlândia" placeholder="Sua cidade">
                </div>
            </div>
        `;
        
        // Add Simple Phone Mask
        setupPhoneMask('cpf-telefone');
    } else {
        formFieldsContainer.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="cnpj-razao">Razão Social *</label>
                    <input type="text" id="cnpj-razao" required placeholder="Nome legal da empresa">
                </div>
                <div class="form-group">
                    <label for="cnpj-fantasia">Nome Fantasia *</label>
                    <input type="text" id="cnpj-fantasia" required placeholder="Nome comercial">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="cnpj-numero">CNPJ *</label>
                    <input type="text" id="cnpj-numero" required placeholder="00.000.000/0001-00">
                </div>
                <div class="form-group">
                    <label for="cnpj-ie">Inscrição Estadual *</label>
                    <input type="text" id="cnpj-ie" required placeholder="Inscrição Estadual">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="cnpj-responsavel">Nome do Responsável *</label>
                    <input type="text" id="cnpj-responsavel" required placeholder="Nome de contato">
                </div>
                <div class="form-group">
                    <label for="cnpj-telefone">Telefone Comercial *</label>
                    <input type="tel" id="cnpj-telefone" required placeholder="(99) 99999-9999">
                </div>
            </div>
            <div class="form-group">
                <label for="cnpj-endereco">Endereço Comercial *</label>
                <input type="text" id="cnpj-endereco" required placeholder="Rua, número, sala/galpão">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="cnpj-bairro">Bairro *</label>
                    <input type="text" id="cnpj-bairro" required placeholder="Bairro comercial">
                </div>
                <div class="form-group">
                    <label for="cnpj-cidade">Cidade *</label>
                    <input type="text" id="cnpj-cidade" required value="Orlândia" placeholder="Cidade">
                </div>
            </div>
        `;
        
        setupPhoneMask('cnpj-telefone');
        setupCNPJMask('cnpj-numero');
    }
    
    // Auto-fill if user is logged in
    prefillCheckoutFields();
}

// Masks helpers
function setupPhoneMask(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', (e) => {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
}

function setupCNPJMask(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', (e) => {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
        e.target.value = !x[2] ? x[1] : x[1] + '.' + x[2] + '.' + x[3] + '/' + x[4] + (x[5] ? '-' + x[5] : '');
    });
}

// --- AUTH LOGIC (SUPABASE REAL) ---

// Inicializa ouvindo mudanças de sessão (login, logout, retorno do Google)
if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (session && session.user) {
            await fetchAndSetProfile(session.user);
        } else {
            loggedInUser = null;
            updateAuthHeaderState();
        }
    });
}

async function fetchAndSetProfile(authUser) {
    if (!supabaseClient) return;
    
    let profile = null;
    try {
        const { data } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
        profile = data;
    } catch (e) {
        console.warn('Não foi possível carregar o perfil:', e);
    }

    const name = profile?.name || authUser.user_metadata?.full_name || authUser.email;
    const phone = profile?.phone || '';

    loggedInUser = {
        id: authUser.id,
        name,
        email: authUser.email,
        phone,
        address: {
            street: profile?.address_street || '',
            number: profile?.address_number || '',
            neighborhood: profile?.address_neighborhood || '',
            city: profile?.address_city || ''
        }
    };

    updateAuthHeaderState();
}

async function loadAuthUser() {
    if (!supabaseClient) return;
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            await fetchAndSetProfile(session.user);
        }
    } catch (e) {
        console.warn('Erro ao carregar usuário autenticado:', e);
    }
}

function updateAuthHeaderState() {
    if (loggedInUser) {
        accountBtn.classList.add('logged-in');
    } else {
        accountBtn.classList.remove('logged-in');
    }
}

function openAuthModal() {
    authModal.classList.add('active');
    authOverlay.classList.add('active');

    if (loggedInUser) {
        showAuthView('profile');
        renderProfileInfo();
    } else {
        showAuthView('login');
    }
}

function closeAuthModal() {
    authModal.classList.remove('active');
    authOverlay.classList.remove('active');
}

function showAuthView(viewName) {
    viewLogin.style.display = viewName === 'login' ? 'block' : 'none';
    viewRegister.style.display = viewName === 'register' ? 'block' : 'none';
    viewProfile.style.display = viewName === 'profile' ? 'block' : 'none';
}

function renderProfileInfo() {
    if (!loggedInUser) return;
    profileNameDisplay.textContent = loggedInUser.name;
    profileEmailDisplay.textContent = loggedInUser.email;
    profilePhoneDisplay.textContent = loggedInUser.phone || 'Não informado';

    const addr = loggedInUser.address;
    if (addr && addr.street) {
        profileAddressDisplay.innerHTML = `${addr.street}, ${addr.number}<br>${addr.neighborhood} - ${addr.city}`;
    } else {
        profileAddressDisplay.textContent = 'Não informado';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    const street = document.getElementById('reg-street').value;
    const number = document.getElementById('reg-number').value;
    const neighborhood = document.getElementById('reg-neighborhood').value;
    const city = document.getElementById('reg-city').value;

    showToast('Criando conta...');

    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
    });

    if (error) {
        showToast('Erro ao criar conta: ' + error.message);
        return;
    }

    if (data.user) {
        // Salva o perfil na tabela profiles
        await supabaseClient.from('profiles').upsert({
            id: data.user.id,
            name,
            phone,
            address_street: street,
            address_number: number,
            address_neighborhood: neighborhood,
            address_city: city
        });

        showToast(`Conta criada! Bem-vindo(a), ${name}!`);
        await fetchAndSetProfile(data.user);
        showAuthView('profile');
        renderProfileInfo();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    showToast('Entrando...');

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        showToast('Credenciais inválidas. Tente novamente.');
        return;
    }

    if (data.user) {
        await fetchAndSetProfile(data.user);
        showToast('Bem-vindo(a) de volta!');
        showAuthView('profile');
        renderProfileInfo();
    }
}

async function handleGoogleLogin() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });
    if (error) {
        showToast('Erro ao iniciar login com Google: ' + error.message);
    }
}

async function handleLogout() {
    await supabaseClient.auth.signOut();
    loggedInUser = null;
    updateAuthHeaderState();
    showToast('Você saiu da conta.');
    closeAuthModal();
}

function prefillCheckoutFields() {
    const loginPrompt = document.getElementById('checkout-login-prompt');
    
    if (!loggedInUser) {
        if (loginPrompt) loginPrompt.style.display = 'block';
        return;
    }
    
    if (loginPrompt) loginPrompt.style.display = 'none';
    
    if (currentCustomerType === 'cpf') {
        const cpfNome = document.getElementById('cpf-nome');
        const cpfTelefone = document.getElementById('cpf-telefone');
        const cpfEndereco = document.getElementById('cpf-endereco');
        const cpfBairro = document.getElementById('cpf-bairro');
        const cpfCidade = document.getElementById('cpf-cidade');
        
        if (cpfNome) cpfNome.value = loggedInUser.name;
        if (cpfTelefone) cpfTelefone.value = loggedInUser.phone;
        if (cpfEndereco) cpfEndereco.value = loggedInUser.address.street + ", " + loggedInUser.address.number;
        if (cpfBairro) cpfBairro.value = loggedInUser.address.neighborhood;
        if (cpfCidade) cpfCidade.value = loggedInUser.address.city;
    } else {
        const cnpjResp = document.getElementById('cnpj-responsavel');
        const cnpjTelefone = document.getElementById('cnpj-telefone');
        const cnpjEndereco = document.getElementById('cnpj-endereco');
        const cnpjBairro = document.getElementById('cnpj-bairro');
        const cnpjCidade = document.getElementById('cnpj-cidade');
        
        if (cnpjResp) cnpjResp.value = loggedInUser.name;
        if (cnpjTelefone) cnpjTelefone.value = loggedInUser.phone;
        if (cnpjEndereco) cnpjEndereco.value = loggedInUser.address.street + ", " + loggedInUser.address.number;
        if (cnpjBairro) cnpjBairro.value = loggedInUser.address.neighborhood;
        if (cnpjCidade) cnpjCidade.value = loggedInUser.address.city;
    }
}

// --- SUBMIT ORDER & WHATSAPP REDIRECT ---
async function handleCheckoutFormSubmit(e) {
    e.preventDefault();
    
    const payment = document.getElementById('checkout-payment').value;
    let message = '';
    
    message += `Olá, gostaria de realizar um pedido.\n\n`;
    
    let dbCustomerName = '';
    let dbCustomerPhone = '';
    let dbDeliveryAddress = '';
    
    // Assemble Customer Details
    if (currentCustomerType === 'cpf') {
        const nome = document.getElementById('cpf-nome').value;
        const tel = document.getElementById('cpf-telefone').value;
        const end = document.getElementById('cpf-endereco').value;
        const bairro = document.getElementById('cpf-bairro').value;
        const cidade = document.getElementById('cpf-cidade').value;
        
        dbCustomerName = nome;
        dbCustomerPhone = tel;
        dbDeliveryAddress = `${end}, ${bairro} - ${cidade}`;
        
        message += `*CLIENTE:* Pessoa Física (CPF)\n`;
        message += `*Nome:* ${nome}\n`;
        message += `*Telefone:* ${tel}\n`;
        message += `*Endereço:* ${dbDeliveryAddress}\n`;
    } else {
        const razao = document.getElementById('cnpj-razao').value;
        const fantasia = document.getElementById('cnpj-fantasia').value;
        const cnpj = document.getElementById('cnpj-numero').value;
        const ie = document.getElementById('cnpj-ie').value;
        const resp = document.getElementById('cnpj-responsavel').value;
        const tel = document.getElementById('cnpj-telefone').value;
        const end = document.getElementById('cnpj-endereco').value;
        const bairro = document.getElementById('cnpj-bairro').value;
        const cidade = document.getElementById('cnpj-cidade').value;
        
        dbCustomerName = razao;
        dbCustomerPhone = tel;
        dbDeliveryAddress = `${end}, ${bairro} - ${cidade}`;
        
        message += `*CLIENTE:* Pessoa Jurídica (CNPJ)\n`;
        message += `*Razão Social:* ${razao}\n`;
        message += `*Nome Fantasia:* ${fantasia}\n`;
        message += `*CNPJ:* ${cnpj}\n`;
        message += `*Inscrição Estadual:* ${ie}\n`;
        message += `*Responsável:* ${resp}\n`;
        message += `*Telefone Comercial:* ${tel}\n`;
        message += `*Endereço Comercial:* ${dbDeliveryAddress}\n`;
    }
    
    message += `*Forma de Pagamento:* ${payment}\n\n`;
    message += `-----------------------------\n`;
    message += `*PRODUTOS PEDIDOS:*\n`;
    
    // Assemble Products List
    cart.forEach(item => {
        const sub = item.price * item.quantity;
        message += `• *${item.name}* x${item.quantity} - R$ ${item.price.toFixed(2).replace('.', ',')} (Subtotal: R$ ${sub.toFixed(2).replace('.', ',')})\n`;
    });
    
    const subtotalNum = calculateSubtotal();
    
    message += `-----------------------------\n`;
    message += `*Total do Pedido: R$ ${subtotalNum.toFixed(2).replace('.', ',')}*\n\n`;
    message += `Aguardando confirmação do pedido e taxa de entrega.`;
    
    // Desabilitar botão durante o envio
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registrando Pedido...';
    
    // Salvar no Supabase
    if (supabaseClient) {
        try {
            const customerId = loggedInUser && loggedInUser.id ? loggedInUser.id : null;
            const { error } = await supabaseClient.from('orders').insert({
                customer_id: customerId,
                customer_name: dbCustomerName,
                customer_phone: dbCustomerPhone,
                delivery_address: dbDeliveryAddress,
                items: cart,
                total: subtotalNum,
                status: 'Pendente'
            });
            if (error) console.error('Erro ao salvar pedido no Supabase:', error);
        } catch (err) {
            console.error('Erro fatal ao tentar salvar no Supabase:', err);
        }
    }
    
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = originalBtnText;

    // Redirect to WhatsApp
    const encodedText = encodeURIComponent(message);
    const phoneNumber = '5547992419566'; // Número para testar os pedidos
    const url = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    
    // Open in a new tab
    window.open(url, '_blank');
    
    // Success flow
    closeCheckoutModal();
    showToast('Pedido gerado! Redirecionando para o WhatsApp...');
    
    // Clear cart and state
    cart = [];
    saveLocalStorageCart();
    renderCart();
    
    // Reset catalogue items qty display
    document.querySelectorAll('.qty-input').forEach(input => input.value = 1);
}

// --- EVENT LISTENERS REGISTRATION ---
function setupEventListeners() {
    // Cart open/close triggers
    cartToggle.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    });
    
    cartClose.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    });
    
    cartOverlay.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    });
    
    btnCheckout.addEventListener('click', openCheckoutModal);
    
    // Empty Cart start shopping button
    btnStartShopping.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    });
    
    // Search toggle
    searchToggle.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        searchInput.focus();
    });
    
    closeSearch.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        renderProducts('todos');
    });
    
    searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        renderProducts(activeFilter, val);
    });
    
    // Filters buttons catalog
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.filter;
            renderProducts(category, searchInput.value);
            
            // Sync category cards if matching
            categoryCards.forEach(card => {
                if (card.dataset.category === category) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        });
    });
    
    // Categories Grid Click Event
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const cat = card.dataset.category;
            
            // Scroll to catalog section
            document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
            
            // Set filter active state
            filterBtns.forEach(btn => {
                if (btn.dataset.filter === cat) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Toggle active category card state
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            renderProducts(cat);
        });
    });
    
    // CNPJ Hero trigger
    heroCnpjBtn.addEventListener('click', () => {
        openCheckoutModal();
        toggleCustomerType('cnpj');
    });
    
    // Modal buttons tabs events
    tabCpf.addEventListener('click', () => toggleCustomerType('cpf'));
    tabCnpj.addEventListener('click', () => toggleCustomerType('cnpj'));
    
    modalClose.addEventListener('click', closeCheckoutModal);
    modalOverlay.addEventListener('click', closeCheckoutModal);
    
    // Form submit event
    checkoutForm.addEventListener('submit', handleCheckoutFormSubmit);
    
    // Logo scroll to top helper
    document.getElementById('logo-link').addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Navegação e Animações de Menu
    mobileMenuBtn.addEventListener('click', () => {
        const nav = document.querySelector('.nav');
        nav.classList.toggle('mobile-active');
        if (nav.classList.contains('mobile-active')) {
            mobileMenuBtn.querySelector('i').className = 'fa-solid fa-xmark';
            nav.style.display = 'block';
            nav.style.position = 'fixed';
            nav.style.top = '90px';
            nav.style.left = '0';
            nav.style.width = '100%';
            nav.style.background = 'rgba(3, 11, 34, 0.95)';
            nav.style.padding = '20px 24px';
            nav.style.borderBottom = '1px solid rgba(45, 107, 255, 0.1)';
            nav.style.zIndex = '98';
            
            // Style mobile items
            const navList = nav.querySelector('.nav-list');
            navList.style.flexDirection = 'column';
            navList.style.alignItems = 'flex-start';
            navList.style.gap = '20px';
        } else {
            mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
            nav.style.display = 'none';
        }
    });
    
    // Close mobile menu on nav link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const nav = document.querySelector('.nav');
            if (nav.classList.contains('mobile-active')) {
                nav.classList.remove('mobile-active');
                nav.style.display = 'none';
                mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
            }
        });
    });
    
    // Scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.style.background = 'rgba(3, 11, 34, 0.98)';
            header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.background = 'rgba(3, 11, 34, 0.85)';
            header.style.boxShadow = 'none';
        }
    });

    // Account / Auth Modal Events
    accountBtn.addEventListener('click', openAuthModal);
    authClose.addEventListener('click', closeAuthModal);
    authOverlay.addEventListener('click', closeAuthModal);
    
    // Switch Views
    linkToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthView('register');
    });
    
    linkToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthView('login');
    });
    
    btnGuestContinue.addEventListener('click', closeAuthModal);
    
    linkCheckoutLogin.addEventListener('click', (e) => {
        e.preventDefault();
        closeCheckoutModal();
        openAuthModal();
    });
    
    // Auth Forms Submission
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    btnLogout.addEventListener('click', handleLogout);
    
    // Google Login button
    const btnGoogleLogin = document.getElementById('btn-google-login');
    if (btnGoogleLogin) {
        btnGoogleLogin.addEventListener('click', handleGoogleLogin);
    }
    
    // Apply phone mask to registration form phone field
    setupPhoneMask('reg-phone');
}

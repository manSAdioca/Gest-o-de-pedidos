// ======================================================
// ADMIN JS — Distribuidora Imperatriz
// Integração completa com Supabase
// ======================================================

const SUPABASE_URL = 'https://urzxfvhyccxkkcqbyttx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyenhmdmh5Y2N4a2tjcWJ5dHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NTU1MTcsImV4cCI6MjA5OTQzMTUxN30.LT_13YxAnQKi2ODXBhcYwd0Ief7sFKmaAdEV9xL3izI';

let supabase;
try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
    console.error('Supabase SDK não carregou:', e);
}

// Estado global
let allProducts = [];
let allOrders = [];
let allCustomers = [];
let currentUser = null;
let deleteTargetId = null;
let editingProductId = null;
let selectedImageFile = null;

// ── INICIALIZAÇÃO ──
window.addEventListener('DOMContentLoaded', async () => {

    // ⚠️ Registrar o listener do botão de login PRIMEIRO (independente de auth)
    document.getElementById('btn-gate-login').addEventListener('click', handleGateLogin);
    document.getElementById('gate-password').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleGateLogin();
    });

    if (!supabase) return; // auth-gate já está visível por padrão

    try {
        await checkAuth();
    } catch (err) {
        console.error('Erro ao verificar auth:', err);
        // auth-gate já está visível, nada a fazer
    }
});

async function handleGateLogin() {
    const emailEl = document.getElementById('gate-email');
    const passEl  = document.getElementById('gate-password');
    const btn     = document.getElementById('btn-gate-login');

    const email    = emailEl ? emailEl.value.trim() : '';
    const password = passEl  ? passEl.value         : '';

    if (!email || !password) {
        alert('Preencha e-mail e senha para continuar.');
        return;
    }

    // Verificar se SDK carregou
    if (typeof window.supabase === 'undefined' || !supabase) {
        alert('SDK do Supabase ainda está carregando. Aguarde um momento e tente novamente.');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Entrando...';

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            alert('Login inválido: ' + error.message);
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Entrar no Painel';
            return;
        }

        // Verificar role admin
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError || !profile || profile.role !== 'admin') {
            await supabase.auth.signOut();
            alert('Sua conta não tem permissão de administrador.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Entrar no Painel';
            return;
        }

        currentUser = { ...data.user, ...profile };
        initAdminPanel();

    } catch (err) {
        alert('Erro inesperado: ' + err.message);
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Entrar no Painel';
    }
}


async function checkAuth() {
    if (!supabase) {
        showGate('auth-gate');
        return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        showGate('auth-gate');
        return;
    }

    // Buscar perfil e verificar role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        showGate('access-denied');
        return;
    }

    currentUser = { ...session.user, ...profile };
    initAdminPanel();
}

function showGate(gateId) {
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('auth-gate').style.display = 'none';
    document.getElementById('access-denied').style.display = 'none';
    document.getElementById('admin-app').style.display = 'none';
    document.getElementById(gateId).style.display = 'flex';
}

function initAdminPanel() {
    // Preencher info do usuário na sidebar
    const name = currentUser.name || currentUser.email;
    document.getElementById('sidebar-user-name').textContent = name;
    document.getElementById('user-avatar-initials').textContent = name.charAt(0).toUpperCase();

    // Esconder auth-gate e mostrar painel
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('auth-gate').style.display = 'none';
    document.getElementById('access-denied').style.display = 'none';
    document.getElementById('admin-app').style.display = 'flex';

    // Carregar dados
    loadProducts();
    loadOrders();
    loadCustomers();

    // Event listeners
    setupEventListeners();

    // Listeners em tempo real para novos pedidos
    setupRealtimeOrders();
}

// ── NAVEGAÇÃO ──
function showSection(name) {
    document.getElementById('section-dashboard').style.display = 'none';
    document.getElementById('section-products').style.display = 'none';
    // Hide all sections and remove active classes
    document.querySelectorAll('.page-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => el.classList.remove('active'));

    if (name === 'dashboard') {
        document.getElementById('section-dashboard').style.display = 'block';
        document.getElementById('nav-dashboard').classList.add('active');
        document.getElementById('topbar-title').textContent = 'Dashboard';
        document.getElementById('topbar-subtitle').textContent = 'Visão geral do seu negócio';
        // Recarrega estatísticas caso volte para a Home
        loadProducts(); 
        loadOrders();
        loadCustomers();
    } else if (name === 'products') {
        document.getElementById('section-products').style.display = 'block';
        document.getElementById('nav-products').classList.add('active');
        document.getElementById('topbar-title').textContent = 'Produtos';
        document.getElementById('topbar-subtitle').textContent = 'Gerencie seu catálogo de produtos';
        loadProducts(); // Fetch fresh data
    } else if (name === 'orders') {
        document.getElementById('section-orders').style.display = 'block';
        document.getElementById('nav-orders').classList.add('active');
        document.getElementById('topbar-title').textContent = 'Pedidos';
        document.getElementById('topbar-subtitle').textContent = 'Gerencie as vendas e entregas';
        loadOrders(); // Fetch fresh data
    } else if (name === 'customers') {
        document.getElementById('section-customers').style.display = 'block';
        document.getElementById('nav-customers').classList.add('active');
        document.getElementById('topbar-title').textContent = 'Clientes';
        document.getElementById('topbar-subtitle').textContent = 'Acompanhe os clientes cadastrados';
        loadCustomers(); // Fetch fresh data
    }

    // Fechar sidebar mobile
    document.getElementById('sidebar').classList.remove('open');
}

// ── CARREGAR PRODUTOS ──
async function loadProducts() {
    // Admin pode ver todos (ativos e inativos)
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        showToast('Erro ao carregar produtos: ' + error.message, 'error');
        return;
    }

    allProducts = data || [];
    updateStats();
    renderProductsTable(allProducts);
}

function updateStats() {
    const totalProducts = allProducts.length;
    const totalCustomers = allCustomers.length;
    
    // Calcular total de vendas apenas de pedidos não cancelados
    const totalSales = allOrders
        .filter(o => o.status !== 'Cancelado')
        .reduce((sum, o) => sum + Number(o.total), 0);
        
    const pendingOrders = allOrders.filter(o => o.status === 'Pendente').length;

    document.getElementById('stat-sales').textContent = totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('stat-pending-orders').textContent = pendingOrders;
    document.getElementById('stat-customers').textContent = totalCustomers;
    document.getElementById('stat-products').textContent = totalProducts;
}

// ── RENDERIZAR TABELA ──
function renderProductsTable(products) {
    const tbody = document.getElementById('products-table-body');

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="6">
                <div class="empty-state">
                    <i class="fa-solid fa-box-open"></i>
                    <p>Nenhum produto encontrado. Adicione seu primeiro produto!</p>
                </div>
            </td></tr>
        `;
        return;
    }

    const categoryEmojis = {
        cervejas: '🍺', destilados: '🥃', refrigerantes: '🥤',
        energeticos: '⚡', aguas: '💧', sucos: '🍹', gelo: '🧊', carvao: '🔥'
    };

    tbody.innerHTML = products.map(p => {
        const emoji = categoryEmojis[p.category] || '📦';
        const thumbHtml = p.image_url
            ? `<div class="product-thumb"><img src="${p.image_url}" alt="${p.name}"></div>`
            : `<div class="product-thumb">${emoji}</div>`;

        const statusBadge = p.active
            ? `<span class="badge badge-active"><i class="fa-solid fa-circle" style="font-size:0.5rem;"></i> Ativo</span>`
            : `<span class="badge badge-inactive"><i class="fa-solid fa-circle" style="font-size:0.5rem;"></i> Inativo</span>`;

        return `
        <tr>
            <td>${thumbHtml}</td>
            <td>
                <div class="product-name-cell">
                    <strong>${p.name}</strong>
                    <span>${p.description ? p.description.substring(0, 50) + (p.description.length > 50 ? '...' : '') : '—'}</span>
                </div>
            </td>
            <td><span class="badge badge-cat">${p.category}</span></td>
            <td class="price-cell">R$ ${parseFloat(p.price).toFixed(2).replace('.', ',')}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-sm btn-outline btn-icon" title="Editar" onclick="editProduct('${p.id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn btn-sm ${p.active ? 'btn-danger' : 'btn-success'} btn-icon" title="${p.active ? 'Desativar' : 'Ativar'}" onclick="toggleProductActive('${p.id}', ${p.active})">
                        <i class="fa-solid fa-${p.active ? 'eye-slash' : 'eye'}"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-icon" title="Excluir" onclick="confirmDelete('${p.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

// ── BUSCA E FILTRO ──
function filterProducts() {
    const query = document.getElementById('search-products').value.toLowerCase();
    const category = document.getElementById('filter-category').value;

    let filtered = allProducts;

    if (query) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
    }

    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }

    renderProductsTable(filtered);
}

// ── MODAL PRODUTO ──
function openProductModal(product = null) {
    editingProductId = product ? product.id : null;
    selectedImageFile = null;

    document.getElementById('modal-title').textContent = product ? 'Editar Produto' : 'Novo Produto';
    document.getElementById('product-id').value = product ? product.id : '';
    document.getElementById('product-name').value = product ? product.name : '';
    document.getElementById('product-category').value = product ? product.category : '';
    document.getElementById('product-price').value = product ? product.price : '';
    document.getElementById('product-description').value = product ? (product.description || '') : '';
    document.getElementById('product-active').checked = product ? product.active : true;

    // Reset upload area
    const preview = document.getElementById('upload-preview');
    const icon = document.getElementById('upload-icon');
    const text = document.getElementById('upload-text');

    if (product && product.image_url) {
        preview.src = product.image_url;
        preview.classList.add('visible');
        icon.style.display = 'none';
        text.style.display = 'none';
    } else {
        preview.src = '';
        preview.classList.remove('visible');
        icon.style.display = 'block';
        text.style.display = 'block';
    }

    document.getElementById('product-modal-overlay').classList.add('active');
}

function closeProductModal() {
    document.getElementById('product-modal-overlay').classList.remove('active');
    document.getElementById('product-form').reset();
    editingProductId = null;
    selectedImageFile = null;
}

function editProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (product) openProductModal(product);
}

// ── SALVAR PRODUTO ──
async function saveProduct() {
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value.trim();
    const active = document.getElementById('product-active').checked;

    if (!name || !category || isNaN(price)) {
        showToast('Preencha os campos obrigatórios (Nome, Categoria e Preço).', 'error');
        return;
    }

    const btn = document.getElementById('btn-save-product');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

    try {
        let imageUrl = editingProductId
            ? (allProducts.find(p => p.id === editingProductId)?.image_url || null)
            : null;

        // Upload de imagem se houver nova
        if (selectedImageFile) {
            const ext = selectedImageFile.name.split('.').pop();
            const fileName = `product_${Date.now()}.${ext}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, selectedImageFile, { upsert: true });

            if (uploadError) {
                showToast('Erro ao enviar imagem: ' + uploadError.message, 'error');
            } else {
                const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
                imageUrl = urlData.publicUrl;
            }
        }

        const payload = { name, category, price, description, active, image_url: imageUrl, updated_at: new Date().toISOString() };

        let error;
        if (editingProductId) {
            ({ error } = await supabase.from('products').update(payload).eq('id', editingProductId));
        } else {
            ({ error } = await supabase.from('products').insert([payload]));
        }

        if (error) {
            showToast('Erro ao salvar: ' + error.message, 'error');
        } else {
            showToast(editingProductId ? 'Produto atualizado!' : 'Produto criado!', 'success');
            closeProductModal();
            await loadProducts();
        }
    } catch (err) {
        showToast('Erro inesperado: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Produto';
    }
}

// ── TOGGLE ATIVO/INATIVO ──
async function toggleProductActive(id, currentActive) {
    const { error } = await supabase
        .from('products')
        .update({ active: !currentActive, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        showToast('Erro ao atualizar status.', 'error');
    } else {
        showToast(currentActive ? 'Produto desativado.' : 'Produto ativado!', 'success');
        await loadProducts();
        renderProductsTable(allProducts);
    }
}

// ── EXCLUIR PRODUTO ──
function confirmDelete(id) {
    deleteTargetId = id;
    document.getElementById('confirm-overlay').classList.add('active');
}

async function executeDelete() {
    if (!deleteTargetId) return;

    const { error } = await supabase.from('products').delete().eq('id', deleteTargetId);

    document.getElementById('confirm-overlay').classList.remove('active');

    if (error) {
        showToast('Erro ao excluir produto.', 'error');
    } else {
        showToast('Produto excluído.', 'success');
        deleteTargetId = null;
        await loadProducts();
    }
}

// ── LOGOUT ──
async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}

// ── TOAST ──
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ── EVENT LISTENERS (painel interno) ──
function setupEventListeners() {
    // Salvar produto
    document.getElementById('btn-save-product').addEventListener('click', saveProduct);

    // Logout
    document.getElementById('btn-logout-nav').addEventListener('click', handleLogout);

    // Botão Testar Alerta
    document.getElementById('btn-test-alert')?.addEventListener('click', () => {
        orderAudio.play().catch(e => console.warn('Erro no play de teste:', e));
        showToast('🚀 Teste de Alerta: Som e notificação funcionando!', 'success');
        
        const navOrders = document.getElementById('nav-orders');
        if (navOrders && !navOrders.classList.contains('active')) {
            navOrders.classList.add('pulse');
            setTimeout(() => navOrders.classList.remove('pulse'), 5000);
        }
    });

    // Confirm delete
    document.getElementById('btn-confirm-delete').addEventListener('click', executeDelete);
    document.getElementById('btn-confirm-cancel').addEventListener('click', () => {
        document.getElementById('confirm-overlay').classList.remove('active');
        deleteTargetId = null;
    });

    // Busca e filtro
    document.getElementById('search-products').addEventListener('input', filterProducts);
    document.getElementById('filter-category').addEventListener('change', filterProducts);

    // Upload de imagem
    const imageInput = document.getElementById('product-image');
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast('Imagem muito grande. Máximo 5MB.', 'error');
            return;
        }

        selectedImageFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const preview = document.getElementById('upload-preview');
            preview.src = ev.target.result;
            preview.classList.add('visible');
            document.getElementById('upload-icon').style.display = 'none';
            document.getElementById('upload-text').style.display = 'none';
        };
        reader.readAsDataURL(file);
    });

    // Drag and drop na área de upload
    const uploadArea = document.getElementById('upload-area');
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            imageInput.files = e.dataTransfer.files;
            imageInput.dispatchEvent(new Event('change'));
        }
    });

    // Mobile sidebar toggle
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });

    // Filtros de pedidos e clientes
    document.getElementById('search-orders').addEventListener('input', filterOrders);
    document.getElementById('filter-order-status').addEventListener('change', filterOrders);
    document.getElementById('search-customers').addEventListener('input', filterCustomers);
    document.getElementById('btn-save-order').addEventListener('click', saveOrderStatus);
}

// ==========================================
// MÓDULO DE PEDIDOS
// ==========================================

// Prepara o som de novo pedido
const orderAudio = new Audio('assets/SOM%20DE%20PEDIDOS.mp3');

function setupRealtimeOrders() {
    supabase
        .channel('realtime-orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
            // Toca o som (permissão já é concedida pois o admin interagiu ao fazer login)
            orderAudio.play().catch(e => console.warn('Áudio não tocou (falta interação):', e));
            
            // Notificação
            showToast(`Novo pedido recebido do cliente ${payload.new.customer_name || ''}!`, 'success');
            
            // Atualiza a tabela
            loadOrders();
            
            // Se não estiver na tela de pedidos, pisca o menu
            const navOrders = document.getElementById('nav-orders');
            if (navOrders && !navOrders.classList.contains('active')) {
                navOrders.classList.add('pulse');
                setTimeout(() => navOrders.classList.remove('pulse'), 5000);
            }
        })
        .subscribe((status) => {
            console.log('Status Realtime:', status);
        });
}

async function loadOrders() {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        showToast('Erro ao carregar pedidos: ' + error.message, 'error');
        return;
    }

    allOrders = data || [];
    updateStats();
    renderOrdersTable(allOrders);
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="6">
                <div class="empty-state">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <p>Nenhum pedido encontrado.</p>
                </div>
            </td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td><strong>#${o.id.split('-')[0].toUpperCase()}</strong></td>
            <td>${o.customer_name}</td>
            <td>${new Date(o.created_at).toLocaleString('pt-BR')}</td>
            <td><strong>${Number(o.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></td>
            <td><span class="status-badge ${o.status.replace(/ /g, '-').toLowerCase()}">${o.status}</span></td>
            <td>
                <button class="btn btn-icon" onclick="openOrderModal('${o.id}')" title="Atualizar Pedido">
                    <i class="fa-solid fa-pen"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterOrders() {
    const term = document.getElementById('search-orders').value.toLowerCase();
    const status = document.getElementById('filter-order-status').value;

    const filtered = allOrders.filter(o => {
        const matchTerm = o.customer_name.toLowerCase().includes(term) || o.id.toLowerCase().includes(term);
        const matchStatus = status ? o.status === status : true;
        return matchTerm && matchStatus;
    });

    renderOrdersTable(filtered);
}

function openOrderModal(id) {
    const order = allOrders.find(o => o.id === id);
    if (!order) return;

    document.getElementById('edit-order-id').value = order.id;
    document.getElementById('edit-order-customer').textContent = `${order.customer_name} (${order.customer_phone}) - ${order.delivery_address}`;
    
    // Parse items se for string (Supabase retorna object JSONB parseado automaticamente, mas garantimos)
    let items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    
    const itemsList = document.getElementById('edit-order-items');
    itemsList.innerHTML = items.map(item => `
        <li>${item.quantity}x ${item.name} - ${(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
    `).join('');

    document.getElementById('order-status-select').value = order.status;
    document.getElementById('order-modal-overlay').style.display = 'flex';
}

function closeOrderModal() {
    document.getElementById('order-modal-overlay').style.display = 'none';
}

async function saveOrderStatus() {
    const id = document.getElementById('edit-order-id').value;
    const status = document.getElementById('order-status-select').value;
    const btn = document.getElementById('btn-save-order');

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

    const { error } = await supabase
        .from('orders')
        .update({ status: status })
        .eq('id', id);

    if (error) {
        showToast('Erro ao atualizar pedido: ' + error.message, 'error');
    } else {
        showToast('Pedido atualizado com sucesso!', 'success');
        closeOrderModal();
        loadOrders();
    }

    btn.disabled = false;
    btn.innerHTML = 'Salvar Status';
}

// ==========================================
// MÓDULO DE CLIENTES
// ==========================================

async function loadCustomers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) {
        showToast('Erro ao carregar clientes: ' + error.message, 'error');
        return;
    }

    allCustomers = data || [];
    updateStats();
    renderCustomersTable(allCustomers);
}

function renderCustomersTable(customers) {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;

    if (customers.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="5">
                <div class="empty-state">
                    <i class="fa-solid fa-users"></i>
                    <p>Nenhum cliente cadastrado ainda.</p>
                </div>
            </td></tr>`;
        return;
    }

    tbody.innerHTML = customers.map(c => `
        <tr>
            <td><strong>${c.name || 'Sem nome'}</strong></td>
            <td>—</td>
            <td>${c.phone || '—'}</td>
            <td>${c.address_street ? c.address_street + ', ' + (c.address_number || '') : '—'}</td>
            <td>${new Date(c.updated_at).toLocaleDateString('pt-BR')}</td>
        </tr>
    `).join('');
}

function filterCustomers() {
    const term = document.getElementById('search-customers').value.toLowerCase();
    const filtered = allCustomers.filter(c => 
        (c.name && c.name.toLowerCase().includes(term)) || 
        (c.phone && c.phone.toLowerCase().includes(term))
    );
    renderCustomersTable(filtered);
}

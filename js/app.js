// Supabase 配置 - 使用全局配置
// 配置在HTML文件中定义

// 全局变量
// supabase 变量在HTML文件中初始化

// 初始化数据存储
function initDataStore() {
    // 不需要本地存储，只使用Supabase
    console.log('初始化数据存储，只使用Supabase');
}

// 数据存储管理（使用 Supabase）
class DataStore {
    constructor() {
        // 初始化数据
        this.initData();
    }
    
    // 检查 Supabase 是否可用
    get useSupabase() {
        return typeof window.supabase !== 'undefined' && window.supabase !== null;
    }
    
    // 获取 Supabase 实例
    get client() {
        return window.supabase;
    }

    // 初始化数据
    async initData() {
        if (this.useSupabase) {
            try {
                // 检查表是否存在，如果不存在则创建
                await this.createTables();
                
                // 检查用户数据是否存在
                const { data: users } = await this.client.from('users').select('*');
                if (!users || users.length === 0) {
                    await this.client.from('users').insert({ username: 'admin', password: 'admin' });
                }
                
                console.log('Supabase 数据初始化成功');
            } catch (error) {
                console.error('Supabase 初始化错误:', error);
            }
        } else {
            // Supabase 不可用，延迟重试
            console.log('Supabase 不可用，延迟初始化数据');
            setTimeout(() => {
                this.initData();
            }, 2000);
        }
    }
    
    // 创建表
    async createTables() {
        try {
            // 表已经通过SQL直接创建，这里不需要再创建
            console.log('表已经创建完成');
        } catch (error) {
            console.error('创建表错误:', error);
            // 表可能已经存在，忽略错误
        }
    }

    // 用户相关操作
    async getUsers() {
        if (this.useSupabase) {
            try {
                const { data: users, error } = await this.client.from('users').select('*');
                if (error) throw error;
                return users || [];
            } catch (error) {
                console.error('Supabase getUsers error:', error);
                throw error;
            }
        } else {
            throw new Error('Supabase 不可用');
        }
    }

    async addUser(user) {
        if (this.useSupabase) {
            try {
                const { error } = await this.client.from('users').insert(user);
                if (error) throw error;
                return { success: true };
            } catch (error) {
                console.error('Supabase addUser error:', error);
                throw error;
            }
        } else {
            throw new Error('Supabase 不可用');
        }
    }

    async deleteUser(username) {
        if (this.useSupabase) {
            try {
                const { error } = await this.client.from('users').delete().eq('username', username);
                if (error) throw error;
                return { success: true };
            } catch (error) {
                console.error('Supabase deleteUser error:', error);
                throw error;
            }
        } else {
            throw new Error('Supabase 不可用');
        }
    }

    // 库存相关操作
    async getInventory() {
        if (this.useSupabase) {
            try {
                const { data: inventory, error } = await this.client.from('inventory').select('*');
                if (error) throw error;
                // 转换数据格式，确保字段名称匹配
                return (inventory || []).map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    costPrice: item.cost_price,
                    sellPrice: item.sell_price
                }));
            } catch (error) {
                console.error('Supabase getInventory error:', error);
                throw error;
            }
        } else {
            throw new Error('Supabase 不可用');
        }
    }

    async addInventory(item) {
        if (this.useSupabase) {
            try {
                // 检查商品是否存在
                const { data: existingItems, error: findError } = await this.client.from('inventory').select('*').eq('name', item.name);
                if (findError) throw findError;
                
                if (existingItems && existingItems.length > 0) {
                    // 更新现有商品
                    const existingItem = existingItems[0];
                    const { error: updateError } = await this.client.from('inventory')
                        .update({
                            quantity: existingItem.quantity + item.quantity,
                            cost_price: item.costPrice,
                            sell_price: item.sellPrice
                        })
                        .eq('id', existingItem.id);
                    if (updateError) throw updateError;
                } else {
                    // 添加新商品
                    const { error: insertError } = await this.client.from('inventory').insert({
                        name: item.name,
                        quantity: item.quantity,
                        cost_price: item.costPrice,
                        sell_price: item.sellPrice
                    });
                    if (insertError) throw insertError;
                }
                return { success: true };
            } catch (error) {
                console.error('Supabase addInventory error:', error);
                throw error;
            }
        } else {
            throw new Error('Supabase 不可用');
        }
    }

    async updateInventory(oldName, item) {
        if (this.useSupabase) {
            try {
                // 查找商品
                const { data: existingItems, error: findError } = await this.client.from('inventory').select('*').eq('name', oldName);
                if (findError) throw findError;
                
                if (existingItems && existingItems.length > 0) {
                    const existingItem = existingItems[0];
                    const { error: updateError } = await this.client.from('inventory')
                        .update({
                            name: item.name,
                            cost_price: item.costPrice,
                            sell_price: item.sellPrice
                        })
                        .eq('id', existingItem.id);
                    if (updateError) throw updateError;
                    return { success: true };
                }
                return { error: 'Item not found' };
            } catch (error) {
                console.error('Supabase updateInventory error:', error);
                throw error;
            }
        } else {
            throw new Error('Supabase 不可用');
        }
    }

    async deleteInventory(name) {
        if (this.useSupabase) {
            try {
                const { error } = await this.client.from('inventory').delete().eq('name', name);
                if (error) throw error;
                return { success: true };
            } catch (error) {
                console.error('Supabase deleteInventory error:', error);
                throw error;
            }
        } else {
            throw new Error('Supabase 不可用');
        }
    }

    // 进货相关操作
    async getPurchases() {
        if (this.useSupabase) {
            try {
                const { data: purchases, error } = await this.client.from('purchases').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                // 转换数据格式，确保字段名称匹配
                return (purchases || []).map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    costPrice: item.cost_price,
                    sellPrice: item.sell_price,
                    date: item.date
                }));
            } catch (error) {
                console.error('Supabase getPurchases error:', error);
                throw error;
            }
        } else {
            throw new Error('Supabase 不可用');
        }
    }

    async addPurchase(purchase) {
        if (this.useSupabase) {
            try {
                const { error } = await this.client.from('purchases').insert({
                    name: purchase.name,
                    quantity: purchase.quantity,
                    cost_price: purchase.costPrice,
                    sell_price: purchase.sellPrice,
                    date: purchase.date
                });
                if (error) throw error;
                return { success: true };
            } catch (error) {
                console.error('Supabase addPurchase error:', error);
                throw error;
            }
        } else {
            throw new Error('Supabase 不可用');
        }
    }

    // 销货相关操作
    async getSales() {
        if (this.useSupabase) {
            try {
                const { data: sales, error } = await this.client.from('sales').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                // 转换数据格式，确保字段名称匹配
                return (sales || []).map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    sellPrice: item.sell_price,
                    date: item.date
                }));
            } catch (error) {
                console.error('Supabase getSales error:', error);
                throw error;
            }
        } else {
            throw new Error('Supabase 不可用');
        }
    }

    async addSales(sale) {
        if (this.useSupabase) {
            try {
                const { error } = await this.client.from('sales').insert({
                    name: sale.name,
                    quantity: sale.quantity,
                    sell_price: sale.sellPrice,
                    date: sale.date
                });
                if (error) throw error;
                return { success: true };
            } catch (error) {
                console.error('Supabase addSales error:', error);
                throw error;
            }
        } else {
            throw new Error('Supabase 不可用');
        }
    }


}

const api = new DataStore();
let currentUser = null;

// 页面加载时检查登录状态和 URL 参数
window.onload = function() {
    // 初始化数据存储
    initDataStore();
    
    // 检查 Supabase 是否加载成功
    if (typeof window.supabase !== 'undefined') {
        console.log('Supabase SDK 加载成功');
        try {
            // 使用HTML中已经初始化的Supabase
            console.log('Supabase 初始化成功:', window.supabase);
            
            // 测试 Supabase 连接
            window.supabase.auth.getSession().then(({ data: { session } }) => {
                console.log('Supabase 连接状态:', session ? '已连接' : '未连接');
            });
            
            // 重新初始化DataStore，确保Supabase可用
            console.log('重新初始化DataStore以使用Supabase');
            api.initData();
        } catch (error) {
            console.error('Supabase 初始化失败:', error);
        }
    } else {
        console.error('Supabase SDK 未加载');
        // 尝试延迟初始化，给 SDK 更多加载时间
        setTimeout(function() {
            if (typeof window.supabase !== 'undefined') {
                console.log('Supabase SDK 加载成功，延迟初始化');
                try {
                    console.log('Supabase 初始化成功');
                    // 重新初始化DataStore，确保Supabase可用
                    console.log('重新初始化DataStore以使用Supabase');
                    api.initData();
                } catch (error) {
                    console.error('Supabase 初始化失败:', error);
                }
            } else {
                console.error('Supabase SDK 仍然未加载');
            }
        }, 2000);
    }
    
    // 不使用本地存储，每次都需要重新登录
    showLoginSection();
};

// 登录功能
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const users = await api.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = user;
            // 登录成功后自动同步数据
            await syncData();
            showMainSection();
        } else {
            alert('用户名或密码错误');
        }
    } catch (error) {
        console.error('登录错误:', error);
        alert('登录失败，请刷新页面重试');
    }
}

// 注册功能
async function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    
    if (!username || !password) {
        alert('请填写完整信息');
        return;
    }
    
    try {
        const users = await api.getUsers();
        if (users.find(u => u.username === username)) {
            alert('用户名已存在');
            return;
        }
        
        await api.addUser({ username, password });
        await syncData();
        alert('注册成功');
        showLogin();
    } catch (error) {
        console.error('注册错误:', error);
        alert('注册失败，请刷新页面重试');
    }
}

// 退出登录
function logout() {
    currentUser = null;
    showLoginSection();
}

// 显示注册表单
function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'flex';
}

// 显示登录表单
function showLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'flex';
}

// 显示登录界面
function showLoginSection() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('main-section').style.display = 'none';
}

// 显示主界面
async function showMainSection() {
    document.getElementById('login-section').style.display = 'none';
    const mainSection = document.getElementById('main-section');
    mainSection.style.display = 'block';
    mainSection.classList.add('fade-in');
    setTimeout(() => {
        mainSection.classList.remove('fade-in');
    }, 500);
    document.getElementById('current-user').textContent = `当前用户: ${currentUser.username}`;
    // 进入主界面时自动同步数据
    await syncData();
    
    // 设置 Supabase 数据监听，实现自动同步
    setupSupabaseListeners();
    
    // 检查是否为手机端
    if (window.innerWidth <= 768) {
        // 显示手机端首页
        showMobileHome();
        // 隐藏导航栏
        document.querySelector('nav').style.display = 'none';
    } else {
        // 显示PC端界面
        showModule('inventory');
        // 显示导航栏
        document.querySelector('nav').style.display = 'block';
    }
}

// 设置 Supabase 数据监听
function setupSupabaseListeners() {
    // 检查 Supabase 是否可用
    if (typeof window.supabase !== 'undefined' && window.supabase !== null) {
        console.log('设置 Supabase 数据监听');
        
        // 监听库存数据变化
        window.supabase
            .channel('inventory-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, async (payload) => {
                console.log('库存数据更新:', payload);
                await updateInventoryTable();
            })
            .subscribe();
        
        // 监听进货数据变化
        window.supabase
            .channel('purchases-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'purchases' }, async (payload) => {
                console.log('进货数据更新:', payload);
                await updatePurchaseTable();
            })
            .subscribe();
        
        // 监听销货数据变化
        window.supabase
            .channel('sales-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, async (payload) => {
                console.log('销货数据更新:', payload);
                await updateSalesTable();
            })
            .subscribe();
        
        // 监听用户数据变化
        window.supabase
            .channel('users-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async (payload) => {
                console.log('用户数据更新:', payload);
                await updateUsersTable();
            })
            .subscribe();
    } else {
        console.error('Supabase 不可用，无法设置数据监听');
        // 尝试延迟设置，给 Supabase 更多加载时间
        setTimeout(function() {
            if (typeof window.supabase !== 'undefined' && window.supabase !== null) {
                console.log('Supabase 已可用，设置数据监听');
                setupSupabaseListeners();
            } else {
                console.error('Supabase 仍然不可用');
            }
        }, 2000);
    }
}

// 显示手机端首页
function showMobileHome() {
    const mainContent = document.querySelector('main');
    mainContent.innerHTML = `
        <div class="mobile-home">
            <div class="mobile-card inventory-card" onclick="showMobileModule('inventory')">
                <div class="card-icon">📦</div>
                <h3>仓库管理</h3>
                <p>查看和管理库存</p>
            </div>
            <div class="mobile-card purchase-card" onclick="showMobileModule('purchase')">
                <div class="card-icon">📥</div>
                <h3>进货管理</h3>
                <p>添加进货记录</p>
            </div>
            <div class="mobile-card sales-card" onclick="showMobileModule('sales')">
                <div class="card-icon">📤</div>
                <h3>销货管理</h3>
                <p>添加销货记录</p>
            </div>
            <div class="mobile-card users-card" onclick="showMobileModule('users')">
                <div class="card-icon">👥</div>
                <h3>账号管理</h3>
                <p>管理用户账号</p>
            </div>
        </div>
    `;
}

// 显示手机端模块
function showMobileModule(moduleName) {
    const mainContent = document.querySelector('main');
    
    switch(moduleName) {
        case 'inventory':
            mainContent.innerHTML = `
                <div class="mobile-module">
                    <div class="module-header">
                        <button onclick="showMobileHome()" class="back-button">← 返回</button>
                        <h2>仓库管理</h2>
                    </div>
                    <div class="search-box">
                        <input type="text" id="inventory-search" placeholder="搜索商品">
                        <button onclick="searchInventory()">搜索</button>
                    </div>
                    <div class="table-container">
                        <table id="inventory-table">
                            <thead>
                                <tr>
                                    <th>商品名称</th>
                                    <th>库存数量</th>
                                    <th>成本价</th>
                                    <th>零售价</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            break;
        case 'purchase':
            mainContent.innerHTML = `
                <div class="mobile-module">
                    <div class="module-header">
                        <button onclick="showMobileHome()" class="back-button">← 返回</button>
                        <h2>进货管理</h2>
                    </div>
                    <div class="form-group">
                        <input type="text" id="purchase-name" placeholder="商品名称">
                        <input type="number" id="purchase-quantity" placeholder="数量">
                        <input type="number" step="0.01" id="purchase-cost" placeholder="成本价">
                        <input type="number" step="0.01" id="purchase-price" placeholder="零售价">
                        <button onclick="addPurchase()">添加进货</button>
                    </div>
                    <div class="table-container">
                        <table id="purchase-table">
                            <thead>
                                <tr>
                                    <th>商品名称</th>
                                    <th>数量</th>
                                    <th>成本价</th>
                                    <th>零售价</th>
                                    <th>日期</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            break;
        case 'sales':
            mainContent.innerHTML = `
                <div class="mobile-module">
                    <div class="module-header">
                        <button onclick="showMobileHome()" class="back-button">← 返回</button>
                        <h2>销货管理</h2>
                    </div>
                    <div class="form-group">
                        <input type="text" id="sales-name" placeholder="商品名称">
                        <input type="number" id="sales-quantity" placeholder="数量">
                        <button onclick="addSales()">添加销货</button>
                    </div>
                    <div class="table-container">
                        <table id="sales-table">
                            <thead>
                                <tr>
                                    <th>商品名称</th>
                                    <th>数量</th>
                                    <th>零售价</th>
                                    <th>日期</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            break;
        case 'users':
            mainContent.innerHTML = `
                <div class="mobile-module">
                    <div class="module-header">
                        <button onclick="showMobileHome()" class="back-button">← 返回</button>
                        <h2>账号管理</h2>
                    </div>
                    <div class="table-container">
                        <table id="users-table">
                            <thead>
                                <tr>
                                    <th>用户名</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            break;
    }
    
    // 更新表格数据
    if (moduleName === 'inventory') {
        updateInventoryTable();
    } else if (moduleName === 'purchase') {
        updatePurchaseTable();
    } else if (moduleName === 'sales') {
        updateSalesTable();
    } else if (moduleName === 'users') {
        updateUsersTable();
    }
}

// 显示模块
async function showModule(moduleName) {
    // 同步数据
    await syncData();
    
    const modules = ['inventory', 'purchase', 'sales', 'users'];
    modules.forEach(name => {
        const module = document.getElementById(`${name}-module`);
        module.style.display = name === moduleName ? 'block' : 'none';
        if (name === moduleName) {
            module.classList.add('fade-in');
            setTimeout(() => {
                module.classList.remove('fade-in');
            }, 500);
        }
    });
    
    // 更新导航栏激活状态
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.textContent.trim() === getModuleName(moduleName)) {
            link.classList.add('active');
        }
    });
}

// 获取模块名称
function getModuleName(moduleName) {
    const moduleNames = {
        'inventory': '仓库管理',
        'purchase': '进货管理',
        'sales': '销货管理',
        'users': '账号管理'
    };
    return moduleNames[moduleName] || '';
}

// 更新库存表格
async function updateInventoryTable() {
    try {
        const inventory = await api.getInventory();
        const tbody = document.getElementById('inventory-table').querySelector('tbody');
        tbody.innerHTML = '';
        
        inventory.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.costPrice}</td>
                <td>${item.sellPrice}</td>
                <td>
                    <button onclick="editItem('${item.name}')">编辑</button>
                    <button onclick="deleteItem('${item.name}')">删除</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('更新库存表格失败:', error);
    }
}

// 更新进货表格
async function updatePurchaseTable() {
    try {
        const purchases = await api.getPurchases();
        const tbody = document.getElementById('purchase-table').querySelector('tbody');
        tbody.innerHTML = '';
        
        purchases.forEach(purchase => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${purchase.name}</td>
                <td>${purchase.quantity}</td>
                <td>${purchase.costPrice}</td>
                <td>${purchase.sellPrice}</td>
                <td>${purchase.date}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('更新进货表格失败:', error);
    }
}

// 更新销货表格
async function updateSalesTable() {
    try {
        const sales = await api.getSales();
        const tbody = document.getElementById('sales-table').querySelector('tbody');
        tbody.innerHTML = '';
        
        sales.forEach(sale => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sale.name}</td>
                <td>${sale.quantity}</td>
                <td>${sale.sellPrice}</td>
                <td>${sale.date}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('更新销货表格失败:', error);
    }
}

// 更新用户表格
async function updateUsersTable() {
    try {
        const users = await api.getUsers();
        const tbody = document.getElementById('users-table').querySelector('tbody');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>
                    ${user.username !== 'admin' ? `<button onclick="deleteUser('${user.username}')">删除</button>` : '系统管理员'}
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('更新用户表格失败:', error);
    }
}

// 添加进货
async function addPurchase() {
    console.log('开始添加进货');
    const name = document.getElementById('purchase-name').value;
    const quantity = parseInt(document.getElementById('purchase-quantity').value);
    const costPrice = parseFloat(document.getElementById('purchase-cost').value);
    const sellPrice = parseFloat(document.getElementById('purchase-price').value);
    
    console.log('进货信息:', { name, quantity, costPrice, sellPrice });
    
    if (!name || isNaN(quantity) || isNaN(costPrice) || isNaN(sellPrice)) {
        alert('请填写完整信息');
        return;
    }
    
    try {
        // 添加到进货记录
        const purchaseData = {
            name,
            quantity,
            costPrice,
            sellPrice,
            date: new Date().toLocaleString()
        };
        console.log('准备添加进货记录:', purchaseData);
        const purchaseResult = await api.addPurchase(purchaseData);
        console.log('添加进货记录结果:', purchaseResult);
        
        // 更新库存
        console.log('准备更新库存');
        const inventoryResult = await api.addInventory({
            name,
            quantity,
            costPrice,
            sellPrice
        });
        console.log('更新库存结果:', inventoryResult);
        
        // 清空表单
        document.getElementById('purchase-name').value = '';
        document.getElementById('purchase-quantity').value = '';
        document.getElementById('purchase-cost').value = '';
        document.getElementById('purchase-price').value = '';
        
        // 同步数据
        console.log('准备同步数据');
        await syncData();
        console.log('数据同步完成');
        
        alert('进货成功');
    } catch (error) {
        console.error('进货错误:', error);
        alert('进货失败，请刷新页面重试');
    }
}

// 添加销货
async function addSales() {
    const name = document.getElementById('sales-name').value;
    const quantity = parseInt(document.getElementById('sales-quantity').value);
    
    if (!name || isNaN(quantity)) {
        alert('请填写完整信息');
        return;
    }
    
    try {
        // 检查库存
        const inventory = await api.getInventory();
        const existingItem = inventory.find(item => item.name === name);
        
        if (!existingItem) {
            alert('商品不存在');
            return;
        }
        
        if (existingItem.quantity < quantity) {
            alert('库存不足');
            return;
        }
        
        // 添加到销货记录
        const saleData = {
            name,
            quantity,
            sellPrice: existingItem.sellPrice,
            date: new Date().toLocaleString()
        };
        await api.addSales(saleData);
        
        // 更新库存
        const newQuantity = existingItem.quantity - quantity;
        if (newQuantity > 0) {
            await api.addInventory({
                name,
                quantity: -quantity,
                costPrice: existingItem.costPrice,
                sellPrice: existingItem.sellPrice
            });
        } else {
            await api.deleteInventory(name);
        }
        
        // 清空表单
        document.getElementById('sales-name').value = '';
        document.getElementById('sales-quantity').value = '';
        
        // 同步数据
        await syncData();
        
        alert('销货成功');
    } catch (error) {
        console.error('销货错误:', error);
        alert('销货失败，请刷新页面重试');
    }
}

// 搜索库存
async function searchInventory() {
    try {
        const searchTerm = document.getElementById('inventory-search').value.toLowerCase();
        const inventory = await api.getInventory();
        const filteredInventory = inventory.filter(item => 
            item.name.toLowerCase().includes(searchTerm)
        );
        
        const tbody = document.getElementById('inventory-table').querySelector('tbody');
        tbody.innerHTML = '';
        
        filteredInventory.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.costPrice}</td>
                <td>${item.sellPrice}</td>
                <td>
                    <button onclick="editItem('${item.name}')">编辑</button>
                    <button onclick="deleteItem('${item.name}')">删除</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('搜索库存失败:', error);
    }
}

// 编辑商品
async function editItem(name) {
    const newName = prompt('请输入新的商品名称:', name);
    const newCostPrice = parseFloat(prompt('请输入新的成本价:'));
    const newSellPrice = parseFloat(prompt('请输入新的零售价:'));
    
    if (newName && !isNaN(newCostPrice) && !isNaN(newSellPrice)) {
        try {
            await api.updateInventory(name, {
                name: newName,
                costPrice: newCostPrice,
                sellPrice: newSellPrice
            });
            await syncData();
            alert('编辑成功');
        } catch (error) {
            console.error('编辑错误:', error);
            alert('编辑失败，请刷新页面重试');
        }
    }
}

// 删除商品
async function deleteItem(name) {
    if (confirm('确定要删除这个商品吗？')) {
        try {
            await api.deleteInventory(name);
            await syncData();
            alert('删除成功');
        } catch (error) {
            console.error('删除商品错误:', error);
            alert('删除失败，请刷新页面重试');
        }
    }
}

// 删除用户
async function deleteUser(username) {
    if (confirm('确定要删除这个用户吗？')) {
        try {
            await api.deleteUser(username);
            await syncData();
            alert('删除成功');
        } catch (error) {
            console.error('删除用户错误:', error);
            alert('删除失败，请刷新页面重试');
        }
    }
}



// 同步数据
async function syncData() {
    try {
        // 更新本地数据
        await updateInventoryTable();
        await updatePurchaseTable();
        await updateSalesTable();
        await updateUsersTable();
        console.log('数据同步成功');
    } catch (error) {
        console.error('数据同步失败:', error);
    }
}
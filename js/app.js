// API接口管理
class ApiClient {
    constructor() {
        // 使用当前页面的主机地址，确保手机端也能访问
        const protocol = window.location.protocol;
        const host = window.location.hostname;
        const port = 8083;
        this.baseUrl = `${protocol}//${host}:${port}/api`;
    }

    async fetchData(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            if (!response.ok) {
                throw new Error('API请求失败');
            }
            return await response.json();
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    }

    // 用户相关API
    async getUsers() {
        return await this.fetchData('users');
    }

    async addUser(user) {
        return await this.fetchData('users', {
            method: 'POST',
            body: JSON.stringify(user)
        });
    }

    async deleteUser(username) {
        return await this.fetchData('users', {
            method: 'DELETE',
            body: JSON.stringify({ username })
        });
    }

    // 库存相关API
    async getInventory() {
        return await this.fetchData('inventory');
    }

    async addInventory(item) {
        return await this.fetchData('inventory', {
            method: 'POST',
            body: JSON.stringify(item)
        });
    }

    async updateInventory(oldName, item) {
        return await this.fetchData('inventory', {
            method: 'PUT',
            body: JSON.stringify({ oldName, ...item })
        });
    }

    async deleteInventory(name) {
        return await this.fetchData('inventory', {
            method: 'DELETE',
            body: JSON.stringify({ name })
        });
    }

    // 进货相关API
    async getPurchases() {
        return await this.fetchData('purchases');
    }

    async addPurchase(purchase) {
        return await this.fetchData('purchases', {
            method: 'POST',
            body: JSON.stringify(purchase)
        });
    }

    // 销货相关API
    async getSales() {
        return await this.fetchData('sales');
    }

    async addSales(sale) {
        return await this.fetchData('sales', {
            method: 'POST',
            body: JSON.stringify(sale)
        });
    }
}

const api = new ApiClient();
let currentUser = null;

// 页面加载时检查登录状态
window.onload = function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainSection();
    }
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
            localStorage.setItem('currentUser', JSON.stringify(user));
            // 登录成功后自动同步数据
            await syncData();
            showMainSection();
        } else {
            alert('用户名或密码错误');
        }
    } catch (error) {
        alert('登录失败，请检查服务器连接');
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
        alert('注册失败，请检查服务器连接');
    }
}

// 退出登录
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
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
function showModule(moduleName) {
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
    const name = document.getElementById('purchase-name').value;
    const quantity = parseInt(document.getElementById('purchase-quantity').value);
    const costPrice = parseFloat(document.getElementById('purchase-cost').value);
    const sellPrice = parseFloat(document.getElementById('purchase-price').value);
    
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
        await api.addPurchase(purchaseData);
        
        // 更新库存
        await api.addInventory({
            name,
            quantity,
            costPrice,
            sellPrice
        });
        
        // 清空表单
        document.getElementById('purchase-name').value = '';
        document.getElementById('purchase-quantity').value = '';
        document.getElementById('purchase-cost').value = '';
        document.getElementById('purchase-price').value = '';
        
        // 同步数据
        await syncData();
        
        alert('进货成功');
    } catch (error) {
        alert('进货失败，请检查服务器连接');
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
        alert('销货失败，请检查服务器连接');
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
            alert('编辑失败，请检查服务器连接');
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
            alert('删除失败，请检查服务器连接');
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
            alert('删除失败，请检查服务器连接');
        }
    }
}

// 导出数据
function exportData() {
    alert('数据已自动同步到服务器，无需手动导出');
}

// 导入数据
function importData() {
    alert('数据已自动从服务器同步，无需手动导入');
}

// 同步数据
async function syncData() {
    try {
        // 从服务器获取最新数据
        await updateInventoryTable();
        await updatePurchaseTable();
        await updateSalesTable();
        await updateUsersTable();
        console.log('数据同步成功');
    } catch (error) {
        console.error('数据同步失败:', error);
    }
}
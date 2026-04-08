const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8083;
const DATA_DIR = path.join(__dirname, 'data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 数据文件路径
const DATA_FILES = {
    users: path.join(DATA_DIR, 'users.txt'),
    inventory: path.join(DATA_DIR, 'inventory.txt'),
    purchases: path.join(DATA_DIR, 'purchases.txt'),
    sales: path.join(DATA_DIR, 'sales.txt')
};

// 初始化数据文件
function initializeDataFiles() {
    if (!fs.existsSync(DATA_FILES.users)) {
        fs.writeFileSync(DATA_FILES.users, JSON.stringify([{ username: 'admin', password: 'admin' }]));
    }
    if (!fs.existsSync(DATA_FILES.inventory)) {
        fs.writeFileSync(DATA_FILES.inventory, JSON.stringify([]));
    }
    if (!fs.existsSync(DATA_FILES.purchases)) {
        fs.writeFileSync(DATA_FILES.purchases, JSON.stringify([]));
    }
    if (!fs.existsSync(DATA_FILES.sales)) {
        fs.writeFileSync(DATA_FILES.sales, JSON.stringify([]));
    }
}

// 读取数据
function readData(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('读取数据失败:', error);
        return [];
    }
}

// 写入数据
function writeData(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('写入数据失败:', error);
        return false;
    }
}

// 创建服务器
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // 处理静态文件
    if (pathname === '/' || pathname === '/index.html') {
        const filePath = path.join(__dirname, 'index.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content, 'utf-8');
            }
        });
    } else if (pathname.startsWith('/css/')) {
        const filePath = path.join(__dirname, pathname);
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading CSS file');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(content, 'utf-8');
            }
        });
    } else if (pathname.startsWith('/js/')) {
        const filePath = path.join(__dirname, pathname);
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading JavaScript file');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(content, 'utf-8');
            }
        });
    }
    // 处理API请求
    else if (pathname.startsWith('/api/')) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            handleApiRequest(pathname, method, body, res);
        });
    }
    else {
        res.writeHead(404);
        res.end('Not found');
    }
});

// 处理API请求
function handleApiRequest(pathname, method, body, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        const endpoint = pathname.replace('/api/', '');
        
        switch (endpoint) {
            case 'users':
                handleUsersRequest(method, body, res);
                break;
            case 'inventory':
                handleInventoryRequest(method, body, res);
                break;
            case 'purchases':
                handlePurchasesRequest(method, body, res);
                break;
            case 'sales':
                handleSalesRequest(method, body, res);
                break;
            default:
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Endpoint not found' }));
        }
    } catch (error) {
        console.error('API处理错误:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

// 处理用户相关请求
function handleUsersRequest(method, body, res) {
    if (method === 'GET') {
        const users = readData(DATA_FILES.users);
        res.writeHead(200);
        res.end(JSON.stringify(users));
    } else if (method === 'POST') {
        const users = readData(DATA_FILES.users);
        const newUser = JSON.parse(body);
        users.push(newUser);
        if (writeData(DATA_FILES.users, users)) {
            res.writeHead(201);
            res.end(JSON.stringify({ success: true }));
        } else {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to save data' }));
        }
    } else if (method === 'DELETE') {
        const users = readData(DATA_FILES.users);
        const { username } = JSON.parse(body);
        const filteredUsers = users.filter(user => user.username !== username);
        if (writeData(DATA_FILES.users, filteredUsers)) {
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
        } else {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to save data' }));
        }
    }
}

// 处理库存相关请求
function handleInventoryRequest(method, body, res) {
    if (method === 'GET') {
        const inventory = readData(DATA_FILES.inventory);
        res.writeHead(200);
        res.end(JSON.stringify(inventory));
    } else if (method === 'POST') {
        const inventory = readData(DATA_FILES.inventory);
        const newItem = JSON.parse(body);
        const existingItem = inventory.find(item => item.name === newItem.name);
        if (existingItem) {
            existingItem.quantity += newItem.quantity;
            existingItem.costPrice = newItem.costPrice;
            existingItem.sellPrice = newItem.sellPrice;
        } else {
            inventory.push(newItem);
        }
        if (writeData(DATA_FILES.inventory, inventory)) {
            res.writeHead(201);
            res.end(JSON.stringify({ success: true }));
        } else {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to save data' }));
        }
    } else if (method === 'PUT') {
        const inventory = readData(DATA_FILES.inventory);
        const updatedItem = JSON.parse(body);
        const itemIndex = inventory.findIndex(item => item.name === updatedItem.oldName);
        if (itemIndex !== -1) {
            inventory[itemIndex] = {
                name: updatedItem.name,
                quantity: inventory[itemIndex].quantity,
                costPrice: updatedItem.costPrice,
                sellPrice: updatedItem.sellPrice
            };
            if (writeData(DATA_FILES.inventory, inventory)) {
                res.writeHead(200);
                res.end(JSON.stringify({ success: true }));
            } else {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Failed to save data' }));
            }
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Item not found' }));
        }
    } else if (method === 'DELETE') {
        const inventory = readData(DATA_FILES.inventory);
        const { name } = JSON.parse(body);
        const filteredInventory = inventory.filter(item => item.name !== name);
        if (writeData(DATA_FILES.inventory, filteredInventory)) {
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
        } else {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to save data' }));
        }
    }
}

// 处理进货相关请求
function handlePurchasesRequest(method, body, res) {
    if (method === 'GET') {
        const purchases = readData(DATA_FILES.purchases);
        res.writeHead(200);
        res.end(JSON.stringify(purchases));
    } else if (method === 'POST') {
        const purchases = readData(DATA_FILES.purchases);
        const newPurchase = JSON.parse(body);
        purchases.push(newPurchase);
        if (writeData(DATA_FILES.purchases, purchases)) {
            res.writeHead(201);
            res.end(JSON.stringify({ success: true }));
        } else {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to save data' }));
        }
    }
}

// 处理销货相关请求
function handleSalesRequest(method, body, res) {
    if (method === 'GET') {
        const sales = readData(DATA_FILES.sales);
        res.writeHead(200);
        res.end(JSON.stringify(sales));
    } else if (method === 'POST') {
        const sales = readData(DATA_FILES.sales);
        const newSale = JSON.parse(body);
        sales.push(newSale);
        if (writeData(DATA_FILES.sales, sales)) {
            res.writeHead(201);
            res.end(JSON.stringify({ success: true }));
        } else {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to save data' }));
        }
    }
}

// 初始化数据文件
initializeDataFiles();

// 启动服务器
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`局域网访问地址: http://[本机IP]:${PORT}`);
    console.log('数据将保存到 data/ 目录下的 txt 文件中');
});
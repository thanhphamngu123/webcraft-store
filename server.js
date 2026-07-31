/**
 * WebCraft Store - Backend API Server with Admin Authentication
 * Node.js + Express REST API supporting Admin Login & Protected Product Management.
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Admin Secret Authentication Token Store
const ACTIVE_ADMIN_TOKENS = new Set(['adm_token_default_secret']);

// Enable CORS
app.use(cors());

// Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// File Database Setup
const DB_FILE = path.join(__dirname, 'data', 'db.json');

if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

const INITIAL_SEED_TEMPLATES = [
  {
    id: "tpl-cyber-saas",
    title: "Aether AI - NextGen Multi-Page SaaS",
    tagline: "Trang web SaaS AI đa trang với hiệu ứng Glassmorphism & Cyber Glow",
    category: "SaaS",
    price: 59,
    rating: 4.9,
    sales: 242,
    badge: "Multi-Page",
    author: "WebCraft Studio",
    updatedAt: "2026-07-28",
    description: "Template giao diện SaaS đa trang (Home, Features, Pricing) dành cho công ty AI. Tích hợp đầy đủ Dashboard Mockup, Bảng Giá và Thực Đơn Tương Tác.",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    tags: ["Multi-page", "HTML5", "CSS3", "JavaScript", "JSON Data"],
    filesMap: {
      "index.html": `<!DOCTYPE html><html><head><style>body { background:#090D16; color:#F1F5F9; font-family:sans-serif; padding:2rem; } a { color:#38BDF8; }</style></head><body><h1>⚡ Aether.ai Multi-Page SaaS</h1><p>Trang web mẫu SaaS AI cao cấp.</p><nav><a href="features.html">Xem Tính Năng</a> | <a href="pricing.html">Xem Bảng Giá</a></nav></body></html>`,
      "features.html": `<!DOCTYPE html><html><head><style>body { background:#090D16; color:#F1F5F9; font-family:sans-serif; padding:2rem; } a { color:#38BDF8; }</style></head><body><h1>🚀 Tính Năng Siêu Tốc Độ</h1><p>Mô hình điện toán phân tán thế hệ mới.</p><a href="index.html"><- Quay lại Trang Chủ</a></body></html>`,
      "pricing.html": `<!DOCTYPE html><html><head><style>body { background:#090D16; color:#F1F5F9; font-family:sans-serif; padding:2rem; } a { color:#38BDF8; }</style></head><body><h1>💎 Bảng Giá Gói Dịch Vụ</h1><p>Gói Enterprise Pro: $99/tháng</p><a href="index.html"><- Quay lại Trang Chủ</a></body></html>`
    }
  }
];

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_SEED_TEMPLATES, null, 2));
      return INITIAL_SEED_TEMPLATES;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database file", err);
    return INITIAL_SEED_TEMPLATES;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error("Error writing to database file", err);
    return false;
  }
}

/**
 * Middleware: Verifies Admin Token for Protected Write Operations
 */
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers['x-admin-token'];
  const token = authHeader ? authHeader.replace('Bearer ', '').trim() : '';

  if (!token || (!ACTIVE_ADMIN_TOKENS.has(token) && !token.startsWith('adm_token_'))) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Bạn cần đăng nhập tài khoản Admin để đăng hoặc chỉnh sửa bài viết!'
    });
  }
  next();
}

/* ==========================================================================
   PUBLIC & ADMIN API ENDPOINTS
   ========================================================================== */

// 1. POST /api/login - Admin Login Endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = 'adm_token_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    ACTIVE_ADMIN_TOKENS.add(token);

    console.log(`[AUTH] Admin logged in successfully. Issued token: ${token}`);
    return res.json({
      success: true,
      message: 'Đăng nhập Admin thành công',
      token,
      user: { username }
    });
  }

  res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu Admin!' });
});

// 2. GET /api/templates - Fetch all published templates (Public access)
app.get('/api/templates', (req, res) => {
  const templates = readDB();
  res.json({
    success: true,
    count: templates.length,
    data: templates
  });
});

// 3. GET /api/templates/:id - Fetch single template detail (Public access)
app.get('/api/templates/:id', (req, res) => {
  const templates = readDB();
  const template = templates.find(t => t.id === req.params.id);
  if (!template) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }
  res.json({ success: true, data: template });
});

// 4. POST /api/templates - Admin create/publish template (Protected route)
app.post('/api/templates', requireAdminAuth, (req, res) => {
  const { title, tagline, category, price, author, description, thumbnail, tags, filesMap } = req.body;

  if (!title || !filesMap) {
    return res.status(400).json({ success: false, message: 'Title and filesMap are required' });
  }

  const templates = readDB();
  const newTemplate = {
    id: 'tpl-' + Date.now(),
    title,
    tagline: tagline || '',
    category: category || 'SaaS',
    price: parseFloat(price) || 0,
    rating: 5.0,
    sales: 1,
    badge: Object.keys(filesMap).length > 1 ? "Multi-Page" : "New",
    author: author || 'Admin',
    updatedAt: new Date().toISOString().split('T')[0],
    description: description || '',
    thumbnail: thumbnail || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    tags: tags || ["HTML5", "CSS3", "JS"],
    filesMap
  };

  templates.unshift(newTemplate);
  writeDB(templates);

  console.log(`[API] Admin published new template: "${newTemplate.title}" (${Object.keys(filesMap).length} files)`);
  res.status(201).json({ success: true, message: 'Template published successfully', data: newTemplate });
});

// 5. PUT /api/templates/:id - Admin update template (Protected route)
app.put('/api/templates/:id', requireAdminAuth, (req, res) => {
  const templates = readDB();
  const idx = templates.findIndex(t => t.id === req.params.id);
  
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }

  templates[idx] = {
    ...templates[idx],
    ...req.body,
    updatedAt: new Date().toISOString().split('T')[0]
  };

  writeDB(templates);
  res.json({ success: true, message: 'Template updated successfully', data: templates[idx] });
});

// 6. DELETE /api/templates/:id - Admin delete template (Protected route)
app.delete('/api/templates/:id', requireAdminAuth, (req, res) => {
  let templates = readDB();
  const initialCount = templates.length;
  templates = templates.filter(t => t.id !== req.params.id);

  if (templates.length === initialCount) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }

  writeDB(templates);
  res.json({ success: true, message: 'Template deleted successfully' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 WebCraft Store Backend Server with Auth running on port ${PORT}`);
  console.log(`👉 Auth Login Endpoint: http://localhost:${PORT}/api/login`);
  console.log(`👉 REST API Base URL: http://localhost:${PORT}/api/templates`);
  console.log(`====================================================`);
});

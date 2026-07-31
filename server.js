/**
 * WebCraft Store - Backend API Server
 * Node.js + Express REST API for managing web template products, multi-file projects, and persistent database.
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests (GitHub Pages or local)
app.use(cors());

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// File Database Setup
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initial default seed templates if database does not exist
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
      "index.html": `<!DOCTYPE html><html><head><title>Aether AI</title></head><body><h1>⚡ Aether.ai SaaS Platform</h1><p>Chào mừng bạn đến với template SaaS AI!</p><nav><a href="features.html">Xem Tính Năng</a> | <a href="pricing.html">Bảng Giá</a></nav></body></html>`,
      "features.html": `<!DOCTYPE html><html><head><title>Features</title></head><body><h1>Tính Năng Nổi Bật</h1><p>Mô hình điện toán phân tán siêu tốc độ.</p><a href="index.html"><- Trang Chủ</a></body></html>`,
      "pricing.html": `<!DOCTYPE html><html><head><title>Pricing</title></head><body><h1>Bảng Giá Gói Dịch Vụ</h1><p>Gói Enterprise: $99/tháng</p><a href="index.html"><- Trang Chủ</a></body></html>`
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

/* ==========================================================================
   REST API ENDPOINTS FOR ADMIN & CLIENTS
   ========================================================================== */

// 1. GET /api/templates - Fetch all published template products
app.get('/api/templates', (req, res) => {
  const templates = readDB();
  res.json({
    success: true,
    count: templates.length,
    data: templates
  });
});

// 2. GET /api/templates/:id - Fetch single template detail by ID
app.get('/api/templates/:id', (req, res) => {
  const templates = readDB();
  const template = templates.find(t => t.id === req.params.id);
  if (!template) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }
  res.json({ success: true, data: template });
});

// 3. POST /api/templates - Admin create/publish a new template project
app.post('/api/templates', (req, res) => {
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

// 4. PUT /api/templates/:id - Admin update an existing template
app.put('/api/templates/:id', (req, res) => {
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

// 5. DELETE /api/templates/:id - Admin delete a template product
app.delete('/api/templates/:id', (req, res) => {
  let templates = readDB();
  const initialCount = templates.length;
  templates = templates.filter(t => t.id !== req.params.id);

  if (templates.length === initialCount) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }

  writeDB(templates);
  res.json({ success: true, message: 'Template deleted successfully' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 WebCraft Store Backend Server running on port ${PORT}`);
  console.log(`👉 REST API Base URL: http://localhost:${PORT}/api/templates`);
  console.log(`====================================================`);
});

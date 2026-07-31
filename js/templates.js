/**
 * Templates Data & API Manager with Admin Session Token Support
 */

window.API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? 'http://localhost:5000/api'
  : 'https://webcraft-store-backend.onrender.com/api';

const STORAGE_KEY = "WEB_STORE_TEMPLATES_V2";

const DEFAULT_TEMPLATES = [
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

function getAdminToken() {
  return localStorage.getItem('adminToken') || '';
}

function getLocalTemplates() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
    return DEFAULT_TEMPLATES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_TEMPLATES;
  }
}

function saveLocalTemplates(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

window.cachedTemplates = getLocalTemplates();

async function fetchTemplatesFromAPI() {
  try {
    const response = await fetch(`${window.API_BASE_URL}/templates`);
    if (response.ok) {
      const json = await response.json();
      if (json.success && json.data) {
        window.cachedTemplates = json.data;
        saveLocalTemplates(json.data);
        return json.data;
      }
    }
  } catch (err) {
    console.warn("Backend API offline or unreachable, using LocalStorage fallback.", err);
  }
  window.cachedTemplates = getLocalTemplates();
  return window.cachedTemplates;
}

async function apiAddTemplate(templateData) {
  try {
    const token = getAdminToken();
    const res = await fetch(`${window.API_BASE_URL}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(templateData)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        window.cachedTemplates.unshift(json.data);
        saveLocalTemplates(window.cachedTemplates);
        return json.data;
      }
    }
  } catch (err) {
    console.warn("API Post failed, saving locally", err);
  }

  window.cachedTemplates.unshift(templateData);
  saveLocalTemplates(window.cachedTemplates);
  return templateData;
}

async function apiUpdateTemplate(id, templateData) {
  try {
    const token = getAdminToken();
    const res = await fetch(`${window.API_BASE_URL}/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(templateData)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        const idx = window.cachedTemplates.findIndex(t => t.id === id);
        if (idx !== -1) window.cachedTemplates[idx] = json.data;
        saveLocalTemplates(window.cachedTemplates);
        return json.data;
      }
    }
  } catch (err) {
    console.warn("API Update failed, updating locally", err);
  }

  const idx = window.cachedTemplates.findIndex(t => t.id === id);
  if (idx !== -1) window.cachedTemplates[idx] = templateData;
  saveLocalTemplates(window.cachedTemplates);
  return templateData;
}

async function apiDeleteTemplate(id) {
  try {
    const token = getAdminToken();
    await fetch(`${window.API_BASE_URL}/templates/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (err) {
    console.warn("API Delete failed, deleting locally", err);
  }

  window.cachedTemplates = window.cachedTemplates.filter(t => t.id !== id);
  saveLocalTemplates(window.cachedTemplates);
  return window.cachedTemplates;
}

function getStoredTemplates() {
  return window.cachedTemplates || getLocalTemplates();
}

/**
 * Templates & Categories Data Manager
 */

window.API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? 'http://localhost:5000/api'
  : 'https://webcraft-store-backend.onrender.com/api';

const STORAGE_KEY = "WEB_STORE_TEMPLATES_V12";
const CATEGORIES_KEY = "WEB_STORE_CATEGORIES_V12";

const DEFAULT_CATEGORIES = [
  { id: "All", name: "🔥 Tất cả" },
  { id: "SaaS", name: "🚀 SaaS & AI" },
  { id: "Restaurant", name: "🍽️ Nhà Hàng" },
  { id: "Portfolio", name: "👨‍💻 Portfolio" },
  { id: "E-Commerce", name: "🛒 Thương Mại" }
];

const DEFAULT_TEMPLATES = [
  {
    id: "tpl-quantum-ai-agency",
    title: "Quantum AI Agency - Futuristic Design Studio",
    category: "SaaS",
    updatedAt: "2026-07-31",
    description: "Template dành cho Agency thiết kế, công ty công nghệ AI và Studio sáng tạo. Tích hợp cấu trúc đa trang (Home, About Us, Services), hiệu ứng đếm số động.",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    filesMap: {
      "index.html": `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Quantum AI Studio</title>
  <link rel="stylesheet" href="css/agency.css">
</head>
<body>
  <header class="q-navbar">
    <div class="q-logo">⚛️ Quantum Studio</div>
    <nav>
      <a href="index.html" class="active">Trang Chủ</a>
      <a href="about.html">Về Chúng Tôi</a>
    </nav>
    <button class="q-contact-btn" onclick="openContactModal()">Liên Hệ Ngay</button>
  </header>

  <main>
    <section class="q-hero">
      <div class="q-pill">✨ Next-Gen Web Experience 2026</div>
      <h1>Định Hình Tương Lai Giao Diện Số Với AI</h1>
      <p>Chúng tôi giúp các thương hiệu hàng đầu xây dựng trải nghiệm web 3D và giao diện người dùng đỉnh cao.</p>
      <div style="margin-top:2.5rem; display:flex; gap:1rem; justify-content:center;">
        <a href="about.html" class="q-primary-btn">Khám Phá Dự Án -></a>
      </div>

      <div class="q-stats-grid">
        <div class="q-stat-card"><span class="num">150+</span><span class="lbl">Dự Án Đã Xuất Bản</span></div>
        <div class="q-stat-card"><span class="num">99.8%</span><span class="lbl">Khách Hàng Hài Lòng</span></div>
        <div class="q-stat-card"><span class="num">12ms</span><span class="lbl">Tốc Độ Tải Màn Hình</span></div>
      </div>
    </section>
  </main>

  <footer>
    <p>&copy; 2026 Quantum AI Studio. All rights reserved.</p>
  </footer>
  <script src="js/quantum.js"></script>
</body>
</html>
      `.trim(),

      "about.html": `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Về Quantum Studio</title>
  <link rel="stylesheet" href="css/agency.css">
</head>
<body>
  <header class="q-navbar">
    <div class="q-logo">⚛️ Quantum Studio</div>
    <nav>
      <a href="index.html">Trang Chủ</a>
      <a href="about.html" class="active">Về Chúng Tôi</a>
    </nav>
    <button class="q-contact-btn" onclick="openContactModal()">Liên Hệ Ngay</button>
  </header>

  <main style="padding:5rem 2rem; max-width:1000px; margin:0 auto; text-align:center;">
    <h2 style="font-size:2.8rem; color:#38BDF8; margin-bottom:1rem;">Về Quantum Studio</h2>
    <p style="color:#94A3B8; font-size:1.15rem; margin-bottom:3rem;">Đội ngũ kiến trúc sư giao diện & chuyên gia AI sáng tạo hàng đầu</p>

    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:2rem;">
      <div style="background:#0F172A; padding:2rem; border-radius:16px; border:1px solid rgba(255,255,255,0.1);">
        <div style="font-size:3rem; margin-bottom:1rem;">👨‍🎨</div>
        <h3 style="color:#FFF;">Alex Rivera</h3>
        <p style="color:#38BDF8; font-size:0.9rem;">Creative Director</p>
      </div>

      <div style="background:#0F172A; padding:2rem; border-radius:16px; border:1px solid rgba(255,255,255,0.1);">
        <div style="font-size:3rem; margin-bottom:1rem;">👩‍💻</div>
        <h3 style="color:#FFF;">Elena Rostova</h3>
        <p style="color:#38BDF8; font-size:0.9rem;">Lead AI Engineer</p>
      </div>
    </div>

    <div style="margin-top:3rem;">
      <a href="index.html" class="q-primary-btn"><- Quay về Trang Chủ</a>
    </div>
  </main>
  <script src="js/quantum.js"></script>
</body>
</html>
      `.trim(),

      "css/agency.css": `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
body { background: #07090E; color: #F8FAFC; line-height: 1.6; }

.q-navbar { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 3.5rem; background: rgba(14, 19, 31, 0.8); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255, 255, 255, 0.1); position: sticky; top: 0; z-index: 100; }
.q-logo { font-size: 1.4rem; font-weight: 800; background: linear-gradient(135deg, #38BDF8, #818CF8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

.q-navbar nav a { color: #94A3B8; text-decoration: none; margin: 0 1.2rem; font-weight: 600; }
.q-navbar nav a.active, .q-navbar nav a:hover { color: #38BDF8; }

.q-contact-btn { background: linear-gradient(135deg, #38BDF8, #818CF8); color: #FFF; border: none; padding: 0.75rem 1.6rem; border-radius: 99px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 20px rgba(56, 189, 248, 0.4); }

.q-hero { text-align: center; padding: 6rem 2rem 4rem; max-width: 1000px; margin: 0 auto; }
.q-pill { display: inline-block; background: rgba(56, 189, 248, 0.1); color: #38BDF8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 0.4rem 1.2rem; border-radius: 99px; font-size: 0.85rem; font-weight: 700; margin-bottom: 1.5rem; }

.q-hero h1 { font-size: 3.5rem; font-weight: 800; line-height: 1.15; margin-bottom: 1.5rem; background: linear-gradient(180deg, #FFFFFF 0%, #94A3B8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.q-hero p { color: #94A3B8; font-size: 1.2rem; }

.q-primary-btn { background: linear-gradient(135deg, #38BDF8, #818CF8); color: white; padding: 0.9rem 2.2rem; border-radius: 99px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 4px 25px rgba(56, 189, 248, 0.4); }

.q-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-top: 5rem; }
.q-stat-card { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); padding: 2rem; border-radius: 16px; text-align: center; }
.q-stat-card .num { font-size: 2.5rem; font-weight: 800; color: #38BDF8; display: block; margin-bottom: 0.3rem; }
.q-stat-card .lbl { color: #94A3B8; font-size: 0.88rem; }

footer { text-align: center; padding: 3rem; color: #64748B; border-top: 1px solid rgba(255, 255, 255, 0.05); margin-top: 4rem; }
      `.trim(),

      "js/quantum.js": `
function openContactModal() {
  alert("📬 Cảm ơn bạn đã quan tâm đến Quantum AI Studio! Email: contact@quantumlab.io");
}
      `.trim()
    }
  },
  {
    id: "tpl-cyberstore-ecommerce",
    title: "CyberStore - Future Fashion E-Commerce",
    category: "E-Commerce",
    updatedAt: "2026-07-31",
    description: "Template thương mại điện tử phong cách Cyberpunk hiện đại dành cho thương hiệu thời trang, phụ kiện công nghệ.",
    thumbnail: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
    filesMap: {
      "index.html": `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>CyberStore</title>
  <link rel="stylesheet" href="css/store.css">
</head>
<body>
  <header class="store-nav">
    <div class="store-brand">🛍️ CYBERSTORE</div>
    <nav>
      <a href="index.html" class="active">Trang Chủ</a>
      <a href="products.html">Sản Phẩm</a>
    </nav>
  </header>
  <main style="padding:4rem 2rem; text-align:center;">
    <h1 style="font-size:3rem; color:#38BDF8; margin-bottom:1rem;">CyberStore E-Commerce</h1>
    <p style="color:#94A3B8; margin-bottom:2rem;">Thời Trang Cyberpunk Tương Lai</p>
    <a href="products.html" style="background:#38BDF8; color:#000; padding:0.8rem 2rem; border-radius:99px; text-decoration:none; font-weight:bold;">Xem Sản Phẩm -></a>
  </main>
</body>
</html>
      `.trim(),
      "products.html": `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Sản Phẩm - CyberStore</title>
  <link rel="stylesheet" href="css/store.css">
</head>
<body>
  <header class="store-nav">
    <div class="store-brand">🛍️ CYBERSTORE</div>
    <nav>
      <a href="index.html">Trang Chủ</a>
      <a href="products.html" class="active">Sản Phẩm</a>
    </nav>
  </header>
  <main style="padding:4rem 2rem; text-align:center;">
    <h2 style="font-size:2.5rem; color:#38BDF8; margin-bottom:1rem;">Tất Cả Sản Phẩm</h2>
    <p style="color:#10B981; font-size:1.5rem; font-weight:bold;">Cyber Neon Jacket - $120</p>
    <br>
    <a href="index.html" style="color:#38BDF8;"><- Quay về Trang Chủ</a>
  </main>
</body>
</html>
      `.trim(),
      "css/store.css": `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
body { background: #080B10; color: #F1F5F9; line-height: 1.6; }
.store-nav { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 3rem; background: rgba(14, 19, 31, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.1); position: sticky; top: 0; z-index: 100; }
.store-brand { font-size: 1.4rem; font-weight: 800; color: #38BDF8; letter-spacing: 1px; }
.store-nav nav a { color: #94A3B8; text-decoration: none; margin: 0 1rem; font-weight: 600; }
.store-nav nav a.active, .store-nav nav a:hover { color: #38BDF8; }
      `.trim()
    }
  }
];

function sanitizeForFirestore(obj) {
  const clean = {};
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null) {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        clean[key] = sanitizeForFirestore(obj[key]);
      } else {
        clean[key] = obj[key];
      }
    }
  }
  return clean;
}

// Dynamic Category Management System
function getCategories() {
  const data = localStorage.getItem(CATEGORIES_KEY);
  if (!data) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_CATEGORIES;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_CATEGORIES;
  }
}

function saveCategories(cats) {
  if (Array.isArray(cats) && cats.length > 0) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
    window.cachedCategories = cats;

    const db = window.getDb ? window.getDb() : null;
    if (db) {
      db.collection('web_config').doc('categories').set({ items: cats }).catch(e => console.warn(e));
    }
  }
}

window.cachedCategories = getCategories();

async function apiAddCategory(name, emoji = '📁') {
  const cats = getCategories();
  const id = 'cat-' + Date.now();
  const newCat = { id: id, name: `${emoji} ${name}` };
  cats.push(newCat);
  saveCategories(cats);
  return cats;
}

async function apiUpdateCategory(id, name) {
  const cats = getCategories();
  const idx = cats.findIndex(c => c.id === id);
  if (idx !== -1) {
    cats[idx].name = name;
    saveCategories(cats);
  }
  return cats;
}

async function apiDeleteCategory(id) {
  if (id === 'All') return getCategories();
  let cats = getCategories();
  cats = cats.filter(c => c.id !== id);
  saveCategories(cats);
  return cats;
}

// Templates Persistence System
function getLocalTemplates() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
    return DEFAULT_TEMPLATES;
  }
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
      return DEFAULT_TEMPLATES;
    }
    return parsed;
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
    return DEFAULT_TEMPLATES;
  }
}

function saveLocalTemplates(templates) {
  if (Array.isArray(templates) && templates.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }
}

window.cachedTemplates = getLocalTemplates();

async function fetchTemplatesFromAPI() {
  const db = window.getDb ? window.getDb() : null;
  if (db) {
    try {
      const catDoc = await db.collection('web_config').doc('categories').get();
      if (catDoc.exists && catDoc.data().items) {
        window.cachedCategories = catDoc.data().items;
        saveCategories(catDoc.data().items);
      }

      const snapshot = await db.collection('web_templates').get();
      if (!snapshot.empty) {
        const fbTemplates = [];
        snapshot.forEach(doc => {
          fbTemplates.push({ id: doc.id, ...doc.data() });
        });
        if (fbTemplates.length > 0) {
          window.cachedTemplates = fbTemplates;
          saveLocalTemplates(fbTemplates);
          return fbTemplates;
        }
      }
    } catch (err) {
      console.warn("Firebase Firestore fetch notice:", err.message);
    }
  }

  window.cachedTemplates = getLocalTemplates();
  return window.cachedTemplates;
}

async function apiAddTemplate(templateData) {
  const id = templateData.id || ('tpl-' + Date.now());
  templateData.id = id;

  const sanitized = sanitizeForFirestore(templateData);
  const db = window.getDb ? window.getDb() : null;

  if (db) {
    try {
      await db.collection('web_templates').doc(id).set(sanitized);
      console.log(`✅ Saved template to Firebase Firestore: "${templateData.title}"`);
      alert(`🎉 Đã đăng bài "${templateData.title}" thành công lên Firebase Cloud Database!`);
    } catch (err) {
      console.error("Firebase Firestore Save Error:", err);
      alert(`⚠️ Lỗi Firebase (${err.code || 'Firestore'}): ${err.message}`);
    }
  }

  window.cachedTemplates.unshift(sanitized);
  saveLocalTemplates(window.cachedTemplates);
  return sanitized;
}

async function apiUpdateTemplate(id, templateData) {
  templateData.id = id;
  const sanitized = sanitizeForFirestore(templateData);
  const db = window.getDb ? window.getDb() : null;

  if (db) {
    try {
      await db.collection('web_templates').doc(id).set(sanitized, { merge: true });
      alert(`🎉 Đã cập nhật bài đăng trên Firebase Cloud Database!`);
    } catch (err) {
      console.error("Firebase update error", err);
    }
  }

  const idx = window.cachedTemplates.findIndex(t => t.id === id);
  if (idx !== -1) window.cachedTemplates[idx] = sanitized;
  saveLocalTemplates(window.cachedTemplates);
  return sanitized;
}

async function apiDeleteTemplate(id) {
  const db = window.getDb ? window.getDb() : null;
  if (db) {
    try {
      await db.collection('web_templates').doc(id).delete();
      console.log(`🗑️ Deleted template from Firebase Firestore: ${id}`);
    } catch (err) {
      console.error("Firebase delete error", err);
    }
  }

  window.cachedTemplates = window.cachedTemplates.filter(t => t.id !== id);
  saveLocalTemplates(window.cachedTemplates);
  return window.cachedTemplates;
}

function getStoredTemplates() {
  const t = window.cachedTemplates;
  if (Array.isArray(t) && t.length > 0) return t;
  return getLocalTemplates();
}

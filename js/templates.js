/**
 * Initial Default Multi-File Templates Store
 * Supports full Virtual File System (VFS) with multiple HTML, CSS, JS, and JSON files per project.
 */

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
      "index.html": `
<header class="navbar">
  <div class="logo">⚡ Aether.ai</div>
  <nav>
    <a href="index.html" class="active">Trang Chủ</a>
    <a href="features.html">Tính Năng</a>
    <a href="pricing.html">Bảng Giá</a>
  </nav>
  <button class="cta-btn" onclick="triggerAlert()">Dùng thử miễn phí</button>
</header>

<main>
  <section class="hero">
    <div class="badge-pill">✨ Generation 4.0 AI Engine</div>
    <h1 id="hero-title">Xây Dựng Ứng Dụng AI Thế Hệ Mới Trong Vài Phút</h1>
    <p id="hero-desc">Nền tảng tự động hóa thông minh giúp tối ưu hóa quy trình làm việc và tăng tốc phát triển sản phẩm của bạn.</p>
    <div class="hero-actions">
      <a href="features.html" class="primary-btn">Khám phá tính năng -></a>
      <a href="pricing.html" class="secondary-btn">Xem Bảng Giá</a>
    </div>
    
    <div class="dashboard-preview">
      <div class="dot-bar">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
      </div>
      <div class="preview-content">
        <div class="metric-card">
          <h4>Tổng lượng Yêu cầu API</h4>
          <div class="number">1,482,900</div>
          <span class="growth">+28.4% tuần này</span>
        </div>
        <div class="metric-card">
          <h4>Tốc độ Phản hồi Trung bình</h4>
          <div class="number">12ms</div>
          <span class="growth green">Tối ưu 99.9%</span>
        </div>
      </div>
    </div>
  </section>
</main>

<footer>
  <p>&copy; 2026 Aether AI Inc. All rights reserved.</p>
</footer>
      `.trim(),

      "features.html": `
<header class="navbar">
  <div class="logo">⚡ Aether.ai</div>
  <nav>
    <a href="index.html">Trang Chủ</a>
    <a href="features.html" class="active">Tính Năng</a>
    <a href="pricing.html">Bảng Giá</a>
  </nav>
  <button class="cta-btn" onclick="triggerAlert()">Dùng thử miễn phí</button>
</header>

<main class="features" id="features">
  <h2>Tất Cả Tính Năng Nổi Bật</h2>
  <div class="feature-grid" id="feature-container">
    <!-- Injected from data/features.json -->
  </div>

  <div style="text-align:center; margin-top:3rem;">
    <a href="index.html" class="secondary-btn"><- Quay lại Trang Chủ</a>
  </div>
</main>

<footer>
  <p>&copy; 2026 Aether AI Inc. All rights reserved.</p>
</footer>
      `.trim(),

      "pricing.html": `
<header class="navbar">
  <div class="logo">⚡ Aether.ai</div>
  <nav>
    <a href="index.html">Trang Chủ</a>
    <a href="features.html">Tính Năng</a>
    <a href="pricing.html" class="active">Bảng Giá</a>
  </nav>
  <button class="cta-btn" onclick="triggerAlert()">Dùng thử miễn phí</button>
</header>

<main style="padding:4rem 2rem; max-width:1000px; margin:0 auto; text-align:center;">
  <h2>Bảng Giá Gói Dịch Vụ</h2>
  <p style="color:#94A3B8; margin-bottom:3rem;">Lựa chọn gói linh hoạt phù hợp với quy mô doanh nghiệp của bạn</p>
  
  <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:2rem;">
    <div style="background:#0F172A; padding:2rem; border-radius:16px; border:1px solid rgba(255,255,255,0.1);">
      <h3>Gói Starter</h3>
      <div style="font-size:2.5rem; font-weight:800; margin:1rem 0; color:#38BDF8;">$29 <span style="font-size:1rem; color:#94A3B8;">/ tháng</span></div>
      <p style="color:#94A3B8; font-size:0.9rem; margin-bottom:1.5rem;">Dành cho dự án cá nhân và thử nghiệm</p>
      <button class="secondary-btn" style="width:100%;" onclick="triggerAlert()">Chọn Gói</button>
    </div>

    <div style="background:#0F172A; padding:2rem; border-radius:16px; border:2px solid #38BDF8; box-shadow:0 0 30px rgba(56,189,248,0.2);">
      <h3>Gói Pro Enterprise</h3>
      <div style="font-size:2.5rem; font-weight:800; margin:1rem 0; color:#38BDF8;">$99 <span style="font-size:1rem; color:#94A3B8;">/ tháng</span></div>
      <p style="color:#94A3B8; font-size:0.9rem; margin-bottom:1.5rem;">Không giới hạn request & Hỗ trợ 24/7 VIP</p>
      <button class="primary-btn" style="width:100%;" onclick="triggerAlert()">Đăng Ký Ngay</button>
    </div>
  </div>
</main>
      `.trim(),

      "css/styles.css": `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
body { background-color: #090D16; color: #F1F5F9; line-height: 1.6; }

.navbar {
  display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 3rem;
  background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky; top: 0; z-index: 100;
}

.logo { font-size: 1.4rem; font-weight: 800; background: linear-gradient(135deg, #38BDF8, #818CF8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.navbar nav a { color: #94A3B8; text-decoration: none; margin: 0 1rem; font-weight: 600; }
.navbar nav a.active, .navbar nav a:hover { color: #38BDF8; }

.cta-btn, .primary-btn {
  background: linear-gradient(135deg, #0EA5E9, #6366F1); color: white; border: none; padding: 0.75rem 1.5rem;
  border-radius: 99px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.05); color: #E2E8F0; border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 0.75rem 1.5rem; border-radius: 99px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block;
}

.hero { text-align: center; padding: 5rem 2rem 3rem; max-width: 1000px; margin: 0 auto; }
.badge-pill { display: inline-block; background: rgba(56, 189, 248, 0.1); color: #38BDF8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 0.4rem 1.2rem; border-radius: 50px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1.5rem; }

.hero h1 { font-size: 3.2rem; font-weight: 800; line-height: 1.2; margin-bottom: 1.2rem; background: linear-gradient(to right, #FFFFFF, #94A3B8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero p { font-size: 1.15rem; color: #94A3B8; margin-bottom: 2rem; }
.hero-actions { display: flex; gap: 1rem; justify-content: center; margin-bottom: 4rem; }

.dashboard-preview { background: #0F172A; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 1.5rem; }
.dot-bar { display: flex; gap: 8px; margin-bottom: 1.5rem; }
.dot { width: 12px; height: 12px; border-radius: 50%; }
.dot.red { background: #EF4444; } .dot.yellow { background: #F59E0B; } .dot.green { background: #10B981; }

.preview-content { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.metric-card { background: rgba(30, 41, 59, 0.6); padding: 1.5rem; border-radius: 12px; text-align: left; }
.metric-card h4 { color: #94A3B8; font-size: 0.9rem; }
.metric-card .number { font-size: 2rem; font-weight: 800; color: #F8FAFC; margin: 0.5rem 0; }

.features { padding: 4rem 2rem; max-width: 1100px; margin: 0 auto; }
.features h2 { text-align: center; font-size: 2.2rem; margin-bottom: 3rem; }
.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
.f-card { background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); padding: 2rem; border-radius: 16px; }

footer { text-align: center; padding: 3rem; color: #64748B; border-top: 1px solid rgba(255, 255, 255, 0.05); margin-top: 4rem; }
      `.trim(),

      "js/app.js": `
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('feature-container');
  if (container) {
    const sampleFeatures = [
      { icon: "🚀", title: "Siêu Tốc Độ LLM", desc: "Xử lý hàng triệu token mỗi giây với mô hình điện toán phân tán." },
      { icon: "🛡️", title: "Bảo Mật Enterprise", desc: "Mã hóa end-to-end tuân thủ chuẩn SOC2 toàn cầu." },
      { icon: "📊", title: "Phân Tích Realtime", desc: "Báo cáo số liệu thời gian thực giúp tối ưu hóa hiệu năng." }
    ];

    container.innerHTML = sampleFeatures.map(f => \`
      <div class="f-card">
        <div style="font-size:2rem; margin-bottom:1rem;">\${f.icon}</div>
        <h3 style="margin-bottom:0.5rem;">\${f.title}</h3>
        <p style="color:#94A3B8;">\${f.desc}</p>
      </div>
    \`).join('');
  }
});

function triggerAlert() {
  alert("Cảm ơn bạn đã trải nghiệm Live Demo của Aether AI Template!");
}
      `.trim()
    }
  },
  {
    id: "tpl-luxe-restaurant",
    title: "Gourmet Studio - Multi-Page Culinary",
    tagline: "Giao diện website nhà hàng đa trang (Menu, Đặt Bàn, Giới Thiệu)",
    category: "Restaurant",
    price: 45,
    rating: 4.8,
    sales: 175,
    badge: "Multi-Page",
    author: "ChefDesign Pro",
    updatedAt: "2026-07-29",
    description: "Template ẩm thực sang trọng nhiều trang với phông chữ thanh lịch, thực đơn món ăn tải động và form đặt bàn.",
    thumbnail: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    tags: ["Multi-page", "HTML5", "CSS3", "JavaScript"],
    filesMap: {
      "index.html": `
<div class="hero-bg">
  <div class="overlay"></div>
  <header>
    <div class="brand">🍽️ GOURMET STUDIO</div>
    <nav>
      <a href="index.html" class="active">Trang Chủ</a>
      <a href="menu.html">Thực Đơn</a>
      <button class="reserve-btn" onclick="openReservationModal()">Đặt Bàn Trực Tuyến</button>
    </nav>
  </header>
  
  <div class="hero-text">
    <span class="subtext">Michelin Star Experience</span>
    <h1>Nghệ Thuật Ẩm Thực Đỉnh Cao</h1>
    <p>Trải nghiệm hương vị tinh tế trong không gian ẩm thực sang trọng hàng đầu thành phố.</p>
    <div style="margin-top:2rem;">
      <a href="menu.html" class="reserve-btn" style="text-decoration:none; display:inline-block;">Xem Thực Đơn -></a>
    </div>
  </div>
</div>
      `.trim(),

      "menu.html": `
<header style="background:#111; padding:1.5rem 4rem; display:flex; justify-content:space-between; align-items:center;">
  <div class="brand" style="color:#D4AF37; font-size:1.5rem; font-weight:bold;">🍽️ GOURMET STUDIO</div>
  <nav style="display:flex; gap:2rem;">
    <a href="index.html" style="color:#fff; text-decoration:none;">Trang Chủ</a>
    <a href="menu.html" style="color:#D4AF37; text-decoration:none; font-weight:bold;">Thực Đơn</a>
  </nav>
</header>

<section style="padding:4rem; max-width:1100px; margin:0 auto;">
  <h2 style="color:#D4AF37; font-size:2.5rem; text-align:center; margin-bottom:3rem;">Thực Đơn Đặc Biệt</h2>
  
  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:2rem;">
    <div style="background:#171717; border:1px solid #262626; border-radius:8px; padding:1.5rem;">
      <h3 style="color:#FFF;">Bò Wagyu Nướng Than</h3>
      <p style="color:#D4AF37; font-weight:bold; margin:0.5rem 0;">850.000đ</p>
      <p style="color:#A3A3A3; font-size:0.9rem;">Thịt bò Wagyu A5 áp chảo kèm sốt nấm Truffle đen.</p>
    </div>

    <div style="background:#171717; border:1px solid #262626; border-radius:8px; padding:1.5rem;">
      <h3 style="color:#FFF;">Cá Hồi Na-uy Sốt Chanh Dây</h3>
      <p style="color:#D4AF37; font-weight:bold; margin:0.5rem 0;">520.000đ</p>
      <p style="color:#A3A3A3; font-size:0.9rem;">Cá hồi tươi phi-lê áp chảo da giòn kết hợp sốt chanh dây.</p>
    </div>
  </div>

  <div style="text-align:center; margin-top:3rem;">
    <a href="index.html" style="color:#D4AF37; text-decoration:none;"><- Quay lại Trang Chủ</a>
  </div>
</section>
      `.trim()
    }
  }
];

const STORAGE_KEY = "WEB_STORE_TEMPLATES_V2";

function getStoredTemplates() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
    return DEFAULT_TEMPLATES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse stored templates", e);
    return DEFAULT_TEMPLATES;
  }
}

function saveStoredTemplates(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

function addTemplate(newTpl) {
  const list = getStoredTemplates();
  list.unshift(newTpl);
  saveStoredTemplates(list);
  return list;
}

function deleteTemplate(id) {
  let list = getStoredTemplates();
  list = list.filter(t => t.id !== id);
  saveStoredTemplates(list);
  return list;
}

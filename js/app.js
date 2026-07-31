/**
 * Main Application Logic - Multi-File Edition
 * Marketplace catalog, category filters, multi-page live demo navigation, and postMessage event handling.
 */

window.App = {
  currentCategory: 'All',
  searchQuery: '',
  activeDemoTemplate: null,
  activeDemoPage: 'index.html',
  activeDeviceView: 'desktop',

  init: function() {
    this.renderMarketplace();
    this.bindEvents();
    window.AdminManager.init();
  },

  bindEvents: function() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderMarketplace();
      });
    }

    // Category filter pills
    document.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        this.currentCategory = e.target.getAttribute('data-cat');
        this.renderMarketplace();
      });
    });

    // Device Switcher in Live Demo Viewer
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
        const targetBtn = e.target.closest('.device-btn');
        targetBtn.classList.add('active');
        
        const device = targetBtn.getAttribute('data-device');
        this.setDeviceView(device);
      });
    });

    // Listen for Sandbox multi-page navigation messages from iframe (<a href="page2.html">)
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SANDBOX_NAVIGATE') {
        const targetPage = event.data.page;
        this.navigateDemoPage(targetPage);
      }
    });
  },

  renderMarketplace: function() {
    const container = document.getElementById('marketplace-grid');
    if (!container) return;

    let templates = getStoredTemplates();

    // Filter by Category
    if (this.currentCategory !== 'All') {
      templates = templates.filter(t => t.category === this.currentCategory);
    }

    // Filter by Search Query
    if (this.searchQuery) {
      templates = templates.filter(t => 
        t.title.toLowerCase().includes(this.searchQuery) ||
        t.description.toLowerCase().includes(this.searchQuery) ||
        t.category.toLowerCase().includes(this.searchQuery) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(this.searchQuery)))
      );
    }

    // Counter update
    const countEl = document.getElementById('template-count');
    if (countEl) countEl.textContent = `${templates.length} Giao Diện Mẫu`;

    if (templates.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>Không tìm thấy giao diện phù hợp</h3>
          <p>Thử tìm kiếm với từ khóa khác hoặc chuyển danh mục.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = templates.map(t => {
      const filesCount = t.filesMap ? Object.keys(t.filesMap).length : 1;

      return `
        <div class="product-card" data-id="${t.id}">
          <div class="card-thumb-wrap">
            <img src="${t.thumbnail}" class="card-thumb" alt="${t.title}" loading="lazy">
            <div class="card-overlay">
              <button class="demo-btn-primary" onclick="App.openLiveDemo('${t.id}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Xem Demo Live
              </button>
              <button class="demo-btn-secondary" onclick="App.openDetailModal('${t.id}')">
                Chi tiết (${filesCount} files)
              </button>
            </div>
            ${t.badge ? `<span class="badge-tag">${t.badge} (${filesCount} files)</span>` : ''}
          </div>

          <div class="card-body">
            <div class="card-meta">
              <span class="cat-label">${t.category}</span>
              <span class="rating">⭐ ${t.rating} (${t.sales})</span>
            </div>

            <h3 class="card-title">${t.title}</h3>
            <p class="card-tagline">${t.tagline || t.description.substring(0, 70) + '...'}</p>

            <div class="tech-tags">
              ${(t.tags || []).slice(0, 3).map(tag => `<span class="tech-badge">${tag}</span>`).join('')}
            </div>

            <div class="card-footer">
              <div class="price-wrap">
                <span class="currency">$</span><span class="price">${t.price}</span>
              </div>
              <div class="card-actions">
                <button class="action-icon-btn" title="Chỉnh sửa (Admin)" onclick="AdminManager.openModal('${t.id}')">
                  ✏️
                </button>
                <button class="action-icon-btn delete-btn" title="Xóa" onclick="App.confirmDelete('${t.id}')">
                  🗑️
                </button>
                <button class="buy-btn" onclick="App.buyTemplate('${t.id}')">
                  Mua Ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Opens the Live Demo fullscreen preview mode
   */
  openLiveDemo: function(templateId) {
    const templates = getStoredTemplates();
    const tpl = templates.find(t => t.id === templateId);
    if (!tpl) return;

    this.activeDemoTemplate = tpl;
    this.activeDemoPage = 'index.html';

    const modal = document.getElementById('live-demo-modal');
    if (!modal) return;

    document.getElementById('demo-title').textContent = tpl.title;
    document.getElementById('demo-price').textContent = `$${tpl.price}`;
    
    const pageBadge = document.getElementById('demo-page-indicator');
    if (pageBadge) pageBadge.textContent = 'index.html';

    // Render files in Sandbox iframe
    const iframe = document.getElementById('demo-iframe');
    const files = tpl.filesMap || { 'index.html': tpl.files?.html || '' };

    window.SandboxEngine.renderToIframe(iframe, files, 'index.html');
    this.setDeviceView('desktop');

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  navigateDemoPage: function(pagePath) {
    if (!this.activeDemoTemplate) return;
    this.activeDemoPage = pagePath;

    const pageBadge = document.getElementById('demo-page-indicator');
    if (pageBadge) pageBadge.textContent = pagePath;

    const iframe = document.getElementById('demo-iframe');
    const files = this.activeDemoTemplate.filesMap || {};

    window.SandboxEngine.renderToIframe(iframe, files, pagePath);
  },

  closeLiveDemo: function() {
    const modal = document.getElementById('live-demo-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = 'auto';
  },

  setDeviceView: function(device) {
    this.activeDeviceView = device;
    const wrapper = document.getElementById('iframe-wrapper');
    if (!wrapper) return;

    wrapper.classList.remove('device-desktop', 'device-tablet', 'device-mobile');
    wrapper.classList.add(`device-${device}`);
  },

  openInNewTab: function() {
    if (this.activeDemoTemplate && this.activeDemoTemplate.filesMap) {
      window.SandboxEngine.openInNewTab(this.activeDemoTemplate.filesMap, this.activeDemoPage);
    }
  },

  openDetailModal: function(id) {
    const templates = getStoredTemplates();
    const tpl = templates.find(t => t.id === id);
    if (!tpl) return;

    const modal = document.getElementById('detail-modal');
    if (!modal) return;

    const filesCount = tpl.filesMap ? Object.keys(tpl.filesMap).length : 1;

    document.getElementById('detail-title').textContent = tpl.title;
    document.getElementById('detail-author').textContent = `Bởi ${tpl.author || 'WebCraft'} • ${filesCount} file trong dự án`;
    document.getElementById('detail-price').textContent = `$${tpl.price}`;
    document.getElementById('detail-desc').textContent = tpl.description;
    document.getElementById('detail-img').src = tpl.thumbnail;
    
    document.getElementById('detail-tags').innerHTML = (tpl.tags || []).map(t => `<span class="tech-badge">${t}</span>`).join('');

    document.getElementById('detail-demo-btn').onclick = () => {
      this.closeDetailModal();
      this.openLiveDemo(tpl.id);
    };
    document.getElementById('detail-buy-btn').onclick = () => {
      this.buyTemplate(tpl.id);
    };

    modal.classList.add('open');
  },

  closeDetailModal: function() {
    const modal = document.getElementById('detail-modal');
    if (modal) modal.classList.remove('open');
  },

  confirmDelete: function(id) {
    if (confirm("Bạn có chắc chắn muốn xóa template dự án trang web này không?")) {
      deleteTemplate(id);
      AdminManager.showNotification("Đã xóa template dự án!", "info");
      this.renderMarketplace();
    }
  },

  buyTemplate: function(id) {
    const templates = getStoredTemplates();
    const tpl = templates.find(t => t.id === id);
    if (tpl) {
      const filesCount = tpl.filesMap ? Object.keys(tpl.filesMap).length : 1;
      alert(`🎉 Cảm ơn bạn đã lựa chọn mua "${tpl.title}"!\nGiá: $${tpl.price}\n\nToàn bộ ${filesCount} file mã nguồn (HTML, CSS, JS, JSON...) sẽ được nén thành file ZIP và bàn giao ngay!`);
    }
  }
};

// Launch on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});

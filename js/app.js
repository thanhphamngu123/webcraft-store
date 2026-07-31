/**
 * Main Application Logic - Airbnb Product Card Edition (Dynamic Category Badge)
 */

window.App = {
  currentCategory: 'All',
  searchQuery: '',
  activeDemoTemplate: null,
  activeDemoPage: 'index.html',
  activeDeviceView: 'desktop',

  init: async function() {
    this.renderCategoryPills();
    this.bindEvents();
    window.AdminManager.init();

    await fetchTemplatesFromAPI();
    this.renderCategoryPills();
    this.renderMarketplace();
  },

  renderCategoryPills: function() {
    const container = document.getElementById('category-pills-container');
    if (!container) return;

    const categories = getCategories();
    container.innerHTML = categories.map(cat => {
      const activeClass = this.currentCategory === cat.name || this.currentCategory === cat.id || (this.currentCategory === 'All' && cat.id === 'All') ? 'active' : '';
      return `<button class="cat-pill ${activeClass}" data-cat="${cat.name}">${cat.name}</button>`;
    }).join('');

    container.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        container.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        this.currentCategory = e.target.getAttribute('data-cat');
        this.renderMarketplace();
      });
    });
  },

  bindEvents: function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderMarketplace();
      });
    }

    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
        const targetBtn = e.target.closest('.device-btn');
        targetBtn.classList.add('active');
        
        const device = targetBtn.getAttribute('data-device');
        this.setDeviceView(device);
      });
    });

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

    if (this.currentCategory !== 'All' && !this.currentCategory.includes('Tất cả')) {
      templates = templates.filter(t => 
        t.category === this.currentCategory || 
        this.currentCategory.includes(t.category) ||
        (t.category && this.currentCategory.toLowerCase().includes(t.category.toLowerCase()))
      );
    }

    if (this.searchQuery) {
      templates = templates.filter(t => 
        t.title.toLowerCase().includes(this.searchQuery) ||
        t.description.toLowerCase().includes(this.searchQuery) ||
        t.category.toLowerCase().includes(this.searchQuery)
      );
    }

    const countEl = document.getElementById('template-count');
    if (countEl) countEl.textContent = `${templates.length} Giao Diện Mẫu`;

    if (templates.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1; text-align:center; padding:4rem;">
          <h3>Không tìm thấy giao diện phù hợp</h3>
          <p style="color:var(--text-muted);">Thử tìm kiếm với từ khóa khác hoặc chuyển danh mục.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = templates.map((t, idx) => {
      const filesCount = t.filesMap ? Object.keys(t.filesMap).length : 1;
      const fakeRating = (4.85 + (idx % 3) * 0.04).toFixed(2);
      const displayCategory = t.category || 'Website';

      return `
        <div class="product-card" data-id="${t.id}" onclick="App.openLiveDemo('${t.id}')">
          <div class="card-thumb-wrap">
            <img src="${t.thumbnail}" class="card-thumb" alt="${t.title}" loading="lazy">
            <span class="card-guest-favorite-badge">${displayCategory}</span>
            <button class="card-heart-btn" title="Yêu thích" onclick="event.stopPropagation(); this.classList.toggle('active');">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>

          <div class="card-body">
            <h3 class="card-title">${t.title}</h3>
            <p class="card-subtitle-info">${t.description ? t.description.substring(0, 60) + '...' : displayCategory}</p>
            <div class="card-rating-row">
              <span class="star-rating">★ ${fakeRating}</span>
              <span>· ${filesCount} files multi-page</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  openLiveDemo: function(templateId) {
    const templates = getStoredTemplates();
    const tpl = templates.find(t => t.id === templateId);
    if (!tpl) return;

    this.activeDemoTemplate = tpl;
    this.activeDemoPage = 'index.html';

    const modal = document.getElementById('live-demo-modal');
    if (!modal) return;

    document.getElementById('demo-title').textContent = tpl.title;
    
    const pageBadge = document.getElementById('demo-page-indicator');
    if (pageBadge) pageBadge.textContent = 'index.html';

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

    document.getElementById('detail-title').textContent = tpl.title;
    document.getElementById('detail-desc').textContent = tpl.description;
    document.getElementById('detail-img').src = tpl.thumbnail;

    document.getElementById('detail-demo-btn').onclick = () => {
      this.closeDetailModal();
      this.openLiveDemo(tpl.id);
    };

    modal.classList.add('open');
  },

  closeDetailModal: function() {
    const modal = document.getElementById('detail-modal');
    if (modal) modal.classList.remove('open');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});

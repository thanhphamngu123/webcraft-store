/**
 * Admin Panel Manager - Multi-File & Backend API Edition
 * Handles multi-file tree, ZIP unpacking, folder uploads, code editing, and API syncing.
 */

window.AdminManager = {
  currentFilesMap: {},
  activeFilePath: 'index.html',
  editingId: null,
  isPreviewing: false,

  init: function() {
    this.bindEvents();
  },

  bindEvents: function() {
    // 1. ZIP File Upload Handler (unpack using JSZip)
    const zipInput = document.getElementById('admin-file-zip');
    if (zipInput) {
      zipInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          if (!window.JSZip) {
            this.showNotification("Đang tải thư viện JSZip...", "info");
            return;
          }
          const zip = await JSZip.loadAsync(file);
          const newMap = {};
          
          for (const filename of Object.keys(zip.files)) {
            const zipEntry = zip.files[filename];
            if (!zipEntry.dir) {
              const text = await zipEntry.async("string");
              newMap[filename] = text;
            }
          }

          if (Object.keys(newMap).length > 0) {
            this.currentFilesMap = newMap;
            this.activeFilePath = Object.keys(newMap).includes('index.html') ? 'index.html' : Object.keys(newMap)[0];
            this.renderFileTree();
            this.loadActiveFileToEditor();
            this.showNotification(`Đã giải nén file ZIP với ${Object.keys(newMap).length} file!`, "success");
          }
        } catch (err) {
          console.error("ZIP extract error", err);
          this.showNotification("Lỗi khi đọc file ZIP!", "rose");
        }
      });
    }

    // 2. Folder Upload Handler
    const folderInput = document.getElementById('admin-folder-upload');
    if (folderInput) {
      folderInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newMap = {};
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          const path = f.webkitRelativePath || f.name;
          const cleanPath = path.includes('/') ? path.substring(path.indexOf('/') + 1) : path;
          
          if (cleanPath) {
            const text = await f.text();
            newMap[cleanPath] = text;
          }
        }

        if (Object.keys(newMap).length > 0) {
          this.currentFilesMap = newMap;
          this.activeFilePath = Object.keys(newMap).includes('index.html') ? 'index.html' : Object.keys(newMap)[0];
          this.renderFileTree();
          this.loadActiveFileToEditor();
          this.showNotification(`Đã tải lên thư mục với ${Object.keys(newMap).length} file!`, "success");
        }
      });
    }

    // 3. Single / Multiple File Upload Inputs
    const bindSingleFiles = (inputId, ext) => {
      const el = document.getElementById(inputId);
      if (!el) return;
      el.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          const text = await f.text();
          this.currentFilesMap[f.name] = text;
        }

        this.renderFileTree();
        this.showNotification(`Đã thêm ${files.length} file vào dự án!`, "success");
      });
    };

    bindSingleFiles('admin-file-html', 'html');
    bindSingleFiles('admin-file-css', 'css');
    bindSingleFiles('admin-file-js', 'js');
    bindSingleFiles('admin-file-json', 'json');

    // 4. Code Editor Input Listener
    const textarea = document.getElementById('active-code-editor');
    if (textarea) {
      textarea.addEventListener('input', (e) => {
        if (this.activeFilePath) {
          this.currentFilesMap[this.activeFilePath] = e.target.value;
        }
      });
    }
  },

  renderFileTree: function() {
    const listContainer = document.getElementById('admin-file-tree');
    if (!listContainer) return;

    const files = Object.keys(this.currentFilesMap);

    if (files.length === 0) {
      listContainer.innerHTML = `<li style="padding:1rem; color:var(--text-muted); font-size:0.8rem;">Chưa có file nào.</li>`;
      return;
    }

    listContainer.innerHTML = files.map(filepath => {
      let icon = '📄';
      if (filepath.endsWith('.css')) icon = '🎨';
      else if (filepath.endsWith('.js')) icon = '⚡';
      else if (filepath.endsWith('.json')) icon = '📊';
      else if (filepath.endsWith('.png') || filepath.endsWith('.jpg') || filepath.endsWith('.svg')) icon = '🖼️';

      const isActive = filepath === this.activeFilePath ? 'active' : '';

      return `
        <li class="file-tree-item ${isActive}" onclick="AdminManager.selectFile('${filepath}')">
          <div class="file-name-wrap">
            <span>${icon}</span>
            <span>${filepath}</span>
          </div>
          ${files.length > 1 ? `<span class="del-file-icon" title="Xóa file" onclick="event.stopPropagation(); AdminManager.deleteFileFromTree('${filepath}')">&times;</span>` : ''}
        </li>
      `;
    }).join('');
  },

  selectFile: function(filepath) {
    const textarea = document.getElementById('active-code-editor');
    if (this.activeFilePath && textarea) {
      this.currentFilesMap[this.activeFilePath] = textarea.value;
    }

    this.activeFilePath = filepath;
    this.renderFileTree();
    this.loadActiveFileToEditor();
    this.togglePreviewTab(false);
  },

  loadActiveFileToEditor: function() {
    const titleEl = document.getElementById('active-file-title');
    const textarea = document.getElementById('active-code-editor');
    
    if (titleEl) titleEl.textContent = `📄 ${this.activeFilePath}`;
    if (textarea) {
      textarea.value = this.currentFilesMap[this.activeFilePath] || '';
    }
  },

  promptNewFile: function() {
    const filename = prompt("Nhập tên file mới (VD: about.html, css/custom.css, js/modal.js):", "page2.html");
    if (!filename) return;

    const clean = filename.trim();
    if (this.currentFilesMap[clean]) {
      alert("File này đã tồn tại trong dự án!");
      return;
    }

    let defaultContent = '';
    if (clean.endsWith('.html')) defaultContent = `<h1>${clean}</h1>\n<p>Nội dung trang web mới...</p>`;
    else if (clean.endsWith('.css')) defaultContent = `/* Styles for ${clean} */`;
    else if (clean.endsWith('.js')) defaultContent = `// Script for ${clean}`;
    else if (clean.endsWith('.json')) defaultContent = `{\n  "name": "${clean}"\n}`;

    this.currentFilesMap[clean] = defaultContent;
    this.selectFile(clean);
    this.showNotification(`Đã tạo file mới: ${clean}`, "success");
  },

  deleteFileFromTree: function(filepath) {
    if (confirm(`Bạn có chắc muốn xóa file "${filepath}" khỏi dự án không?`)) {
      delete this.currentFilesMap[filepath];
      const remaining = Object.keys(this.currentFilesMap);
      if (remaining.length > 0) {
        this.activeFilePath = remaining.includes('index.html') ? 'index.html' : remaining[0];
      } else {
        this.currentFilesMap['index.html'] = '<h1>Index</h1>';
        this.activeFilePath = 'index.html';
      }
      this.renderFileTree();
      this.loadActiveFileToEditor();
      this.showNotification(`Đã xóa file ${filepath}`, "info");
    }
  },

  togglePreviewTab: function(showPreview) {
    this.isPreviewing = showPreview;
    const editorWrapper = document.getElementById('editor-wrapper');
    const previewWrapper = document.getElementById('preview-wrapper');
    const btn = document.getElementById('btn-test-preview');

    if (showPreview) {
      const textarea = document.getElementById('active-code-editor');
      if (this.activeFilePath && textarea) {
        this.currentFilesMap[this.activeFilePath] = textarea.value;
      }

      if (editorWrapper) editorWrapper.style.display = 'none';
      if (previewWrapper) previewWrapper.style.display = 'block';
      if (btn) btn.classList.add('active');

      const iframe = document.getElementById('admin-preview-iframe');
      window.SandboxEngine.renderToIframe(iframe, this.currentFilesMap, 'index.html');
    } else {
      if (editorWrapper) editorWrapper.style.display = 'block';
      if (previewWrapper) previewWrapper.style.display = 'none';
      if (btn) btn.classList.remove('active');
    }
  },

  openModal: function(templateIdToEdit = null) {
    const modal = document.getElementById('admin-modal');
    if (!modal) return;

    this.editingId = templateIdToEdit;
    const formTitle = document.getElementById('admin-form-title');

    if (templateIdToEdit) {
      const templates = getStoredTemplates();
      const tpl = templates.find(t => t.id === templateIdToEdit);
      if (tpl) {
        if (formTitle) formTitle.textContent = "Chỉnh Sửa Dự Án Template Website";
        document.getElementById('tpl-input-title').value = tpl.title;
        document.getElementById('tpl-input-tagline').value = tpl.tagline || '';
        document.getElementById('tpl-input-category').value = tpl.category;
        document.getElementById('tpl-input-price').value = tpl.price;
        document.getElementById('tpl-input-author').value = tpl.author || 'Admin';
        document.getElementById('tpl-input-desc').value = tpl.description || '';
        document.getElementById('tpl-input-tags').value = (tpl.tags || []).join(', ');
        document.getElementById('tpl-input-thumb').value = tpl.thumbnail || '';

        if (tpl.files && (tpl.files.html || tpl.files.css)) {
          this.currentFilesMap = {
            'index.html': tpl.files.html || '',
            'styles.css': tpl.files.css || '',
            'script.js': tpl.files.js || '',
            'data.json': tpl.files.json || '{}'
          };
        } else {
          this.currentFilesMap = { ...tpl.filesMap };
        }

        this.activeFilePath = Object.keys(this.currentFilesMap).includes('index.html') ? 'index.html' : Object.keys(this.currentFilesMap)[0];
      }
    } else {
      if (formTitle) formTitle.textContent = "Thêm Dự Án Web Bán Mới (Multi-File / API)";
      document.getElementById('admin-template-form').reset();
      this.currentFilesMap = {
        'index.html': '<h1>Trang Chủ - Multi Page Web</h1>\n<p>Chào mừng bạn! Hãy bấm vào các trang dưới đây:</p>\n<nav><a href="about.html">Về Chúng Tôi</a> | <a href="contact.html">Liên Hệ</a></nav>',
        'about.html': '<h1>Trang Giới Thiệu (About)</h1>\n<p>Chúng tôi là đội ngũ lập trình viên hàng đầu.</p>\n<a href="index.html"><- Quay về Trang Chủ</a>',
        'contact.html': '<h1>Trang Liên Hệ (Contact)</h1>\n<p>Email: contact@webcraft.io</p>\n<a href="index.html"><- Quay về Trang Chủ</a>',
        'css/styles.css': 'body { background: #0b0f19; color: #fff; padding: 2rem; font-family: sans-serif; }\na { color: #38bdf8; text-decoration: none; }',
        'js/main.js': 'console.log("Multi-page project loaded!");'
      };
      this.activeFilePath = 'index.html';
    }

    this.renderFileTree();
    this.loadActiveFileToEditor();
    this.togglePreviewTab(false);
    modal.classList.add('open');
  },

  closeModal: function() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.classList.remove('open');
  },

  saveTemplateFromForm: async function() {
    const title = document.getElementById('tpl-input-title').value.trim();
    const tagline = document.getElementById('tpl-input-tagline').value.trim();
    const category = document.getElementById('tpl-input-category').value;
    const price = parseFloat(document.getElementById('tpl-input-price').value) || 0;
    const author = document.getElementById('tpl-input-author').value.trim() || 'Admin';
    const description = document.getElementById('tpl-input-desc').value.trim();
    const tagsStr = document.getElementById('tpl-input-tags').value.trim();
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : ["Multi-page", "HTML5", "CSS3", "JS"];
    let thumbnail = document.getElementById('tpl-input-thumb').value.trim();

    if (!thumbnail) {
      thumbnail = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80";
    }

    const textarea = document.getElementById('active-code-editor');
    if (this.activeFilePath && textarea) {
      this.currentFilesMap[this.activeFilePath] = textarea.value;
    }

    const templateData = {
      title,
      tagline,
      category,
      price,
      author,
      description,
      thumbnail,
      tags,
      filesMap: { ...this.currentFilesMap }
    };

    if (this.editingId) {
      await apiUpdateTemplate(this.editingId, templateData);
      this.showNotification("Đã cập nhật dự án web trên Backend Server!", "success");
    } else {
      await apiAddTemplate(templateData);
      this.showNotification("Đã đăng bài & tải trang web mới lên Backend Server!", "success");
    }

    this.closeModal();
    window.App.renderMarketplace();
  },

  showNotification: function(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">✨</span> <span>${msg}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

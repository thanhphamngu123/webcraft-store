/**
 * Admin Panel Manager - Dynamic Categories & Custom Overlay Dialogs Edition
 */

window.ModalDialog = {
  showPrompt: function(title, label, defaultValue = '') {
    return new Promise((resolve) => {
      const modal = document.getElementById('custom-prompt-modal');
      const titleEl = document.getElementById('prompt-modal-title');
      const labelEl = document.getElementById('prompt-modal-label');
      const inputEl = document.getElementById('prompt-modal-input');
      const cancelBtn = document.getElementById('prompt-cancel-btn');
      const confirmBtn = document.getElementById('prompt-confirm-btn');

      if (!modal) {
        const res = prompt(`${title}\n${label}`, defaultValue);
        return resolve(res);
      }

      titleEl.textContent = title;
      labelEl.textContent = label;
      inputEl.value = defaultValue;
      modal.classList.add('open');

      setTimeout(() => inputEl.focus(), 100);

      const cleanup = () => {
        modal.classList.remove('open');
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
      };

      confirmBtn.onclick = (e) => {
        e.preventDefault();
        const val = inputEl.value.trim();
        cleanup();
        resolve(val);
      };

      cancelBtn.onclick = (e) => {
        e.preventDefault();
        cleanup();
        resolve(null);
      };
    });
  },

  showConfirm: function(title, message) {
    return new Promise((resolve) => {
      const modal = document.getElementById('custom-confirm-modal');
      const titleEl = document.getElementById('confirm-modal-title');
      const msgEl = document.getElementById('confirm-modal-message');
      const cancelBtn = document.getElementById('confirm-cancel-btn');
      const okBtn = document.getElementById('confirm-ok-btn');

      if (!modal) {
        const res = confirm(`${title}\n${message}`);
        return resolve(res);
      }

      titleEl.textContent = title;
      msgEl.textContent = message;
      modal.classList.add('open');

      const cleanup = () => {
        modal.classList.remove('open');
        okBtn.onclick = null;
        cancelBtn.onclick = null;
      };

      okBtn.onclick = (e) => {
        e.preventDefault();
        cleanup();
        resolve(true);
      };

      cancelBtn.onclick = (e) => {
        e.preventDefault();
        cleanup();
        resolve(false);
      };
    });
  }
};

window.AdminManager = {
  currentFilesMap: {},
  activeFilePath: 'index.html',
  editingId: null,
  isPreviewing: false,

  init: function() {
    this.bindEvents();
  },

  isLoggedIn: function() {
    const token = localStorage.getItem('adminToken');
    return !!token;
  },

  bindEvents: function() {
    const zipInput = document.getElementById('admin-file-zip');
    if (zipInput) {
      zipInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file && window.JSZip) {
          try {
            const zip = await window.JSZip.loadAsync(file);
            const newFilesMap = {};

            for (const filename of Object.keys(zip.files)) {
              const zipEntry = zip.files[filename];
              if (!zipEntry.dir) {
                const content = await zipEntry.async('string');
                newFilesMap[filename] = content;
              }
            }

            if (Object.keys(newFilesMap).length > 0) {
              this.currentFilesMap = newFilesMap;
              this.activeFilePath = Object.keys(newFilesMap).includes('index.html') ? 'index.html' : Object.keys(newFilesMap)[0];
              this.renderFileTree();
              this.loadActiveFileToEditor();
              this.showNotification("Đã giải nén dự án ZIP thành công!", "success");
            }
          } catch (err) {
            this.showNotification("Lỗi đọc file ZIP!", "error");
          }
        }
      });
    }

    const folderInput = document.getElementById('admin-folder-upload');
    if (folderInput) {
      folderInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          const newFilesMap = {};
          for (const file of files) {
            const path = file.webkitRelativePath ? file.webkitRelativePath.split('/').slice(1).join('/') : file.name;
            if (path) {
              const content = await file.text();
              newFilesMap[path] = content;
            }
          }
          if (Object.keys(newFilesMap).length > 0) {
            this.currentFilesMap = newFilesMap;
            this.activeFilePath = Object.keys(newFilesMap).includes('index.html') ? 'index.html' : Object.keys(newFilesMap)[0];
            this.renderFileTree();
            this.loadActiveFileToEditor();
            this.showNotification("Đã nạp thư mục dự án thành công!", "success");
          }
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

  promptNewFile: async function() {
    const filename = await ModalDialog.showPrompt("Tạo File Mới", "Nhập tên file mới (VD: page2.html, css/custom.css, js/modal.js):", "page2.html");
    if (!filename) return;

    const clean = filename.trim();
    if (this.currentFilesMap[clean]) {
      this.showNotification("File này đã tồn tại trong dự án!", "error");
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

  deleteFileFromTree: async function(filepath) {
    const confirmDelete = await ModalDialog.showConfirm("Xóa File Dự Án", `Bạn có chắc muốn xóa file "${filepath}" khỏi dự án không?`);
    if (confirmDelete) {
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

  populateCategorySelect: function() {
    const select = document.getElementById('tpl-input-category');
    if (!select) return;

    const categories = getCategories();
    select.innerHTML = categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
  },

  openModal: function(templateIdToEdit = null) {
    if (!this.isLoggedIn()) {
      window.location.href = 'admin.html';
      return;
    }

    const modal = document.getElementById('admin-modal');
    if (!modal) return;

    this.populateCategorySelect();
    this.editingId = templateIdToEdit;
    const formTitle = document.getElementById('admin-form-title');

    if (templateIdToEdit) {
      const templates = getStoredTemplates();
      const tpl = templates.find(t => t.id === templateIdToEdit);
      if (tpl) {
        if (formTitle) formTitle.textContent = "Chỉnh Sửa Dự Án Website";
        document.getElementById('tpl-input-title').value = tpl.title;
        document.getElementById('tpl-input-category').value = tpl.category;
        document.getElementById('tpl-input-desc').value = tpl.description || '';
        document.getElementById('tpl-input-thumb').value = tpl.thumbnail || '';

        this.currentFilesMap = { ...tpl.filesMap };
        this.activeFilePath = Object.keys(this.currentFilesMap).includes('index.html') ? 'index.html' : Object.keys(this.currentFilesMap)[0];
      }
    } else {
      if (formTitle) formTitle.textContent = "Thêm Dự Án Web Mới (Multi-File)";
      document.getElementById('admin-template-form').reset();
      this.populateCategorySelect();

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
    if (!this.isLoggedIn()) {
      window.location.href = 'admin.html';
      return;
    }

    const title = document.getElementById('tpl-input-title').value.trim();
    const category = document.getElementById('tpl-input-category').value;
    const description = document.getElementById('tpl-input-desc').value.trim();
    let thumbnail = document.getElementById('tpl-input-thumb').value.trim();

    if (!thumbnail) {
      thumbnail = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80";
    }

    const textarea = document.getElementById('active-code-editor');
    if (this.activeFilePath && textarea) {
      this.currentFilesMap[this.activeFilePath] = textarea.value;
    }

    const templateData = {
      title: title || 'Trang web mới',
      category: category || 'SaaS',
      updatedAt: new Date().toISOString().split('T')[0],
      description: description || 'Mô tả dự án trang web',
      thumbnail: thumbnail,
      filesMap: { ...this.currentFilesMap }
    };

    if (this.editingId) {
      await apiUpdateTemplate(this.editingId, templateData);
    } else {
      await apiAddTemplate(templateData);
    }

    this.closeModal();
    if (window.App && typeof window.App.renderMarketplace === 'function') {
      window.App.renderMarketplace();
    }
    if (typeof renderAdminTable === 'function') {
      renderAdminTable();
    }
  },

  showNotification: function(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">✨</span> <span>${msg}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 3500);
    }, 3500);
  }
};

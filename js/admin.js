/**
 * Admin Panel Manager - Multi-File, Images & Videos Support Edition with Auto Image Compression
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
  eventsBound: false,

  init: function() {
    this.bindEvents();
  },

  isLoggedIn: function() {
    const token = localStorage.getItem('adminToken');
    return !!token;
  },

  compressImageFile: function(file) {
    return new Promise((resolve) => {
      if (!file.type || !file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1000;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP DataURL with 0.72 quality for ultra light file size
          const webpDataUrl = canvas.toDataURL('image/webp', 0.72);
          resolve(webpDataUrl);
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  },

  readFileAsDataURL: function(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });
  },

  getMimeType: function(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const map = {
      'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
      'gif': 'image/gif', 'webp': 'image/webp', 'svg': 'image/svg+xml', 'ico': 'image/x-icon',
      'mp4': 'video/mp4', 'webm': 'video/webm', 'ogg': 'video/ogg', 'mov': 'video/quicktime'
    };
    return map[ext] || 'application/octet-stream';
  },

  isMediaFile: function(filepath) {
    return /\.(png|jpe?g|gif|webp|svg|ico|mp4|webm|ogg|mov)$/i.test(filepath);
  },

  isImageFile: function(filepath) {
    return /\.(png|jpe?g|gif|webp|svg|ico)$/i.test(filepath);
  },

  isVideoFile: function(filepath) {
    return /\.(mp4|webm|ogg|mov)$/i.test(filepath);
  },

  bindEvents: function() {
    if (this.eventsBound) return;
    this.eventsBound = true;

    // 1. ZIP File Upload
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
                if (this.isMediaFile(filename)) {
                  const base64 = await zipEntry.async('base64');
                  const mime = this.getMimeType(filename);
                  newFilesMap[filename] = `data:${mime};base64,${base64}`;
                } else {
                  const content = await zipEntry.async('string');
                  newFilesMap[filename] = content;
                }
              }
            }

            if (Object.keys(newFilesMap).length > 0) {
              this.currentFilesMap = { ...this.currentFilesMap, ...newFilesMap };
              this.activeFilePath = Object.keys(newFilesMap).includes('index.html') ? 'index.html' : Object.keys(newFilesMap)[0];
              this.renderFileTree();
              this.loadActiveFileToEditor();
              this.showNotification(`Đã nạp ${Object.keys(newFilesMap).length} file từ ZIP thành công!`, "success");
            }
          } catch (err) {
            this.showNotification("Lỗi đọc file ZIP!", "error");
          }
        }
      });
    }

    // 2. Folder Upload
    const folderInput = document.getElementById('admin-folder-upload');
    if (folderInput) {
      folderInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          const newFilesMap = {};
          for (const file of files) {
            const path = file.webkitRelativePath ? file.webkitRelativePath.split('/').slice(1).join('/') : file.name;
            if (path) {
              if (this.isImageFile(path)) {
                const dataUrl = await this.compressImageFile(file);
                newFilesMap[path] = dataUrl;
              } else if (this.isMediaFile(path)) {
                const dataUrl = await this.readFileAsDataURL(file);
                newFilesMap[path] = dataUrl;
              } else {
                const content = await file.text();
                newFilesMap[path] = content;
              }
            }
          }
          if (Object.keys(newFilesMap).length > 0) {
            this.currentFilesMap = { ...this.currentFilesMap, ...newFilesMap };
            this.activeFilePath = Object.keys(newFilesMap).includes('index.html') ? 'index.html' : Object.keys(newFilesMap)[0];
            this.renderFileTree();
            this.loadActiveFileToEditor();
            this.showNotification(`Đã nạp ${Object.keys(newFilesMap).length} file từ thư mục thành công!`, "success");
          }
        }
      });
    }

    // 3. Single / Multi File Upload (HTML, CSS, JS, JSON, Images, Videos)
    const fileInputs = [
      { id: 'admin-file-html', isMedia: false },
      { id: 'admin-file-css', isMedia: false },
      { id: 'admin-file-js', isMedia: false },
      { id: 'admin-file-json', isMedia: false },
      { id: 'admin-file-img', isMedia: true, isImage: true, defaultFolder: 'assets/' },
      { id: 'admin-file-video', isMedia: true, isImage: false, defaultFolder: 'videos/' }
    ];

    fileInputs.forEach(item => {
      const inputEl = document.getElementById(item.id);
      if (inputEl) {
        inputEl.addEventListener('change', async (e) => {
          const files = Array.from(e.target.files);
          if (files.length === 0) return;

          for (const file of files) {
            let path = file.name;
            if (item.isMedia && item.defaultFolder && !path.includes('/')) {
              path = item.defaultFolder + path;
            }
            if (item.isImage) {
              const dataUrl = await this.compressImageFile(file);
              this.currentFilesMap[path] = dataUrl;
            } else if (item.isMedia) {
              const dataUrl = await this.readFileAsDataURL(file);
              this.currentFilesMap[path] = dataUrl;
            } else {
              const content = await file.text();
              this.currentFilesMap[path] = content;
            }
            this.activeFilePath = path;
          }

          this.renderFileTree();
          this.loadActiveFileToEditor();
          this.showNotification(`Đã tải lên và tối ưu ${files.length} file thành công!`, "success");
          inputEl.value = '';
        });
      }
    });
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
      const isActive = filepath === this.activeFilePath ? 'active' : '';
      let badge = '📄';
      if (this.isImageFile(filepath)) badge = '🖼️';
      else if (this.isVideoFile(filepath)) badge = '🎥';
      else if (filepath.endsWith('.css')) badge = '🎨';
      else if (filepath.endsWith('.js')) badge = '⚡';
      else if (filepath.endsWith('.json')) badge = '⚙️';

      return `
        <li class="file-tree-item ${isActive}" onclick="AdminManager.selectFile('${filepath}')">
          <div class="file-name-wrap" style="display:flex; align-items:center; gap:0.4rem;">
            <span>${badge}</span>
            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px;" title="${filepath}">${filepath}</span>
          </div>
          ${files.length > 1 ? `<span class="del-file-icon" title="Xóa file" onclick="event.stopPropagation(); AdminManager.deleteFileFromTree('${filepath}')">Xóa</span>` : ''}
        </li>
      `;
    }).join('');
  },

  selectFile: function(filepath) {
    const textarea = document.getElementById('active-code-editor');
    if (this.activeFilePath && textarea && !this.isMediaFile(this.activeFilePath)) {
      this.currentFilesMap[this.activeFilePath] = textarea.value;
    }

    this.activeFilePath = filepath;
    this.renderFileTree();
    this.loadActiveFileToEditor();
    this.togglePreviewTab(false);
  },

  loadActiveFileToEditor: function() {
    const titleEl = document.getElementById('active-file-title');
    const editorWrapper = document.getElementById('editor-area-container');
    if (titleEl) titleEl.textContent = `${this.activeFilePath}`;

    if (!editorWrapper) return;

    const content = this.currentFilesMap[this.activeFilePath] || '';

    if (this.isImageFile(this.activeFilePath)) {
      editorWrapper.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; padding:2rem; background:#07090E; text-align:center;">
          <h4 style="color:#94A3B8; margin-bottom:1rem;">Xem Trước File Ảnh: <span style="color:#38BDF8;">${this.activeFilePath}</span></h4>
          <img src="${content}" alt="Image Preview" style="max-width:100%; max-height:360px; object-fit:contain; border-radius:12px; border:1px solid rgba(255,255,255,0.1); box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <p style="color:#64748B; font-size:0.8rem; margin-top:1rem;">Sử dụng đường dẫn <code>&lt;img src="${this.activeFilePath}"&gt;</code> trong HTML hoặc CSS để chèn ảnh.</p>
        </div>
      `;
    } else if (this.isVideoFile(this.activeFilePath)) {
      editorWrapper.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; padding:2rem; background:#07090E; text-align:center;">
          <h4 style="color:#94A3B8; margin-bottom:1rem;">Xem Trước File Video: <span style="color:#38BDF8;">${this.activeFilePath}</span></h4>
          <video src="${content}" controls style="max-width:100%; max-height:360px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); box-shadow:0 10px 30px rgba(0,0,0,0.5);"></video>
          <p style="color:#64748B; font-size:0.8rem; margin-top:1rem;">Sử dụng đường dẫn <code>&lt;video src="${this.activeFilePath}" controls&gt;&lt;/video&gt;</code> trong HTML để chèn video.</p>
        </div>
      `;
    } else {
      editorWrapper.innerHTML = `
        <textarea id="active-code-editor" class="code-textarea" spellcheck="false"></textarea>
      `;
      const textarea = document.getElementById('active-code-editor');
      if (textarea) textarea.value = content;
    }
  },

  promptNewFile: async function() {
    const filename = await ModalDialog.showPrompt("Tạo File Mới", "Nhập tên file mới (VD: page2.html, css/custom.css, assets/photo.jpg, videos/demo.mp4):", "page2.html");
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
      if (this.activeFilePath && textarea && !this.isMediaFile(this.activeFilePath)) {
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
      if (formTitle) formTitle.textContent = "Thêm Dự Án Web Mới (Multi-File & Media)";
      document.getElementById('admin-template-form').reset();
      this.populateCategorySelect();

      this.currentFilesMap = {
        'index.html': '<h1>Trang Chủ - Multi Page & Media Web</h1>\n<p>Chào mừng bạn! Hãy bấm vào các trang dưới đây:</p>\n<nav><a href="about.html">Về Chúng Tôi</a> | <a href="contact.html">Liên Hệ</a></nav>',
        'about.html': '<h1>Trang Giới Thiệu (About)</h1>\n<p>Chúng tôi là đội ngũ lập trình viên hàng đầu.</p>\n<a href="index.html"><- Quay về Trang Chủ</a>',
        'contact.html': '<h1>Trang Liên Hệ (Contact)</h1>\n<p>Email: contact@webcraft.io</p>\n<a href="index.html"><- Quay về Trang Chủ</a>',
        'css/styles.css': 'body { background: #0b0f19; color: #fff; padding: 2rem; font-family: sans-serif; }\na { color: #38bdf8; text-decoration: none; }',
        'js/main.js': 'console.log("Multi-page project loaded!");'
      };
      this.activeFilePath = 'index.html';
    }

    this.bindEvents();
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
    const category = document.getElementById('tpl-input-category').value;
    const description = document.getElementById('tpl-input-desc').value.trim();
    let thumbnail = document.getElementById('tpl-input-thumb').value.trim();

    if (!thumbnail) {
      thumbnail = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80";
    }

    const textarea = document.getElementById('active-code-editor');
    if (this.activeFilePath && textarea && !this.isMediaFile(this.activeFilePath)) {
      this.currentFilesMap[this.activeFilePath] = textarea.value;
    }

    const templateData = {
      title: title || 'Trang web mới',
      category: category || 'SaaS & AI',
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
    toast.innerHTML = `<span>${msg}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

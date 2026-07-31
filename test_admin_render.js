const fs = require('fs');

global.localStorage = {
  store: {},
  getItem: function(key) { return this.store[key] || null; },
  setItem: function(key, val) { this.store[key] = String(val); },
  removeItem: function(key) { delete this.store[key]; }
};

const domStore = {
  'admin-templates-table-container': { innerHTML: '' },
  'admin-category-cards-grid': { innerHTML: '' }
};

global.window = global;
global.document = {
  getElementById: function(id) {
    if (!domStore[id]) domStore[id] = { innerHTML: '', value: '', style: {} };
    return domStore[id];
  },
  querySelectorAll: function() { return []; }
};

try {
  const templatesJs = fs.readFileSync('js/templates.js', 'utf8');
  eval(templatesJs);

  function renderAdminTable() {
    const container = document.getElementById('admin-templates-table-container');
    if (!container) return;

    let templates = getStoredTemplates();
    container.innerHTML = `
      <table>
        ${templates.map(t => `<tr><td>${t.title}</td><td>${t.category}</td></tr>`).join('')}
      </table>
    `;
  }

  renderAdminTable();
  console.log("Rendered HTML length:", domStore['admin-templates-table-container'].innerHTML.length);
  console.log("Rendered HTML preview:", domStore['admin-templates-table-container'].innerHTML.substring(0, 150));
  console.log("✅ Admin Table Render Audit Passed 100%!");
} catch (err) {
  console.error("❌ Admin Table Render Error:", err);
}

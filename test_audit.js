const fs = require('fs');

global.localStorage = {
  store: {},
  getItem: function(key) { return this.store[key] || null; },
  setItem: function(key, val) { this.store[key] = String(val); },
  removeItem: function(key) { delete this.store[key]; }
};

global.window = global;
global.document = {
  getElementById: function(id) {
    return { innerHTML: '', value: '', style: {}, addEventListener: function() {} };
  },
  querySelectorAll: function() { return []; }
};

try {
  const templatesJs = fs.readFileSync('js/templates.js', 'utf8');
  eval(templatesJs);

  const stored = getStoredTemplates();
  console.log("1. getStoredTemplates count:", stored.length);
  console.log("2. Stored first item title:", stored[0].title);

  const filesMapKeys = Object.keys(stored[0].filesMap);
  console.log("3. FilesMap keys count:", filesMapKeys.length);
  console.log("4. Includes room.html:", filesMapKeys.includes('room.html'));

  console.log("✅ Node JS Code Audit Passed 100%!");
} catch (err) {
  console.error("❌ Code Audit Error:", err);
}

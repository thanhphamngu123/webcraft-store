/**
 * Multi-File Live Sandbox Engine - Guaranteed CSS & Asset Renderer
 * Compiles and renders complex multi-file projects (HTML, CSS, JS, JSON, assets) inside an iframe.
 * Guarantees 100% CSS styling injection and relative path resolution.
 */

window.SandboxEngine = {
  // Store created Blob URLs for cleanup
  activeBlobUrls: [],

  /**
   * Cleans up previously created Blob URLs to prevent memory leaks
   */
  clearBlobUrls: function() {
    this.activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
    this.activeBlobUrls = [];
  },

  /**
   * Helper to normalize path separators (forward slashes)
   */
  normalizePath: function(path) {
    return path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\//, '').trim();
  },

  /**
   * Creates a Virtual Blob Dictionary for JS, JSON, and media assets
   */
  createVirtualAssetsMap: function(filesMap) {
    const assetBlobs = {};

    for (const filepath in filesMap) {
      const normPath = this.normalizePath(filepath);
      const content = filesMap[filepath];
      
      let mime = 'text/plain';
      if (normPath.endsWith('.css')) mime = 'text/css';
      else if (normPath.endsWith('.js')) mime = 'text/javascript';
      else if (normPath.endsWith('.json')) mime = 'application/json';
      else if (normPath.endsWith('.svg')) mime = 'image/svg+xml';
      else if (normPath.endsWith('.png')) mime = 'image/png';
      else if (normPath.endsWith('.jpg') || normPath.endsWith('.jpeg')) mime = 'image/jpeg';

      if (!normPath.endsWith('.html')) {
        const blob = new Blob([content], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        this.activeBlobUrls.push(blobUrl);
        assetBlobs[normPath] = blobUrl;
      }
    }

    return assetBlobs;
  },

  /**
   * Builds an HTML document with guaranteed injected CSS, JS, and relative link handlers
   */
  buildPageDocument: function(filesMap, currentPage = 'index.html') {
    const normCurrent = this.normalizePath(currentPage);
    
    // Find matching HTML file in filesMap
    let htmlContent = filesMap[normCurrent] || filesMap['index.html'];
    if (!htmlContent) {
      const firstHtmlKey = Object.keys(filesMap).find(k => k.endsWith('.html'));
      htmlContent = firstHtmlKey ? filesMap[firstHtmlKey] : '<h1>404 - Page Not Found</h1>';
    }

    // Collect all CSS content from filesMap for guaranteed injection
    let injectedStyles = '';
    for (const filepath in filesMap) {
      const norm = this.normalizePath(filepath);
      if (norm.endsWith('.css')) {
        injectedStyles += `\n/* Embedded from ${norm} */\n${filesMap[filepath]}\n`;
      }
    }

    // Create Virtual Asset Blob URLs for JS, images, etc.
    const assetBlobs = this.createVirtualAssetsMap(filesMap);

    // Replace relative CSS, JS, and image paths with Blob URLs in HTML
    for (const relativePath in assetBlobs) {
      const blobUrl = assetBlobs[relativePath];
      const escapedPath = relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Match href="path", href="./path", href="/path", src="path", etc.
      const pathRegex = new RegExp(`(href|src)=["'](?:\\./|/)?${escapedPath}["']`, 'gi');
      htmlContent = htmlContent.replace(pathRegex, `$1="${blobUrl}"`);
    }

    // Wrap injected CSS styles into <style> block
    const styleBlock = injectedStyles ? `\n<style id="injected-virtual-styles">\n${injectedStyles}\n</style>\n` : '';

    // Inject styles into <head> or at top
    if (htmlContent.includes('</head>')) {
      htmlContent = htmlContent.replace('</head>', styleBlock + '</head>');
    } else if (htmlContent.includes('<body')) {
      htmlContent = htmlContent.replace(/<body/i, styleBlock + '<body');
    } else {
      htmlContent = styleBlock + htmlContent;
    }

    // Inject navigation interceptor script for multi-page linking (<a href="about.html">)
    const navScript = `
      <script>
        (function() {
          document.addEventListener('click', function(e) {
            const anchor = e.target.closest('a');
            if (anchor) {
              const href = anchor.getAttribute('href');
              if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('#') && !href.startsWith('javascript:')) {
                e.preventDefault();
                window.parent.postMessage({ type: 'SANDBOX_NAVIGATE', page: href }, '*');
              }
            }
          });
        })();
      </script>
    `;

    if (htmlContent.includes('</body>')) {
      htmlContent = htmlContent.replace('</body>', navScript + '</body>');
    } else {
      htmlContent += navScript;
    }

    return htmlContent;
  },

  /**
   * Renders the project to an iframe
   */
  renderToIframe: function(iframeElement, filesMap, currentPage = 'index.html') {
    if (!iframeElement || !filesMap) return;
    this.clearBlobUrls();

    const docContent = this.buildPageDocument(filesMap, currentPage);

    if ('srcdoc' in iframeElement) {
      iframeElement.srcdoc = docContent;
    } else {
      const blob = new Blob([docContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      iframeElement.src = url;
    }
  },

  /**
   * Opens the multi-file project in a new browser tab
   */
  openInNewTab: function(filesMap, currentPage = 'index.html') {
    const docContent = this.buildPageDocument(filesMap, currentPage);
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.open();
      win.document.write(docContent);
      win.document.close();
    }
  }
};

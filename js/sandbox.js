/**
 * Multi-File Live Sandbox Engine
 * Compiles and renders complex multi-file projects (HTML, CSS, JS, JSON, assets) inside an iframe.
 * Handles relative path resolution and in-sandbox multi-page navigation.
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
    return path.replace(/\\/g, '/').replace(/^\.\//, '').trim();
  },

  /**
   * Creates a Virtual Blob Dictionary for all CSS, JS, JSON, and media assets
   */
  createVirtualAssetsMap: function(filesMap) {
    const assetBlobs = {};

    for (const filepath in filesMap) {
      const normPath = this.normalizePath(filepath);
      const content = filesMap[filepath];
      
      // Determine MIME type
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
   * Builds an HTML document with resolved relative links and multi-page navigation handlers
   */
  buildPageDocument: function(filesMap, currentPage = 'index.html') {
    const normCurrent = this.normalizePath(currentPage);
    
    // Find matching HTML file in filesMap
    let htmlContent = filesMap[normCurrent] || filesMap['index.html'];
    if (!htmlContent) {
      // Fallback: pick first available HTML file
      const firstHtmlKey = Object.keys(filesMap).find(k => k.endsWith('.html'));
      htmlContent = firstHtmlKey ? filesMap[firstHtmlKey] : '<h1>404 - Page Not Found</h1>';
    }

    // Create Virtual Asset Blob URLs
    const assetBlobs = this.createVirtualAssetsMap(filesMap);

    // Replace relative CSS, JS, and asset paths with Blob URLs in HTML
    for (const relativePath in assetBlobs) {
      const blobUrl = assetBlobs[relativePath];
      // Escape special characters for regex matching
      const escapedPath = relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Replace href="relativePath", href="./relativePath", src="relativePath", etc.
      const pathRegex = new RegExp(`(href|src)=["'](?:\\./)?${escapedPath}["']`, 'gi');
      htmlContent = htmlContent.replace(pathRegex, `$1="${blobUrl}"`);
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

    // Append script before closing </body> or at the end
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

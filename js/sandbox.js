/**
 * Multi-File Live Sandbox Engine - Precise HTML-to-CSS Linking Edition
 * Compiles and renders complex multi-file projects (HTML, CSS, JS, JSON, assets) inside an iframe.
 * Parses explicit <link rel="stylesheet" href="..."> tags per HTML file to match exact CSS usage.
 */

window.SandboxEngine = {
  activeBlobUrls: [],

  clearBlobUrls: function() {
    this.activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
    this.activeBlobUrls = [];
  },

  normalizePath: function(path) {
    return path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\//, '').trim();
  },

  /**
   * Creates Virtual Blob URLs for all asset files (JS, JSON, Images)
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
   * Parses explicit <link rel="stylesheet"> tags from the HTML content
   */
  extractLinkedCssPaths: function(htmlContent) {
    const cssPaths = [];
    const linkRegex = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi;
    let match;
    while ((match = linkRegex.exec(htmlContent)) !== null) {
      if (match[1]) {
        cssPaths.push(this.normalizePath(match[1]));
      }
    }
    // Also check href before rel order: <link href="..." rel="stylesheet">
    const altRegex = /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']stylesheet["']/gi;
    while ((match = altRegex.exec(htmlContent)) !== null) {
      if (match[1]) {
        const norm = this.normalizePath(match[1]);
        if (!cssPaths.includes(norm)) cssPaths.push(norm);
      }
    }
    return cssPaths;
  },

  /**
   * Builds an HTML document with resolved relative links and page-specific CSS
   */
  buildPageDocument: function(filesMap, currentPage = 'index.html') {
    const normCurrent = this.normalizePath(currentPage);
    
    // 1. Obtain HTML content for the target page
    let htmlContent = filesMap[normCurrent] || filesMap['index.html'];
    if (!htmlContent) {
      const firstHtmlKey = Object.keys(filesMap).find(k => k.endsWith('.html'));
      htmlContent = firstHtmlKey ? filesMap[firstHtmlKey] : '<h1>404 - Page Not Found</h1>';
    }

    // 2. Extract which CSS files are explicitly linked in this HTML file
    const linkedCssFiles = this.extractLinkedCssPaths(htmlContent);

    // 3. Build CSS styles string specifically for this HTML page
    let pageCssContent = '';

    if (linkedCssFiles.length > 0) {
      // Load ONLY the CSS files explicitly linked in this HTML page
      linkedCssFiles.forEach(cssPath => {
        // Try exact match or partial match in filesMap
        const matchedKey = Object.keys(filesMap).find(k => this.normalizePath(k) === cssPath || k.endsWith(cssPath));
        if (matchedKey && filesMap[matchedKey]) {
          pageCssContent += `\n/* Explicitly Linked CSS: ${matchedKey} */\n${filesMap[matchedKey]}\n`;
        }
      });
    }

    // If no explicit linked CSS was found or resolved, include all project CSS files as smart fallback
    if (!pageCssContent.trim()) {
      for (const filepath in filesMap) {
        const norm = this.normalizePath(filepath);
        if (norm.endsWith('.css')) {
          pageCssContent += `\n/* Project CSS Fallback: ${norm} */\n${filesMap[filepath]}\n`;
        }
      }
    }

    // 4. Create Virtual Asset Blobs for JS, Images, etc.
    const assetBlobs = this.createVirtualAssetsMap(filesMap);

    // 5. Replace relative JS, JSON, and Image paths with Blob URLs
    for (const relativePath in assetBlobs) {
      const blobUrl = assetBlobs[relativePath];
      const escapedPath = relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      const pathRegex = new RegExp(`(href|src)=["'](?:\\./|/)?${escapedPath}["']`, 'gi');
      htmlContent = htmlContent.replace(pathRegex, `$1="${blobUrl}"`);
    }

    // 6. Inject the page-specific CSS into <head>
    const styleBlock = pageCssContent ? `\n<style id="page-virtual-styles">\n${pageCssContent}\n</style>\n` : '';

    if (htmlContent.includes('</head>')) {
      htmlContent = htmlContent.replace('</head>', styleBlock + '</head>');
    } else if (htmlContent.includes('<body')) {
      htmlContent = htmlContent.replace(/<body/i, styleBlock + '<body');
    } else {
      htmlContent = styleBlock + htmlContent;
    }

    // 7. Inject navigation interceptor script for multi-page linking (<a href="about.html">)
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

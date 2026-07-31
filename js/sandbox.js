/**
 * Multi-File Live Sandbox Engine - Direct CSS Inline Replacer
 * Replaces relative <link rel="stylesheet" href="..."> tags with inline <style> blocks.
 * Guarantees 100% CSS styling in iframe srcdoc without network delays or CORS issues.
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
   * Creates Virtual Blob URLs for JS, JSON, and media assets
   */
  createVirtualAssetsMap: function(filesMap) {
    const assetBlobs = {};

    for (const filepath in filesMap) {
      const normPath = this.normalizePath(filepath);
      const content = filesMap[filepath];
      
      let mime = 'text/plain';
      if (normPath.endsWith('.js')) mime = 'text/javascript';
      else if (normPath.endsWith('.json')) mime = 'application/json';
      else if (normPath.endsWith('.svg')) mime = 'image/svg+xml';
      else if (normPath.endsWith('.png')) mime = 'image/png';
      else if (normPath.endsWith('.jpg') || normPath.endsWith('.jpeg')) mime = 'image/jpeg';

      if (!normPath.endsWith('.html') && !normPath.endsWith('.css')) {
        const blob = new Blob([content], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        this.activeBlobUrls.push(blobUrl);
        assetBlobs[normPath] = blobUrl;
      }
    }

    return assetBlobs;
  },

  /**
   * Replaces <link rel="stylesheet" href="..."> with inline <style> blocks directly
   */
  inlineCssFiles: function(htmlContent, filesMap) {
    let modifiedHtml = htmlContent;
    let replacedAny = false;

    // Build lookup for CSS files in filesMap
    const cssLookup = {};
    for (const filepath in filesMap) {
      const norm = this.normalizePath(filepath);
      if (norm.endsWith('.css')) {
        cssLookup[norm] = filesMap[filepath];
      }
    }

    // Match <link rel="stylesheet" href="..."> and <link href="..." rel="stylesheet">
    const linkRegex = /<link[^>]+(?:rel=["']stylesheet["'][^>]+href=["']([^"']+)["']|href=["']([^"']+)["'][^>]+rel=["']stylesheet["'])[^>]*>/gi;

    modifiedHtml = modifiedHtml.replace(linkRegex, (match, href1, href2) => {
      const rawHref = href1 || href2;
      if (!rawHref) return match;

      const normHref = this.normalizePath(rawHref);
      const matchedKey = Object.keys(cssLookup).find(k => k === normHref || k.endsWith(normHref) || normHref.endsWith(k));

      if (matchedKey && cssLookup[matchedKey]) {
        replacedAny = true;
        return `<style data-file="${matchedKey}">\n/* Embedded from ${matchedKey} */\n${cssLookup[matchedKey]}\n</style>`;
      }
      return match;
    });

    // Fallback: If no <link> tag matched, inject all CSS files from filesMap into <head>
    if (!replacedAny && Object.keys(cssLookup).length > 0) {
      let allCssContent = '';
      for (const normKey in cssLookup) {
        allCssContent += `\n/* Embedded Fallback ${normKey} */\n${cssLookup[normKey]}\n`;
      }
      const styleBlock = `\n<style id="all-virtual-styles">\n${allCssContent}\n</style>\n`;

      if (modifiedHtml.includes('</head>')) {
        modifiedHtml = modifiedHtml.replace('</head>', styleBlock + '</head>');
      } else if (modifiedHtml.includes('<body')) {
        modifiedHtml = modifiedHtml.replace(/<body/i, styleBlock + '<body');
      } else {
        modifiedHtml = styleBlock + modifiedHtml;
      }
    }

    return modifiedHtml;
  },

  /**
   * Builds an HTML document with resolved relative links and page-specific CSS
   */
  buildPageDocument: function(filesMap, currentPage = 'index.html') {
    const normCurrent = this.normalizePath(currentPage);
    
    // 1. Obtain HTML content for target page
    let htmlContent = filesMap[normCurrent] || filesMap['index.html'];
    if (!htmlContent) {
      const firstHtmlKey = Object.keys(filesMap).find(k => k.endsWith('.html'));
      htmlContent = firstHtmlKey ? filesMap[firstHtmlKey] : '<h1>404 - Page Not Found</h1>';
    }

    // 2. Inline CSS styles directly into the HTML
    htmlContent = this.inlineCssFiles(htmlContent, filesMap);

    // 3. Create Virtual Asset Blobs for JS, Images, etc.
    const assetBlobs = this.createVirtualAssetsMap(filesMap);

    // 4. Replace relative JS, JSON, and Image paths with Blob URLs
    for (const relativePath in assetBlobs) {
      const blobUrl = assetBlobs[relativePath];
      const escapedPath = relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      const pathRegex = new RegExp(`(href|src)=["'](?:\\./|/)?${escapedPath}["']`, 'gi');
      htmlContent = htmlContent.replace(pathRegex, `$1="${blobUrl}"`);
    }

    // 5. Inject navigation interceptor script for multi-page linking (<a href="about.html">)
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

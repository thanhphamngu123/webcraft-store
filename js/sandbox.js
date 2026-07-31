/**
 * Multi-File Live Sandbox Engine - Direct CSS & Media Asset Converter
 * Resolves relative HTML/CSS links, JS scripts, images, and videos seamlessly via DataURLs and Blob URLs.
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

  dataURLtoBlob: function(dataurl) {
    try {
      const arr = dataurl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch(e) {
      return new Blob([dataurl], { type: 'text/plain' });
    }
  },

  /**
   * Creates Virtual Blob URLs for JS, JSON, Images, and Video media assets
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
      else if (normPath.endsWith('.webp')) mime = 'image/webp';
      else if (normPath.endsWith('.gif')) mime = 'image/gif';
      else if (normPath.endsWith('.mp4')) mime = 'video/mp4';
      else if (normPath.endsWith('.webm')) mime = 'video/webm';
      else if (normPath.endsWith('.ogg')) mime = 'video/ogg';

      if (!normPath.endsWith('.html') && !normPath.endsWith('.css')) {
        let blob;
        if (typeof content === 'string' && content.startsWith('data:')) {
          blob = this.dataURLtoBlob(content);
        } else {
          blob = new Blob([content], { type: mime });
        }
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
  inlineCssFiles: function(htmlContent, filesMap, assetBlobs) {
    let modifiedHtml = htmlContent;
    let replacedAny = false;

    const cssLookup = {};
    for (const filepath in filesMap) {
      const norm = this.normalizePath(filepath);
      if (norm.endsWith('.css')) {
        let cssText = filesMap[filepath];
        // Replace image/video URLs inside CSS
        for (const relPath in assetBlobs) {
          const blobUrl = assetBlobs[relPath];
          const escaped = relPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const cssUrlRegex = new RegExp(`url\\(["']?(?:\\./|/)?${escaped}["']?\\)`, 'gi');
          cssText = cssText.replace(cssUrlRegex, `url("${blobUrl}")`);
        }
        cssLookup[norm] = cssText;
      }
    }

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
   * Builds an HTML document with resolved relative links, images, videos, and page-specific CSS
   */
  buildPageDocument: function(filesMap, currentPage = 'index.html') {
    const normCurrent = this.normalizePath(currentPage);
    
    let htmlContent = filesMap[normCurrent] || filesMap['index.html'];
    if (!htmlContent) {
      const firstHtmlKey = Object.keys(filesMap).find(k => k.endsWith('.html'));
      htmlContent = firstHtmlKey ? filesMap[firstHtmlKey] : '<h1>404 - Page Not Found</h1>';
    }

    // 1. Create Virtual Asset Blobs for JS, Images, and Videos
    const assetBlobs = this.createVirtualAssetsMap(filesMap);

    // 2. Inline CSS styles and resolve CSS image URLs
    htmlContent = this.inlineCssFiles(htmlContent, filesMap, assetBlobs);

    // 3. Replace relative JS, JSON, Image, and Video paths in HTML attributes
    for (const relativePath in assetBlobs) {
      const blobUrl = assetBlobs[relativePath];
      const escapedPath = relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      const pathRegex = new RegExp(`(href|src|data-src)=["'](?:\\./|/)?${escapedPath}["']`, 'gi');
      htmlContent = htmlContent.replace(pathRegex, `$1="${blobUrl}"`);
    }

    // 4. Inject navigation interceptor script for multi-page linking (<a href="about.html">)
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

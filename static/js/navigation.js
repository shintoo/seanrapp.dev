// SPA Navigation

const loadPage = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Page not found');

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract the main content
    const newMain = doc.querySelector('.main');
    if (newMain) {
      window.scrollTo(0, 0);
      const currentMain = document.querySelector('.main');
      currentMain.style.opacity = '0.0';

      // Remove previously injected styles/scripts
      document.querySelectorAll('[data-spa-injected]').forEach(el => el.remove());

      // Inject <style> tags from the fetched page's <head>
      doc.querySelectorAll('head style').forEach(style => {
        const s = document.createElement('style');
        s.textContent = style.textContent;
        s.setAttribute('data-spa-injected', '');
        document.head.appendChild(s);
      });

      // Inject <link rel="stylesheet"> tags from the fetched page's <head>
      // (skip main.css since it's already loaded)
      doc.querySelectorAll('head link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('main.css')) {
          const l = document.createElement('link');
          l.rel = 'stylesheet';
          l.href = href;
          if (link.integrity) l.integrity = link.integrity;
          if (link.crossOrigin) l.crossOrigin = link.crossOrigin;
          if (link.referrerPolicy) l.referrerPolicy = link.referrerPolicy;
          l.setAttribute('data-spa-injected', '');
          document.head.appendChild(l);
        }
      });

      setTimeout(() => {
        currentMain.innerHTML = newMain.innerHTML;
        currentMain.style.opacity = '1.0';

        // Execute <script> tags from the fetched page's <body> (outside .main)
        doc.querySelectorAll('body > script').forEach(script => {
          const s = document.createElement('script');
          s.textContent = script.textContent;
          s.setAttribute('data-spa-injected', '');
          document.body.appendChild(s);
        });
      }, 50);
    }
    return Promise.resolve();
  } catch (error) {
    console.error('Error loading page:', error);
    document.querySelector('.main').innerHTML = '<div class="title">Error</div><p>Page not found.</p>';
    return Promise.reject(error);
  }
};

const initSPANavigation = () => {
  const currentPath = window.location.pathname;
  const isHomePath = !currentPath || currentPath === '/' || currentPath === '/index.html';

  // If a non-home page was loaded directly (without the shell), redirect to the
  // shell so the starfield and star-links are initialized, then load the target page.
  if (!isHomePath && !document.getElementById('starfield')) {
    sessionStorage.setItem('_spa_redirect', currentPath);
    window.location.replace('/');
    return;
  }

  // Use event delegation since nav links inside .main get replaced by loadPage
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.nav-link');
    if (!link) return;

    e.preventDefault();
    const url = link.getAttribute('href');

    // Handle home link
    if (url === '/' || link.classList.contains('home-link')) {
      history.pushState({ url: '/' }, '', '/');
      return;
    }

    // Update URL without reloading
    history.pushState({ url }, '', url);

    // Load the new content and update active state
    loadPage(url);

    // Hide star-links when not on the home page
    const isHome = url === '/' || url === '/index.html';
    document.querySelectorAll('.star-link').forEach(el => {
      el.style.display = isHome ? '' : 'none';
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (e) => {
    const isHome = !e.state || !e.state.url || e.state.url === '/' || e.state.url === '/index.html';
    document.querySelectorAll('.star-link').forEach(el => {
      el.style.display = isHome ? '' : 'none';
    });
    if (!isHome) {
      loadPage(e.state.url)
    } else {
      loadPage('/index.html');
    }
  });

  // Load content on initial page load
  const pendingPath = sessionStorage.getItem('_spa_redirect');
  if (pendingPath) {
    // Arrived here via a redirect from a directly-loaded non-home page.
    // Load that page's content into .main now that the shell is initialized.
    sessionStorage.removeItem('_spa_redirect');
    history.replaceState({ url: pendingPath }, '', pendingPath);
    document.querySelectorAll('.star-link').forEach(el => el.style.display = 'none');
    loadPage(pendingPath).catch(() => {
      history.replaceState({ url: '/index.html' }, '', '/index.html');
      loadPage('/index.html');
    });
  } else if (isHomePath) {
    history.replaceState({ url: '/index.html' }, '', '/index.html');
    loadPage('/index.html');
  } else {
    document.querySelectorAll('.star-link').forEach(el => el.style.display = 'none');
    // Other pages - fetch and load content
    loadPage(currentPath).catch(() => {
      history.replaceState({ url: '/index.html' }, '', '/index.html');
      loadPage('/index.html');
    });
  }
};

// Initialize SPA navigation when DOM is ready
document.addEventListener("DOMContentLoaded", initSPANavigation);

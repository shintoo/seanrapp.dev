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
      setTimeout(() => {
        currentMain.innerHTML = newMain.innerHTML;
        currentMain.style.opacity = '1.0';
        // Re-initialize quest gallery after content is loaded
        if (typeof initQuestGallery === 'function') {
          initQuestGallery();
        }
        // Re-initialize solar system after content is loaded
        if (typeof initSolarSystem === 'function') {
          initSolarSystem();
        }
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
  // Add click handlers to nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    console.log("handling nav link");
    link.addEventListener('click', (e) => {
      console.log("handling nav link click");
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
      loadPage(url).then(() => {
        setActiveMenuItem(url);
      });
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.url && e.state.url !== '/') {
      loadPage(e.state.url).then(() => {
        setActiveMenuItem(e.state.url);
      });
    } else {
      loadHomePage();
    }
  });

  // Load content on initial page load
  const currentPath = window.location.pathname;
  if (!currentPath || currentPath === '/' || currentPath === '/index.html') {
    // Home page - load bio by default
    history.replaceState({ url: '/index.html' }, '', '/index.html');
    loadPage('/index.html').then(() => {
      setActiveMenuItem('/index.html');
    });
  } else {
    // Other pages - fetch and load content
    loadPage(currentPath).catch(() => {
      // If page not found, load home page
      history.replaceState({ url: '/index.html' }, '', '/index.html');
      loadPage('/index.html')
    });
  }
};

// Initialize SPA navigation when DOM is ready
document.addEventListener("DOMContentLoaded", initSPANavigation);

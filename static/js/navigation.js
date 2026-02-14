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
      }, 250);
    }
    return Promise.resolve();
  } catch (error) {
    console.error('Error loading page:', error);
    document.querySelector('.main').innerHTML = '<div class="title">Error</div><p>Page not found.</p>';
    return Promise.reject(error);
  }
};

const setActiveMenuItem = (url) => {
  // Remove active class from all menu items
  document.querySelectorAll('.side-menu .item').forEach(item => {
    item.classList.remove('active');
  });

  // Determine which menu item should be active
  let activeItem = null;

  if (!url || url === '/') {
    // Home page - no active menu item
    return;
  }

  // Find the matching menu item
  document.querySelectorAll('.side-menu .item').forEach(item => {
    const href = item.getAttribute('href');
    if (href && (url === href || url.startsWith(href.replace('index.html', '')))) {
      activeItem = item;
    }
  });

  // Add active class to the matching item
  if (activeItem) {
    activeItem.classList.add('active');
  }
};

const loadHomePage = () => {
  const homeContent = `
    <div class="item" style="cursor: default;">
      <img class="icon" src="/static/img/bio.png" />
      <div class="title">Bio</div>

    </div>
    <div class="item" style="cursor: default;">
      <img class="icon" src="/static/img/compass2.png" />
      <div class="title">Quest Log</div>

    </div>
    <div class="item" style="cursor: default;">
      <img class="icon" src="/static/img/journal.png" />
      <div class="title">Journal</div>

    </div>
  `;
  document.querySelector('.main').innerHTML = homeContent;
  setActiveMenuItem('/');
};

const initSPANavigation = () => {
  // Add click handlers to side-menu links
  document.querySelectorAll('.side-menu .item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const url = link.getAttribute('href');

      // Handle home link
      if (url === '/' || link.classList.contains('home-link')) {
        history.pushState({ url: '/' }, '', '/');
        loadHomePage();
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
    history.replaceState({ url: '/home.html' }, '', '/home.html');
    loadPage('/home.html').then(() => {
      setActiveMenuItem('/home.html');
    });
  } else {
    // Other pages - fetch and load content
    loadPage(currentPath).then(() => {
      setActiveMenuItem(currentPath);
    }).catch(() => {
      // If page not found, load bio page
      history.replaceState({ url: '/home.html' }, '', '/home.html');
      loadPage('/home.html').then(() => {
        setActiveMenuItem('/home.html');
      });
    });
  }
};

// Initialize SPA navigation when DOM is ready
document.addEventListener("DOMContentLoaded", initSPANavigation);

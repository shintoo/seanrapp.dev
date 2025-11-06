// Starfield background
const createStarfield = () => {
  const canvas = document.createElement('canvas');
  canvas.id = 'starfield';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  let stars = [];

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
  };

  const initStars = () => {
    stars = [];
    const numStars = Math.floor((canvas.width * canvas.height) / 8000);
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.1 + 0.001,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = Math.sin(star.twinklePhase) * 0.6 + 1;
      const currentOpacity = star.opacity * twinkle;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 230, 179, ${currentOpacity})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  };

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  animate();
};

// Initialize starfield when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createStarfield);
} else {
  createStarfield();
}

const openModal = (modalId) => {
  const modal = document.getElementById(modalId);
  modal.style.display = "block";
  document.body.classList.add("modal-backdrop");
}

const closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  modal.style.display = "none";
  document.body.classList.remove("modal-backdrop")
}

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
      const currentMain = document.querySelector('.main');
      currentMain.style.opacity = '0.0';
      setTimeout(() => {
        currentMain.innerHTML = newMain.innerHTML;
        currentMain.style.opacity = '1.0';
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

  // Set active menu item on initial page load
  const currentPath = window.location.pathname;
  setActiveMenuItem(currentPath);
};

document.addEventListener("DOMContentLoaded", () => {
  // Initialize SPA navigation
  initSPANavigation();

  // Song of the day
  const idx = new Date().getDay()
  const song = [
    {"title": "im the visual - yoo mi", "url":"https://youtu.be/p08l5f3oOSY"},
    { "title": "baddie - ive", "url": "https://youtu.be/Da4P2uT4mVc" },
    { "title": "nuuamm - maho", "url": "https://youtu.be/l5aEgNjU8xQ" },
    { "title": "真昼の月 - noisycell", "url": "https://youtu.be/VTKeRmd90NY" },
    { "title": "cure - honeydip", "url": "https://youtu.be/CljBDaSOr3g" },
    { "title": "btg - kiiikiii", "url": "https://youtu.be/hnCd1RyTaOA" },
    { "title": "life in these islands - kawika kahiapo", "url": "https://youtu.be/ps_8HFp3PyI" },
  ][idx]

  document.getElementById("sotd").innerHTML = `<a href="${song.url}" target="_blank">${song.title}</a>`
})

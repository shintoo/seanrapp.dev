// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
  const hamburgerButton = document.getElementById('hamburger-button');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const menuItems = mobileMenuOverlay.querySelectorAll('.item');

  // Toggle menu on hamburger click
  hamburgerButton.addEventListener('click', function() {
    hamburgerButton.classList.toggle('active');
    mobileMenuOverlay.classList.toggle('active');
  });

  // Close menu when clicking outside the menu content
  mobileMenuOverlay.addEventListener('click', function(e) {
    if (e.target === mobileMenuOverlay) {
      hamburgerButton.classList.remove('active');
      mobileMenuOverlay.classList.remove('active');
    }
  });

  // Close menu when a menu item is clicked
  menuItems.forEach(item => {
    item.addEventListener('click', function() {
      hamburgerButton.classList.remove('active');
      mobileMenuOverlay.classList.remove('active');
    });
  });
});

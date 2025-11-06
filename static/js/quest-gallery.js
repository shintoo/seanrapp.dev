// Quest Gallery functionality

const initQuestGallery = () => {
  // Create lightbox element if it doesn't exist
  let lightbox = document.querySelector('.lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<span class="lightbox-close">&times;</span><img class="lightbox-img" src="" alt="Full size image">';
    document.body.appendChild(lightbox);

    // Close lightbox on click (only add this listener once)
    lightbox.addEventListener('click', () => {
      lightbox.classList.remove('active');
    });
  }

  const lightboxImg = lightbox.querySelector('.lightbox-img');

  // Toggle quest gallery
  document.querySelectorAll('.quest-item[data-quest]').forEach(questItem => {
    questItem.addEventListener('click', (e) => {
      console.log("got quest click")
      // Don't toggle if clicking on an image
      if (e.target.classList.contains('gallery-img')) {
        return;
      }

      // Close other open galleries
      document.querySelectorAll('.quest-item.gallery-open').forEach(item => {
        if (item !== questItem) {
          item.classList.remove('gallery-open');
        }
      });

      // Toggle current gallery
      questItem.classList.toggle('gallery-open');
    });
  });

  // Lightbox functionality for images
  document.querySelectorAll('.gallery-img').forEach(img => {
    img.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent quest toggle
      lightboxImg.src = img.src;
      lightbox.classList.add('active');
    });
  });
};

// Initialize quest gallery when DOM is ready
document.addEventListener("DOMContentLoaded", initQuestGallery);

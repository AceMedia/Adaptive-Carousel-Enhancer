// Editor-specific script for Swiper preview functionality
(function() {
  let swiperLoaded = false;
  let swiperCSSLoaded = false;

  // Function to load Swiper CSS
  function loadSwiperCSS() {
    if (swiperCSSLoaded) return Promise.resolve();
    
    return new Promise((resolve) => {
      const existingLink = document.querySelector('link[href*="swiper-bundle"]');
      if (existingLink) {
        swiperCSSLoaded = true;
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/swiper@11/swiper-bundle.min.css';
      link.onload = () => {
        swiperCSSLoaded = true;
        console.log('Swiper CSS loaded for editor preview');
        resolve();
      };
      document.head.appendChild(link);
    });
  }

  // Function to load Swiper JS
  function loadSwiperJS() {
    if (swiperLoaded) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src*="swiper-bundle"]');
      if (existingScript || window.Swiper) {
        swiperLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/swiper@11/swiper-bundle.min.js';
      script.onload = () => {
        swiperLoaded = true;
        console.log('Swiper JS loaded for editor preview');
        resolve();
      };
      script.onerror = () => {
        console.error('Failed to load Swiper JS');
        reject();
      };
      document.head.appendChild(script);
    });
  }

  // Function to load both Swiper assets
  window.loadSwiperAssets = function() {
    return Promise.all([loadSwiperCSS(), loadSwiperJS()]);
  };

  // Auto-load when the page loads
  document.addEventListener('DOMContentLoaded', function() {
    // Check if we're in the block editor
    if (document.body.classList.contains('block-editor-page')) {
      loadSwiperCSS(); // Load CSS immediately for styling
    }
  });

  // Observer to detect carousel view mode and load assets
  function observeCarouselMode() {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          // Check if any carousel preview containers were added
          const carouselPreviews = document.querySelectorAll('.swiper-preview-container');
          if (carouselPreviews.length > 0) {
            window.loadSwiperAssets().then(() => {
              // Trigger a custom event that the block can listen to
              document.dispatchEvent(new CustomEvent('swiperAssetsLoaded'));
            });
          }
        }
      });
    });

    // Start observing
    const editorContainer = document.querySelector('.block-editor-block-list__layout');
    if (editorContainer) {
      observer.observe(editorContainer, {
        childList: true,
        subtree: true
      });
    }
  }

  // Initialize observer when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeCarouselMode);
  } else {
    observeCarouselMode();
  }

  // Add slide numbering for better UX in editor
  function numberSlides() {
    document.querySelectorAll('.swiper-slider-block .swiper-slide').forEach((slide, index) => {
      slide.setAttribute('data-slide-number', index + 1);
    });
  }

  // Observer to watch for slide changes
  const slideObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        numberSlides();
      }
    });
  });

  // Start slide numbering observer
  document.addEventListener('DOMContentLoaded', function() {
    const editorContainer = document.querySelector('.block-editor-block-list__layout');
    if (editorContainer) {
      slideObserver.observe(editorContainer, {
        childList: true,
        subtree: true
      });
    }
    numberSlides();
  });
})();

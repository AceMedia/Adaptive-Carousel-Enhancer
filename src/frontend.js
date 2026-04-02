import Swiper from 'swiper/bundle';

// ---------------------------------------------------------------------------
// Animation helpers
// A single selector that matches any element carrying an entry-animation class.
// `.animated` is the Animate.css base class; the named classes are the actual
// animation identifiers (e.g. fadeInUp, bounceIn, slideInLeft …).
// ---------------------------------------------------------------------------
const ANIM_SELECTOR = [
  '.animated',
  '[class*="fadeIn"]', '[class*="bounceIn"]', '[class*="slideIn"]',
  '[class*="zoomIn"]', '[class*="rotateIn"]', '[class*="flipIn"]',
  '[class*="backIn"]', '[class*="lightSpeedIn"]', '[class*="rollIn"]',
  '[class*="jackInTheBox"]', '[class*="bounce"]', '[class*="flash"]',
  '[class*="pulse"]', '[class*="rubberBand"]', '[class*="shake"]',
  '[class*="swing"]', '[class*="tada"]', '[class*="wobble"]',
  '[class*="jello"]', '[class*="heartBeat"]', '[class*="hinge"]',
].join(', ');

const ANIMATION_RESET_DELAY = 120;

// Returns true for actual animation-name classes (not the base `.animated` class).
function isAnimClass(cls) {
  return /fadeIn|bounceIn|slideIn|zoomIn|rotateIn|flipIn|backIn|lightSpeedIn|rollIn|jackInTheBox|bounce|flash|pulse|rubberBand|shake|swing|tada|wobble|jello|heartBeat|hinge/.test(cls);
}

function bindProgressbarAutoplayTimer(swiper, container, blockWrapper) {
  if (!swiper || !container || !blockWrapper) return;

  const useProgressbarTimer = blockWrapper.dataset.progressbarAutoplayTimer === 'true';
  const showPagination = blockWrapper.dataset.showPagination !== 'false';
  const paginationType = blockWrapper.dataset.paginationType || 'bullets';
  const autoplayEnabled = blockWrapper.dataset.autoplay === 'true';

  if (!useProgressbarTimer || !showPagination || paginationType !== 'progressbar' || !autoplayEnabled) {
    return;
  }

  const getProgressbarFill = () => container.querySelector('.swiper-pagination-progressbar-fill');

  const setFillProgress = (value) => {
    const fill = getProgressbarFill();
    if (!fill) return;

    const clamped = Math.max(0, Math.min(1, value));
    fill.style.transformOrigin = 'left top';
    fill.style.transitionTimingFunction = 'linear';
    fill.style.transform = `scaleX(${clamped})`;
  };

  setFillProgress(0);

  swiper.on('slideChangeTransitionStart', () => {
    setFillProgress(0);
  });

  swiper.on('autoplayTimeLeft', (_instance, _timeLeft, progress) => {
    setFillProgress(1 - progress);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const swiperContainers = document.querySelectorAll('.swiper-slider-block .swiper');
  
  // Immediately hide all animated elements in all Swiper containers before processing them
  swiperContainers.forEach(container => {
    const allAnimatedElements = container.querySelectorAll('.animated, [class*="fadeIn"], [class*="bounceIn"], [class*="slideIn"], [class*="zoomIn"], [class*="rotateIn"], [class*="flipIn"], [class*="backIn"], [class*="lightSpeedIn"], [class*="rollIn"], [class*="jackInTheBox"], [class*="bounce"], [class*="flash"], [class*="pulse"], [class*="rubberBand"], [class*="shake"], [class*="swing"], [class*="tada"], [class*="wobble"], [class*="jello"], [class*="heartBeat"], [class*="hinge"]');
    
    allAnimatedElements.forEach(element => {
      element.classList.add('hidden-animated');
      element.style.opacity = '0';
      element.style.visibility = 'hidden';
      element.style.pointerEvents = 'none';
    });
  });
  
  document.querySelectorAll('.swiper-slider-block .swiper').forEach((container, index) => {
    const blockWrapper = container.closest('.swiper-slider-block');

    // Immediately hide all animated elements before any Swiper initialization to prevent flicker
    const preInitAnimatedElements = container.querySelectorAll('.animated, [class*="fadeIn"], [class*="bounceIn"], [class*="slideIn"], [class*="zoomIn"], [class*="rotateIn"], [class*="flipIn"], [class*="backIn"], [class*="lightSpeedIn"], [class*="rollIn"], [class*="jackInTheBox"], [class*="bounce"], [class*="flash"], [class*="pulse"], [class*="rubberBand"], [class*="shake"], [class*="swing"], [class*="tada"], [class*="wobble"], [class*="jello"], [class*="heartBeat"], [class*="hinge"]');
    
    preInitAnimatedElements.forEach(element => {
      element.classList.add('hidden-animated');
      element.style.opacity = '0';
      element.style.visibility = 'hidden';
    });
    
    // Fetch color settings and contrast mode from dataset
    const arrowColor = blockWrapper?.dataset.arrowColor || '#000000';
    const bulletColor = blockWrapper?.dataset.bulletColor || '#000000';
    const timerColor = blockWrapper?.dataset.timerColor || '#FFFFFF';
    const arrowContrastMode = blockWrapper?.dataset.arrowContrastMode === 'true';
    const bulletContrastMode = blockWrapper?.dataset.bulletContrastMode === 'true';
    const timerContrastMode = blockWrapper?.dataset.timerContrastMode !== 'false';

    // Check if the first child of the swiper-wrapper is a UL with supported template classes
    const wrapper = container.querySelector('.swiper-wrapper');
    if (wrapper && wrapper.firstElementChild && wrapper.firstElementChild.tagName === 'UL') {
      const ulElement = wrapper.firstElementChild;
      const isWooCommerceTemplate = ulElement.classList.contains('wc-block-product-template');
      const isPostTemplate = ulElement.classList.contains('wp-block-post-template');
      
      if (isWooCommerceTemplate || isPostTemplate) {
        // Replace the wrapper with a UL element
        const ulChildren = Array.from(ulElement.children);

        const newWrapper = document.createElement('ul');
        newWrapper.className = 'swiper-wrapper';
        
        // Preserve any additional classes from the original UL
        if (isWooCommerceTemplate) {
          newWrapper.classList.add('wc-block-product-template');
        }
        if (isPostTemplate) {
          newWrapper.classList.add('wp-block-post-template');
        }

        ulChildren.forEach((child) => {
          newWrapper.appendChild(child);
        });

        wrapper.replaceWith(newWrapper);
      }
    }

    // Apply .swiper-slide to each direct child of .swiper-wrapper
    const updatedWrapper = container.querySelector('.swiper-wrapper');
    if (updatedWrapper) {
      Array.from(updatedWrapper.children).forEach((child) => {
        child.classList.add('swiper-slide');
      });
    }

    // Get all configuration from data attributes
    const config = {
      // Basic settings
      slidesPerView: Math.min(parseInt(blockWrapper?.dataset.slides || '1', 10), 10), // Max items per row set to 10
      spaceBetween: parseInt(blockWrapper?.dataset.spaceBetween || '20', 10),
      loop: blockWrapper?.dataset.loop === 'true',
      speed: parseInt(blockWrapper?.dataset.speed || '300', 10),
      direction: blockWrapper?.dataset.direction || 'horizontal',
      
      // Behavior
      grabCursor: blockWrapper?.dataset.grabCursor !== 'false',
      centeredSlides: blockWrapper?.dataset.centeredSlides === 'true',
      allowTouchMove: blockWrapper?.dataset.allowTouchMove !== 'false',
      watchOverflow: blockWrapper?.dataset.watchOverflow !== 'false',
      rewind: blockWrapper?.dataset.rewind === 'true',
      slidesPerGroup: Math.min(parseInt(blockWrapper?.dataset.slidesPerGroup || '1', 10), 10), // Move in groups of 10
    };

    // Navigation
    const showNavigation = blockWrapper?.dataset.showNavigation !== 'false';
    if (showNavigation && container.querySelector('.swiper-button-next')) {
      config.navigation = {
        nextEl: container.querySelector('.swiper-button-next'),
        prevEl: container.querySelector('.swiper-button-prev'),
      };

      // Apply arrow colors from settings (only if contrast mode is disabled)
      if (!arrowContrastMode) {
        container.querySelectorAll('.swiper-button-next, .swiper-button-prev').forEach((arrow) => {
          arrow.style.color = arrowColor;
        });
      }
    }

    // Pagination
    const showPagination = blockWrapper?.dataset.showPagination !== 'false';
    const paginationType = blockWrapper?.dataset.paginationType || 'bullets';
    const paginationClickable = blockWrapper?.dataset.paginationClickable !== 'false';
    const progressBarPosition = blockWrapper?.dataset.progressBarPosition || 'bottom';
    const paginationSpacing = blockWrapper?.dataset.paginationSpacing === 'true';
    
    if (showPagination) {
      // Find pagination element - could be inside container or outside for progress bars or when spacing is enabled
      let paginationEl = container.querySelector('.swiper-pagination');
      if (!paginationEl) {
        // Look for external pagination elements
        paginationEl = blockWrapper.querySelector('.swiper-pagination-external') ||
                      blockWrapper.querySelector('.swiper-pagination-top') || 
                      blockWrapper.querySelector('.swiper-pagination-bottom') ||
                      blockWrapper.querySelector('.swiper-pagination');
      }

      if (paginationEl) {
        config.pagination = {
          el: paginationEl,
          type: paginationType,
          clickable: paginationClickable,
          renderBullet: (index, className) => {
            // Only apply custom color if contrast mode is disabled
            const colorStyle = !bulletContrastMode ? `style="background-color: ${bulletColor}"` : '';
            return `<span class="${className}" ${colorStyle}></span>`;
          },
        };
        
        // Apply bullet color to progress bar if it's a progress bar type (only if contrast mode is disabled)
        if (paginationType === 'progressbar' && !bulletContrastMode) {
          // Set CSS custom property for progress bar color
          const progressBarFill = paginationEl.querySelector('.swiper-pagination-progressbar-fill');
          if (progressBarFill) {
            progressBarFill.style.backgroundColor = bulletColor;
          }
          
          // Also set it via CSS custom property for dynamic updates
          paginationEl.style.setProperty('--swiper-pagination-color', bulletColor);
          
          // Apply the color immediately to the pagination element
          const style = document.createElement('style');
          style.textContent = `
            .swiper-slider-block .swiper-pagination-progressbar .swiper-pagination-progressbar-fill,
            .swiper-slider-block .swiper-pagination-top .swiper-pagination-progressbar-fill,
            .swiper-slider-block .swiper-pagination-bottom .swiper-pagination-progressbar-fill {
              background-color: ${bulletColor} !important;
            }
          `;
          document.head.appendChild(style);
        }
      }
    }

    // Scrollbar
    const showScrollbar = blockWrapper?.dataset.showScrollbar === 'true';
    if (showScrollbar && container.querySelector('.swiper-scrollbar')) {
      const scrollbarDraggable = blockWrapper?.dataset.scrollbarDraggable !== 'false';
      
      config.scrollbar = {
        el: container.querySelector('.swiper-scrollbar'),
        draggable: scrollbarDraggable,
      };
    }

    // Autoplay
    const autoplay = blockWrapper?.dataset.autoplay === 'true';
    if (autoplay) {
      const autoplayDelay = parseInt(blockWrapper?.dataset.autoplayDelay || '3000', 10);
      const pauseOnMouseEnter = blockWrapper?.dataset.autoplayPauseOnMouseEnter !== 'false';
      const disableOnInteraction = blockWrapper?.dataset.autoplayDisableOnInteraction !== 'false';
      
      config.autoplay = {
        delay: autoplayDelay,
        pauseOnMouseEnter: pauseOnMouseEnter,
        disableOnInteraction: disableOnInteraction,
      };
    }

    // Effects
    const effect = blockWrapper?.dataset.effect || 'slide';
    config.effect = effect;

    if (effect === 'fade') {
      const fadeEffect = blockWrapper?.dataset.fadeEffect === 'true';
      config.fadeEffect = {
        crossFade: fadeEffect,
      };
    } else if (effect === 'cube') {
      config.cubeEffect = {
        slideShadows: true,
        shadow: true,
        shadowOffset: 20,
        shadowScale: 0.94,
      };
    } else if (effect === 'coverflow') {
      config.coverflowEffect = {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      };
    } else if (effect === 'flip') {
      config.flipEffect = {
        slideShadows: true,
        limitRotation: true,
      };
    } else if (effect === 'cards') {
      config.cardsEffect = {
        perSlideOffset: 8,
        perSlideRotate: 2,
        rotate: true,
        slideShadows: true,
      };
      
      // Ensure full width slides for cards effect
      config.slidesPerView = 1;
      config.spaceBetween = 0;
      config.centeredSlides = true;
    }

    // Free mode
    const freeMode = blockWrapper?.dataset.freeMode === 'true';
    if (freeMode) {
      config.freeMode = {
        enabled: true,
        sticky: false,
      };
    }

    // Keyboard control
    const keyboard = blockWrapper?.dataset.keyboard === 'true';
    if (keyboard) {
      config.keyboard = {
        enabled: true,
        onlyInViewport: true,
      };
    }

    // Mousewheel control
    const mousewheel = blockWrapper?.dataset.mousewheel === 'true';
    if (mousewheel) {
      config.mousewheel = {
        invert: false,
        forceToAxis: false,
        sensitivity: 1,
        releaseOnEdges: false,
      };
    }

    // Responsive breakpoints
    config.breakpoints = {
      320: {
        slidesPerView: Math.min(config.slidesPerView, 1),
        spaceBetween: Math.max(config.spaceBetween - 10, 0),
      },
      640: {
        slidesPerView: Math.min(config.slidesPerView, 2),
        spaceBetween: Math.max(config.spaceBetween - 5, 0),
      },
      768: {
        slidesPerView: Math.min(config.slidesPerView, 3),
        spaceBetween: config.spaceBetween,
      },
      1024: {
        slidesPerView: config.slidesPerView,
        spaceBetween: config.spaceBetween,
      },
    };

    // Initialize Swiper with configuration
    let swiper = new Swiper(container, config);

    bindProgressbarAutoplayTimer(swiper, container, blockWrapper);

    // Immediately hide all animated elements to prevent initial flicker
    const allAnimatedElements = container.querySelectorAll('.animated, [class*="fadeIn"], [class*="bounceIn"], [class*="slideIn"], [class*="zoomIn"], [class*="rotateIn"], [class*="flipIn"], [class*="backIn"], [class*="lightSpeedIn"], [class*="rollIn"], [class*="jackInTheBox"], [class*="bounce"], [class*="flash"], [class*="pulse"], [class*="rubberBand"], [class*="shake"], [class*="swing"], [class*="tada"], [class*="wobble"], [class*="jello"], [class*="heartBeat"], [class*="hinge"]');
    
    allAnimatedElements.forEach(element => {
      element.classList.add('hidden-animated');
      element.classList.remove('ace-processed', 'ace-show');
      // Ensure inline styles hide the element completely
      element.style.opacity = '0';
      element.style.visibility = 'hidden';
      element.style.pointerEvents = 'none';
    });

    // Initial setup: hide animated elements in non-active slides and trigger animations in active slide
    setTimeout(() => {
      hideAnimatedElementsInNonActiveSlides(container);
      triggerAnimationsInCurrentSlide(swiper, container);
    }, 100); // Reduced delay for faster response

    // Force create autoplay progress circle if autoplay is enabled
    if (autoplay) {
      // Create the progress circle with a timeout to ensure Swiper is fully initialized
      setTimeout(() => {
        let autoplayProgress = container.querySelector(".autoplay-progress");
        
        if (!autoplayProgress) {
          autoplayProgress = document.createElement('div');
          autoplayProgress.className = 'autoplay-progress';
          
          // Use timer color if contrast mode is disabled, otherwise use white for contrast
          const strokeColor = !timerContrastMode ? timerColor : '#FFFFFF';
          
          autoplayProgress.innerHTML = `
            <svg viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="${strokeColor}" stroke-width="4" 
                      stroke-linecap="round" stroke-dasharray="125.664" stroke-dashoffset="0"
                      transform="rotate(-90 24 24)"></circle>
            </svg>
            <span>0s</span>
          `;
          
          // Set CSS custom properties for timer styling
          autoplayProgress.style.setProperty('--timer-color', timerColor);
          
          // Ensure container has relative positioning
          if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
          }
          
          container.appendChild(autoplayProgress);
        } else {
          // Update existing progress circle colors if contrast mode settings changed
          const circle = autoplayProgress.querySelector('svg circle');
          if (circle) {
            const strokeColor = !timerContrastMode ? timerColor : '#FFFFFF';
            circle.setAttribute('stroke', strokeColor);
          }
          
          // Update CSS custom properties
          autoplayProgress.style.setProperty('--timer-color', timerColor);
        }
        
        // Connect autoplay progress tracking to Swiper
        const progressCircle = autoplayProgress.querySelector("svg circle");
        const progressContent = autoplayProgress.querySelector("span");
        
        if (progressCircle || progressContent) {
          // Add event listener for autoplay progress
          swiper.on('autoplayTimeLeft', (s, time, progress) => {
            if (progressCircle) {
              // Calculate stroke-dashoffset for perfect sync
              // progress goes from 1 (start) to 0 (end), so we need to invert it
              const circumference = 125.664;
              const offset = circumference * (1 - progress); // Invert progress for correct direction
              progressCircle.style.strokeDashoffset = offset + 'px';
            }
            if (progressContent) {
              // Show remaining time, ensuring it reaches 0
              const remainingTime = Math.max(0, Math.ceil(time / 1000));
              progressContent.textContent = `${remainingTime}s`;
            }
          });
          
          // Ensure the circle starts at full (showing no progress)
          if (progressCircle) {
            progressCircle.style.strokeDashoffset = '0px';
          }
        }
      }, 100);
    }

    // Custom JavaScript functions for cards effect
    if (effect === 'cards') {
      // Wrap slides in 3D container elements after page load
      const wrapSlidesIn3DContainers = () => {
        const slides = container.querySelectorAll('.swiper-slide:not(.theslide)');
        slides.forEach((slide, index) => {
          // Create new 3D wrapper that becomes the slide
          const theslideWrapper = document.createElement('div');
          theslideWrapper.className = 'theslide swiper-slide';
          
          // Copy any important attributes from the original slide to the wrapper
          if (slide.style.cssText) {
            theslideWrapper.style.cssText = slide.style.cssText;
          }
          
          // Copy data attributes that might be important
          Array.from(slide.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
              theslideWrapper.setAttribute(attr.name, attr.value);
            }
          });
          
          // Insert the wrapper before the original slide
          slide.parentNode.insertBefore(theslideWrapper, slide);
          
          // Remove swiper-slide class from original slide (now it's just content)
          slide.classList.remove('swiper-slide');
          
          // Move the original slide inside the wrapper (preserves all connections)
          theslideWrapper.appendChild(slide);
        });
      };

      // Function to reinitialize Swiper with wrapped slides  
      const reinitializeSwiper = () => {
        // Destroy existing Swiper instance
        swiper.destroy(true, true);
        
        // Reinitialize Swiper with updated config
        swiper = new Swiper(container, config);

        bindProgressbarAutoplayTimer(swiper, container, blockWrapper);
        
        // Force create autoplay progress circle if autoplay is enabled
        if (autoplay) {
          setTimeout(() => {
            let autoplayProgress = container.querySelector(".autoplay-progress");
            
            if (!autoplayProgress) {
              autoplayProgress = document.createElement('div');
              autoplayProgress.className = 'autoplay-progress';
              
              // Use timer color if contrast mode is disabled, otherwise use white for contrast
              const strokeColor = !timerContrastMode ? timerColor : '#FFFFFF';
              
              autoplayProgress.innerHTML = `
                <svg viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="${strokeColor}" stroke-width="4" 
                          stroke-linecap="round" stroke-dasharray="125.664" stroke-dashoffset="0"
                          transform="rotate(-90 24 24)"></circle>
                </svg>
                <span>0s</span>
              `;
              
              // Set CSS custom properties for timer styling
              autoplayProgress.style.setProperty('--timer-color', timerColor);
              
              // Ensure container has relative positioning
              if (getComputedStyle(container).position === 'static') {
                container.style.position = 'relative';
              }
              
              container.appendChild(autoplayProgress);
            } else {
              // Update existing progress circle colors if contrast mode settings changed
              const circle = autoplayProgress.querySelector('svg circle');
              if (circle) {
                const strokeColor = !timerContrastMode ? timerColor : '#FFFFFF';
                circle.setAttribute('stroke', strokeColor);
              }
              
              // Update CSS custom properties
              autoplayProgress.style.setProperty('--timer-color', timerColor);
            }
            
            // Connect autoplay progress tracking to Swiper
            const progressCircle = autoplayProgress.querySelector("svg circle");
            const progressContent = autoplayProgress.querySelector("span");
            
            if (progressCircle || progressContent) {
              // Add event listener for autoplay progress
              swiper.on('autoplayTimeLeft', (s, time, progress) => {
                if (progressCircle) {
                  // Calculate stroke-dashoffset for perfect sync
                  // progress goes from 1 (start) to 0 (end), so we need to invert it
                  const circumference = 125.664;
                  const offset = circumference * (1 - progress); // Invert progress for correct direction
                  progressCircle.style.strokeDashoffset = offset + 'px';
                }
                if (progressContent) {
                  // Show remaining time, ensuring it reaches 0
                  const remainingTime = Math.max(0, Math.ceil(time / 1000));
                  progressContent.textContent = `${remainingTime}s`;
                }
              });
              
              // Ensure the circle starts at full (showing no progress)
              if (progressCircle) {
                progressCircle.style.strokeDashoffset = '0px';
              }
            }
          }, 100);
        }
        
        // Add 3D hover effects to the new Swiper instance
        addCardHoverEffects(swiper);

        bindAnimationLifecycle(swiper, container);

        // Trigger animations in the initial slide for cards effect
        triggerAnimationsInCurrentSlide(swiper, container);
      };
      
      // Function to add 3D hover effects only to active card
      const addCardHoverEffects = (swiperInstance) => {
        // Improved constants for smoother 3D effects
        const PERSPECTIVE = 1000;
        const MAX_ROTATION = 3;
        const TRANSITION_DURATION = 200;
        const RESET_DELAY = 100;
        
        let isHovering = false;
        let animationFrameId = null;
        
        // Comprehensive safety check to ensure we don't interfere with video/iframe content
        // This prevents conflicts with video plugin parallax, jarallax, and other media transforms
        const isSafeForTransforms = (element) => {
          if (!element) return false;
          
          const tagName = element.tagName;
          const className = element.className || '';
          const id = element.id || '';
          
          // Check direct element
          if (tagName === 'IFRAME' || tagName === 'VIDEO' || tagName === 'EMBED' || tagName === 'OBJECT') {
            return false;
          }
          
          // Check for video-related classes and IDs
          if (className.includes('jarallax') || className.includes('video') || 
              id.includes('VideoWorker') || id.includes('video')) {
            return false;
          }
          
          // Check for video-related data attributes
          if (element.hasAttribute('data-jarallax') || element.hasAttribute('data-video')) {
            return false;
          }
          
          return true;
        };
        
        const applyTransform = (element, rotateX, rotateY) => {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          
          animationFrameId = requestAnimationFrame(() => {
            element.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
          });
        };
        
        const handleMouseMove = (e) => {
          const theslide = e.currentTarget;
          
          // Only apply hover effect if this is the active slide
          if (!theslide.classList.contains('swiper-slide-active')) return;
          
          // Apply 3D transform ONLY to the immediate child element of .theslide
          // This ensures we don't interfere with video plugin parallax or embedded media
          const childElement = theslide.firstElementChild;
          if (!childElement || !isSafeForTransforms(childElement)) {
            return;
          }
          
          isHovering = true;
          
          const rect = theslide.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          // Calculate rotation based on mouse position relative to center
          const mouseX = e.clientX - centerX;
          const mouseY = e.clientY - centerY;
          
          // Normalize to -1 to 1 range and apply max rotation
          const rotateY = (mouseX / (rect.width / 2)) * MAX_ROTATION;
          const rotateX = -(mouseY / (rect.height / 2)) * MAX_ROTATION;
          
          // Apply bounds to prevent extreme rotations
          const boundedRotateX = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, rotateX));
          const boundedRotateY = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, rotateY));
          
          // Apply transform to the immediate child element
          applyTransform(childElement, boundedRotateX, boundedRotateY);
        };

        const handleMouseEnter = (e) => {
          const theslide = e.currentTarget;
          if (!theslide.classList.contains('swiper-slide-active')) return;
          
          // Apply transition ONLY to the immediate child element
          const childElement = theslide.firstElementChild;
          if (!childElement || !isSafeForTransforms(childElement)) {
            return;
          }
          
          isHovering = true;
          childElement.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.23, 1, 0.320, 1)`;
        };

        const handleMouseLeave = (e) => {
          const theslide = e.currentTarget;
          const childElement = theslide.firstElementChild;
          if (!childElement || !isSafeForTransforms(childElement)) {
            return;
          }
          
          isHovering = false;
          
          // Smooth return to neutral position for the immediate child element
          childElement.style.transition = `transform ${TRANSITION_DURATION * 2}ms cubic-bezier(0.23, 1, 0.320, 1)`;
          
          setTimeout(() => {
            if (!isHovering) {
              applyTransform(childElement, 0, 0);
            }
          }, RESET_DELAY);
        };

        const handleDeviceOrientation = (e) => {
          // Only apply if not currently hovering with mouse
          if (isHovering) return;
          
          const activeSlide = container.querySelector('.swiper-slide-active.theslide');
          if (activeSlide) {
            const childElement = activeSlide.firstElementChild;
            if (!childElement) return;
            
            // Reduce sensitivity for device orientation
            const rotateX = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, (e.beta || 0) * 0.3));
            const rotateY = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, (e.gamma || 0) * 0.3));
            
            applyTransform(childElement, rotateX, rotateY);
          }
        };

        // Device orientation support (only on mobile)
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile && window.DeviceOrientationEvent) {
          window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
        }

        const attachEventsToActiveSlide = () => {
          // Remove events from all slides first and reset their child elements
          const allSlides = container.querySelectorAll('.swiper-slide.theslide');
          allSlides.forEach(slide => {
            slide.removeEventListener('mouseenter', handleMouseEnter);
            slide.removeEventListener('mousemove', handleMouseMove);
            slide.removeEventListener('mouseleave', handleMouseLeave);
            
            // Reset transform and transition on the immediate child elements
            const childElement = slide.firstElementChild;
            if (childElement) {
              childElement.style.transform = `perspective(${PERSPECTIVE}px) rotateX(0deg) rotateY(0deg) translateZ(0)`;
              childElement.style.transition = '';
            }
          });            // Add events only to active slide on non-mobile devices
            if (!isMobile) {
              const activeSlide = container.querySelector('.swiper-slide-active.theslide');
              if (activeSlide && activeSlide.firstElementChild) {
                // Extra safety check: ensure the child element is safe to transform
                const childElement = activeSlide.firstElementChild;
                
                if (isSafeForTransforms(childElement)) {
                  activeSlide.addEventListener('mouseenter', handleMouseEnter, { passive: true });
                  activeSlide.addEventListener('mousemove', handleMouseMove, { passive: true });
                  activeSlide.addEventListener('mouseleave', handleMouseLeave, { passive: true });
                } else {
                }
              }
            }
        };

        // Initial attachment
        attachEventsToActiveSlide();
        
        // Re-attach events when slide changes
        swiperInstance.on('slideChangeTransitionStart', () => {
          isHovering = false;
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          setTimeout(attachEventsToActiveSlide, 50);
        });
        
        // Cleanup on destroy
        swiperInstance.on('destroy', () => {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          if (isMobile && window.DeviceOrientationEvent) {
            window.removeEventListener('deviceorientation', handleDeviceOrientation);
          }
        });
      };
      
      // Initialize cards effect with proper flow
      const initializeCardsEffect = () => {
        // 1. Wrap slides in .theslide containers (preserve original elements)
        wrapSlidesIn3DContainers();
        
        // 2. Reinitialize Swiper to recognize new structure
        setTimeout(() => {
          reinitializeSwiper();
        }, 50);
      };
      
      // Initialize after page load (reduced delay since we're not waiting for complex rendering)
      setTimeout(() => {
        initializeCardsEffect();
      }, 200); // Reduced delay since we're not cloning or reinitializing
    }

    // Apply progress bar color after initialization
    if (showPagination && paginationType === 'progressbar') {
      swiper.on('init', function() {
        const progressBarFill = container.querySelector('.swiper-pagination-progressbar-fill') ||
                               blockWrapper.querySelector('.swiper-pagination-progressbar-fill');
        if (progressBarFill) {
          progressBarFill.style.backgroundColor = bulletColor;
        }
      });
      
      // Also apply color on progress update
      swiper.on('progress', function() {
        const progressBarFill = container.querySelector('.swiper-pagination-progressbar-fill') ||
                               blockWrapper.querySelector('.swiper-pagination-progressbar-fill');
        if (progressBarFill) {
          progressBarFill.style.backgroundColor = bulletColor;
        }
      });
    }

    // Check if arrows should be placed outside the slider
    const arrowsOutside = blockWrapper?.dataset.arrowsOutside === 'true';
    if (arrowsOutside && showNavigation) {
      // Create arrow holder wrapper and restructure DOM
      const arrowHolder = document.createElement('div');
      arrowHolder.className = 'arrowHolder';
      
      // Insert arrow holder before the swiper container
      container.parentNode.insertBefore(arrowHolder, container);
      
      // Find and move navigation buttons outside swiper but inside arrow holder
      const nextButton = container.querySelector('.swiper-button-next');
      const prevButton = container.querySelector('.swiper-button-prev');
      
      // Move swiper container into arrow holder
      arrowHolder.appendChild(container);
      
      // Move navigation buttons outside swiper but inside arrow holder
      if (nextButton) {
        arrowHolder.appendChild(nextButton);
        // Update navigation config to use the moved elements
        config.navigation.nextEl = nextButton;
      }
      
      if (prevButton) {
        arrowHolder.appendChild(prevButton);
        // Update navigation config to use the moved elements
        config.navigation.prevEl = prevButton;
      }
      
      // Re-initialize Swiper with new structure
      swiper.destroy(true, false); // Don't remove elements, just destroy instance
      swiper = new Swiper(container, config);
      
      // Apply enhanced styling classes
      blockWrapper.setAttribute('data-arrows-outside', 'true');
      container.classList.add('arrows-outside');
    } else if (arrowsOutside) {
      // Fallback for when arrows outside is requested but navigation is disabled
      blockWrapper.setAttribute('data-arrows-outside', 'true');
      container.classList.add('arrows-outside');
    }

    bindAnimationLifecycle(swiper, container);
  });

  function clearPendingAnimationReset(container) {
    if (container._aceResetTimer) {
      clearTimeout(container._aceResetTimer);
      container._aceResetTimer = null;
    }
  }

  function scheduleAnimationReset(container, delay = ANIMATION_RESET_DELAY) {
    clearPendingAnimationReset(container);

    container._aceResetTimer = window.setTimeout(() => {
      hideAnimatedElementsInNonActiveSlides(container);
      container._aceResetTimer = null;
    }, delay);
  }

  function bindAnimationLifecycle(swiper, container) {
    swiper.on('slideChangeTransitionStart', function () {
      clearPendingAnimationReset(container);
    });

    swiper.on('slideChangeTransitionEnd', function () {
      scheduleAnimationReset(container);
      triggerAnimationsInCurrentSlide(swiper, container);
    });

    swiper.on('destroy', function () {
      clearPendingAnimationReset(container);
    });
  }

  /**
   * Reset an animated element back to its pre-animation hidden state.
   * Crucially, ALL inline style overrides are removed so they cannot
   * persist across slide visits and fight against the next animation replay.
   */
  function resetAnimatedElement(el) {
    el.style.removeProperty('opacity');
    el.style.removeProperty('visibility');
    el.style.removeProperty('pointer-events');
    el.style.removeProperty('animation-play-state');
    el.style.removeProperty('animation');
    el.style.removeProperty('animation-name');
    el.style.removeProperty('animation-duration');
    el.style.removeProperty('animation-delay');
    el.style.removeProperty('animation-fill-mode');
    el.style.removeProperty('animation-timing-function');
    el.style.removeProperty('animation-iteration-count');
    el.style.removeProperty('transform');
    el.style.removeProperty('transition');
    el.classList.remove('ace-processed', 'ace-show');
    el.classList.add('hidden-animated');
  }

  /**
   * Hide every animated element in slides that are not currently active.
   * Called as soon as a slide change is committed so that the outgoing
   * slide's elements are reset before they scroll out of view.
   */
  function hideAnimatedElementsInNonActiveSlides(container) {
    container.querySelectorAll('.swiper-slide').forEach(slide => {
      if (slide.classList.contains('swiper-slide-active')) return;
      slide.querySelectorAll(ANIM_SELECTOR).forEach(resetAnimatedElement);
    });
  }

  /**
   * Replay entry animations in the currently active slide.
   *
   * Inactive slides are reset separately after their transition finishes,
   * so this function only needs to re-arm the elements inside the active
   * slide before replaying their entry animation.
   *
   *  1. Reset active-slide animatables into the hidden base state.
   *  2. Remove named animation classes while still hidden.
   *  3. Force a reflow so the browser treats the next class add as a fresh run.
   *  4. Lift the hidden state and re-add the animation classes in one batch.
   *
   * No inline opacity/visibility is ever SET here – letting the CSS
   * animation own those values entirely is what makes the replay clean.
   */
  function triggerAnimationsInCurrentSlide(swiper, container) {
    // Cancel any pending animation frame from a previous rapid call.
    if (container._aceAnimFrame) cancelAnimationFrame(container._aceAnimFrame);

    container._aceAnimFrame = requestAnimationFrame(() => {
      const activeSlide = container.querySelector('.swiper-slide-active');
      if (!activeSlide) return;

      // Replay elements in the active slide after the reset paint has
      // been committed by the browser.
      requestAnimationFrame(() => {
        activeSlide.querySelectorAll(ANIM_SELECTOR).forEach(el => {
          resetAnimatedElement(el);

          const animClasses = Array.from(el.classList).filter(isAnimClass);
          if (!animClasses.length) return;

          // Strip any lingering inline overrides (e.g. set by 3rd-party
          // animation plugins that have already fired once).
          el.style.removeProperty('opacity');
          el.style.removeProperty('visibility');
          el.style.removeProperty('pointer-events');
          el.style.removeProperty('animation-play-state');
          el.style.removeProperty('animation');
          el.style.removeProperty('animation-name');
          el.style.removeProperty('animation-duration');
          el.style.removeProperty('animation-delay');
          el.style.removeProperty('animation-fill-mode');
          el.style.removeProperty('animation-timing-function');
          el.style.removeProperty('animation-iteration-count');
          el.style.removeProperty('transform');
          el.style.removeProperty('transition');

          // Remove named animation classes while hidden-animated keeps
          // the element invisible – no visible intermediate state.
          animClasses.forEach(c => el.classList.remove(c));

          // Commit the removal so the browser registers it as a new
          // animation start when we add the classes back.
          void el.offsetWidth;

          // Lift the hidden state and fire the animation in one batch.
          // The @keyframes `from` block now controls opacity from zero.
          el.classList.remove('hidden-animated', 'ace-processed', 'ace-show');
          // Otter removes `.animated` on animationend and gates animations
          // behind `.o-anim-ready`; ensure both are present for replay.
          el.classList.add('animated', 'o-anim-ready');
          animClasses.forEach(c => el.classList.add(c));

          // Mark complete once the animation finishes.
          el.addEventListener('animationend', () => {
            el.classList.add('ace-processed');
          }, { once: true });
        });
      });
    });
  }
});

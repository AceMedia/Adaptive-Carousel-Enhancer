// Only the Swiper modules the block can switch on: swiper/bundle also carried Virtual, Zoom,
// Thumbs, Controller, Grid, Parallax, Manipulation, HashNavigation, History and the creative
// effect. A11y stays: it gives slides and buttons their roles and labels. The rarer modules live in
// swiper-extras.js and load only on pages that use them (see the bottom of this file).
import Swiper from 'swiper';
import A11y from 'swiper-modules/a11y.mjs';
import Autoplay from 'swiper-modules/autoplay.mjs';
import Keyboard from 'swiper-modules/keyboard.mjs';
import Navigation from 'swiper-modules/navigation.mjs';
import Pagination from 'swiper-modules/pagination.mjs';

Swiper.use([A11y, Autoplay, Keyboard, Navigation, Pagination]);

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

  const autoplayDelay = Math.max(1000, parseInt(blockWrapper.dataset.autoplayDelay || '3000', 10));

  const getProgressbarFill = () => (
    container.querySelector('.swiper-pagination-progressbar-fill') ||
    blockWrapper.querySelector('.swiper-pagination-progressbar-fill')
  );

  const getProgressbarEl = () => (
    container.querySelector('.swiper-pagination-progressbar') ||
    blockWrapper.querySelector('.swiper-pagination-progressbar')
  );

  const getTotalSlides = () => {
    if (swiper.params?.loop) {
      const uniqueSlides = container.querySelectorAll('.swiper-wrapper > .swiper-slide:not(.swiper-slide-duplicate)');
      return uniqueSlides.length || swiper.slides.length || 1;
    }
    return swiper.slides.length || 1;
  };

  const getCurrentSlideIndex = () => {
    if (typeof swiper.realIndex === 'number') {
      return swiper.realIndex;
    }
    return typeof swiper.activeIndex === 'number' ? swiper.activeIndex : 0;
  };

  const setFillProgress = (value, durationMs = 0) => {
    const fill = getProgressbarFill();
    if (!fill) return;

    const clamped = Math.max(0, Math.min(1, value));
    const progressbarEl = getProgressbarEl();

    if (progressbarEl) {
      progressbarEl.classList.add('ace-progressbar-timer-active');
    }

    fill.style.transformOrigin = 'left top';
    fill.style.transitionProperty = 'width';
    fill.style.transitionTimingFunction = 'linear';
    fill.style.transitionDuration = `${Math.max(0, durationMs)}ms`;
    fill.style.width = `${clamped * 100}%`;
    fill.style.transform = 'translate3d(0px, 0px, 0px) scaleX(1) scaleY(1)';
  };

  const setChunkTimerProgress = (progress) => {
    const totalSlides = Math.max(1, getTotalSlides());
    const currentSlide = Math.max(0, Math.min(totalSlides - 1, getCurrentSlideIndex()));
    const elapsedInSlide = Math.max(0, Math.min(1, 1 - progress));
    const overallProgress = (currentSlide + elapsedInSlide) / totalSlides;
    setFillProgress(overallProgress);
  };

  let isTransitioning = false;
  let previousSlideIndex = getCurrentSlideIndex();
  let userInteractionPending = false;
  let manualHold = false;

  const resetCurrentSlideTimer = () => {
    const total = Math.max(1, getTotalSlides());
    const current = Math.max(0, Math.min(total - 1, getCurrentSlideIndex()));

    // At loop reset, restart bar from 0 instead of staying at the last chunk.
    const isLoopReset = swiper.params?.loop && current === 0;
    setFillProgress(isLoopReset ? 0 : current / total);
  };

  // Start at the beginning of the current slide's chunk.
  const totalSlides = Math.max(1, getTotalSlides());
  const currentSlide = Math.max(0, Math.min(totalSlides - 1, getCurrentSlideIndex()));
  setFillProgress(currentSlide / totalSlides);

  // Mark likely manual interactions so manual-only timer behavior is deterministic.
  container.addEventListener('pointerdown', () => {
    userInteractionPending = true;
  }, true);

  container.addEventListener('touchstart', () => {
    userInteractionPending = true;
  }, { passive: true, capture: true });

  container.addEventListener('click', (event) => {
    if (event.target.closest('.swiper-button-next, .swiper-button-prev, .swiper-pagination')) {
      userInteractionPending = true;
    }
  }, true);

  swiper.on('slideChangeTransitionStart', () => {
    isTransitioning = true;

    const total = Math.max(1, getTotalSlides());
    const current = Math.max(0, Math.min(total - 1, getCurrentSlideIndex()));

    if (!userInteractionPending) {
      // Autoplay-driven change: finish the chunk for the slide that just ended.
      const endedSlide = Math.max(0, Math.min(total - 1, previousSlideIndex));
      setFillProgress((endedSlide + 1) / total);
    } else {
      // Manual change: animate to the end of the selected/current slide and hold.
      const manualTweenDuration = Math.max(120, parseInt(swiper.params?.speed || 300, 10));
      setFillProgress((current + 1) / total, manualTweenDuration);
      manualHold = true;
    }
  });

  swiper.on('slideChangeTransitionEnd', () => {
    previousSlideIndex = getCurrentSlideIndex();

    if (!userInteractionPending) {
      // Resume timer from start of next chunk for autoplay flow.
      resetCurrentSlideTimer();
    }

    isTransitioning = false;
    userInteractionPending = false;
  });

  swiper.on('autoplayStart', () => {
    manualHold = false;
    resetCurrentSlideTimer();
  });

  swiper.on('autoplayStop', () => {
    manualHold = false;
  });

  swiper.on('autoplayTimeLeft', (_s, _time, progress) => {
    if (isTransitioning || manualHold) return;
    setChunkTimerProgress(progress);
  });

  swiper.on('destroy', () => {
    if (container.__aceProgressbarTimerInterval) {
      clearInterval(container.__aceProgressbarTimerInterval);
      container.__aceProgressbarTimerInterval = null;
    }
  });
}

// ---------------------------------------------------------------------------
// Desktop peek helpers
// ---------------------------------------------------------------------------
const PEEK_DESKTOP = window.matchMedia('(min-width: 782px)');
const PEEK_MAX_BLEED = 48;
const peekBlocks = new Set();

// How far the carousel can widen into the side padding of the column it sits in, without passing
// that column's edges, so the page never scrolls sideways. Read once per block and on resize.
function setPeekBleed(blockWrapper) {
  if (!blockWrapper) {
    return;
  }
  peekBlocks.add(blockWrapper);
  const parent = blockWrapper.parentElement;
  const column = parent?.closest('.wp-block-column') || parent?.closest('main') || parent;
  if (!column || !PEEK_DESKTOP.matches) {
    blockWrapper.style.setProperty('--ace-peek-bleed', '0px');
    return;
  }
  const current = parseFloat(blockWrapper.style.getPropertyValue('--ace-peek-bleed')) || 0;
  const block = blockWrapper.getBoundingClientRect();
  const frame = column.getBoundingClientRect();
  const room = Math.min(block.left + current - frame.left, frame.right - (block.right - current));
  const bleed = Math.max(0, Math.min(PEEK_MAX_BLEED, Math.floor(room)));
  blockWrapper.style.setProperty('--ace-peek-bleed', `${bleed}px`);
}

let peekResizeFrame = 0;
window.addEventListener('resize', () => {
  cancelAnimationFrame(peekResizeFrame);
  peekResizeFrame = requestAnimationFrame(() => peekBlocks.forEach(setPeekBleed));
});

// The slides either side overhang the frame, so focusing a control or a link in a slide can make
// the browser scroll a clipping ancestor (overflow hidden is still scrollable by script and focus),
// which leaves the whole carousel off-centre. Put any such ancestor back.
function resetClippedScroll(blockWrapper) {
  for (let el = blockWrapper.parentElement; el && el !== document.body; el = el.parentElement) {
    if (el.scrollLeft && getComputedStyle(el).overflowX === 'hidden') {
      el.scrollLeft = 0;
    }
  }
}

function bindPeekScrollGuard(swiper, blockWrapper) {
  const reset = () => requestAnimationFrame(() => resetClippedScroll(blockWrapper));
  if (!blockWrapper.aceScrollGuard) {
    blockWrapper.aceScrollGuard = true;
    blockWrapper.addEventListener('focusin', reset);
  }
  swiper.on('slideChangeTransitionEnd', reset);
}

// Swiper's loop moves slide nodes around the track when it slides to a focused slide, and a moved
// node loses focus, so a keyboard user tabbing into the carousel lands back on <body>. Put focus
// back on the element that had it.
function bindFocusKeeper(swiper, blockWrapper) {
  if (!blockWrapper) {
    return;
  }
  const restore = () => {
    const last = blockWrapper.aceLastFocus;
    if (last && last.isConnected && (document.activeElement === document.body || !document.activeElement)) {
      last.focus({ preventScroll: true });
    }
  };
  const later = () => setTimeout(restore, 0);
  if (!blockWrapper.aceFocusKeeper) {
    blockWrapper.aceFocusKeeper = true;
    blockWrapper.addEventListener('focusin', (event) => {
      blockWrapper.aceLastFocus = event.target;
    });
    blockWrapper.addEventListener('focusout', (event) => {
      if (event.relatedTarget && !blockWrapper.contains(event.relatedTarget)) {
        blockWrapper.aceLastFocus = null; // focus left the carousel on purpose
      } else if (!event.relatedTarget) {
        later();
      }
    });
  }
  swiper.on('loopFix', later);
  swiper.on('slideChange', later);
  swiper.on('slideChangeTransitionEnd', restore);
}

// A click on a slide that is only peeking brings it into view instead of following its link, as
// on phones. Keyboard focus already does the same through Swiper's A11y module.
function bindPeekClicks(swiper, container) {
  // Mark the slides in view, so the peeking ones can sit back. Swiper's own fully-visible class
  // misses a slide that overhangs the frame by a fraction of a pixel.
  const markCurrent = () => {
    if (swiper.destroyed) {
      return;
    }
    const perView = Math.max(1, Math.round(parseFloat(swiper.params.slidesPerView) || 1));
    swiper.slides.forEach((slide, index) => {
      slide.classList.toggle('ace-peek-current', index >= swiper.activeIndex && index < swiper.activeIndex + perView);
    });
  };
  markCurrent();
  ['slideChange', 'loopFix', 'breakpoint', 'resize'].forEach((name) => swiper.on(name, markCurrent));

  // While a reader drags, each slide grows towards full size and strength as it nears the current
  // place, and the one leaving sits back, so the slide being pulled in already looks like the current
  // one. On release the classes take over again and the slides ease to their resting sizes.
  const DRAG_SCALE = 0.94;
  const DRAG_OPACITY = 0.55;
  const clearDrag = () => {
    container.classList.remove('ace-pc-dragging');
    swiper.slides.forEach((slide) => {
      slide.style.removeProperty('--ace-drag-s');
      slide.style.removeProperty('--ace-drag-o');
      slide.style.removeProperty('--ace-drag-origin');
    });
  };
  swiper.on('sliderMove', () => {
    if (swiper.destroyed || !PEEK_DESKTOP.matches || container.matches('.ace-tuck-prev, .ace-tuck-next')) {
      return;
    }
    container.classList.add('ace-pc-dragging');
    const gap = parseFloat(swiper.params.spaceBetween) || 0;
    swiper.slides.forEach((slide, index) => {
      const left = (slide.swiperSlideOffset || 0) + swiper.translate;
      const step = (swiper.slidesSizesGrid[index] || slide.offsetWidth || 1) + gap;
      const near = Math.max(0, Math.min(1, 1 - Math.abs(left) / step));
      slide.style.setProperty('--ace-drag-s', (DRAG_SCALE + (1 - DRAG_SCALE) * near).toFixed(4));
      slide.style.setProperty('--ace-drag-o', (DRAG_OPACITY + (1 - DRAG_OPACITY) * near).toFixed(3));
      slide.style.setProperty('--ace-drag-origin', left < 0 ? 'right center' : 'left center');
    });
  });
  ['touchEnd', 'slideChange', 'resize'].forEach((name) => swiper.on(name, clearDrag));

  container.addEventListener('click', (event) => {
    if (!PEEK_DESKTOP.matches || swiper.destroyed) {
      return;
    }
    const slide = event.target.closest('.swiper-slide');
    if (!slide || slide.classList.contains('ace-peek-current') || event.target.closest('.swiper-button-prev, .swiper-button-next, .swiper-pagination')) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const index = swiper.slides.indexOf(slide);
    if (index < 0) {
      return;
    }
    if (index < swiper.activeIndex) {
      swiper.slidePrev();
    } else {
      swiper.slideNext();
    }
  }, true);
}

// Reduced motion: the device setting, or the reader's own choice from an accessibility panel that
// sets html.ace-a11y-reduce-motion and window.aceReducedMotion (announced with ace-a11y:motion).
function wantsReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('ace-a11y-reduce-motion') ||
    window.aceReducedMotion === true;
}

// Peek controls: with the slides either side showing, the arrows sit on those slides, the bullets
// sit under the carousel on the page, and the autoplay timer is a slim ring on the active bullet,
// so the current slide holds only its content. Built before Swiper starts (the buttons and bullets
// move into a bar after the slider), then laid out from what is measured.
const PC_MIN_STRIP = 22; // below this the side slides are too thin to carry an arrow
const PC_RING = '<span class="ace-pc-ring" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">' +
  '<circle class="ace-pc-ring-track" cx="12" cy="12" r="9.6" pathLength="100"></circle>' +
  '<circle class="ace-pc-ring-fill" cx="12" cy="12" r="9.6" pathLength="100"></circle></svg></span>';

function buildPeekControls(blockWrapper, container, config) {
  const bar = document.createElement('div');
  bar.className = 'ace-pc-bar';
  container.after(bar);
  const prev = container.querySelector(':scope > .swiper-button-prev');
  const next = container.querySelector(':scope > .swiper-button-next');
  const pagination = config.pagination?.el;
  if (prev) {
    bar.appendChild(prev);
  }
  if (pagination) {
    bar.appendChild(pagination);
  }
  if (next) {
    bar.appendChild(next);
  }
  blockWrapper.classList.add('ace-peek-controls');
  return bar;
}

function layoutPeekControls(swiper, blockWrapper, container) {
  if (swiper.destroyed) {
    return;
  }
  const block = blockWrapper.getBoundingClientRect();
  const frame = container.getBoundingClientRect();
  const gap = Math.max(0, parseFloat(swiper.params.spaceBetween) || 0);
  const left = Math.max(0, frame.left - block.left);
  const right = Math.max(0, block.right - frame.right);
  const strip = Math.min(left, right) - gap;
  const style = blockWrapper.style;
  style.setProperty('--ace-pc-l', `${Math.round(left)}px`);
  style.setProperty('--ace-pc-r', `${Math.round(right)}px`);
  style.setProperty('--ace-pc-gap', `${Math.round(gap)}px`);
  style.setProperty('--ace-pc-top', `${Math.round(frame.top - block.top)}px`);
  style.setProperty('--ace-pc-h', `${Math.round(frame.height)}px`);
  style.setProperty('--ace-pc-btn', `${Math.round(Math.max(24, Math.min(36, strip - 4)))}px`);
  style.setProperty('--ace-pc-tuck', `${Math.round(Math.max(12, Math.min(36, strip * .75)))}px`);
  blockWrapper.classList.toggle('ace-pc-compact', strip < PC_MIN_STRIP);
}

function bindPeekControls(swiper, blockWrapper, container, autoplayWanted) {
  const bar = blockWrapper.querySelector(':scope > .ace-pc-bar');
  const layout = () => layoutPeekControls(swiper, blockWrapper, container);
  layout();
  ['breakpoint', 'resize', 'slideChangeTransitionEnd'].forEach((name) => swiper.on(name, layout));
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => requestAnimationFrame(layout));
    observer.observe(blockWrapper);
    observer.observe(container);
  }
  // Measure again once the slider and any side columns have settled (a menu folding away moves the
  // frame without always resizing it).
  [250, 900].forEach((delay) => setTimeout(layout, delay));
  // Only transitions that can move the frame within the block: a box changing size outside the
  // carousel (a side column, the left navigation). The carousel's own slides and dots, and paint-only
  // changes anywhere (the ticker gliding, a colour fading), re-measured the page dozens of times a minute.
  let layoutFrame = 0;
  const queueLayout = () => {
    if (!layoutFrame) {
      layoutFrame = requestAnimationFrame(() => {
        layoutFrame = 0;
        layout();
      });
    }
  };
  const SIZING = /^(width|height|min-|max-|margin|padding|border-width|left|right|inset|flex|grid-template|font-size|letter-spacing|gap|column-gap)/;
  document.addEventListener('pp:left-nav', queueLayout);
  document.addEventListener('transitionend', (event) => {
    if (SIZING.test(event.propertyName) && !blockWrapper.contains(event.target)) {
      queueLayout();
    }
  });
  window.addEventListener('load', layout);

  // The timer ring on every bullet; only the active one shows it.
  const addRings = () => {
    blockWrapper.querySelectorAll('.swiper-pagination-bullet').forEach((bullet) => {
      if (!bullet.querySelector('.ace-pc-ring')) {
        bullet.insertAdjacentHTML('beforeend', PC_RING);
      }
    });
  };
  addRings();
  swiper.on('paginationRender', addRings);
  const setRing = (progress) => {
    const fill = blockWrapper.querySelector('.swiper-pagination-bullet-active .ace-pc-ring-fill');
    if (fill) {
      fill.style.strokeDashoffset = (100 * (1 - Math.max(0, Math.min(1, progress)))).toFixed(2);
    }
  };
  swiper.on('paginationUpdate', () => {
    blockWrapper.querySelectorAll('.ace-pc-ring-fill').forEach((fill) => { fill.style.strokeDashoffset = '0'; });
  });
  swiper.on('autoplayTimeLeft', (_s, _time, progress) => setRing(progress));
  const markStopped = () => blockWrapper.classList.toggle('ace-pc-stopped', !(swiper.autoplay && swiper.autoplay.running));
  markStopped();
  ['autoplayStart', 'autoplayStop'].forEach((name) => swiper.on(name, markStopped));

  // Slides change at the slider's speed; the side slides' own transitions follow it.
  blockWrapper.style.setProperty('--ace-pc-speed', `${Math.max(0, parseInt(swiper.params.speed, 10) || 0)}ms`);

  // While the timer is held for an interaction, the active dot becomes a play button that carries on.
  const PLAY_LABEL = 'Play the slideshow';
  let labelled = null;
  // The play button is only for a slideshow a reader has stopped (a swipe, an arrow or a dot, which
  // stop autoplay); pointing at the carousel or focusing inside it only pauses the timer for as long as
  // that lasts, so the dot stays a dot and the ring simply holds still.
  const isHeld = () => !!(autoplayWanted && swiper.autoplay && swiper.params.autoplay && !wantsReducedMotion() &&
    !document.documentElement.classList.contains('pp-intro-c') && !swiper.autoplay.running);
  const markHeld = () => {
    const held = isHeld();
    blockWrapper.classList.toggle('ace-pc-paused', held);
    const active = blockWrapper.querySelector('.ace-pc-bar .swiper-pagination-bullet-active');
    if (labelled && (labelled !== active || !held)) {
      labelled.setAttribute('aria-label', labelled.aceLabel || '');
      labelled = null;
    }
    if (held && active && labelled !== active) {
      active.aceLabel = active.getAttribute('aria-label') || '';
      active.setAttribute('aria-label', PLAY_LABEL);
      labelled = active;
    }
  };
  ['autoplayStart', 'autoplayStop', 'autoplayPause', 'autoplayResume', 'paginationUpdate'].forEach((name) => swiper.on(name, markHeld));
  ['pointerenter', 'pointerleave', 'focusin', 'focusout'].forEach((name) => blockWrapper.addEventListener(name, () => requestAnimationFrame(markHeld)));
  markHeld();
  bar?.addEventListener('click', (event) => {
    const bullet = event.target.closest('.swiper-pagination-bullet-active');
    if (!bullet || !blockWrapper.classList.contains('ace-pc-paused')) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    bar.aceHoverPaused = false;
    blockWrapper.aceFocusPaused = false;
    if (!swiper.autoplay.running) {
      swiper.autoplay.start();
    } else if (swiper.autoplay.paused) {
      swiper.autoplay.resume();
    }
    markHeld();
  }, true);
  bar?.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('.swiper-pagination-bullet-active') && blockWrapper.classList.contains('ace-pc-paused')) {
      event.preventDefault();
      event.target.click();
    }
  }, true);

  // Keyboard focus inside the carousel pauses the timer, as hovering does.
  blockWrapper.addEventListener('focusin', () => {
    if (swiper.autoplay?.running && !swiper.autoplay.paused) {
      swiper.autoplay.pause();
      blockWrapper.aceFocusPaused = true;
    }
  });
  blockWrapper.addEventListener('focusout', (event) => {
    if (blockWrapper.aceFocusPaused && !blockWrapper.contains(event.relatedTarget)) {
      blockWrapper.aceFocusPaused = false;
      if (swiper.autoplay?.running && swiper.autoplay.paused) {
        swiper.autoplay.resume();
      }
    }
  });

  // Hovering or focusing a side slide or its arrow tucks that slide in a little.
  const tuck = (side) => {
    blockWrapper.classList.toggle('ace-tuck-prev', side === 'prev');
    blockWrapper.classList.toggle('ace-tuck-next', side === 'next');
  };
  container.addEventListener('mouseover', (event) => {
    const slide = event.target.closest('.swiper-slide');
    tuck(slide?.classList.contains('swiper-slide-prev') ? 'prev' : slide?.classList.contains('swiper-slide-next') ? 'next' : '');
  });
  container.addEventListener('mouseleave', () => tuck(''));
  [['prev', '.swiper-button-prev'], ['next', '.swiper-button-next']].forEach(([side, selector]) => {
    const button = bar?.querySelector(selector);
    if (!button) {
      return;
    }
    button.addEventListener('mouseenter', () => tuck(side));
    button.addEventListener('focus', () => tuck(side));
    button.addEventListener('mouseleave', () => tuck(''));
    button.addEventListener('blur', () => tuck(''));
  });
  // A move drops the tuck, and the slide that arrives at the side stays sat back, faded and smaller,
  // even with the pointer still on its arrow: it only comes forward when the reader points at it again.
  swiper.on('slideChangeTransitionStart', () => tuck(''));

  // Swiper only pauses for a pointer over the slider itself; the arrows and bullets now sit
  // outside it, so pause for them too.
  if (bar && swiper.params.autoplay?.pauseOnMouseEnter) {
    bar.addEventListener('mouseenter', () => {
      if (swiper.autoplay?.running && !swiper.autoplay.paused) {
        swiper.autoplay.pause();
        bar.aceHoverPaused = true;
      }
    });
    bar.addEventListener('mouseleave', () => {
      if (bar.aceHoverPaused) {
        bar.aceHoverPaused = false;
        if (swiper.autoplay?.running && swiper.autoplay.paused && !blockWrapper.aceFocusPaused) {
          swiper.autoplay.resume();
        }
      }
    });
  }

  // A change to the reader's motion setting stops or restarts autoplay at once.
  document.addEventListener('ace-a11y:motion', () => {
    if (!swiper.autoplay || swiper.destroyed) {
      return;
    }
    if (wantsReducedMotion()) {
      swiper.autoplay.stop();
    } else if (autoplayWanted && !swiper.autoplay.running) {
      swiper.params.autoplay.enabled = true;
      swiper.autoplay.start();
    }
    markStopped();
  });
}

// Desktop titles that fit their slide: each slide's title grows or shrinks between a minimum and a
// maximum so it fills the space its slide has for it, measured per slide (as the phone layout does
// by title length). The slides keep the height they had, so nothing around the carousel moves, and
// titles only ever change size, never break mid-word.
const FIT_MIN = 22;
function fitSlideTitles(swiper, blockWrapper) {
  if (swiper.destroyed) {
    return;
  }
  const slides = Array.from(swiper.slides);
  const titles = slides.map((slide) => slide.querySelector('.wp-block-post-title'));
  slides.forEach((slide, i) => {
    slide.style.minHeight = '';
    if (titles[i]) {
      titles[i].style.fontSize = '';
    }
  });
  if (!PEEK_DESKTOP.matches || !titles.some(Boolean)) {
    blockWrapper.classList.remove('ace-titles-fitted');
    return;
  }
  blockWrapper.classList.add('ace-titles-fitting');
  const height = Math.max(...slides.map((slide) => slide.getBoundingClientRect().height));
  slides.forEach((slide) => { slide.style.minHeight = `${Math.round(height)}px`; });
  // All the slides are fitted together, one step at a time: every title is set to its next trial size,
  // then all are measured in one pass. Fitting them one by one cost a whole-page layout per trial per
  // slide (well over a hundred on a looping carousel); this costs one per step.
  const jobs = [];
  slides.forEach((slide, i) => {
    const title = titles[i];
    if (!title) {
      return;
    }
    // The room the title has: the slide's inner height (inside the cover's padding, and the padding of
    // the column the text sits in, where a theme pads that instead) less the rest of the text group.
    const box = slide.querySelector('.wp-block-cover') || slide;
    const group = title.parentElement;
    const boxStyle = getComputedStyle(box);
    const column = title.closest('.wp-block-column');
    const columnStyle = column && box.contains(column) ? getComputedStyle(column) : null;
    const inner = height - (parseFloat(boxStyle.paddingTop) || 0) - (parseFloat(boxStyle.paddingBottom) || 0)
      - (columnStyle ? (parseFloat(columnStyle.paddingTop) || 0) + (parseFloat(columnStyle.paddingBottom) || 0) : 0);
    const titleHeight = title.getBoundingClientRect().height;
    const budget = inner - (group.getBoundingClientRect().height - titleHeight) - 4;
    const max = Math.max(FIT_MIN, Math.min(64, title.clientWidth * 0.16));
    jobs.push({ title, budget, max, low: FIT_MIN, high: max, done: false, trial: max });
  });
  const fits = (job) => job.title.getBoundingClientRect().height <= job.budget && job.title.scrollWidth <= job.title.clientWidth + 1;
  // First try every title at its largest size; those that fit are finished.
  jobs.forEach((job) => { job.title.style.fontSize = `${job.max}px`; });
  jobs.forEach((job) => { job.done = fits(job); });
  for (let step = 0; step < 7; step++) {
    const open = jobs.filter((job) => !job.done);
    if (!open.length) {
      break;
    }
    open.forEach((job) => {
      job.trial = (job.low + job.high) / 2;
      job.title.style.fontSize = `${job.trial}px`;
    });
    open.forEach((job) => {
      if (fits(job)) {
        job.low = job.trial;
      } else {
        job.high = job.trial;
      }
    });
  }
  jobs.filter((job) => !job.done).forEach((job) => { job.title.style.fontSize = `${Math.floor(job.low)}px`; });
  blockWrapper.classList.remove('ace-titles-fitting');
  blockWrapper.classList.add('ace-titles-fitted');
}

// The slide text stays hidden until it is fitted (see style.scss), so it can change size without
// moving anything a reader can see. Fit once the web fonts have arrived, so the size is not worked
// out twice (once in the fallback font, again in Paddy Sans), and never wait past FIT_WAIT.
const FIT_WAIT = 2500;
function bindTitleFit(swiper, blockWrapper) {
  const run = () => fitSlideTitles(swiper, blockWrapper);
  if (document.fonts?.ready && document.fonts.status !== 'loaded') {
    let fitted = false;
    const first = () => {
      if (!fitted) {
        fitted = true;
        run();
      }
    };
    const timer = setTimeout(first, FIT_WAIT);
    document.fonts.ready.then(() => {
      clearTimeout(timer);
      if (fitted) {
        run(); // the fonts came after the wait ran out
      } else {
        first();
      }
    });
  } else {
    run();
  }
  let timer = 0;
  const later = () => {
    clearTimeout(timer);
    timer = setTimeout(run, 160);
  };
  window.addEventListener('resize', later);
  // The reader's font style and headline settings change the type, so the titles are fitted again.
  document.addEventListener('pp:font-style', later);
  document.addEventListener('pp:headline-sizes', later);
  // A font switch asks for the new face's sizes straight away, before it types the new face in.
  document.addEventListener('pp:fit-now', run);
  swiper.on('breakpoint', run);
}

// Accept colour values only, never markup, declarations or CSS URLs.
function safeColour(value, fallback) {
  return typeof value === 'string' && /^#[0-9a-f]{3,8}$/i.test(value) && [4, 5, 7, 9].includes(value.length) ? value : fallback;
}

function initCarousels() {
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
  
  const setupCarousel = (container) => {
    container.classList.remove('ace-carousel-waiting');
    const blockWrapper = container.closest('.swiper-slider-block');

    // Immediately hide all animated elements before any Swiper initialization to prevent flicker
    const preInitAnimatedElements = container.querySelectorAll('.animated, [class*="fadeIn"], [class*="bounceIn"], [class*="slideIn"], [class*="zoomIn"], [class*="rotateIn"], [class*="flipIn"], [class*="backIn"], [class*="lightSpeedIn"], [class*="rollIn"], [class*="jackInTheBox"], [class*="bounce"], [class*="flash"], [class*="pulse"], [class*="rubberBand"], [class*="shake"], [class*="swing"], [class*="tada"], [class*="wobble"], [class*="jello"], [class*="heartBeat"], [class*="hinge"]');
    
    preInitAnimatedElements.forEach(element => {
      element.classList.add('hidden-animated');
      element.style.opacity = '0';
      element.style.visibility = 'hidden';
    });
    
    // Fetch color settings and contrast mode from dataset
    const arrowColor = safeColour(blockWrapper?.dataset.arrowColor, '#000000');
    const bulletColor = safeColour(blockWrapper?.dataset.bulletColor, '#000000');
    const timerColor = safeColour(blockWrapper?.dataset.timerColor, '#FFFFFF');
    blockWrapper.style.setProperty('--bullet-color', bulletColor);
    const arrowContrastMode = blockWrapper?.dataset.arrowContrastMode === 'true';
    const bulletContrastMode = blockWrapper?.dataset.bulletContrastMode === 'true';
    const timerContrastMode = blockWrapper?.dataset.timerContrastMode !== 'false';

    // A query's slide list arrives in the wrapper's place (ul.ace-slide-list, from the render callback). It
    // takes the wrapper's role here by class alone, ending with the same classes the list built below has,
    // so its slides are never taken out of the page and put back: that made the browser paint the first
    // slide's image a second time when the carousel started.
    const servedList = Array.from(container.children).find((child) => child.tagName === 'UL' && child.classList.contains('ace-slide-list'));
    if (servedList) {
      const servedWoo = servedList.classList.contains('wc-block-product-template');
      const servedPosts = servedList.classList.contains('wp-block-post-template');
      servedList.className = 'swiper-wrapper' + (servedWoo ? ' wc-block-product-template' : '') + (servedPosts ? ' wp-block-post-template' : '');
    }

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

        ulChildren.filter((child) => !child.classList.contains('ace-variation-tile')).forEach((child) => {
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

    // Optional phone settings, as data attributes: a slide limit and a peek at the slides either side.
    const onPhone = window.matchMedia('(max-width: 781px)').matches;
    const mobileMaxSlides = parseInt(blockWrapper?.dataset.mobileMaxSlides || '0', 10);
    if (onPhone && mobileMaxSlides > 0 && updatedWrapper) {
      Array.from(updatedWrapper.children).slice(mobileMaxSlides).forEach((child) => child.remove());
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

      // Slides sit in a ul (the post template), so they must stay list items rather than A11y's default "group".
      a11y: { slideRole: 'listitem' },
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
            // A custom renderBullet stops Swiper's A11y module naming the bullets, so name them here.
            const a11yAttrs = paginationClickable ? ` role="button" aria-label="Go to slide ${index + 1}"` : '';
            return `<span class="${className}" ${colorStyle}${a11yAttrs}></span>`;
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
    const useProgressbarAsTimer = autoplay && showPagination && paginationType === 'progressbar' && blockWrapper?.dataset.progressbarAutoplayTimer === 'true';
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

    if (blockWrapper?.dataset.mobilePeek === 'true' && config.slidesPerView === 1 && effect === 'slide') {
      config.breakpoints = {
        // One slide per view in a frame inset from the screen edges (style.scss), rather than 1.14
        // slides: Swiper's loop then needs only two slides, so three still keep a slide each side.
        0: { slidesPerView: 1, spaceBetween: 8, centeredSlides: true },
        782: { slidesPerView: 1, spaceBetween: config.spaceBetween, centeredSlides: config.centeredSlides },
      };
    }

    // Desktop peek: from 782px the carousel widens into its column's side padding and insets the
    // slides, so the slides either side show at the edges (style.scss does the insetting). Works
    // for any number of slides per view, as it only narrows the frame Swiper measures.
    const desktopPeek = blockWrapper?.dataset.desktopPeek === 'true' && effect === 'slide' && config.direction === 'horizontal';
    if (desktopPeek) {
      const peekGap = Math.min(config.spaceBetween, 16);
      Object.keys(config.breakpoints).forEach((width) => {
        if (parseInt(width, 10) >= 782) {
          config.breakpoints[width] = { ...config.breakpoints[width], spaceBetween: peekGap };
        }
      });
      const below = Object.keys(config.breakpoints).map(Number).filter((width) => width < 782).sort((a, b) => b - a)[0];
      if (!config.breakpoints[782]) {
        config.breakpoints[782] = { ...(below !== undefined ? config.breakpoints[below] : {}), spaceBetween: peekGap };
      }
      // One slide per view: centring it changes nothing on screen but makes a looping carousel keep
      // a slide on each side of the current one, even with only three, so both peeks always show.
      if (config.slidesPerView === 1 && config.loop) {
        Object.keys(config.breakpoints).forEach((width) => {
          if (parseInt(width, 10) >= 782) {
            config.breakpoints[width].centeredSlides = true;
          }
        });
      }
      setPeekBleed(blockWrapper);
    }

    // The device's reduced-motion setting, or the site's own Reduce motion switch (window.aceReducedMotion,
    // set before first paint by the settings panel).
    if (wantsReducedMotion()) {
      // Keep the settings so autoplay can start later if the reader turns reduced motion off.
      if (config.autoplay) {
        config.autoplay.enabled = false;
      }
      if (desktopPeek || blockWrapper?.dataset.mobilePeek === 'true') {
        config.speed = 0;
      }
    }

    const peekControls = (desktopPeek || (blockWrapper?.dataset.mobilePeek === 'true' && config.slidesPerView === 1 && effect === 'slide')) &&
      blockWrapper?.dataset.peekControls !== 'false' && blockWrapper?.dataset.arrowsOutside !== 'true';
    if (peekControls) {
      buildPeekControls(blockWrapper, container, config);
    }

    // Arrows outside the slider: move the container and its buttons into an arrow holder before
    // Swiper starts. Doing it afterwards meant destroying and re-creating every such carousel,
    // which doubled its start-up cost (two rounds of forced style and layout per carousel).
    const arrowsOutside = blockWrapper?.dataset.arrowsOutside === 'true';
    if (arrowsOutside && showNavigation) {
      const arrowHolder = document.createElement('div');
      arrowHolder.className = 'arrowHolder';
      container.parentNode.insertBefore(arrowHolder, container);

      const nextButton = container.querySelector('.swiper-button-next');
      const prevButton = container.querySelector('.swiper-button-prev');
      arrowHolder.appendChild(container);
      if (nextButton) {
        arrowHolder.appendChild(nextButton);
        config.navigation.nextEl = nextButton;
      }
      if (prevButton) {
        arrowHolder.appendChild(prevButton);
        config.navigation.prevEl = prevButton;
      }
    }
    if (arrowsOutside) {
      blockWrapper.setAttribute('data-arrows-outside', 'true');
      container.classList.add('arrows-outside');
    }

    // Initialize Swiper with configuration. While it starts, the "first slide only" styles stand aside
    // so it measures every slide (style.scss); nothing paints in between.
    // A plain class says the slider is starting, for the stylesheet (a :has(.swiper-initialized) test
    // made every DOM change anywhere on the page re-style it, about 180ms each on a slow phone). It goes
    // on before Swiper starts: the first-slide-only rule it lifts hid the other slides with display:none,
    // and Swiper leaves such slides out of its sums, which left a looping carousel on the wrong slide.
    container.closest('.wp-block-ace-adaptive-carousel')?.classList.add('ace-carousel-ready');
    container.classList.add('ace-swiper-starting');
    let swiper = new Swiper(container, config);
    container.classList.remove('ace-swiper-starting');

    // A looping slider moves its last slide in front of the first as it starts, and here it was left
    // showing that last slide (realIndex 6 on a seven-post carousel), so the carousel opened on the
    // oldest post and jumped away from the first one the page had shown. Put it on its first post.
    // At start the slider can have no size yet (its slides measure 0 and the move does nothing), so this
    // waits until it has one: the next frame, or its first resize.
    if (config.loop) {
      const first = config.initialSlide || 0;
      const toFirst = () => {
        if (!swiper.destroyed && swiper.size > 0 && swiper.realIndex !== first) {
          swiper.slideToLoop(first, 0, false);
        }
      };
      toFirst();
      requestAnimationFrame(toFirst);
      swiper.once('resize', toFirst);
    }

    if (desktopPeek) {
      bindPeekClicks(swiper, container);
    }

    // Swiper's loop only moves slides round before a move, so with few slides the one after the
    // current slide can be missing until the next move, and that peek shows empty. Settle the
    // order after each move instead, on desktop and, with the phone peek, on phones.
    const mobilePeek = blockWrapper?.dataset.mobilePeek === 'true' && config.slidesPerView === 1 && effect === 'slide';
    if ((desktopPeek || mobilePeek) && config.loop) {
      swiper.on('slideChangeTransitionEnd', () => {
        const peeking = PEEK_DESKTOP.matches ? desktopPeek : mobilePeek;
        if (peeking && !swiper.destroyed && !swiper.animating) {
          // The settle is an instant internal move, which pauses autoplay until a CSS transition
          // ends that never comes, so pick autoplay back up afterwards.
          const autoplaying = swiper.autoplay?.running && !swiper.autoplay.paused;
          swiper.loopFix();
          if (autoplaying && swiper.autoplay.running && swiper.autoplay.paused) {
            swiper.autoplay.resume();
          }
        }
      });
    }

    if (desktopPeek || mobilePeek) {
      bindPeekScrollGuard(swiper, blockWrapper);
    }
    bindFocusKeeper(swiper, blockWrapper);
    if (peekControls) {
      bindPeekControls(swiper, blockWrapper, container, autoplay);
    }
    if (peekControls && blockWrapper?.dataset.fitTitles !== 'false') {
      bindTitleFit(swiper, blockWrapper);
    }
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
    if (autoplay && !useProgressbarAsTimer && !peekControls) {
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
              if (progressContent.textContent !== `${remainingTime}s`) progressContent.textContent = `${remainingTime}s`;
            }
          });
          
          // Ensure the circle starts at full (showing no progress)
          if (progressCircle) {
            progressCircle.style.strokeDashoffset = '0px';
          }
        }
      }, 100);
    } else if (useProgressbarAsTimer) {
      const autoplayProgress = container.querySelector('.autoplay-progress');
      if (autoplayProgress) {
        autoplayProgress.remove();
      }
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
        container.classList.add('ace-swiper-starting');
        swiper = new Swiper(container, config);
        container.classList.remove('ace-swiper-starting');

        if (desktopPeek || mobilePeek) {
          bindPeekScrollGuard(swiper, blockWrapper);
        }
        bindFocusKeeper(swiper, blockWrapper);
        bindProgressbarAutoplayTimer(swiper, container, blockWrapper);

        // Force create autoplay progress circle if autoplay is enabled
        if (autoplay && !useProgressbarAsTimer) {
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
                  if (progressContent.textContent !== `${remainingTime}s`) progressContent.textContent = `${remainingTime}s`;
                }
              });
              
              // Ensure the circle starts at full (showing no progress)
              if (progressCircle) {
                progressCircle.style.strokeDashoffset = '0px';
              }
            }
          }, 100);
        } else if (useProgressbarAsTimer) {
          const autoplayProgress = container.querySelector('.autoplay-progress');
          if (autoplayProgress) {
            autoplayProgress.remove();
          }
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

    // Arrows outside: restructure before Swiper starts (see above the first new Swiper).
    bindAnimationLifecycle(swiper, container);
  };

  // One carousel per task, so a page with several gives the browser room to respond between them.
  const queue = [];
  const runQueue = () => {
    setupCarousel(queue.shift());
    if (queue.length) setTimeout(runQueue, 0);
  };
  const startCarousel = (container) => {
    queue.push(container);
    if (queue.length === 1) runQueue();
  };

  // Carousels on screen start now. The rest wait until they're a screen away, which also covers
  // ones in hidden tabs, as those only intersect once they're shown.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        startCarousel(entry.target);
      });
    }, { rootMargin: '100% 0px' });

    swiperContainers.forEach((container) => {
      const rect = container.getBoundingClientRect();
      // checkVisibility: a closed panel using content-visibility still reports a size here.
      const visible = !container.checkVisibility || container.checkVisibility();
      if (visible && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0) {
        startCarousel(container);
      } else {
        container.classList.add('ace-carousel-waiting');
        observer.observe(container);
      }
    });
  } else {
    swiperContainers.forEach(startCarousel);
  }

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
          // the element invisible. Commit one restart reflow, then add
          // the classes back in a single batch to avoid layout thrash.
          animClasses.forEach(c => el.classList.remove(c));
          if (animClasses.length) {
            void el.offsetWidth;
          }

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
}

// Effects other than slide, free mode, mousewheel and the scrollbar come from a separate chunk,
// fetched only when a carousel on the page asks for one. Everything else starts exactly as
// before, at DOMContentLoaded.
function needsExtras() {
  return Array.from(document.querySelectorAll('.swiper-slider-block')).some((block) => {
    const data = block.dataset;
    return (data.effect && data.effect !== 'slide')
      || data.freeMode === 'true'
      || data.mousewheel === 'true'
      || data.showScrollbar === 'true';
  });
}

function startCarousels() {
  if (!needsExtras()) {
    initCarousels();
    return;
  }
  import(/* webpackChunkName: "swiper-extras" */ './swiper-extras')
    .then(({ default: extras }) => Swiper.use(extras))
    .catch(() => {}) // without them the carousel still runs, as a plain slide
    .then(initCarousels);
}
// The script is deferred, so the page is parsed by the time it runs: start straight away rather than
// waiting for DOMContentLoaded, which only fires once every other deferred script has run too. The
// slides beside the first only show once the slider is going, so this is when they first paint.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startCarousels);
} else {
  startCarousels();
}

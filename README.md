# Ace Adaptive Carousel Enhancer

`Ace Adaptive Carousel Enhancer` is a Gutenberg block plugin that turns nested block content into a Swiper-powered carousel on the frontend.

The block is registered as `ace/adaptive-carousel` and uses a PHP render callback to ensure each direct child inside the generated `.swiper-wrapper` receives the `swiper-slide` class.

## What The Plugin Does

- Registers a configurable carousel block for the WordPress block editor
- Outputs Swiper-compatible markup on save/render
- Initializes the frontend carousel from block `data-*` attributes
- Supports multiple navigation, pagination, autoplay, and transition configurations
- Adds styling and behavior for overflow-visible layouts, edge fades, autoplay timers, and animation replay handling

## Frontend Feature Summary

### Core Carousel Controls

- Horizontal and vertical direction
- Configurable `slidesPerView`
- Configurable `spaceBetween`
- Loop, speed, rewind, watch overflow, and slides per group
- Optional touch, keyboard, mousewheel, free mode, centered slides, and grab cursor behavior

### Navigation And Pagination

- Optional next/previous arrows
- Arrow color or contrast mode
- Optional arrows-outside layout
- Bullet, fraction, or progress bar pagination
- Clickable pagination
- Optional external pagination spacing
- Progress bar placement above or below the slider
- Optional draggable scrollbar

### Autoplay

- Enable/disable autoplay
- Adjustable delay
- Pause on mouse enter
- Disable on interaction
- Optional autoplay timer styling
- Optional use of the progress bar as an autoplay timer
- Recent timer handling improvements already merged into the current standalone repo

### Effects

- Slide
- Fade
- Cube
- Coverflow
- Flip
- Cards

### Viewport And Visual Behavior

- Overflow-visible mode for slides that extend beyond the frame
- Edge fade masks for softer offscreen crop behavior
- Arrow, bullet, progress, and timer color controls
- Contrast-mode toggles for arrows, bullets, and timers

## Block Structure

The block saves markup in this general form:

```html
<div class="swiper-slider-block" ...data attributes...>
  <div class="swiper">
    <div class="swiper-wrapper">
      <!-- InnerBlocks content -->
    </div>
    <!-- optional pagination / arrows / scrollbar -->
  </div>
</div>
```

At render time, the PHP callback walks the `.swiper-wrapper` children and adds `swiper-slide` to each direct element node. That keeps authoring simple while ensuring Swiper receives valid slide markup.

## Editor Experience

- The block uses `InnerBlocks` so editors can place standard Gutenberg blocks inside slides
- Settings live in inspector panels rather than a separate “preview mode” workflow
- An editor helper script preloads Swiper CSS for editor-side styling and adds some observer-based enhancements

## Source Layout

- [`adaptive-carousel-enhancer.php`](/var/www/html/plugins/Ace-Adaptive-Carousel-Enhancer/adaptive-carousel-enhancer.php)
  Plugin bootstrap and PHP render callback
- [`block.json`](/var/www/html/plugins/Ace-Adaptive-Carousel-Enhancer/block.json)
  Block registration metadata
- [`src/adaptive-carousel-block.js`](/var/www/html/plugins/Ace-Adaptive-Carousel-Enhancer/src/adaptive-carousel-block.js)
  Block registration, attributes, inspector controls, and save markup
- [`src/frontend.js`](/var/www/html/plugins/Ace-Adaptive-Carousel-Enhancer/src/frontend.js)
  Frontend Swiper setup and runtime behavior. Registered as the block's `viewScript`, so WordPress loads it deferred (never render-blocking) and only on pages that render a carousel; it initialises on `DOMContentLoaded`. It imports Swiper core with only A11y, Autoplay, Keyboard, Navigation and Pagination (via the `swiper-modules` alias in `webpack.config.js`, since Swiper only exports its modules barrel)
- [`src/swiper-extras.js`](/var/www/html/plugins/Ace-Adaptive-Carousel-Enhancer/src/swiper-extras.js)
  The rarer Swiper modules (fade, cube, coverflow, flip and cards effects, free mode, mousewheel, scrollbar), built as the lazy `build/swiper-extras.js` chunk and fetched only when a carousel on the page uses one. If it fails to load, carousels still start as plain slides
- [`src/editor.js`](/var/www/html/plugins/Ace-Adaptive-Carousel-Enhancer/src/editor.js)
  Editor-side asset loading and helper behavior
- [`src/style.scss`](/var/www/html/plugins/Ace-Adaptive-Carousel-Enhancer/src/style.scss)
  Swiper and block styling
- [`build/`](/var/www/html/plugins/Ace-Adaptive-Carousel-Enhancer/build)
  Compiled production assets

## Installation

1. Put the plugin in your WordPress plugins directory.
2. Run `npm install` inside the plugin directory if you need to build assets locally.
3. Run `npm run build`.
4. Activate the plugin in WordPress admin.

## Development

```bash
npm install
npm run start
npm run build
```

Build pipeline notes:

- `npm run build` runs `wp-scripts build`
- SCSS is compiled separately into `build/ace-carousel-styles.css`
- JS and CSS are then minified into the committed build assets

## Current Notes

- The standalone plugin repo is now the source of truth
- `ppnews` should consume it via submodule rather than a vendored copy
- The latest merge pulled in the ppnews animation reset improvement while preserving the newer upstream autoplay timer work

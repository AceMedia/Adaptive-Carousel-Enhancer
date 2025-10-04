/* === File: src/adaptive-carousel-block.js === */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks, InspectorControls, ColorPalette } from '@wordpress/block-editor';
import { 
  PanelBody, 
  RangeControl, 
  ToggleControl, 
  SelectControl,
  __experimentalNumberControl as NumberControl 
} from '@wordpress/components';
import { useState } from '@wordpress/element';

registerBlockType('ace/adaptive-carousel', {
  apiVersion: 2,
  title: __('Adaptive Carousel', 'adaptive-carousel'),
  icon: 'images-alt2',
  category: 'layout',
  attributes: {
    // Basic settings
    slidesPerView: { type: 'number', default: 1 },
    spaceBetween: { type: 'number', default: 0 },
    loop: { type: 'boolean', default: false },
    speed: { type: 'number', default: 300 },
    direction: { type: 'string', default: 'horizontal' },
    
    // Navigation
    showNavigation: { type: 'boolean', default: true },
    arrowColor: { type: 'string', default: '#000000' },
    arrowsOutside: { type: 'boolean', default: false },
    arrowContrastMode: { type: 'boolean', default: false },
    
    // Pagination
    showPagination: { type: 'boolean', default: true },
    paginationType: { type: 'string', default: 'bullets' },
    paginationClickable: { type: 'boolean', default: true },
    bulletColor: { type: 'string', default: '#000000' },
    bulletContrastMode: { type: 'boolean', default: false },
    progressBar: { type: 'boolean', default: false },
    progressBarPosition: { type: 'string', default: 'bottom' },
    paginationSpacing: { type: 'boolean', default: false },
    
    // Scrollbar
    showScrollbar: { type: 'boolean', default: false },
    scrollbarDraggable: { type: 'boolean', default: true },
    
    // Autoplay
    autoplay: { type: 'boolean', default: false },
    autoplayDelay: { type: 'number', default: 3000 },
    autoplayPauseOnMouseEnter: { type: 'boolean', default: true },
    autoplayDisableOnInteraction: { type: 'boolean', default: true },
    timerColor: { type: 'string', default: '#FFFFFF' },
    timerContrastMode: { type: 'boolean', default: true },
    
    // Effects
    effect: { type: 'string', default: 'slide' },
    fadeEffect: { type: 'boolean', default: false },
    
    // Behavior
    grabCursor: { type: 'boolean', default: true },
    centeredSlides: { type: 'boolean', default: false },
    freeMode: { type: 'boolean', default: false },
    keyboard: { type: 'boolean', default: false },
    mousewheel: { type: 'boolean', default: false },
    
    // Advanced
    slidesPerGroup: { type: 'number', default: 1 },
    watchOverflow: { type: 'boolean', default: true },
    rewind: { type: 'boolean', default: false },
    allowTouchMove: { type: 'boolean', default: true },
  },

  edit: ({ attributes, setAttributes }) => {
    const blockProps = useBlockProps();
    const { 
      slidesPerView, 
      spaceBetween, 
      loop, 
      speed, 
      direction,
      showNavigation,
      showPagination,
      paginationType,
      paginationClickable,
      showScrollbar,
      scrollbarDraggable,
      autoplay,
      autoplayDelay,
      autoplayPauseOnMouseEnter,
      autoplayDisableOnInteraction,
      effect,
      fadeEffect,
      grabCursor,
      centeredSlides,
      freeMode,
      keyboard,
      mousewheel,
      slidesPerGroup,
      watchOverflow,
      rewind,
      allowTouchMove,
      arrowColor,
      bulletColor,
      progressBar,
      progressBarPosition,
      paginationSpacing,
      arrowsOutside,
      arrowContrastMode,
      bulletContrastMode,
      timerColor,
      timerContrastMode
    } = attributes;

    const defaultArrowColor = arrowColor || '#000000';
    const defaultBulletColor = bulletColor || '#000000';

    // Ensure spaceBetween is passed to Swiper configuration
    const swiperConfig = {
      spaceBetween,
      slidesPerView,
      loop,
      speed,
      direction,
      navigation: showNavigation ? {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
        style: { color: defaultArrowColor },
      } : false,
      pagination: showPagination ? {
        el: '.swiper-pagination',
        clickable: paginationClickable,
        renderBullet: (index, className) => `<span class="${className}" style="background-color: ${defaultBulletColor}"></span>`
      } : false,
      scrollbar: progressBar ? {
        el: '.swiper-scrollbar',
        draggable: true,
      } : false,
      autoplay: autoplay ? { delay: autoplayDelay, disableOnInteraction: autoplayDisableOnInteraction } : false,
      effect,
      grabCursor,
      centeredSlides,
      freeMode,
      keyboard,
      mousewheel,
      slidesPerGroup,
      watchOverflow,
      rewind,
      allowTouchMove,
    };

    // Render the block editor UI
    return (
      <div {...blockProps}>
        <InspectorControls>
          {/* Basic Settings Panel */}
          <PanelBody title={__('Basic Settings', 'adaptive-carousel')}>
            <RangeControl
              label={__('Slides Per View', 'adaptive-carousel')}
              min={1}
              max={10}
              value={slidesPerView}
              onChange={(value) => setAttributes({ slidesPerView: value })}
            />
            <RangeControl
              label={__('Space Between Slides', 'adaptive-carousel')}
              min={0}
              max={50}
              value={spaceBetween}
              onChange={(value) => setAttributes({ spaceBetween: value })}
            />
            <SelectControl
              label={__('Direction', 'adaptive-carousel')}
              value={direction}
              options={[
                { label: __('Horizontal', 'adaptive-carousel'), value: 'horizontal' },
                { label: __('Vertical', 'adaptive-carousel'), value: 'vertical' },
              ]}
              onChange={(value) => setAttributes({ direction: value })}
            />
            <RangeControl
              label={__('Transition Speed (ms)', 'adaptive-carousel')}
              min={100}
              max={2000}
              step={50}
              value={speed}
              onChange={(value) => setAttributes({ speed: value })}
            />
            <ToggleControl
              label={__('Loop Slides', 'adaptive-carousel')}
              checked={loop}
              onChange={(value) => setAttributes({ loop: value })}
            />
          </PanelBody>

          {/* Navigation Panel */}
          <PanelBody title={__('Navigation', 'adaptive-carousel')} initialOpen={false}>
            <ToggleControl
              label={__('Show Navigation Arrows', 'adaptive-carousel')}
              checked={showNavigation}
              onChange={(value) => setAttributes({ showNavigation: value })}
            />
            {showNavigation && (
              <div>
                <ToggleControl
                  label={__('Arrow Contrast Mode', 'adaptive-carousel')}
                  checked={arrowContrastMode}
                  onChange={(value) => setAttributes({ arrowContrastMode: value })}
                  help={__('Applies contrast filter to arrows when inside slides', 'adaptive-carousel')}
                />
                {!arrowContrastMode && (
                  <div>
                    <strong>{__('Arrow Color', 'adaptive-carousel')}</strong>
                    <ColorPalette
                      value={arrowColor}
                      onChange={(color) => setAttributes({ arrowColor: color })}
                    />
                  </div>
                )}
                <ToggleControl
                  label={__('Arrows Outside', 'adaptive-carousel')}
                  checked={arrowsOutside}
                  onChange={(value) => setAttributes({ arrowsOutside: value })}
                  help={__('Place navigation arrows outside the slider', 'adaptive-carousel')}
                />
              </div>
            )}
          </PanelBody>

          {/* Pagination Panel */}
          <PanelBody title={__('Pagination', 'adaptive-carousel')} initialOpen={false}>
            <ToggleControl
              label={__('Show Pagination', 'adaptive-carousel')}
              checked={showPagination}
              onChange={(value) => setAttributes({ showPagination: value })}
            />
            {showPagination && (
              <>
                <SelectControl
                  label={__('Pagination Type', 'adaptive-carousel')}
                  value={paginationType}
                  options={[
                    { label: __('Bullets', 'adaptive-carousel'), value: 'bullets' },
                    { label: __('Fraction', 'adaptive-carousel'), value: 'fraction' },
                    { label: __('Progress Bar', 'adaptive-carousel'), value: 'progressbar' },
                  ]}
                  onChange={(value) => setAttributes({ paginationType: value })}
                />
                <ToggleControl
                  label={__('Clickable Pagination', 'adaptive-carousel')}
                  checked={paginationClickable}
                  onChange={(value) => setAttributes({ paginationClickable: value })}
                />
                <ToggleControl
                  label={__('Add Spacing to Pagination', 'adaptive-carousel')}
                  checked={paginationSpacing}
                  onChange={(value) => setAttributes({ paginationSpacing: value })}
                  help={__('Adds extra space for bullets, fractions, or progress bars for better visual separation', 'adaptive-carousel')}
                />
                {paginationType === 'bullets' && (
                  <div>
                    <ToggleControl
                      label={__('Bullet Contrast Mode', 'adaptive-carousel')}
                      checked={bulletContrastMode}
                      onChange={(value) => setAttributes({ bulletContrastMode: value })}
                      help={__('Applies contrast filter to bullets when inside slides', 'adaptive-carousel')}
                    />
                    {!bulletContrastMode && (
                      <div>
                        <strong>{__('Bullet Color', 'adaptive-carousel')}</strong>
                        <ColorPalette
                          value={bulletColor}
                          onChange={(color) => setAttributes({ bulletColor: color })}
                        />
                      </div>
                    )}
                  </div>
                )}
                {paginationType === 'progressbar' && (
                  <>
                    <SelectControl
                      label={__('Progress Bar Position', 'adaptive-carousel')}
                      value={progressBarPosition}
                      options={[
                        { label: __('Above Slider', 'adaptive-carousel'), value: 'top' },
                        { label: __('Below Slider', 'adaptive-carousel'), value: 'bottom' },
                      ]}
                      onChange={(value) => setAttributes({ progressBarPosition: value })}
                    />
                    <div>
                      <strong>{__('Progress Bar Color', 'adaptive-carousel')}</strong>
                      <ColorPalette
                        value={bulletColor}
                        onChange={(color) => setAttributes({ bulletColor: color })}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </PanelBody>

          {/* Scrollbar Panel */}
          <PanelBody title={__('Scrollbar', 'adaptive-carousel')} initialOpen={false}>
            <ToggleControl
              label={__('Show Scrollbar', 'adaptive-carousel')}
              checked={showScrollbar}
              onChange={(value) => setAttributes({ showScrollbar: value })}
            />
            {showScrollbar && (
              <ToggleControl
                label={__('Draggable Scrollbar', 'adaptive-carousel')}
                checked={scrollbarDraggable}
                onChange={(value) => setAttributes({ scrollbarDraggable: value })}
              />
            )}
          </PanelBody>

          {/* Autoplay Panel */}
          <PanelBody title={__('Autoplay', 'adaptive-carousel')} initialOpen={false}>
            <ToggleControl
              label={__('Enable Autoplay', 'adaptive-carousel')}
              checked={autoplay}
              onChange={(value) => setAttributes({ autoplay: value })}
            />
            {autoplay && (
              <>
                <RangeControl
                  label={__('Autoplay Delay (ms)', 'adaptive-carousel')}
                  min={1000}
                  max={10000}
                  step={500}
                  value={autoplayDelay}
                  onChange={(value) => setAttributes({ autoplayDelay: value })}
                />
                <ToggleControl
                  label={__('Pause on Mouse Enter', 'adaptive-carousel')}
                  checked={autoplayPauseOnMouseEnter}
                  onChange={(value) => setAttributes({ autoplayPauseOnMouseEnter: value })}
                />
                <ToggleControl
                  label={__('Disable on Interaction', 'adaptive-carousel')}
                  checked={autoplayDisableOnInteraction}
                  onChange={(value) => setAttributes({ autoplayDisableOnInteraction: value })}
                />
                <ToggleControl
                  label={__('Timer Contrast Mode', 'adaptive-carousel')}
                  checked={timerContrastMode}
                  onChange={(value) => setAttributes({ timerContrastMode: value })}
                  help={__('Applies contrast filter to the autoplay timer', 'adaptive-carousel')}
                />
                {!timerContrastMode && (
                  <div>
                    <strong>{__('Timer Color', 'adaptive-carousel')}</strong>
                    <ColorPalette
                      value={timerColor}
                      onChange={(color) => setAttributes({ timerColor: color })}
                    />
                  </div>
                )}
              </>
            )}
          </PanelBody>

          {/* Effects Panel */}
          <PanelBody title={__('Effects', 'adaptive-carousel')} initialOpen={false}>
            <SelectControl
              label={__('Transition Effect', 'adaptive-carousel')}
              value={effect}
              options={[
                { label: __('Slide', 'adaptive-carousel'), value: 'slide' },
                { label: __('Fade', 'adaptive-carousel'), value: 'fade' },
                { label: __('Cube', 'adaptive-carousel'), value: 'cube' },
                { label: __('Coverflow', 'adaptive-carousel'), value: 'coverflow' },
                { label: __('Flip', 'adaptive-carousel'), value: 'flip' },
                { label: __('Cards', 'adaptive-carousel'), value: 'cards' },
              ]}
              onChange={(value) => setAttributes({ effect: value })}
            />
            {effect === 'fade' && (
              <ToggleControl
                label={__('Cross Fade', 'adaptive-carousel')}
                checked={fadeEffect}
                onChange={(value) => setAttributes({ fadeEffect: value })}
              />
            )}
          </PanelBody>

          {/* Behavior Panel */}
          <PanelBody title={__('Behavior', 'adaptive-carousel')} initialOpen={false}>
            <ToggleControl
              label={__('Grab Cursor', 'adaptive-carousel')}
              checked={grabCursor}
              onChange={(value) => setAttributes({ grabCursor: value })}
            />
            <ToggleControl
              label={__('Centered Slides', 'adaptive-carousel')}
              checked={centeredSlides}
              onChange={(value) => setAttributes({ centeredSlides: value })}
            />
            <ToggleControl
              label={__('Free Mode', 'adaptive-carousel')}
              checked={freeMode}
              onChange={(value) => setAttributes({ freeMode: value })}
            />
            <ToggleControl
              label={__('Keyboard Control', 'adaptive-carousel')}
              checked={keyboard}
              onChange={(value) => setAttributes({ keyboard: value })}
            />
            <ToggleControl
              label={__('Mousewheel Control', 'adaptive-carousel')}
              checked={mousewheel}
              onChange={(value) => setAttributes({ mousewheel: value })}
            />
            <ToggleControl
              label={__('Allow Touch Move', 'adaptive-carousel')}
              checked={allowTouchMove}
              onChange={(value) => setAttributes({ allowTouchMove: value })}
            />
          </PanelBody>

          {/* Advanced Panel */}
          <PanelBody title={__('Advanced', 'adaptive-carousel')} initialOpen={false}>
            <RangeControl
              label={__('Slides Per Group', 'adaptive-carousel')}
              min={1}
              max={10}
              value={slidesPerGroup}
              onChange={(value) => setAttributes({ slidesPerGroup: value })}
              help={__('Number of slides to move at once', 'adaptive-carousel')}
            />
            <ToggleControl
              label={__('Watch Overflow', 'adaptive-carousel')}
              checked={watchOverflow}
              onChange={(value) => setAttributes({ watchOverflow: value })}
              help={__('Hide navigation when not needed', 'adaptive-carousel')}
            />
            <ToggleControl
              label={__('Rewind', 'adaptive-carousel')}
              checked={rewind}
              onChange={(value) => setAttributes({ rewind: value })}
              help={__('Go to first slide when reaching the end', 'adaptive-carousel')}
            />
          </PanelBody>

          
        </InspectorControls>
        <InnerBlocks />
      </div>
    );
  },

  save: ({ attributes }) => {
    const {
      slidesPerView,
      spaceBetween,
      loop,
      speed,
      direction,
      showNavigation,
      showPagination,
      paginationType,
      paginationClickable,
      showScrollbar,
      scrollbarDraggable,
      autoplay,
      autoplayDelay,
      autoplayPauseOnMouseEnter,
      autoplayDisableOnInteraction,
      effect,
      fadeEffect,
      grabCursor,
      centeredSlides,
      freeMode,
      keyboard,
      mousewheel,
      slidesPerGroup,
      watchOverflow,
      rewind,
      allowTouchMove,
      arrowColor,
      bulletColor,
      progressBar,
      progressBarPosition,
      paginationSpacing,
      arrowsOutside,
      arrowContrastMode,
      bulletContrastMode,
      timerColor,
      timerContrastMode
    } = attributes;

    return (
      <div
        {...useBlockProps.save({
          className: `swiper-slider-block${paginationSpacing ? ' has-pagination-spacing' : ''}`,
          style: {
            '--progress-bar-color': bulletColor || '#000000',
            '--timer-color': timerColor || '#FFFFFF',
            '--bullet-color': bulletColor || '#000000',
            '--arrow-color': arrowColor || '#000000'
          },
          'data-slides': slidesPerView,
          'data-space-between': spaceBetween,
          'data-loop': loop,
          'data-speed': speed,
          'data-direction': direction,
          'data-show-navigation': showNavigation,
          'data-show-pagination': showPagination,
          'data-pagination-type': paginationType,
          'data-pagination-clickable': paginationClickable,
          'data-show-scrollbar': showScrollbar,
          'data-scrollbar-draggable': scrollbarDraggable,
          'data-autoplay': autoplay,
          'data-autoplay-delay': autoplayDelay,
          'data-autoplay-pause-on-mouse-enter': autoplayPauseOnMouseEnter,
          'data-autoplay-disable-on-interaction': autoplayDisableOnInteraction,
          'data-effect': effect,
          'data-fade-effect': fadeEffect,
          'data-grab-cursor': grabCursor,
          'data-centered-slides': centeredSlides,
          'data-free-mode': freeMode,
          'data-keyboard': keyboard,
          'data-mousewheel': mousewheel,
          'data-slides-per-group': slidesPerGroup,
          'data-watch-overflow': watchOverflow,
          'data-rewind': rewind,
          'data-allow-touch-move': allowTouchMove,
          'data-arrow-color': arrowColor,
          'data-bullet-color': bulletColor,
          'data-progress-bar-position': progressBarPosition,
          'data-pagination-spacing': paginationSpacing,
          'data-arrows-outside': arrowsOutside,
          'data-arrow-contrast-mode': arrowContrastMode,
          'data-bullet-contrast-mode': bulletContrastMode,
          'data-timer-color': timerColor,
          'data-timer-contrast-mode': timerContrastMode,
        })}
      >
        {showPagination && paginationType === 'progressbar' && progressBarPosition === 'top' && (
          <div className="swiper-pagination swiper-pagination-top"></div>
        )}
        <div className="swiper">
          <div className="swiper-wrapper">
            <InnerBlocks.Content />
          </div>
          {showPagination && paginationType !== 'progressbar' && !paginationSpacing && (
            <div className="swiper-pagination"></div>
          )}
          {showNavigation && (
            <>
              <div className="swiper-button-next"></div>
              <div className="swiper-button-prev"></div>
            </>
          )}
          {showScrollbar && <div className="swiper-scrollbar"></div>}
        </div>
        {showPagination && paginationType !== 'progressbar' && paginationSpacing && (
          <div className="swiper-pagination swiper-pagination-external"></div>
        )}
        {showPagination && paginationType === 'progressbar' && progressBarPosition === 'bottom' && (
          <div className="swiper-pagination swiper-pagination-bottom"></div>
        )}
      </div>
    );
  },
});

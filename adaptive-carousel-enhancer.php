<?php
/**
 * Plugin Name: Adaptive Carousel Enhancer
 * Description: Gutenberg block that turns inner blocks into SwiperJS slides.
 * Author: Shane Rounce
 * Version: 0.1.0
 */

defined('ABSPATH') || exit;


// Register block using block.json and retain render callback
add_action('init', function() {
    register_block_type(__DIR__, [
        'render_callback' => 'ace_swiper_slider_block_render',
    ]);
});

function ace_swiper_slider_block_render($attributes, $content) {
    // Parse the inner blocks content and wrap each block in a swiper-slide div
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="utf-8" ?>' . $content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();
    
    $wrapper = $dom->getElementsByTagName('div')->item(0);
    if ($wrapper && $wrapper->getAttribute('class') === 'swiper-slider-block') {
        $swiperWrapper = null;
        foreach ($wrapper->childNodes as $child) {
            if ($child->nodeType === XML_ELEMENT_NODE && $child->getAttribute('class') === 'swiper') {
                foreach ($child->childNodes as $grandChild) {
                    if ($grandChild->nodeType === XML_ELEMENT_NODE && $grandChild->getAttribute('class') === 'swiper-wrapper') {
                        $swiperWrapper = $grandChild;
                        break;
                    }
                }
                break;
            }
        }
        
        if ($swiperWrapper) {
            $children = [];
            foreach ($swiperWrapper->childNodes as $child) {
                if ($child->nodeType === XML_ELEMENT_NODE) {
                    $children[] = $child;
                }
            }
            
            // Clear the wrapper
            while ($swiperWrapper->firstChild) {
                $swiperWrapper->removeChild($swiperWrapper->firstChild);
            }
            
            // Wrap each child in a swiper-slide
            foreach ($children as $child) {
                $slide = $dom->createElement('div');
                $slide->setAttribute('class', 'swiper-slide');
                $slide->appendChild($child);
                $swiperWrapper->appendChild($slide);
            }
        }
        
        return $dom->saveHTML();
    }
    
    return $content;
}

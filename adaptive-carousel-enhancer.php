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
    // Parse the inner blocks content and add swiper-slide class to each direct child of .swiper-wrapper
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="utf-8" ?>' . $content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();

    $swiperWrapper = null;

    // Walk all divs to find the one with class "swiper-wrapper"
    foreach ( $dom->getElementsByTagName('div') as $div ) {
        $classes = array_filter( explode( ' ', $div->getAttribute('class') ) );
        if ( in_array( 'swiper-wrapper', $classes, true ) ) {
            $swiperWrapper = $div;
            break;
        }
    }

    if ( $swiperWrapper ) {
        foreach ( $swiperWrapper->childNodes as $child ) {
            if ( $child->nodeType !== XML_ELEMENT_NODE ) {
                continue;
            }
            $existing = array_filter( explode( ' ', $child->getAttribute('class') ) );
            if ( ! in_array( 'swiper-slide', $existing, true ) ) {
                $existing[] = 'swiper-slide';
                $child->setAttribute( 'class', implode( ' ', $existing ) );
            }
        }

        return $dom->saveHTML();
    }

    return $content;
}

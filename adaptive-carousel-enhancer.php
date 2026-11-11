<?php
/**
 * Plugin Name: Adaptive Carousel Enhancer
 * Description: Gutenberg block that turns inner blocks into SwiperJS slides.
 * Author: Shane Rounce
 * Version: 0.2.27
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Text Domain: adaptive-carousel-enhancer
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

defined('ABSPATH') || exit;


// Register block using block.json and retain render callback
add_action('init', function() {
    register_block_type(__DIR__, [
        'render_callback' => 'ace_swiper_slider_block_render',
    ]);
});

function ace_swiper_slider_block_render($attributes, $content) {
    if ( '' === trim( $content ) || ! class_exists( 'DOMDocument' ) ) {
        return $content;
    }
    // Parse the inner blocks content and add swiper-slide class to each direct child of .swiper-wrapper
    $dom = new DOMDocument();
    $previous_errors = libxml_use_internal_errors(true);
    try {
    $dom->loadHTML('<?xml encoding="utf-8" ?>' . $content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    } finally {
        libxml_clear_errors();
        libxml_use_internal_errors( $previous_errors );
    }
    foreach ( iterator_to_array( $dom->childNodes ) as $node ) {
        if ( XML_PI_NODE === $node->nodeType ) {
            $dom->removeChild( $node );
        }
    }

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

        // A query's slide list (the one list inside the wrapper) is sent in the wrapper's place. It keeps
        // every class it had, so it is styled exactly as before until the script starts, and then takes the
        // wrapper's role by class alone (frontend.js). The script used to build a new list and move every
        // slide into it, which took the slides out of the page and put them back: the browser painted the
        // first slide's image a second time and counted that later paint as the page's largest image.
        $elements = [];
        foreach ( $swiperWrapper->childNodes as $child ) {
            if ( XML_ELEMENT_NODE === $child->nodeType ) {
                $elements[] = $child;
            }
        }
        if ( 1 === count( $elements ) && 'ul' === strtolower( $elements[0]->nodeName )
            && 'swiper-wrapper' === trim( $swiperWrapper->getAttribute( 'class' ) ) && 1 === $swiperWrapper->attributes->length ) {
            $list         = $elements[0];
            $list_classes = array_values( array_filter( explode( ' ', $list->getAttribute( 'class' ) ) ) );
            $is_template  = (bool) array_intersect( [ 'wp-block-post-template', 'wc-block-product-template' ], $list_classes );
            $has_tile     = false;
            foreach ( $list->childNodes as $item ) {
                if ( XML_ELEMENT_NODE === $item->nodeType && in_array( 'ace-variation-tile', explode( ' ', $item->getAttribute( 'class' ) ), true ) ) {
                    $has_tile = true; // the script drops these when it builds the list, so leave that carousel to it
                    break;
                }
            }
            if ( $is_template && ! $has_tile ) {
                $list_classes[] = 'ace-slide-list';
                $list->setAttribute( 'class', implode( ' ', $list_classes ) );
                $swiperWrapper->removeChild( $list );
                $swiperWrapper->parentNode->replaceChild( $list, $swiperWrapper );
            }
        }

        return $dom->saveHTML();
    }

    return $content;
}

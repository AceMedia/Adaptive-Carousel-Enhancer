<?php
define('ABSPATH', __DIR__);
function add_action() {}
require dirname(__DIR__) . '/adaptive-carousel-enhancer.php';
function check($value, $message) { if (!$value) { throw new RuntimeException($message); } echo "PASS $message\n"; }
$markup = '<div class="swiper-slider-block"><div class="swiper-wrapper"><p>Café &amp; tea</p><div class="custom">Two</div></div></div>';
libxml_use_internal_errors(false);
$output = ace_swiper_slider_block_render([], $markup);
check(false === libxml_use_internal_errors(), 'libxml error mode restored');
check(false === strpos($output, '<?xml'), 'no leaked XML instruction');
check(2 === substr_count($output, 'swiper-slide"'), 'both direct slide children marked');
check(false !== strpos($output, 'custom swiper-slide'), 'existing class preserved');
check(false !== strpos($output, 'Caf'), 'content preserved');
check('' === ace_swiper_slider_block_render([], ''), 'empty content safe');
check('<p>No carousel</p>' === ace_swiper_slider_block_render([], '<p>No carousel</p>'), 'unrelated markup unchanged');
libxml_use_internal_errors(true);
ace_swiper_slider_block_render([], $markup);
check(true === libxml_use_internal_errors(), 'enabled libxml error mode restored');
$query = '<div class="swiper-slider-block"><div class="swiper"><div class="swiper-wrapper"><ul class="columns-1 wp-block-post-template is-layout-grid"><li class="wp-block-post">One</li><li class="wp-block-post">Two</li></ul></div><div class="swiper-pagination"></div></div></div>';
$output = ace_swiper_slider_block_render([], $query);
check(false === strpos($output, '<div class="swiper-wrapper">'), 'a query list replaces the wrapper');
check(false !== strpos($output, '<div class="swiper"><ul class="columns-1 wp-block-post-template is-layout-grid swiper-slide ace-slide-list"><li class="wp-block-post">One</li>'), 'the list keeps its classes and is marked');
check(false !== strpos($output, '</ul><div class="swiper-pagination">'), 'the list sits where the wrapper was');
$tiles = str_replace('<li class="wp-block-post">Two</li>', '<li class="wp-block-post ace-variation-tile">Two</li>', $query);
check(false !== strpos(ace_swiper_slider_block_render([], $tiles), '<div class="swiper-wrapper"><ul'), 'a list with variation tiles is left to the script');
$two = str_replace('</ul></div>', '</ul><p>extra</p></div>', $query);
check(false !== strpos(ace_swiper_slider_block_render([], $two), '<div class="swiper-wrapper"><ul'), 'a wrapper with more than the list is unchanged');
check(false !== strpos(ace_swiper_slider_block_render([], $markup), '<div class="swiper-wrapper"><p'), 'plain slides keep their wrapper');

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

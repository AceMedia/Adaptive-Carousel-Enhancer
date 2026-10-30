=== Adaptive Carousel Enhancer ===
Contributors: shanerounce
Tags: carousel, slider, block, swiper, gutenberg
Requires at least: 6.0
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 0.1.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Gutenberg block that turns inner blocks into SwiperJS slides.

== Description ==

Ace Adaptive Carousel Enhancer is a Gutenberg block that turns nested block content into a Swiper-powered carousel on the front end. Place any blocks inside a slide, then control autoplay, navigation, pagination, breakpoints and effects from the block sidebar.

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/`, or install the zip from Plugins > Add New.
2. Activate it through the Plugins screen.
3. Add an Adaptive Carousel block in the block editor and configure its sidebar controls.

== Frequently Asked Questions ==

= Where do I report a bug or ask for a feature? =

Open an issue on the plugin's GitHub repository.

== External services ==

This plugin does not contact external services. Swiper scripts and styles are bundled locally.

== Source and licences ==

Editable source, the dependency lockfile and rebuild instructions are included in this archive. See BUILDING.txt and LICENSE-SWIPER for the bundled Swiper library.

== Changelog ==

= 0.1.1 =
* Keep editor assets local and include Swiper licensing and source.
* Validate carousel colours and isolate progress bar styling.
* Preserve libxml settings and render content safely without the DOM extension.
* Update block metadata and retain the WordPress 6.0 editor runtime.


= 0.1.0 =
* Initial public release.

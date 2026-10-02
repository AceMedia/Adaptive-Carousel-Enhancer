/**
 * Swiper modules only some carousels switch on. frontend.js loads this chunk on pages where a
 * carousel uses an effect other than slide, free mode, mousewheel or a scrollbar; everywhere else
 * it's never fetched.
 */
import Scrollbar from 'swiper-modules/scrollbar.mjs';
import Mousewheel from 'swiper-modules/mousewheel.mjs';
import FreeMode from 'swiper-modules/free-mode.mjs';
import EffectFade from 'swiper-modules/effect-fade.mjs';
import EffectCube from 'swiper-modules/effect-cube.mjs';
import EffectCoverflow from 'swiper-modules/effect-coverflow.mjs';
import EffectFlip from 'swiper-modules/effect-flip.mjs';
import EffectCards from 'swiper-modules/effect-cards.mjs';

export default [
  Scrollbar, Mousewheel, FreeMode,
  EffectFade, EffectCube, EffectCoverflow, EffectFlip, EffectCards,
];

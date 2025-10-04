# Ace Adaptive Carousel Enhancer

A powerful WordPress Gutenberg block for creating beautiful, responsive carousels using Swiper.js.

## Features

### Comprehensive Swiper.js Integration
- **Multiple Effects**: Slide, Fade, Cube, Coverflow, Flip, Cards
- **Navigation**: Customizable arrows with show/hide options
- **Pagination**: Bullets, Fraction, Progress Bar with clickable options
- **Scrollbar**: Optional draggable scrollbar
- **Autoplay**: Full autoplay control with pause options
- **Responsive**: Built-in breakpoints for all devices

### Advanced Controls
- **Behavior Settings**: Free mode, keyboard, mousewheel, touch controls
- **Visual Options**: Grab cursor, centered slides, custom spacing
- **Performance**: Watch overflow, rewind mode, slides per group
- **Effects**: Fade crossfade, cube shadows, coverflow depth

### Editor Experience

#### **Dual View Modes**
The block features two distinct editing modes for optimal workflow:

**📋 List View (Default)**
- All slides displayed as individual blocks
- Full editing capabilities for content
- Vertical layout for easy access
- Perfect for content creation and editing
- Numbered slides with clear visual separation

**🎠 Carousel View (Preview Mode)**
- Live Swiper preview exactly as it appears on frontend
- **Automatic asset loading**: Swiper.js and CSS loaded when needed
- Interactive navigation, pagination, and controls
- Real-time testing of all settings and effects
- Read-only mode (content editing disabled)
- Perfect for testing carousel behavior and settings

#### **Easy Mode Switching**
- **Toolbar Button**: Click the list/desktop icon in the block toolbar
- **Inspector Control**: Toggle in the Editor Settings panel
- **Visual Feedback**: Clear headers and styling for each mode
- **Instant switching**: No page reload required

### Settings Organization

Settings are organized into logical panels:

1. **Editor Settings** - View mode controls
2. **Basic Settings** - Core carousel configuration
3. **Navigation** - Arrow controls
4. **Pagination** - Bullet/fraction/progress options
5. **Scrollbar** - Optional scrollbar settings
6. **Autoplay** - Automatic progression controls
7. **Effects** - Visual transition effects
8. **Behavior** - Interaction and control options
9. **Advanced** - Performance and fine-tuning

## Usage

1. Add the "Adaptive Carousel" block to your page
2. **Default List View**: Start editing your slide content immediately
   - Each slide appears as a separate block
   - Add any WordPress blocks inside each slide
   - Full editing capabilities available
3. **Switch to Carousel View** when you want to:
   - Test carousel settings and behavior
   - Preview how it will look on the frontend
   - Interact with navigation and controls
4. **Configure settings** in the sidebar panels
5. **Switch back to List View** for content editing
6. Publish and enjoy your responsive carousel!

## Workflow Recommendations

### **Content Creation Phase**
- Use **List View** for all content editing
- Add, remove, and edit slides freely
- Focus on content without carousel interference

### **Design & Testing Phase**  
- Switch to **Carousel View** for configuration
- Test different effects and settings
- Verify navigation and responsive behavior
- Fine-tune autoplay and interaction settings

## Technical Details

- **Framework**: WordPress Gutenberg Blocks API
- **Carousel Engine**: Swiper.js v11 (loaded dynamically in editor)
- **Build Process**: wp-scripts with SCSS compilation
- **Responsive**: Mobile-first approach with breakpoints
- **Performance**: Lazy loading and optimized rendering
- **Editor Assets**: Automatic loading of Swiper CSS/JS when in preview mode
- **Asset Management**: Smart loading system prevents conflicts and improves performance

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for all screen sizes

## Installation

1. Extract to WordPress plugins directory
2. Run `npm install` to install dependencies
3. Run `npm run build` to compile assets
4. Activate the plugin in WordPress admin

## Development

```bash
# Install dependencies
npm install

# Development build (watch mode)
npm run start

# Production build
npm run build

# SCSS compilation only
npm run build:scss
```

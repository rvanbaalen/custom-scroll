[&larr; See my other Open Source projects](https://robinvanbaalen.nl)

# @rvanbaalen/custom-scroll
![NPM Downloads](https://img.shields.io/npm/dm/%40rvanbaalen%2Fcustom-scroll)
![GitHub License](https://img.shields.io/github/license/rvanbaalen/custom-scroll)
![NPM Version](https://img.shields.io/npm/v/%40rvanbaalen%2Fcustom-scroll)

## Description

A lightweight, customizable scrollbar library for JavaScript applications. This package provides horizontal and vertical scrollbar components that you can style and control programmatically, perfect for custom UI implementations where native scrollbars don't meet your design requirements.

## Features

- 🔄 Custom horizontal and vertical scrollbars
- 🎨 Fully stylable through CSS
- 🖱️ Handles drag operations and track clicks
- 📏 Automatically sizes thumbs based on content
- 🔗 Simple callback-based API for scroll events
- 🧩 Works with any container element

## Installation

Install the package via npm:

```bash
npm install @rvanbaalen/custom-scroll
```

## Usage

### Basic Example

```javascript
import { HorizontalScrollbar, VerticalScrollbar } from '@rvanbaalen/custom-scroll';

// Create a horizontal scrollbar
const horizontalScrollbar = new HorizontalScrollbar({
  container: document.getElementById('my-container'),
  contentWidth: 2000,  // Total scrollable width
  visibleWidth: 500,   // Width of the visible area
  onScroll: (scrollX) => {
    // Handle horizontal scroll
    document.getElementById('content').style.transform = `translateX(-${scrollX}px)`;
  }
});

// Create a vertical scrollbar
const verticalScrollbar = new VerticalScrollbar({
  container: document.getElementById('my-container'),
  contentHeight: 3000, // Total scrollable height
  visibleHeight: 600,  // Height of the visible area
  onScroll: (scrollY) => {
    // Handle vertical scroll
    document.getElementById('content').style.transform = `translateY(-${scrollY}px)`;
  }
});
```

### Styling

Add these styles to your CSS to customize the appearance:

```css
/* Track styles */
.custom-scrollbar-track {
  position: absolute;
  background: #f1f1f1;
  border-radius: 4px;
}

/* Thumb styles */
.custom-scrollbar-thumb {
  position: absolute;
  background: #888;
  border-radius: 4px;
  cursor: pointer;
}

.custom-scrollbar-thumb:hover {
  background: #555;
}

/* Container needs to be positioned relatively or absolutely */
#my-container {
  position: relative;
  overflow: hidden;
}
```

### Updating the Scrollbars

When your content or container size changes, update the scrollbars:

```javascript
// Update the scrollbars after content changes
function updateScrollbars() {
  const newContentWidth = getContentWidth();
  const newContentHeight = getContentHeight();
  
  horizontalScrollbar.contentSize = newContentWidth;
  horizontalScrollbar.visibleSize = container.offsetWidth;
  horizontalScrollbar.update(currentScrollX);
  
  verticalScrollbar.contentSize = newContentHeight;
  verticalScrollbar.visibleSize = container.offsetHeight;
  verticalScrollbar.update(currentScrollY);
}

// Call this when your content size changes
window.addEventListener('resize', updateScrollbars);
```

## API Reference

### HorizontalScrollbar

```javascript
new HorizontalScrollbar({
  container: HTMLElement,    // Container element
  contentWidth: number,      // Total scrollable width
  visibleWidth: number,      // Width of the visible area
  onScroll: Function         // Callback function(scrollX)
})
```

### VerticalScrollbar

```javascript
new VerticalScrollbar({
  container: HTMLElement,    // Container element
  contentHeight: number,     // Total scrollable height
  visibleHeight: number,     // Height of the visible area
  onScroll: Function         // Callback function(scrollY)
})
```

### Methods

Both scrollbar classes provide the following methods:

- `update(scrollValue)`: Updates the thumb position and size based on the current scroll value

### Properties

- `contentSize`: The total scrollable size (width or height)
- `visibleSize`: The visible size of the container (width or height)

## Use Cases

- Custom data grids with fixed headers/columns
- Design systems requiring consistent scrollbars across browsers
- Interactive dashboards with custom UI components
- Maps and visualization tools
- Virtual scrolling implementations

## Browser Support

Works in all modern browsers that support ES6.

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Build for production: `npm run build`

## Contributing

Contributions are welcome! If you have any suggestions, improvements, or bug fixes, please [open an issue](https://github.com/rvanbaalen/custom-scroll/issues/new) or [submit a pull request](https://github.com/rvanbaalen/custom-scroll/pulls).

## License

Distributed under the MIT License. See the [LICENSE](LICENSE) file for more information.

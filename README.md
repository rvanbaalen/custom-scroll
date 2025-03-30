[&larr; See my other Open Source projects](https://robinvanbaalen.nl)

# @rvanbaalen/custom-scroll
![NPM Downloads](https://img.shields.io/npm/dm/%40rvanbaalen%2Fcustom-scroll)
![GitHub License](https://img.shields.io/github/license/rvanbaalen/custom-scroll)
![NPM Version](https://img.shields.io/npm/v/%40rvanbaalen%2Fcustom-scroll)

## Description

A lightweight, customizable scrollbar library for JavaScript applications, now with reactive programming support via the `@rvanbaalen/signals` package. This package provides horizontal and vertical scrollbar components that you can style and control programmatically, perfect for custom UI implementations where native scrollbars don't meet your design requirements.

## Features

- 🔄 Custom horizontal and vertical scrollbars
- 🎨 Fully stylable through CSS
- 🖱️ Handles drag operations and track clicks
- 📏 Automatically sizes thumbs based on content
- 🔗 Reactive state management using signals
- 🚀 Programmatic scrolling control
- 📡 Event-based architecture via signals
- 💨 Smooth animations and interactions

## Installation

Install the package via npm:

```bash
npm install @rvanbaalen/custom-scroll
```

The `@rvanbaalen/signals` package will be automatically installed as a dependency.

### Including the required files

#### ES Modules (Recommended)

```javascript
// Import the scrollbar components
import { HorizontalScrollbar, VerticalScrollbar } from '@rvanbaalen/custom-scroll';

// Import the default styles (optional)
import '@rvanbaalen/custom-scroll/scrollbar.css';
```

#### Script Tags (Browser)

```html
<!-- Include the signals library first -->
<script src="path/to/node_modules/@rvanbaalen/signals/dist/signals.min.js"></script>
<!-- Then include the scrollbar library -->
<script src="path/to/node_modules/@rvanbaalen/custom-scroll/dist/custom-scroll.min.js"></script>
<!-- Include the styles -->
<link rel="stylesheet" href="path/to/node_modules/@rvanbaalen/custom-scroll/scrollbar.css">

<script>
  // Access via the global namespace
  const { HorizontalScrollbar, VerticalScrollbar } = customScroll;
</script>
```

## Usage

### Basic Example

```javascript
import { HorizontalScrollbar, VerticalScrollbar } from '@rvanbaalen/custom-scroll';

// Create a horizontal scrollbar
const horizontalScrollbar = new HorizontalScrollbar({
  container: document.getElementById('my-container'),
  contentWidth: 2000,  // Total scrollable width in pixels
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

### Programmatic Control

The signal-based implementation enables programmatic control of the scrollbars:

```javascript
// Scroll to a specific position
horizontalScrollbar.scrollTo(500);

// Scroll to the middle
const middleX = (horizontalScrollbar.store.state.contentSize - horizontalScrollbar.store.state.visibleSize) / 2;
horizontalScrollbar.scrollTo(middleX);

// Get current scroll position
const currentPosition = horizontalScrollbar.scrollValue;

// Update content dimensions
horizontalScrollbar.setContentSize(3000);
verticalScrollbar.setContentSize(5000);

// Update visible dimensions (e.g., on window resize)
window.addEventListener('resize', () => {
  horizontalScrollbar.setVisibleSize(container.offsetWidth);
  verticalScrollbar.setVisibleSize(container.offsetHeight);
});
```

### Advanced Signal Usage

The signals integration allows for more complex reactive behavior:

```javascript
// Get direct access to the scroll signal
const scrollSignal = horizontalScrollbar.getScrollSignal();

// Connect to the signal for custom behavior
const cleanup = scrollSignal.connect((scrollValue) => {
  console.log('Horizontal scroll changed:', scrollValue);
  updateOtherElement(scrollValue);
});

// Clean up when done
cleanup();

// Create synchronized scrollbars
horizontalScrollbar.getScrollSignal().connect((scrollX) => {
  // Make vertical scrollbar follow horizontal scrollbar
  const ratio = scrollX / (horizontalScrollbar.store.state.contentSize - horizontalScrollbar.store.state.visibleSize);
  const targetY = ratio * (verticalScrollbar.store.state.contentSize - verticalScrollbar.store.state.visibleSize);
  verticalScrollbar.scrollTo(targetY);
});
```

### Smooth Animations

Create smooth scroll animations by controlling the scrollbar programmatically:

```javascript
function smoothScrollTo(scrollbar, targetPosition, duration = 500) {
  const startPosition = scrollbar.scrollValue;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();
  
  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
    
    const currentPosition = startPosition + (distance * easeProgress);
    scrollbar.scrollTo(currentPosition);
    
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  
  requestAnimationFrame(step);
}

// Usage
smoothScrollTo(horizontalScrollbar, 1000, 800);
```

### Styling

#### Using the included stylesheet

The package includes a basic stylesheet that you can import directly:

```javascript
// Import the default styles
import '@rvanbaalen/custom-scroll/scrollbar.css';
```

Or include it via HTML if you're using a bundled version:

```html
<link rel="stylesheet" href="path/to/node_modules/@rvanbaalen/custom-scroll/scrollbar.css">
```

#### Creating custom styles

You can also create your own custom styles. Add these to your CSS:

```css
/* Track styles */
.custom-scrollbar-track {
  position: absolute;
  background: #f1f1f1;  /* Track background color */
  border-radius: 4px;   /* Rounded corners */
  z-index: 100;         /* Ensure proper stacking */
}

/* Thumb styles */
.custom-scrollbar-thumb {
  position: absolute;
  background: #888;     /* Thumb color */
  border-radius: 4px;   /* Rounded corners */
  cursor: pointer;      /* Change cursor on hover */
  z-index: 101;         /* Stack above the track */
}

.custom-scrollbar-thumb:hover {
  background: #555;     /* Darker color on hover */
}

/* Container needs to be positioned relatively or absolutely */
#my-container {
  position: relative;
  overflow: hidden;     /* Hide default scrollbars */
}
```

#### Themed scrollbars

You can create different themes or styles:

```css
/* Dark theme */
.dark-theme .custom-scrollbar-track {
  background: #333;
}

.dark-theme .custom-scrollbar-thumb {
  background: #666;
}

.dark-theme .custom-scrollbar-thumb:hover {
  background: #999;
}

/* Minimal theme */
.minimal-theme .custom-scrollbar-track {
  background: transparent;
}

.minimal-theme .custom-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.minimal-theme .custom-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}
```

#### Advanced styling techniques

For more control, you can add additional classes to the scrollbars:

```javascript
// Add a custom class to the track and thumb elements
horizontalScrollbar.track.classList.add('custom-horizontal-track');
horizontalScrollbar.thumb.classList.add('custom-horizontal-thumb');

verticalScrollbar.track.classList.add('custom-vertical-track');
verticalScrollbar.thumb.classList.add('custom-vertical-thumb');
```

Then style these classes in your CSS:

```css
/* Custom styling for horizontal scrollbar */
.custom-horizontal-track {
  height: 6px;           /* Thinner track */
  bottom: 0;             /* Position at bottom */
}

.custom-horizontal-thumb {
  background: linear-gradient(to right, #4568dc, #b06ab3); /* Gradient thumb */
}

/* Custom styling for vertical scrollbar */
.custom-vertical-track {
  width: 6px;            /* Thinner track */
  right: 0;              /* Position at right */
}

.custom-vertical-thumb {
  background: linear-gradient(to bottom, #4568dc, #b06ab3); /* Gradient thumb */
}
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
- `scrollTo(value)`: Programmatically scrolls to a specific position
- `setContentSize(size)`: Updates the content size (width/height) and refreshes the scrollbar
- `setVisibleSize(size)`: Updates the visible size (width/height) and refreshes the scrollbar
- `getScrollSignal()`: Returns the signal that emits when scrolling occurs

### Properties

- `store.state.contentSize`: The total scrollable size (width or height)
- `store.state.visibleSize`: The visible size of the container (width or height)
- `scrollValue`: The current scroll position

## Use Cases

- Custom data grids with fixed headers/columns
- Design systems requiring consistent scrollbars across browsers
- Interactive dashboards with custom UI components
- Maps and visualization tools
- Virtual scrolling implementations
- Synchronized scrolling between multiple containers
- Smooth scroll animations and effects

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

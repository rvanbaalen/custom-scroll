// Example usage of the refactored custom scrollbar with signals

import { HorizontalScrollbar, VerticalScrollbar } from "../index.js";

/*
 * 1. Basic initialization (similar to original)
 * ----------------------------------------
 */

// Create a horizontal scrollbar
const container = document.getElementById("container");
const hScrollbar = new HorizontalScrollbar({
  container,
  contentWidth: 2000,
  visibleWidth: 500,
  onScroll: (newScrollX) => {
    // Update your content based on scroll position
    document.getElementById("content").style.transform = `translateX(-${newScrollX}px)`;
  },
});
// Create a vertical scrollbar
const vScrollbar = new VerticalScrollbar({
  container,
  contentHeight: 3000,
  visibleHeight: 700,
  onScroll: (newScrollY) => {
    // Update your content based on scroll position
    document.getElementById("content").style.transform = `translateY(-${newScrollY}px)`;
  },
});

/*
 * 2. Programmatic control (new functionality)
 * ----------------------------------------
 */

// Scroll to a specific position
document.getElementById("scrollToMiddleBtn").addEventListener("click", () => {
  // Scroll horizontally to the middle
  const middleX = (hScrollbar.store.state.contentSize - hScrollbar.store.state.visibleSize) / 2;
  hScrollbar.scrollTo(middleX);

  // Scroll vertically to the middle
  const middleY = (vScrollbar.store.state.contentSize - vScrollbar.store.state.visibleSize) / 2;
  vScrollbar.scrollTo(middleY);
});

// Scroll by a specific amount
document.getElementById("scrollRightBtn").addEventListener("click", () => {
  // Scroll 100px to the right
  const newPosition = hScrollbar.scrollValue + 100;
  hScrollbar.scrollTo(newPosition);
});

// Update visible dimensions dynamically (e.g., on window resize)
window.addEventListener("resize", () => {
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  hScrollbar.setVisibleSize(containerWidth);
  vScrollbar.setVisibleSize(containerHeight);
});

/*
 * 3. Advanced signal usage
 * ----------------------------------------
 */

// Connect to scrollbar signals directly for custom behavior
const hScrollSignal = hScrollbar.getScrollSignal();
const cleanupFn = hScrollSignal.connect((scrollValue) => {
  // Update something else in the UI
  document.getElementById("scrollPosition").textContent = `Scroll X: ${Math.round(scrollValue)}px`;
});

// Connect to both scrollbars to create synchronized behaviors
hScrollSignal.connect((scrollX) => {
  // Make vertical scrollbar follow horizontal scrollbar proportionally
  const ratio = scrollX / (hScrollbar.store.state.contentSize - hScrollbar.store.state.visibleSize);
  const targetY = ratio * (vScrollbar.store.state.contentSize - vScrollbar.store.state.visibleSize);

  // Only update if not already at this position (prevent loops)
  if (Math.abs(vScrollbar.scrollValue - targetY) > 1) {
    vScrollbar.scrollTo(targetY);
  }
});

// Usage with animation
function animateScroll(targetPosition, duration = 500) {
  const startPosition = hScrollbar.scrollValue;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Use easing function for smoother animation
    const easeProgress = 1 - (1 - progress) ** 3; // Cubic ease-out
    const currentPosition = startPosition + (distance * easeProgress);
    hScrollbar.scrollTo(currentPosition);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// Button to trigger smooth scroll animation
document.getElementById("smoothScrollBtn").addEventListener("click", () => {
  // Smoothly scroll to the end
  const endPosition = hScrollbar.store.state.contentSize - hScrollbar.store.state.visibleSize;
  animateScroll(endPosition, 1000);
});

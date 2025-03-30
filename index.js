/**
 * CustomScrollbar Library (Refactored with @rvanbaalen/signals)
 *
 * This library provides a base class for custom scrollbars as well as two
 * direction-specific implementations: HorizontalScrollbar and VerticalScrollbar.
 *
 * The library uses the @rvanbaalen/signals package for reactive state management
 * and component communication, allowing for both user-driven and programmatic
 * control of the scrollbars.
 */

import { createStore } from "@rvanbaalen/signals";

/**
 * Base class for custom scrollbars.
 * Provides common drag and track-click logic.
 * Uses signals for state management and event handling.
 */
class CustomScrollbarBase {
  /**
   * Creates an instance of CustomScrollbarBase.
   * @param {object} config - Configuration object.
   * @param {HTMLElement} config.container - The container element for the scrollbar.
   * @param {number} config.contentSize - The total scrollable size (width or height).
   * @param {number} config.visibleSize - The visible size of the container.
   * @param {Function} config.onScroll - Callback function invoked with the new scroll value.
   * @param {string} config.orientation - Either "horizontal" or "vertical".
   */
  constructor({ container, contentSize, visibleSize, onScroll, orientation }) {
    // Create store for state management
    this.store = createStore({
      container,
      contentSize,
      visibleSize,
      orientation,
      scrollValue: 0,
      thumbPosition: 0,
      thumbSize: 0,
      trackSize: 0,
      dragging: false,
      startPos: 0,
      startThumbPos: 0,
    }, ["scroll", "interaction"]);

    // Create DOM elements
    this.track = document.createElement("div");
    this.thumb = document.createElement("div");
    this.track.className = "custom-scrollbar-track";
    this.thumb.className = "custom-scrollbar-thumb";

    // Append thumb to track, and track to container.
    this.track.appendChild(this.thumb);
    container.appendChild(this.track);

    // Set up DOM event listeners
    this.thumb.addEventListener("mousedown", e => this.onDragStart(e));
    document.addEventListener("mousemove", e => this.onDrag(e));
    document.addEventListener("mouseup", e => this.onDragEnd(e));

    // When clicking on the track (outside the thumb).
    this.track.addEventListener("click", (e) => {
      if (e.target !== this.thumb) {
        const rect = this.track.getBoundingClientRect();
        const clickPos = this.store.state.orientation === "horizontal"
          ? e.clientX - rect.left
          : e.clientY - rect.top;
        const thumbSize = this.store.state.thumbSize;
        const trackSize = this.store.state.trackSize;
        const available = trackSize - thumbSize;
        const newScroll = available
          ? ((clickPos - thumbSize / 2) / available) * (this.store.state.contentSize - this.store.state.visibleSize)
          : 0;

        this.scrollTo(newScroll);
      }
    });

    // Set up signal connections
    this.scrollSignal = this.store.signals.scroll.get("changed");

    // Connect to the onScroll callback
    if (typeof onScroll === "function") {
      this.scrollSignal.connect(onScroll);
    }

    // Connect signal for internal state updates
    this.scrollSignal.connect(() => this.updateThumb());

    // Initial update
    this.update(0);
  }

  /**
   * Updates the scrollbar thumb's size and position.
   * This method may be overridden by subclasses to customize appearance.
   * @param {number} scrollValue - The current scroll value.
   */
  update(scrollValue) {
    // Update the store with the new scroll value
    this.store.update({ scrollValue }, "scroll", "changed");

    // Calculate track size
    const trackSize = this.store.state.orientation === "horizontal"
      ? this.track.offsetWidth
      : this.track.offsetHeight;
    // Calculate thumb size
    const ratio = this.store.state.contentSize > 0
      ? this.store.state.visibleSize / this.store.state.contentSize
      : 0;
    const thumbSize = Math.max(trackSize * ratio, 20);

    // Update store with new dimensions
    this.store.update({
      trackSize,
      thumbSize,
    });

    // Update the thumb position
    this.updateThumb();
  }

  /**
   * Updates the thumb position based on the current scroll value
   */
  updateThumb() {
    const { scrollValue, contentSize, visibleSize, trackSize, thumbSize } = this.store.state;
    const maxScroll = contentSize - visibleSize;
    const scrollRatio = maxScroll ? scrollValue / maxScroll : 0;
    const maxThumbPos = trackSize - thumbSize;
    const thumbPosition = scrollRatio * maxThumbPos;

    // Update thumb position in store
    this.store.update({ thumbPosition });

    // Apply position to the DOM
    if (this.store.state.orientation === "horizontal") {
      this.thumb.style.left = `${thumbPosition}px`;
    } else {
      this.thumb.style.top = `${thumbPosition}px`;
    }
  }

  /**
   * Programmatically scrolls to a specific position
   * @param {number} value - The scroll position to move to
   */
  scrollTo(value) {
    const maxScroll = this.store.state.contentSize - this.store.state.visibleSize;
    const scrollValue = Math.max(0, Math.min(value, maxScroll));
    this.store.update({ scrollValue }, "scroll", "changed");
  }

  /**
   * Handles the start of a drag operation.
   * @param {MouseEvent} e - The mousedown event.
   */
  onDragStart(e) {
    e.preventDefault();
    const currentPos = this.store.state.orientation === "horizontal" ? e.clientX : e.clientY;
    const startThumbPos = this.store.state.orientation === "horizontal"
      ? Number.parseFloat(this.thumb.style.left) || 0
      : Number.parseFloat(this.thumb.style.top) || 0;

    this.store.update({
      dragging: true,
      startPos: currentPos,
      startThumbPos,
    }, "interaction", "dragStart");
  }

  /**
   * Handles dragging of the scrollbar thumb.
   * @param {MouseEvent} e - The mousemove event.
   */
  onDrag(e) {
    if (!this.store.state.dragging) {
      return;
    }

    const { startPos, startThumbPos, trackSize, thumbSize, contentSize, visibleSize, orientation } = this.store.state;
    const currentPos = orientation === "horizontal" ? e.clientX : e.clientY;
    const delta = currentPos - startPos;
    let newThumbPos = startThumbPos + delta;
    newThumbPos = Math.max(0, Math.min(newThumbPos, trackSize - thumbSize));

    // Calculate new scroll value
    const available = trackSize - thumbSize;
    const ratio = available ? newThumbPos / available : 0;
    const newScroll = ratio * (contentSize - visibleSize);

    // Update the scroll value
    this.scrollTo(newScroll);
  }

  /**
   * Handles the end of the drag operation.
   * @param {MouseEvent} e - The mouseup event.
   */
  // eslint-disable-next-line unused-imports/no-unused-vars
  onDragEnd(e) {
    if (!this.store.state.dragging) {
      return;
    }

    this.store.update({
      dragging: false,
    }, "interaction", "dragEnd");
  }

  /**
   * Gets the current scroll value
   * @returns {number} The current scroll position
   */
  get scrollValue() {
    return this.store.state.scrollValue;
  }

  /**
   * Sets the content size and updates the scrollbar
   * @param {number} size - The new content size
   */
  setContentSize(size) {
    this.store.update({ contentSize: size });
    this.update(this.store.state.scrollValue);
  }

  /**
   * Sets the visible size and updates the scrollbar
   * @param {number} size - The new visible size
   */
  setVisibleSize(size) {
    this.store.update({ visibleSize: size });
    this.update(this.store.state.scrollValue);
  }

  /**
   * Get the scrollbar's signal for external connections
   * @returns {Signal} The scroll signal
   */
  getScrollSignal() {
    return this.scrollSignal;
  }
}

/**
 * HorizontalScrollbar: A custom scrollbar for horizontal scrolling.
 */
export class HorizontalScrollbar extends CustomScrollbarBase {
  /**
   * Creates an instance of HorizontalScrollbar.
   * @param {object} config - Configuration object.
   * @param {HTMLElement} config.container - The container element.
   * @param {number} config.contentWidth - The total scrollable width.
   * @param {number} config.visibleWidth - The visible width.
   * @param {Function} config.onScroll - Callback function for scroll events.
   */
  constructor({ container, contentWidth, visibleWidth, onScroll }) {
    super({
      container,
      contentSize: contentWidth,
      visibleSize: visibleWidth,
      onScroll,
      orientation: "horizontal",
    });

    // Set track-specific styles.
    this.track.style.height = "8px";
    this.track.style.left = "0px";
    this.track.style.right = "8px";
    this.track.style.bottom = "0px";

    // The thumb should fill the track vertically.
    this.thumb.style.height = "100%";

    // Initial update
    this.update(0);
  }

  /**
   * Updates the horizontal scrollbar thumb size and position.
   * @param {number} scrollValue - The current horizontal scroll value.
   */
  update(scrollValue) {
    super.update(scrollValue);

    // Set thumb width
    this.thumb.style.width = `${this.store.state.thumbSize}px`;
  }
}

/**
 * VerticalScrollbar: A custom scrollbar for vertical scrolling.
 */
export class VerticalScrollbar extends CustomScrollbarBase {
  /**
   * Creates an instance of VerticalScrollbar.
   * @param {object} config - Configuration object.
   * @param {HTMLElement} config.container - The container element.
   * @param {number} config.contentHeight - The total scrollable height.
   * @param {number} config.visibleHeight - The visible height.
   * @param {Function} config.onScroll - Callback function for scroll events.
   */
  constructor({ container, contentHeight, visibleHeight, onScroll }) {
    super({
      container,
      contentSize: contentHeight,
      visibleSize: visibleHeight,
      onScroll,
      orientation: "vertical",
    });

    // Set track-specific styles.
    this.track.style.width = "8px";
    this.track.style.top = "0px";
    this.track.style.bottom = "8px";
    this.track.style.right = "0px";

    // The thumb should fill the track horizontally.
    this.thumb.style.width = "100%";

    // Initial update
    this.update(0);
  }

  /**
   * Updates the vertical scrollbar thumb size and position.
   * @param {number} scrollValue - The current vertical scroll value.
   */
  update(scrollValue) {
    super.update(scrollValue);

    // Set thumb height
    this.thumb.style.height = `${this.store.state.thumbSize}px`;
  }
}

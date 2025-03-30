/**
 * CustomScrollbar Library
 *
 * This library provides a base class for custom scrollbars as well as two
 * direction-specific implementations: HorizontalScrollbar and VerticalScrollbar.
 *
 * The library expects a configuration object with the following properties:
 *   - container {HTMLElement} - The element that will contain the scrollbar.
 *   - contentSize {number} - The total scrollable size (width for horizontal, height for vertical).
 *   - visibleSize {number} - The visible size of the container (width for horizontal, height for vertical).
 *   - onScroll {function} - A callback that receives the new scroll position (number).
 *
 * Usage example:
 *
 * // Horizontal scrollbar:
 * import { HorizontalScrollbar } from "./scrollbars/CustomScrollbar.js";
 * const hScrollbar = new HorizontalScrollbar({
 *   container: document.getElementById('mainGridContainer'),
 *   contentSize: 5000,
 *   visibleSize: 800,
 *   onScroll: (newScrollX) => { console.log("New horizontal scroll:", newScrollX); }
 * });
 *
 * // Vertical scrollbar:
 * import { VerticalScrollbar } from "./scrollbars/CustomScrollbar.js";
 * const vScrollbar = new VerticalScrollbar({
 *   container: document.getElementById('mainGridContainer'),
 *   contentSize: 10000,
 *   visibleSize: 400,
 *   onScroll: (newScrollY) => { console.log("New vertical scroll:", newScrollY); }
 * });
 */

/**
 * Base class for custom scrollbars.
 * Provides common drag and track-click logic.
 * Subclasses must implement the update() method to adjust thumb size and position.
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
    this.container = container;
    this.contentSize = contentSize;
    this.visibleSize = visibleSize;
    this.onScroll = onScroll;
    this.orientation = orientation; // "horizontal" or "vertical"

    this.track = document.createElement("div");
    this.thumb = document.createElement("div");
    this.track.className = "custom-scrollbar-track";
    this.thumb.className = "custom-scrollbar-thumb";

    // Append thumb to track, and track to container.
    this.track.appendChild(this.thumb);
    container.appendChild(this.track);

    // State for dragging.
    this.dragging = false;
    this.startPos = 0;
    this.startThumbPos = 0;

    // Bind events.
    this.thumb.addEventListener("mousedown", e => this.onDragStart(e));
    document.addEventListener("mousemove", e => this.onDrag(e));
    document.addEventListener("mouseup", e => this.onDragEnd(e));

    // When clicking on the track (outside the thumb).
    this.track.addEventListener("click", (e) => {
      if (e.target !== this.thumb) {
        const rect = this.track.getBoundingClientRect();
        const clickPos = this.orientation === "horizontal"
          ? e.clientX - rect.left
          : e.clientY - rect.top;
        const thumbSize = this.orientation === "horizontal"
          ? this.thumb.offsetWidth
          : this.thumb.offsetHeight;
        const available = (this.orientation === "horizontal"
          ? this.track.offsetWidth
          : this.track.offsetHeight) - thumbSize;
        const newScroll = available
          ? ((clickPos - thumbSize / 2) / available) * (this.contentSize - this.visibleSize)
          : 0;
        this.onScroll(newScroll);
        this.update(newScroll);
      }
    });

    // Initial update.
    this.update(0);
  }

  /**
   * Updates the scrollbar thumb's size and position.
   * This method must be implemented by subclasses.
   * @param {number} scrollValue - The current scroll value.
   */
  // eslint-disable-next-line unused-imports/no-unused-vars
  update(scrollValue) {
    throw new Error("update() must be implemented by subclass.");
  }

  /**
   * Handles the start of a drag operation.
   * @param {MouseEvent} e - The mousedown event.
   */
  onDragStart(e) {
    e.preventDefault();
    this.dragging = true;
    this.startPos = this.orientation === "horizontal" ? e.clientX : e.clientY;
    this.startThumbPos = this.orientation === "horizontal"
      ? Number.parseFloat(this.thumb.style.left) || 0
      : Number.parseFloat(this.thumb.style.top) || 0;
  }

  /**
   * Handles dragging of the scrollbar thumb.
   * @param {MouseEvent} e - The mousemove event.
   */
  onDrag(e) {
    if (!this.dragging) {
      return;
    }

    const currentPos = this.orientation === "horizontal" ? e.clientX : e.clientY;
    const delta = currentPos - this.startPos;
    let newThumbPos = this.startThumbPos + delta;
    const trackSize = this.orientation === "horizontal"
      ? this.track.offsetWidth
      : this.track.offsetHeight;
    const thumbSize = this.orientation === "horizontal"
      ? this.thumb.offsetWidth
      : this.thumb.offsetHeight;
    newThumbPos = Math.max(0, Math.min(newThumbPos, trackSize - thumbSize));
    if (this.orientation === "horizontal") {
      this.thumb.style.left = `${newThumbPos}px`;
    } else {
      this.thumb.style.top = `${newThumbPos}px`;
    }

    const available = trackSize - thumbSize;
    const ratio = available ? newThumbPos / available : 0;
    const newScroll = ratio * (this.contentSize - this.visibleSize);
    this.onScroll(newScroll);
  }

  /**
   * Handles the end of the drag operation.
   * @param {MouseEvent} e - The mouseup event.
   */
  // eslint-disable-next-line unused-imports/no-unused-vars
  onDragEnd(e) {
    if (!this.dragging) {
      return;
    }

    this.dragging = false;
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
    // Reserve space on the right for vertical scrollbar.
    this.track.style.right = "8px";
    this.track.style.bottom = "0px";
    // The thumb should fill the track vertically.
    this.thumb.style.height = "100%";
    this.update(0);
  }

  /**
   * Updates the horizontal scrollbar thumb size and position.
   * @param {number} scrollValue - The current horizontal scroll value.
   */
  update(scrollValue) {
    const trackWidth = this.track.offsetWidth || (this.container.offsetWidth - 8);
    const ratio = this.contentSize > 0 ? this.visibleSize / this.contentSize : 0;
    const thumbWidth = Math.max(trackWidth * ratio, 20);
    this.thumb.style.width = `${thumbWidth}px`;
    const maxScroll = this.contentSize - this.visibleSize;
    const scrollRatio = maxScroll ? scrollValue / maxScroll : 0;
    const maxThumbPos = trackWidth - thumbWidth;
    const thumbPos = scrollRatio * maxThumbPos;
    this.thumb.style.left = `${thumbPos}px`;
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
    // Reserve space at the bottom for the horizontal scrollbar.
    this.track.style.bottom = "8px";
    this.track.style.right = "0px";
    // The thumb should fill the track horizontally.
    this.thumb.style.width = "100%";
    this.update(0);
  }

  /**
   * Updates the vertical scrollbar thumb size and position.
   * @param {number} scrollValue - The current vertical scroll value.
   */
  update(scrollValue) {
    const trackHeight = this.track.offsetHeight || (this.container.offsetHeight - 8);
    const ratio = this.contentSize > 0 ? this.visibleSize / this.contentSize : 0;
    const thumbHeight = Math.max(trackHeight * ratio, 20);
    this.thumb.style.height = `${thumbHeight}px`;
    const maxScroll = this.contentSize - this.visibleSize;
    const scrollRatio = maxScroll ? scrollValue / maxScroll : 0;
    const maxThumbPos = trackHeight - thumbHeight;
    const thumbPos = scrollRatio * maxThumbPos;
    this.thumb.style.top = `${thumbPos}px`;
  }
}

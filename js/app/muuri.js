"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

define(['lib/hammer.min'], function (Hammer) {
  'use strict';

  var namespace = 'Muuri';
  var gridInstances = {};
  var eventSynchronize = 'synchronize';
  var eventLayoutStart = 'layoutStart';
  var eventLayoutEnd = 'layoutEnd';
  var eventAdd = 'add';
  var eventRemove = 'remove';
  var eventShowStart = 'showStart';
  var eventShowEnd = 'showEnd';
  var eventHideStart = 'hideStart';
  var eventHideEnd = 'hideEnd';
  var eventFilter = 'filter';
  var eventSort = 'sort';
  var eventMove = 'move';
  var eventSend = 'send';
  var eventBeforeSend = 'beforeSend';
  var eventReceive = 'receive';
  var eventBeforeReceive = 'beforeReceive';
  var eventDragInit = 'dragInit';
  var eventDragStart = 'dragStart';
  var eventDragMove = 'dragMove';
  var eventDragScroll = 'dragScroll';
  var eventDragEnd = 'dragEnd';
  var eventDragReleaseStart = 'dragReleaseStart';
  var eventDragReleaseEnd = 'dragReleaseEnd';
  var eventDestroy = 'destroy';
  /**
   * Event emitter constructor.
   *
   * @class
   */

  function Emitter() {
    this._events = {};
    this._queue = [];
    this._counter = 0;
    this._isDestroyed = false;
  }
  /**
   * Public prototype methods
   * ************************
   */

  /**
   * Bind an event listener.
   *
   * @public
   * @memberof Emitter.prototype
   * @param {String} event
   * @param {Function} listener
   * @returns {Emitter}
   */


  Emitter.prototype.on = function (event, listener) {
    if (this._isDestroyed) return this; // Get listeners queue and create it if it does not exist.

    var listeners = this._events[event];
    if (!listeners) listeners = this._events[event] = []; // Add the listener to the queue.

    listeners.push(listener);
    return this;
  };
  /**
   * Bind an event listener that is triggered only once.
   *
   * @public
   * @memberof Emitter.prototype
   * @param {String} event
   * @param {Function} listener
   * @returns {Emitter}
   */


  Emitter.prototype.once = function (event, listener) {
    if (this._isDestroyed) return this;

    var callback = function () {
      this.off(event, callback);
      listener.apply(null, arguments);
    }.bind(this);

    return this.on(event, callback);
  };
  /**
   * Unbind all event listeners that match the provided listener function.
   *
   * @public
   * @memberof Emitter.prototype
   * @param {String} event
   * @param {Function} [listener]
   * @returns {Emitter}
   */


  Emitter.prototype.off = function (event, listener) {
    if (this._isDestroyed) return this; // Get listeners and return immediately if none is found.

    var listeners = this._events[event];
    if (!listeners || !listeners.length) return this; // If no specific listener is provided remove all listeners.

    if (!listener) {
      listeners.length = 0;
      return this;
    } // Remove all matching listeners.


    var i = listeners.length;

    while (i--) {
      if (listener === listeners[i]) listeners.splice(i, 1);
    }

    return this;
  };
  /**
   * Emit all listeners in a specified event with the provided arguments.
   *
   * @public
   * @memberof Emitter.prototype
   * @param {String} event
   * @param {*} [arg1]
   * @param {*} [arg2]
   * @param {*} [arg3]
   * @returns {Emitter}
   */


  Emitter.prototype.emit = function (event, arg1, arg2, arg3) {
    if (this._isDestroyed) return this; // Get event listeners and quit early if there's no listeners.

    var listeners = this._events[event];
    if (!listeners || !listeners.length) return this;
    var queue = this._queue;
    var qLength = queue.length;
    var aLength = arguments.length - 1;
    var i; // Add the current listeners to the callback queue before we process them.
    // This is necessary to guarantee that all of the listeners are called in
    // correct order even if new event listeners are removed/added during
    // processing and/or events are emitted during processing.

    for (i = 0; i < listeners.length; i++) {
      queue.push(listeners[i]);
    } // Increment queue counter. This is needed for the scenarios where emit is
    // triggered while the queue is already processing. We need to keep track of
    // how many "queue processors" there are active so that we can safely reset
    // the queue in the end when the last queue processor is finished.


    ++this._counter; // Process the queue (the specific part of it for this emit).

    for (i = qLength, qLength = queue.length; i < qLength; i++) {
      // prettier-ignore
      aLength === 0 ? queue[i]() : aLength === 1 ? queue[i](arg1) : aLength === 2 ? queue[i](arg1, arg2) : queue[i](arg1, arg2, arg3); // Stop processing if the emitter is destroyed.

      if (this._isDestroyed) return this;
    } // Decrement queue process counter.


    --this._counter; // Reset the queue if there are no more queue processes running.

    if (!this._counter) queue.length = 0;
    return this;
  };
  /**
   * Destroy emitter instance. Basically just removes all bound listeners.
   *
   * @public
   * @memberof Emitter.prototype
   * @returns {Emitter}
   */


  Emitter.prototype.destroy = function () {
    if (this._isDestroyed) return this;
    var events = this._events;
    var event; // Flag as destroyed.

    this._isDestroyed = true; // Reset queue (if queue is currently processing this will also stop that).

    this._queue.length = this._counter = 0; // Remove all listeners.

    for (event in events) {
      if (events[event]) {
        events[event].length = 0;
        events[event] = undefined;
      }
    }

    return this;
  }; // Set up the default export values.


  var isTransformSupported = false;
  var transformStyle = 'transform';
  var transformProp = 'transform'; // Find the supported transform prop and style names.

  var style = 'transform';
  var styleCap = 'Transform';
  ['', 'Webkit', 'Moz', 'O', 'ms'].forEach(function (prefix) {
    if (isTransformSupported) return;
    var propName = prefix ? prefix + styleCap : style;

    if (document.documentElement.style[propName] !== undefined) {
      prefix = prefix.toLowerCase();
      transformStyle = prefix ? '-' + prefix + '-' + style : style;
      transformProp = propName;
      isTransformSupported = true;
    }
  });
  var stylesCache = typeof WeakMap === 'function' ? new WeakMap() : null;
  /**
   * Returns the computed value of an element's style property as a string.
   *
   * @param {HTMLElement} element
   * @param {String} style
   * @returns {String}
   */

  function getStyle(element, style) {
    var styles = stylesCache && stylesCache.get(element);

    if (!styles) {
      styles = window.getComputedStyle(element, null);
      stylesCache && stylesCache.set(element, styles);
    }

    return styles.getPropertyValue(style === 'transform' ? transformStyle : style);
  }

  var styleNameRegEx = /([A-Z])/g;
  /**
   * Transforms a camel case style property to kebab case style property.
   *
   * @param {String} string
   * @returns {String}
   */

  function getStyleName(string) {
    return string.replace(styleNameRegEx, '-$1').toLowerCase();
  }
  /**
   * Set inline styles to an element.
   *
   * @param {HTMLElement} element
   * @param {Object} styles
   */


  function setStyles(element, styles) {
    for (var prop in styles) {
      element.style[prop === 'transform' ? transformProp : prop] = styles[prop];
    }
  }
  /**
   * Item animation handler powered by Web Animations API.
   *
   * @class
   * @param {HTMLElement} element
   */


  function ItemAnimate(element) {
    this._element = element;
    this._animation = null;
    this._callback = null;
    this._props = [];
    this._values = [];
    this._keyframes = [];
    this._options = {};
    this._isDestroyed = false;
    this._onFinish = this._onFinish.bind(this);
  }
  /**
   * Public prototype methods
   * ************************
   */

  /**
   * Start instance's animation. Automatically stops current animation if it is
   * running.
   *
   * @public
   * @memberof ItemAnimate.prototype
   * @param {Object} propsFrom
   * @param {Object} propsTo
   * @param {Object} [options]
   * @param {Number} [options.duration=300]
   * @param {String} [options.easing='ease']
   * @param {Function} [options.onFinish]
   */


  ItemAnimate.prototype.start = function (propsFrom, propsTo, options) {
    if (this._isDestroyed) return;
    var animation = this._animation;
    var currentProps = this._props;
    var currentValues = this._values;
    var opts = options || 0;
    var cancelAnimation = false; // If we have an existing animation running, let's check if it needs to be
    // cancelled or if it can continue running.

    if (animation) {
      var propCount = 0;
      var propIndex; // Check if the requested animation target props and values match with the
      // current props and values.

      for (var propName in propsTo) {
        ++propCount;
        propIndex = currentProps.indexOf(propName);

        if (propIndex === -1 || propsTo[propName] !== currentValues[propIndex]) {
          cancelAnimation = true;
          break;
        }
      } // Check if the target props count matches current props count. This is
      // needed for the edge case scenario where target props contain the same
      // styles as current props, but the current props have some additional
      // props.


      if (!cancelAnimation && propCount !== currentProps.length) {
        cancelAnimation = true;
      }
    } // Cancel animation (if required).


    if (cancelAnimation) animation.cancel(); // Store animation callback.

    this._callback = typeof opts.onFinish === 'function' ? opts.onFinish : null; // If we have a running animation that does not need to be cancelled, let's
    // call it a day here and let it run.

    if (animation && !cancelAnimation) return; // Store target props and values to instance.

    currentProps.length = currentValues.length = 0;

    for (propName in propsTo) {
      currentProps.push(propName);
      currentValues.push(propsTo[propName]);
    } // Set up keyframes.


    var animKeyframes = this._keyframes;
    animKeyframes[0] = propsFrom;
    animKeyframes[1] = propsTo; // Set up options.

    var animOptions = this._options;
    animOptions.duration = opts.duration || 300;
    animOptions.easing = opts.easing || 'ease'; // Start the animation

    var element = this._element;
    animation = element.animate(animKeyframes, animOptions);
    animation.onfinish = this._onFinish;
    this._animation = animation; // Set the end styles. This makes sure that the element stays at the end
    // values after animation is finished.

    setStyles(element, propsTo);
  };
  /**
   * Stop instance's current animation if running.
   *
   * @public
   * @memberof ItemAnimate.prototype
   * @param {Object} [styles]
   */


  ItemAnimate.prototype.stop = function (styles) {
    if (this._isDestroyed || !this._animation) return;
    var element = this._element;
    var currentProps = this._props;
    var currentValues = this._values;
    var propName;
    var propValue;
    var i; // Calculate (if not provided) and set styles.

    if (!styles) {
      for (i = 0; i < currentProps.length; i++) {
        propName = currentProps[i];
        propValue = getStyle(element, getStyleName(propName));
        element.style[propName === 'transform' ? transformProp : propName] = propValue;
      }
    } else {
      setStyles(element, styles);
    } //  Cancel animation.


    this._animation.cancel();

    this._animation = this._callback = null; // Reset current props and values.

    currentProps.length = currentValues.length = 0;
  };
  /**
   * Check if the item is being animated currently.
   *
   * @public
   * @memberof ItemAnimate.prototype
   * @return {Boolean}
   */


  ItemAnimate.prototype.isAnimating = function () {
    return !!this._animation;
  };
  /**
   * Destroy the instance and stop current animation if it is running.
   *
   * @public
   * @memberof ItemAnimate.prototype
   */


  ItemAnimate.prototype.destroy = function () {
    if (this._isDestroyed) return;
    this.stop();
    this._element = this._options = this._keyframes = null;
    this._isDestroyed = true;
  };
  /**
   * Private prototype methods
   * *************************
   */

  /**
   * Animation end handler.
   *
   * @private
   * @memberof ItemAnimate.prototype
   */


  ItemAnimate.prototype._onFinish = function () {
    var callback = this._callback;
    this._animation = this._callback = null;
    this._props.length = this._values.length = 0;
    callback && callback();
  };

  var raf = (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || rafFallback).bind(window);

  function rafFallback(cb) {
    return window.setTimeout(cb, 16);
  }
  /**
   * A ticker system for handling DOM reads and writes in an efficient way.
   * Contains a read queue and a write queue that are processed on the next
   * animation frame when needed.
   *
   * @class
   */


  function Ticker() {
    this._nextTick = null;
    this._queue = [];
    this._reads = {};
    this._writes = {};
    this._batch = [];
    this._batchReads = {};
    this._batchWrites = {};
    this._flush = this._flush.bind(this);
  }

  Ticker.prototype.add = function (id, readCallback, writeCallback, isImportant) {
    // First, let's check if an item has been added to the queues with the same id
    // and if so -> remove it.
    var currentIndex = this._queue.indexOf(id);

    if (currentIndex > -1) this._queue[currentIndex] = undefined; // Add all important callbacks to the beginning of the queue and other
    // callbacks to the end of the queue.

    isImportant ? this._queue.unshift(id) : this._queue.push(id); // Store callbacks.

    this._reads[id] = readCallback;
    this._writes[id] = writeCallback; // Finally, let's kick-start the next tick if it is not running yet.

    if (!this._nextTick) this._nextTick = raf(this._flush);
  };

  Ticker.prototype.cancel = function (id) {
    var currentIndex = this._queue.indexOf(id);

    if (currentIndex > -1) {
      this._queue[currentIndex] = undefined;
      this._reads[id] = undefined;
      this._writes[id] = undefined;
    }
  };

  Ticker.prototype._flush = function () {
    var queue = this._queue;
    var reads = this._reads;
    var writes = this._writes;
    var batch = this._batch;
    var batchReads = this._batchReads;
    var batchWrites = this._batchWrites;
    var length = queue.length;
    var id;
    var i; // Reset ticker.

    this._nextTick = null; // Setup queues and callback placeholders.

    for (i = 0; i < length; i++) {
      id = queue[i];
      if (!id) continue;
      batch.push(id);
      batchReads[id] = reads[id];
      reads[id] = undefined;
      batchWrites[id] = writes[id];
      writes[id] = undefined;
    } // Reset queue.


    queue.length = 0; // Process read callbacks.

    for (i = 0; i < length; i++) {
      id = batch[i];

      if (batchReads[id]) {
        batchReads[id]();
        batchReads[id] = undefined;
      }
    } // Process write callbacks.


    for (i = 0; i < length; i++) {
      id = batch[i];

      if (batchWrites[id]) {
        batchWrites[id]();
        batchWrites[id] = undefined;
      }
    } // Reset batch.


    batch.length = 0; // Restart the ticker if needed.

    if (!this._nextTick && queue.length) {
      this._nextTick = raf(this._flush);
    }
  };

  var ticker = new Ticker();
  var layoutTick = 'layout';
  var visibilityTick = 'visibility';
  var moveTick = 'move';
  var scrollTick = 'scroll';

  function addLayoutTick(itemId, readCallback, writeCallback) {
    return ticker.add(itemId + layoutTick, readCallback, writeCallback);
  }

  function cancelLayoutTick(itemId) {
    return ticker.cancel(itemId + layoutTick);
  }

  function addVisibilityTick(itemId, readCallback, writeCallback) {
    return ticker.add(itemId + visibilityTick, readCallback, writeCallback);
  }

  function cancelVisibilityTick(itemId) {
    return ticker.cancel(itemId + visibilityTick);
  }

  function addMoveTick(itemId, readCallback, writeCallback) {
    return ticker.add(itemId + moveTick, readCallback, writeCallback, true);
  }

  function cancelMoveTick(itemId) {
    return ticker.cancel(itemId + moveTick);
  }

  function addScrollTick(itemId, readCallback, writeCallback) {
    return ticker.add(itemId + scrollTick, readCallback, writeCallback, true);
  }

  function cancelScrollTick(itemId) {
    return ticker.cancel(itemId + scrollTick);
  }

  var proto = Element.prototype;
  var matches = proto.matches || proto.matchesSelector || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector;
  /**
   * Check if element matches a CSS selector.
   *
   * @param {*} val
   * @returns {Boolean}
   */

  function elementMatches(el, selector) {
    return matches.call(el, selector);
  }
  /**
   * Add class to an element.
   *
   * @param {HTMLElement} element
   * @param {String} className
   */


  function addClassModern(element, className) {
    element.classList.add(className);
  }
  /**
   * Add class to an element (legacy version, for IE9 support).
   *
   * @param {HTMLElement} element
   * @param {String} className
   */


  function addClassLegacy(element, className) {
    if (!elementMatches(element, '.' + className)) {
      element.className += ' ' + className;
    }
  }

  var addClass = 'classList' in Element.prototype ? addClassModern : addClassLegacy;
  /**
   * Normalize array index. Basically this function makes sure that the provided
   * array index is within the bounds of the provided array and also transforms
   * negative index to the matching positive index.
   *
   * @param {Array} array
   * @param {Number} index
   * @param {Boolean} isMigration
   */

  function normalizeArrayIndex(array, index, isMigration) {
    var length = array.length;
    var maxIndex = Math.max(0, isMigration ? length : length - 1);
    return index > maxIndex ? maxIndex : index < 0 ? Math.max(maxIndex + index + 1, 0) : index;
  }
  /**
   * Move array item to another index.
   *
   * @param {Array} array
   * @param {Number} fromIndex
   *   - Index (positive or negative) of the item that will be moved.
   * @param {Number} toIndex
   *   - Index (positive or negative) where the item should be moved to.
   */


  function arrayMove(array, fromIndex, toIndex) {
    // Make sure the array has two or more items.
    if (array.length < 2) return; // Normalize the indices.

    var from = normalizeArrayIndex(array, fromIndex);
    var to = normalizeArrayIndex(array, toIndex); // Add target item to the new position.

    if (from !== to) {
      array.splice(to, 0, array.splice(from, 1)[0]);
    }
  }
  /**
   * Swap array items.
   *
   * @param {Array} array
   * @param {Number} index
   *   - Index (positive or negative) of the item that will be swapped.
   * @param {Number} withIndex
   *   - Index (positive or negative) of the other item that will be swapped.
   */


  function arraySwap(array, index, withIndex) {
    // Make sure the array has two or more items.
    if (array.length < 2) return; // Normalize the indices.

    var indexA = normalizeArrayIndex(array, index);
    var indexB = normalizeArrayIndex(array, withIndex);
    var temp; // Swap the items.

    if (indexA !== indexB) {
      temp = array[indexA];
      array[indexA] = array[indexB];
      array[indexB] = temp;
    }
  }

  var actionCancel = 'cancel';
  var actionFinish = 'finish';
  /**
   * Returns a function, that, as long as it continues to be invoked, will not
   * be triggered. The function will be called after it stops being called for
   * N milliseconds. The returned function accepts one argument which, when
   * being "finish", calls the debounce function immediately if it is currently
   * waiting to be called, and when being "cancel" cancels the currently queued
   * function call.
   *
   * @param {Function} fn
   * @param {Number} wait
   * @returns {Function}
   */

  function debounce(fn, wait) {
    var timeout;

    if (wait > 0) {
      return function (action) {
        if (timeout !== undefined) {
          timeout = window.clearTimeout(timeout);
          if (action === actionFinish) fn();
        }

        if (action !== actionCancel && action !== actionFinish) {
          timeout = window.setTimeout(function () {
            timeout = undefined;
            fn();
          }, wait);
        }
      };
    }

    return function (action) {
      if (action !== actionCancel) fn();
    };
  }
  /**
   * Returns true if element is transformed, false if not. In practice the
   * element's display value must be anything else than "none" or "inline" as
   * well as have a valid transform value applied in order to be counted as a
   * transformed element.
   *
   * Borrowed from Mezr (v0.6.1):
   * https://github.com/niklasramo/mezr/blob/0.6.1/mezr.js#L661
   *
   * @param {HTMLElement} element
   * @returns {Boolean}
   */


  function isTransformed(element) {
    var transform = getStyle(element, 'transform');
    if (!transform || transform === 'none') return false;
    var display = getStyle(element, 'display');
    if (display === 'inline' || display === 'none') return false;
    return true;
  }
  /**
   * Returns an absolute positioned element's containing block, which is
   * considered to be the closest ancestor element that the target element's
   * positioning is relative to. Disclaimer: this only works as intended for
   * absolute positioned elements.
   *
   * @param {HTMLElement} element
   * @param {Boolean} [includeSelf=false]
   *   - When this is set to true the containing block checking is started from
   *     the provided element. Otherwise the checking is started from the
   *     provided element's parent element.
   * @returns {(Document|Element)}
   */


  function getContainingBlock(element, includeSelf) {
    // As long as the containing block is an element, static and not
    // transformed, try to get the element's parent element and fallback to
    // document. https://github.com/niklasramo/mezr/blob/0.6.1/mezr.js#L339
    var ret = (includeSelf ? element : element.parentElement) || document;

    while (ret && ret !== document && getStyle(ret, 'position') === 'static' && !isTransformed(ret)) {
      ret = ret.parentElement || document;
    }

    return ret;
  }
  /**
   * Returns the computed value of an element's style property transformed into
   * a float value.
   *
   * @param {HTMLElement} el
   * @param {String} style
   * @returns {Number}
   */


  function getStyleAsFloat(el, style) {
    return parseFloat(getStyle(el, style)) || 0;
  }

  var offsetA = {};
  var offsetB = {};
  var offsetDiff = {};
  /**
   * Returns the element's document offset, which in practice means the vertical
   * and horizontal distance between the element's northwest corner and the
   * document's northwest corner. Note that this function always returns the same
   * object so be sure to read the data from it instead using it as a reference.
   *
   * @param {(Document|Element|Window)} element
   * @param {Object} [offsetData]
   *   - Optional data object where the offset data will be inserted to. If not
   *     provided a new object will be created for the return data.
   * @returns {Object}
   */

  function getOffset(element, offsetData) {
    var ret = offsetData || {};
    var rect; // Set up return data.

    ret.left = 0;
    ret.top = 0; // Document's offsets are always 0.

    if (element === document) return ret; // Add viewport scroll left/top to the respective offsets.

    ret.left = window.pageXOffset || 0;
    ret.top = window.pageYOffset || 0; // Window's offsets are the viewport scroll left/top values.

    if (element.self === window.self) return ret; // Add element's client rects to the offsets.

    rect = element.getBoundingClientRect();
    ret.left += rect.left;
    ret.top += rect.top; // Exclude element's borders from the offset.

    ret.left += getStyleAsFloat(element, 'border-left-width');
    ret.top += getStyleAsFloat(element, 'border-top-width');
    return ret;
  }
  /**
   * Calculate the offset difference two elements.
   *
   * @param {HTMLElement} elemA
   * @param {HTMLElement} elemB
   * @param {Boolean} [compareContainingBlocks=false]
   *   - When this is set to true the containing blocks of the provided elements
   *     will be used for calculating the difference. Otherwise the provided
   *     elements will be compared directly.
   * @returns {Object}
   */


  function getOffsetDiff(elemA, elemB, compareContainingBlocks) {
    offsetDiff.left = 0;
    offsetDiff.top = 0; // If elements are same let's return early.

    if (elemA === elemB) return offsetDiff; // Compare containing blocks if necessary.

    if (compareContainingBlocks) {
      elemA = getContainingBlock(elemA, true);
      elemB = getContainingBlock(elemB, true); // If containing blocks are identical, let's return early.

      if (elemA === elemB) return offsetDiff;
    } // Finally, let's calculate the offset diff.


    getOffset(elemA, offsetA);
    getOffset(elemB, offsetB);
    offsetDiff.left = offsetB.left - offsetA.left;
    offsetDiff.top = offsetB.top - offsetA.top;
    return offsetDiff;
  }

  var translateData = {};
  /**
   * Returns the element's computed translateX and translateY values as a floats.
   * The returned object is always the same object and updated every time this
   * function is called.
   *
   * @param {HTMLElement} element
   * @returns {Object}
   */

  function getTranslate(element) {
    translateData.x = 0;
    translateData.y = 0;
    var transform = getStyle(element, 'transform');
    if (!transform) return translateData;
    var matrixData = transform.replace('matrix(', '').split(',');
    translateData.x = parseFloat(matrixData[4]) || 0;
    translateData.y = parseFloat(matrixData[5]) || 0;
    return translateData;
  }
  /**
   * Transform translateX and translateY value into CSS transform style
   * property's value.
   *
   * @param {Number} x
   * @param {Number} y
   * @returns {String}
   */


  function getTranslateString(x, y) {
    return 'translateX(' + x + 'px) translateY(' + y + 'px)';
  }

  var tempArray = [];
  /**
   * Insert an item or an array of items to array to a specified index. Mutates
   * the array. The index can be negative in which case the items will be added
   * to the end of the array.
   *
   * @param {Array} array
   * @param {*} items
   * @param {Number} [index=-1]
   */

  function arrayInsert(array, items, index) {
    var startIndex = typeof index === 'number' ? index : -1;
    if (startIndex < 0) startIndex = array.length - startIndex + 1;
    array.splice.apply(array, tempArray.concat(startIndex, 0, items));
    tempArray.length = 0;
  }

  var objectType = '[object Object]';
  var toString = Object.prototype.toString;
  /**
   * Check if a value is a plain object.
   *
   * @param {*} val
   * @returns {Boolean}
   */

  function isPlainObject(val) {
    return _typeof(val) === 'object' && toString.call(val) === objectType;
  }
  /**
   * Remove class from an element.
   *
   * @param {HTMLElement} element
   * @param {String} className
   */


  function removeClassModern(element, className) {
    element.classList.remove(className);
  }
  /**
   * Remove class from an element (legacy version, for IE9 support).
   *
   * @param {HTMLElement} element
   * @param {String} className
   */


  function removeClassLegacy(element, className) {
    if (elementMatches(element, '.' + className)) {
      element.className = (' ' + element.className + ' ').replace(' ' + className + ' ', ' ').trim();
    }
  }

  var removeClass = 'classList' in Element.prototype ? removeClassModern : removeClassLegacy; // To provide consistently correct dragging experience we need to know if
  // transformed elements leak fixed elements or not.

  var hasTransformLeak = checkTransformLeak(); // Drag start predicate states.

  var startPredicateInactive = 0;
  var startPredicatePending = 1;
  var startPredicateResolved = 2;
  var startPredicateRejected = 3;
  /**
   * Bind Hammer touch interaction to an item.
   *
   * @class
   * @param {Item} item
   */

  function ItemDrag(item) {
    if (!Hammer) {
      throw new Error('[' + namespace + '] required dependency Hammer is not defined.');
    } // If we don't have a valid transform leak test result yet, let's run the
    // test on first ItemDrag init. The test needs body element to be ready and
    // here we can be sure that it is ready.


    if (hasTransformLeak === null) {
      hasTransformLeak = checkTransformLeak();
    }

    var drag = this;
    var element = item._element;
    var grid = item.getGrid();
    var settings = grid._settings;
    var hammer; // Start predicate private data.

    var startPredicate = typeof settings.dragStartPredicate === 'function' ? settings.dragStartPredicate : ItemDrag.defaultStartPredicate;
    var startPredicateState = startPredicateInactive;
    var startPredicateResult; // Protected data.

    this._item = item;
    this._gridId = grid._id;
    this._hammer = hammer = new Hammer.Manager(element);
    this._isDestroyed = false;
    this._isMigrating = false; // Setup item's initial drag data.

    this._reset(); // Bind some methods that needs binding.


    this._onScroll = this._onScroll.bind(this);
    this._prepareMove = this._prepareMove.bind(this);
    this._applyMove = this._applyMove.bind(this);
    this._prepareScroll = this._prepareScroll.bind(this);
    this._applyScroll = this._applyScroll.bind(this);
    this._checkOverlap = this._checkOverlap.bind(this); // Create a private drag start resolver that can be used to resolve the drag
    // start predicate asynchronously.

    this._forceResolveStartPredicate = function (event) {
      if (!this._isDestroyed && startPredicateState === startPredicatePending) {
        startPredicateState = startPredicateResolved;

        this._onStart(event);
      }
    }; // Create debounce overlap checker function.


    this._checkOverlapDebounce = debounce(this._checkOverlap, settings.dragSortInterval); // Add drag recognizer to hammer.

    hammer.add(new Hammer.Pan({
      event: 'drag',
      pointers: 1,
      threshold: 0,
      direction: Hammer.DIRECTION_ALL
    })); // Add drag init recognizer to hammer.

    hammer.add(new Hammer.Press({
      event: 'draginit',
      pointers: 1,
      threshold: 1000,
      time: 0
    })); // Configure the hammer instance.

    if (isPlainObject(settings.dragHammerSettings)) {
      hammer.set(settings.dragHammerSettings);
    } // Bind drag events.


    hammer.on('draginit dragstart dragmove', function (e) {
      // Let's activate drag start predicate state.
      if (startPredicateState === startPredicateInactive) {
        startPredicateState = startPredicatePending;
      } // If predicate is pending try to resolve it.


      if (startPredicateState === startPredicatePending) {
        startPredicateResult = startPredicate(drag._item, e);

        if (startPredicateResult === true) {
          startPredicateState = startPredicateResolved;

          drag._onStart(e);
        } else if (startPredicateResult === false) {
          startPredicateState = startPredicateRejected;
        }
      } // Otherwise if predicate is resolved and drag is active, move the item.
      else if (startPredicateState === startPredicateResolved && drag._isActive) {
          drag._onMove(e);
        }
    }).on('dragend dragcancel draginitup', function (e) {
      // Check if the start predicate was resolved during drag.
      var isResolved = startPredicateState === startPredicateResolved; // Do final predicate check to allow user to unbind stuff for the current
      // drag procedure within the predicate callback. The return value of this
      // check will have no effect to the state of the predicate.

      startPredicate(drag._item, e); // Reset start predicate state.

      startPredicateState = startPredicateInactive; // If predicate is resolved and dragging is active, call the end handler.

      if (isResolved && drag._isActive) drag._onEnd(e);
    }); // Prevent native link/image dragging for the item and it's ancestors.

    element.addEventListener('dragstart', preventDefault, false);
  }
  /**
   * Public static methods
   * *********************
   */

  /**
   * Default drag start predicate handler that handles anchor elements
   * gracefully. The return value of this function defines if the drag is
   * started, rejected or pending. When true is returned the dragging is started
   * and when false is returned the dragging is rejected. If nothing is returned
   * the predicate will be called again on the next drag movement.
   *
   * @public
   * @memberof ItemDrag
   * @param {Item} item
   * @param {Object} event
   * @param {Object} [options]
   *   - An optional options object which can be used to pass the predicate
   *     it's options manually. By default the predicate retrieves the options
   *     from the grid's settings.
   * @returns {Boolean}
   */


  ItemDrag.defaultStartPredicate = function (item, event, options) {
    var drag = item._drag;

    var predicate = drag._startPredicateData || drag._setupStartPredicate(options); // Final event logic. At this stage return value does not matter anymore,
    // the predicate is either resolved or it's not and there's nothing to do
    // about it. Here we just reset data and if the item element is a link
    // we follow it (if there has only been slight movement).


    if (event.isFinal) {
      drag._finishStartPredicate(event);

      return;
    } // Find and store the handle element so we can check later on if the
    // cursor is within the handle. If we have a handle selector let's find
    // the corresponding element. Otherwise let's use the item element as the
    // handle.


    if (!predicate.handleElement) {
      predicate.handleElement = drag._getStartPredicateHandle(event);
      if (!predicate.handleElement) return false;
    } // If delay is defined let's keep track of the latest event and initiate
    // delay if it has not been done yet.


    if (predicate.delay) {
      predicate.event = event;

      if (!predicate.delayTimer) {
        predicate.delayTimer = window.setTimeout(function () {
          predicate.delay = 0;

          if (drag._resolveStartPredicate(predicate.event)) {
            drag._forceResolveStartPredicate(predicate.event);

            drag._resetStartPredicate();
          }
        }, predicate.delay);
      }
    }

    return drag._resolveStartPredicate(event);
  };
  /**
   * Default drag sort predicate.
   *
   * @public
   * @memberof ItemDrag
   * @param {Item} item
   * @param {Object} [options]
   * @param {Number} [options.threshold=50]
   * @param {String} [options.action='move']
   * @returns {(Boolean|DragSortCommand)}
   *   - Returns false if no valid index was found. Otherwise returns drag sort
   *     command.
   */


  ItemDrag.defaultSortPredicate = function () {
    var itemRect = {};
    var targetRect = {};
    var returnData = {};
    var rootGridArray = [];

    function getTargetGrid(item, rootGrid, threshold) {
      var target = null;
      var dragSort = rootGrid._settings.dragSort;
      var bestScore = -1;
      var gridScore;
      var grids;
      var grid;
      var i; // Get potential target grids.

      if (dragSort === true) {
        rootGridArray[0] = rootGrid;
        grids = rootGridArray;
      } else {
        grids = dragSort.call(rootGrid, item);
      } // Return immediately if there are no grids.


      if (!Array.isArray(grids)) return target; // Loop through the grids and get the best match.

      for (i = 0; i < grids.length; i++) {
        grid = grids[i]; // Filter out all destroyed grids.

        if (grid._isDestroyed) continue; // We need to update the grid's offsets and dimensions since they might
        // have changed (e.g during scrolling).

        grid._updateBoundingRect(); // Check how much dragged element overlaps the container element.


        targetRect.width = grid._width;
        targetRect.height = grid._height;
        targetRect.left = grid._left;
        targetRect.top = grid._top;
        gridScore = getRectOverlapScore(itemRect, targetRect); // Check if this grid is the best match so far.

        if (gridScore > threshold && gridScore > bestScore) {
          bestScore = gridScore;
          target = grid;
        }
      } // Always reset root grid array.


      rootGridArray.length = 0;
      return target;
    }

    return function (item, options) {
      var drag = item._drag;

      var rootGrid = drag._getGrid(); // Get drag sort predicate settings.


      var sortThreshold = options && typeof options.threshold === 'number' ? options.threshold : 50;
      var sortAction = options && options.action === 'swap' ? 'swap' : 'move'; // Populate item rect data.

      itemRect.width = item._width;
      itemRect.height = item._height;
      itemRect.left = drag._elementClientX;
      itemRect.top = drag._elementClientY; // Calculate the target grid.

      var grid = getTargetGrid(item, rootGrid, sortThreshold); // Return early if we found no grid container element that overlaps the
      // dragged item enough.

      if (!grid) return false;
      var gridOffsetLeft = 0;
      var gridOffsetTop = 0;
      var matchScore = -1;
      var matchIndex;
      var hasValidTargets;
      var target;
      var score;
      var i; // If item is moved within it's originating grid adjust item's left and
      // top props. Otherwise if item is moved to/within another grid get the
      // container element's offset (from the element's content edge).

      if (grid === rootGrid) {
        itemRect.left = drag._gridX + item._marginLeft;
        itemRect.top = drag._gridY + item._marginTop;
      } else {
        grid._updateBorders(1, 0, 1, 0);

        gridOffsetLeft = grid._left + grid._borderLeft;
        gridOffsetTop = grid._top + grid._borderTop;
      } // Loop through the target grid items and try to find the best match.


      for (i = 0; i < grid._items.length; i++) {
        target = grid._items[i]; // If the target item is not active or the target item is the dragged
        // item let's skip to the next item.

        if (!target._isActive || target === item) {
          continue;
        } // Mark the grid as having valid target items.


        hasValidTargets = true; // Calculate the target's overlap score with the dragged item.

        targetRect.width = target._width;
        targetRect.height = target._height;
        targetRect.left = target._left + target._marginLeft + gridOffsetLeft;
        targetRect.top = target._top + target._marginTop + gridOffsetTop;
        score = getRectOverlapScore(itemRect, targetRect); // Update best match index and score if the target's overlap score with
        // the dragged item is higher than the current best match score.

        if (score > matchScore) {
          matchIndex = i;
          matchScore = score;
        }
      } // If there is no valid match and the item is being moved into another
      // grid.


      if (matchScore < sortThreshold && item.getGrid() !== grid) {
        matchIndex = hasValidTargets ? -1 : 0;
        matchScore = Infinity;
      } // Check if the best match overlaps enough to justify a placement switch.


      if (matchScore >= sortThreshold) {
        returnData.grid = grid;
        returnData.index = matchIndex;
        returnData.action = sortAction;
        return returnData;
      }

      return false;
    };
  }();
  /**
   * Public prototype methods
   * ************************
   */

  /**
   * Abort dragging and reset drag data.
   *
   * @public
   * @memberof ItemDrag.prototype
   * @returns {ItemDrag}
   */


  ItemDrag.prototype.stop = function () {
    var item = this._item;
    var element = item._element;

    var grid = this._getGrid();

    if (!this._isActive) return this; // If the item is being dropped into another grid, finish it up and return
    // immediately.

    if (this._isMigrating) {
      this._finishMigration();

      return this;
    } // Cancel queued move and scroll ticks.


    cancelMoveTick(item._id);
    cancelScrollTick(item._id); // Remove scroll listeners.

    this._unbindScrollListeners(); // Cancel overlap check.


    this._checkOverlapDebounce('cancel'); // Append item element to the container if it's not it's child. Also make
    // sure the translate values are adjusted to account for the DOM shift.


    if (element.parentNode !== grid._element) {
      grid._element.appendChild(element);

      element.style[transformProp] = getTranslateString(this._gridX, this._gridY);
    } // Remove dragging class.


    removeClass(element, grid._settings.itemDraggingClass); // Reset drag data.

    this._reset();

    return this;
  };
  /**
   * Destroy instance.
   *
   * @public
   * @memberof ItemDrag.prototype
   * @returns {ItemDrag}
   */


  ItemDrag.prototype.destroy = function () {
    if (this._isDestroyed) return this;
    this.stop();

    this._hammer.destroy();

    this._item._element.removeEventListener('dragstart', preventDefault, false);

    this._isDestroyed = true;
    return this;
  };
  /**
   * Private prototype methods
   * *************************
   */

  /**
   * Get Grid instance.
   *
   * @private
   * @memberof ItemDrag.prototype
   * @returns {?Grid}
   */


  ItemDrag.prototype._getGrid = function () {
    return gridInstances[this._gridId] || null;
  };
  /**
   * Setup/reset drag data.
   *
   * @private
   * @memberof ItemDrag.prototype
   */


  ItemDrag.prototype._reset = function () {
    // Is item being dragged?
    this._isActive = false; // The dragged item's container element.

    this._container = null; // The dragged item's containing block.

    this._containingBlock = null; // Hammer event data.

    this._lastEvent = null;
    this._lastScrollEvent = null; // All the elements which need to be listened for scroll events during
    // dragging.

    this._scrollers = []; // The current translateX/translateY position.

    this._left = 0;
    this._top = 0; // Dragged element's current position within the grid.

    this._gridX = 0;
    this._gridY = 0; // Dragged element's current offset from window's northwest corner. Does
    // not account for element's margins.

    this._elementClientX = 0;
    this._elementClientY = 0; // Offset difference between the dragged element's temporary drag
    // container and it's original container.

    this._containerDiffX = 0;
    this._containerDiffY = 0;
  };
  /**
   * Bind drag scroll handlers to all scrollable ancestor elements of the
   * dragged element and the drag container element.
   *
   * @private
   * @memberof ItemDrag.prototype
   */


  ItemDrag.prototype._bindScrollListeners = function () {
    var gridContainer = this._getGrid()._element;

    var dragContainer = this._container;
    var scrollers = this._scrollers;
    var containerScrollers;
    var i; // Get dragged element's scrolling parents.

    scrollers.length = 0;
    getScrollParents(this._item._element, scrollers); // If drag container is defined and it's not the same element as grid
    // container then we need to add the grid container and it's scroll parents
    // to the elements which are going to be listener for scroll events.

    if (dragContainer !== gridContainer) {
      containerScrollers = [];
      getScrollParents(gridContainer, containerScrollers);
      containerScrollers.push(gridContainer);

      for (i = 0; i < containerScrollers.length; i++) {
        if (scrollers.indexOf(containerScrollers[i]) < 0) {
          scrollers.push(containerScrollers[i]);
        }
      }
    } // Bind scroll listeners.


    for (i = 0; i < scrollers.length; i++) {
      scrollers[i].addEventListener('scroll', this._onScroll);
    }
  };
  /**
   * Unbind currently bound drag scroll handlers from all scrollable ancestor
   * elements of the dragged element and the drag container element.
   *
   * @private
   * @memberof ItemDrag.prototype
   */


  ItemDrag.prototype._unbindScrollListeners = function () {
    var scrollers = this._scrollers;
    var i;

    for (i = 0; i < scrollers.length; i++) {
      scrollers[i].removeEventListener('scroll', this._onScroll);
    }

    scrollers.length = 0;
  };
  /**
   * Setup default start predicate.
   *
   * @private
   * @memberof ItemDrag.prototype
   * @param {Object} [options]
   * @returns {Object}
   */


  ItemDrag.prototype._setupStartPredicate = function (options) {
    var config = options || this._getGrid()._settings.dragStartPredicate || 0;
    return this._startPredicateData = {
      distance: Math.abs(config.distance) || 0,
      delay: Math.max(config.delay, 0) || 0,
      handle: typeof config.handle === 'string' ? config.handle : false
    };
  };
  /**
   * Setup default start predicate handle.
   *
   * @private
   * @memberof ItemDrag.prototype
   * @param {Object} event
   * @returns {?HTMLElement}
   */


  ItemDrag.prototype._getStartPredicateHandle = function (event) {
    var predicate = this._startPredicateData;
    var element = this._item._element;
    var handleElement = element; // No handle, no hassle -> let's use the item element as the handle.

    if (!predicate.handle) return handleElement; // If there is a specific predicate handle defined, let's try to get it.

    handleElement = (event.changedPointers[0] || 0).target;

    while (handleElement && !elementMatches(handleElement, predicate.handle)) {
      handleElement = handleElement !== element ? handleElement.parentElement : null;
    }

    return handleElement || null;
  };
  /**
   * Unbind currently bound drag scroll handlers from all scrollable ancestor
   * elements of the dragged element and the drag container element.
   *
   * @private
   * @memberof ItemDrag.prototype
   * @param {Object} event
   * @returns {Boolean}
   */


  ItemDrag.prototype._resolveStartPredicate = function (event) {
    var predicate = this._startPredicateData;
    var pointer = event.changedPointers[0];
    var pageX = pointer && pointer.pageX || 0;
    var pageY = pointer && pointer.pageY || 0;
    var handleRect;
    var handleLeft;
    var handleTop;
    var handleWidth;
    var handleHeight; // If the moved distance is smaller than the threshold distance or there is
    // some delay left, ignore this predicate cycle.

    if (event.distance < predicate.distance || predicate.delay) return; // Get handle rect data.

    handleRect = predicate.handleElement.getBoundingClientRect();
    handleLeft = handleRect.left + (window.pageXOffset || 0);
    handleTop = handleRect.top + (window.pageYOffset || 0);
    handleWidth = handleRect.width;
    handleHeight = handleRect.height; // Reset predicate data.

    this._resetStartPredicate(); // If the cursor is still within the handle let's start the drag.


    return handleWidth && handleHeight && pageX >= handleLeft && pageX < handleLeft + handleWidth && pageY >= handleTop && pageY < handleTop + handleHeight;
  };
  /**
   * Finalize start predicate.
   *
   * @private
   * @memberof ItemDrag.prototype
   * @param {Object} event
   */


  ItemDrag.prototype._finishStartPredicate = function (event) {
    var element = this._item._element; // Reset predicate.

    this._resetStartPredicate(); // If the gesture can be interpreted as click let's try to open the element's
    // href url (if it is an anchor element).


    if (isClick(event)) openAnchorHref(element);
  };
  /**
   * Reset for default drag start predicate function.
   *
   * @private
   * @memberof ItemDrag.prototype
   */


  ItemDrag.prototype._resetStartPredicate = function () {
    var predicate = this._startPredicateData;

    if (predicate) {
      if (predicate.delayTimer) {
        predicate.delayTimer = window.clearTimeout(predicate.delayTimer);
      }

      this._startPredicateData = null;
    }
  };
  /**
   * Check (during drag) if an item is overlapping other items and based on
   * the configuration layout the items.
   *
   * @private
   * @memberof ItemDrag.prototype
   */


  ItemDrag.prototype._checkOverlap = function () {
    if (!this._isActive) return;
    var item = this._item;

    var settings = this._getGrid()._settings;

    var result;
    var currentGrid;
    var currentIndex;
    var targetGrid;
    var targetIndex;
    var sortAction;
    var isMigration; // Get overlap check result.

    if (typeof settings.dragSortPredicate === 'function') {
      result = settings.dragSortPredicate(item, this._lastEvent);
    } else {
      result = ItemDrag.defaultSortPredicate(item, settings.dragSortPredicate);
    } // Let's make sure the result object has a valid index before going further.


    if (!result || typeof result.index !== 'number') return;
    currentGrid = item.getGrid();
    targetGrid = result.grid || currentGrid;
    isMigration = currentGrid !== targetGrid;
    currentIndex = currentGrid._items.indexOf(item);
    targetIndex = normalizeArrayIndex(targetGrid._items, result.index, isMigration);
    sortAction = result.action === 'swap' ? 'swap' : 'move'; // If the item was moved within it's current grid.

    if (!isMigration) {
      // Make sure the target index is not the current index.
      if (currentIndex !== targetIndex) {
        // Do the sort.
        (sortAction === 'swap' ? arraySwap : arrayMove)(currentGrid._items, currentIndex, targetIndex); // Emit move event.

        if (currentGrid._hasListeners(eventMove)) {
          currentGrid._emit(eventMove, {
            item: item,
            fromIndex: currentIndex,
            toIndex: targetIndex,
            action: sortAction
          });
        } // Layout the grid.


        currentGrid.layout();
      }
    } // If the item was moved to another grid.
    else {
        // Emit beforeSend event.
        if (currentGrid._hasListeners(eventBeforeSend)) {
          currentGrid._emit(eventBeforeSend, {
            item: item,
            fromGrid: currentGrid,
            fromIndex: currentIndex,
            toGrid: targetGrid,
            toIndex: targetIndex
          });
        } // Emit beforeReceive event.


        if (targetGrid._hasListeners(eventBeforeReceive)) {
          targetGrid._emit(eventBeforeReceive, {
            item: item,
            fromGrid: currentGrid,
            fromIndex: currentIndex,
            toGrid: targetGrid,
            toIndex: targetIndex
          });
        } // Update item's grid id reference.


        item._gridId = targetGrid._id; // Update drag instance's migrating indicator.

        this._isMigrating = item._gridId !== this._gridId; // Move item instance from current grid to target grid.

        currentGrid._items.splice(currentIndex, 1);

        arrayInsert(targetGrid._items, item, targetIndex); // Set sort data as null, which is an indicator for the item comparison
        // function that the sort data of this specific item should be fetched
        // lazily.

        item._sortData = null; // Emit send event.

        if (currentGrid._hasListeners(eventSend)) {
          currentGrid._emit(eventSend, {
            item: item,
            fromGrid: currentGrid,
            fromIndex: currentIndex,
            toGrid: targetGrid,
            toIndex: targetIndex
          });
        } // Emit receive event.


        if (targetGrid._hasListeners(eventReceive)) {
          targetGrid._emit(eventReceive, {
            item: item,
            fromGrid: currentGrid,
            fromIndex: currentIndex,
            toGrid: targetGrid,
            toIndex: targetIndex
          });
        } // Layout both grids.


        currentGrid.layout();
        targetGrid.layout();
      }
  };
  /**
   * If item is dragged into another grid, finish the migration process
   * gracefully.
   *
   * @private
   * @memberof ItemDrag.prototype
   */


  ItemDrag.prototype._finishMigration = function () {
    var item = this._item;
    var release = item._release;
    var element = item._element;
    var isActive = item._isActive;
    var targetGrid = item.getGrid();
    var targetGridElement = targetGrid._element;
    var targetSettings = targetGrid._settings;
    var targetContainer = targetSettings.dragContainer || targetGridElement;

    var currentSettings = this._getGrid()._settings;

    var currentContainer = element.parentNode;
    var translate;
    var offsetDiff; // Destroy current drag. Note that we need to set the migrating flag to
    // false first, because otherwise we create an infinite loop between this
    // and the drag.stop() method.

    this._isMigrating = false;
    this.destroy(); // Remove current classnames.

    removeClass(element, currentSettings.itemClass);
    removeClass(element, currentSettings.itemVisibleClass);
    removeClass(element, currentSettings.itemHiddenClass); // Add new classnames.

    addClass(element, targetSettings.itemClass);
    addClass(element, isActive ? targetSettings.itemVisibleClass : targetSettings.itemHiddenClass); // Move the item inside the target container if it's different than the
    // current container.

    if (targetContainer !== currentContainer) {
      targetContainer.appendChild(element);
      offsetDiff = getOffsetDiff(currentContainer, targetContainer, true);
      translate = getTranslate(element);
      translate.x -= offsetDiff.left;
      translate.y -= offsetDiff.top;
    } // Update item's cached dimensions and sort data.


    item._refreshDimensions();

    item._refreshSortData(); // Calculate the offset difference between target's drag container (if any)
    // and actual grid container element. We save it later for the release
    // process.


    offsetDiff = getOffsetDiff(targetContainer, targetGridElement, true);
    release._containerDiffX = offsetDiff.left;
    release._containerDiffY = offsetDiff.top; // Recreate item's drag handler.

    item._drag = targetSettings.dragEnabled ? new ItemDrag(item) : null; // Adjust the position of the item element if it was moved from a container
    // to another.

    if (targetContainer !== currentContainer) {
      element.style[transformProp] = getTranslateString(translate.x, translate.y);
    } // Update child element's styles to reflect the current visibility state.


    item._child.removeAttribute('style');

    setStyles(item._child, isActive ? targetSettings.visibleStyles : targetSettings.hiddenStyles); // Start the release.

    release.start();
  };
  /**
   * Drag start handler.
   *
   * @private
   * @memberof ItemDrag.prototype
   * @param {Object} event
   */


  ItemDrag.prototype._onStart = function (event) {
    var item = this._item; // If item is not active, don't start the drag.

    if (!item._isActive) return;
    var element = item._element;

    var grid = this._getGrid();

    var settings = grid._settings;
    var release = item._release;
    var migrate = item._migrate;
    var gridContainer = grid._element;
    var dragContainer = settings.dragContainer || gridContainer;
    var containingBlock = getContainingBlock(dragContainer, true);
    var translate = getTranslate(element);
    var currentLeft = translate.x;
    var currentTop = translate.y;
    var elementRect = element.getBoundingClientRect();
    var hasDragContainer = dragContainer !== gridContainer;
    var offsetDiff; // If grid container is not the drag container, we need to calculate the
    // offset difference between grid container and drag container's containing
    // element.

    if (hasDragContainer) {
      offsetDiff = getOffsetDiff(containingBlock, gridContainer);
    } // Stop current positioning animation.


    if (item.isPositioning()) {
      item._layout.stop(true, {
        transform: getTranslateString(currentLeft, currentTop)
      });
    } // Stop current migration animation.


    if (migrate._isActive) {
      currentLeft -= migrate._containerDiffX;
      currentTop -= migrate._containerDiffY;
      migrate.stop(true, {
        transform: getTranslateString(currentLeft, currentTop)
      });
    } // If item is being released reset release data.


    if (item.isReleasing()) release._reset(); // Setup drag data.

    this._isActive = true;
    this._lastEvent = event;
    this._container = dragContainer;
    this._containingBlock = containingBlock;
    this._elementClientX = elementRect.left;
    this._elementClientY = elementRect.top;
    this._left = this._gridX = currentLeft;
    this._top = this._gridY = currentTop; // Emit dragInit event.

    grid._emit(eventDragInit, item, event); // If a specific drag container is set and it is different from the
    // grid's container element we need to cast some extra spells.


    if (hasDragContainer) {
      // Store the container offset diffs to drag data.
      this._containerDiffX = offsetDiff.left;
      this._containerDiffY = offsetDiff.top; // If the dragged element is a child of the drag container all we need to
      // do is setup the relative drag position data.

      if (element.parentNode === dragContainer) {
        this._gridX = currentLeft - this._containerDiffX;
        this._gridY = currentTop - this._containerDiffY;
      } // Otherwise we need to append the element inside the correct container,
      // setup the actual drag position data and adjust the element's translate
      // values to account for the DOM position shift.
      else {
          this._left = currentLeft + this._containerDiffX;
          this._top = currentTop + this._containerDiffY;
          dragContainer.appendChild(element);
          element.style[transformProp] = getTranslateString(this._left, this._top);
        }
    } // Set drag class and bind scrollers.


    addClass(element, settings.itemDraggingClass);

    this._bindScrollListeners(); // Emit dragStart event.


    grid._emit(eventDragStart, item, event);
  };
  /**
   * Drag move handler.
   *
   * @private
   * @memberof ItemDrag.prototype
   * @param {Object} event
   */


  ItemDrag.prototype._onMove = function (event) {
    var item = this._item; // If item is not active, reset drag.

    if (!item._isActive) {
      this.stop();
      return;
    }

    var settings = this._getGrid()._settings;

    var axis = settings.dragAxis;
    var xDiff = event.deltaX - this._lastEvent.deltaX;
    var yDiff = event.deltaY - this._lastEvent.deltaY; // Update last event.

    this._lastEvent = event; // Update horizontal position data.

    if (axis !== 'y') {
      this._left += xDiff;
      this._gridX += xDiff;
      this._elementClientX += xDiff;
    } // Update vertical position data.


    if (axis !== 'x') {
      this._top += yDiff;
      this._gridY += yDiff;
      this._elementClientY += yDiff;
    } // Do move prepare/apply handling in the next tick.


    addMoveTick(item._id, this._prepareMove, this._applyMove);
  };
  /**
   * Prepare dragged item for moving.
   *
   * @private
   * @memberof ItemDrag.prototype
   */


  ItemDrag.prototype._prepareMove = function () {
    // Do nothing if item is not active.
    if (!this._item._isActive) return; // If drag sort is enabled -> check overlap.

    if (this._getGrid()._settings.dragSort) this._checkOverlapDebounce();
  };
  /**
   * Apply movement to dragged item.
   *
   * @private
   * @memberof ItemDrag.prototype
   */


  ItemDrag.prototype._applyMove = function () {
    var item = this._item; // Do nothing if item is not active.

    if (!item._isActive) return; // Update element's translateX/Y values.

    item._element.style[transformProp] = getTranslateString(this._left, this._top); // Emit dragMove event.

    this._getGrid()._emit(eventDragMove, item, this._lastEvent);
  };
  /**
   * Drag scroll handler.
   *
   * @private
   * @memberof ItemDrag.prototype
   * @param {Object} event
   */


  ItemDrag.prototype._onScroll = function (event) {
    var item = this._item; // If item is not active, reset drag.

    if (!item._isActive) {
      this.stop();
      return;
    } // Update last scroll event.


    this._lastScrollEvent = event; // Do scroll prepare/apply handling in the next tick.

    addScrollTick(item._id, this._prepareScroll, this._applyScroll);
  };
  /**
   * Prepare dragged item for scrolling.
   *
   * @private
   * @memberof ItemDrag.prototype
   */


  ItemDrag.prototype._prepareScroll = function () {
    var item = this._item; // If item is not active do nothing.

    if (!item._isActive) return;
    var element = item._element;

    var grid = this._getGrid();

    var settings = grid._settings;
    var axis = settings.dragAxis;
    var gridContainer = grid._element;
    var offsetDiff; // Calculate element's rect and x/y diff.

    var rect = element.getBoundingClientRect();
    var xDiff = this._elementClientX - rect.left;
    var yDiff = this._elementClientY - rect.top; // Update container diff.

    if (this._container !== gridContainer) {
      offsetDiff = getOffsetDiff(this._containingBlock, gridContainer);
      this._containerDiffX = offsetDiff.left;
      this._containerDiffY = offsetDiff.top;
    } // Update horizontal position data.


    if (axis !== 'y') {
      this._left += xDiff;
      this._gridX = this._left - this._containerDiffX;
    } // Update vertical position data.


    if (axis !== 'x') {
      this._top += yDiff;
      this._gridY = this._top - this._containerDiffY;
    } // Overlap handling.


    if (settings.dragSort) this._checkOverlapDebounce();
  };
  /**
   * Apply scroll to dragged item.
   *
   * @private
   * @memberof ItemDrag.prototype
   */


  ItemDrag.prototype._applyScroll = function () {
    var item = this._item; // If item is not active do nothing.

    if (!item._isActive) return; // Update element's translateX/Y values.

    item._element.style[transformProp] = getTranslateString(this._left, this._top); // Emit dragScroll event.

    this._getGrid()._emit(eventDragScroll, item, this._lastScrollEvent);
  };
  /**
   * Drag end handler.
   *
   * @private
   * @memberof ItemDrag.prototype
   * @param {Object} event
   */


  ItemDrag.prototype._onEnd = function (event) {
    var item = this._item;
    var element = item._element;

    var grid = this._getGrid();

    var settings = grid._settings;
    var release = item._release; // If item is not active, reset drag.

    if (!item._isActive) {
      this.stop();
      return;
    } // Cancel queued move and scroll ticks.


    cancelMoveTick(item._id);
    cancelScrollTick(item._id); // Finish currently queued overlap check.

    settings.dragSort && this._checkOverlapDebounce('finish'); // Remove scroll listeners.

    this._unbindScrollListeners(); // Setup release data.


    release._containerDiffX = this._containerDiffX;
    release._containerDiffY = this._containerDiffY; // Reset drag data.

    this._reset(); // Remove drag class name from element.


    removeClass(element, settings.itemDraggingClass); // Emit dragEnd event.

    grid._emit(eventDragEnd, item, event); // Finish up the migration process or start the release process.


    this._isMigrating ? this._finishMigration() : release.start();
  };
  /**
   * Private helpers
   * ***************
   */

  /**
   * Prevent default.
   *
   * @param {Object} e
   */


  function preventDefault(e) {
    if (e.preventDefault) e.preventDefault();
  }
  /**
   * Calculate how many percent the intersection area of two rectangles is from
   * the maximum potential intersection area between the rectangles.
   *
   * @param {Rectangle} a
   * @param {Rectangle} b
   * @returns {Number}
   *   - A number between 0-100.
   */


  function getRectOverlapScore(a, b) {
    // Return 0 immediately if the rectangles do not overlap.
    if (a.left + a.width <= b.left || b.left + b.width <= a.left || a.top + a.height <= b.top || b.top + b.height <= a.top) {
      return 0;
    } // Calculate intersection area's width, height, max height and max width.


    var width = Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left);
    var height = Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top);
    var maxWidth = Math.min(a.width, b.width);
    var maxHeight = Math.min(a.height, b.height);
    return width * height / (maxWidth * maxHeight) * 100;
  }
  /**
   * Get element's scroll parents.
   *
   * @param {HTMLElement} element
   * @param {Array} [data]
   * @returns {HTMLElement[]}
   */


  function getScrollParents(element, data) {
    var ret = data || [];
    var parent = element.parentNode; //
    // If transformed elements leak fixed elements.
    //

    if (hasTransformLeak) {
      // If the element is fixed it can not have any scroll parents.
      if (getStyle(element, 'position') === 'fixed') return ret; // Find scroll parents.

      while (parent && parent !== document && parent !== document.documentElement) {
        if (isScrollable(parent)) ret.push(parent);
        parent = getStyle(parent, 'position') === 'fixed' ? null : parent.parentNode;
      } // If parent is not fixed element, add window object as the last scroll
      // parent.


      parent !== null && ret.push(window);
      return ret;
    } //
    // If fixed elements behave as defined in the W3C specification.
    //
    // Find scroll parents.


    while (parent && parent !== document) {
      // If the currently looped element is fixed ignore all parents that are
      // not transformed.
      if (getStyle(element, 'position') === 'fixed' && !isTransformed(parent)) {
        parent = parent.parentNode;
        continue;
      } // Add the parent element to return items if it is scrollable.


      if (isScrollable(parent)) ret.push(parent); // Update element and parent references.

      element = parent;
      parent = parent.parentNode;
    } // If the last item is the root element, replace it with window. The root
    // element scroll is propagated to the window.


    if (ret[ret.length - 1] === document.documentElement) {
      ret[ret.length - 1] = window;
    } // Otherwise add window as the last scroll parent.
    else {
        ret.push(window);
      }

    return ret;
  }
  /**
   * Check if an element is scrollable.
   *
   * @param {HTMLElement} element
   * @returns {Boolean}
   */


  function isScrollable(element) {
    var overflow = getStyle(element, 'overflow');
    if (overflow === 'auto' || overflow === 'scroll') return true;
    overflow = getStyle(element, 'overflow-x');
    if (overflow === 'auto' || overflow === 'scroll') return true;
    overflow = getStyle(element, 'overflow-y');
    if (overflow === 'auto' || overflow === 'scroll') return true;
    return false;
  }
  /**
   * Check if drag gesture can be interpreted as a click, based on final drag
   * event data.
   *
   * @param {Object} element
   * @returns {Boolean}
   */


  function isClick(event) {
    return Math.abs(event.deltaX) < 2 && Math.abs(event.deltaY) < 2 && event.deltaTime < 200;
  }
  /**
   * Check if an element is an anchor element and open the href url if possible.
   *
   * @param {HTMLElement} element
   */


  function openAnchorHref(element) {
    // Make sure the element is anchor element.
    if (element.tagName.toLowerCase() !== 'a') return; // Get href and make sure it exists.

    var href = element.getAttribute('href');
    if (!href) return; // Finally let's navigate to the link href.

    var target = element.getAttribute('target');

    if (target && target !== '_self') {
      window.open(href, target);
    } else {
      window.location.href = href;
    }
  }
  /**
   * Detects if transformed elements leak fixed elements. According W3C
   * transform rendering spec a transformed element should contain even fixed
   * elements. Meaning that fixed elements are positioned relative to the
   * closest transformed ancestor element instead of window. However, not every
   * browser follows the spec (IE and older Firefox). So we need to test it.
   * https://www.w3.org/TR/css3-2d-transforms/#transform-rendering
   *
   * Borrowed from Mezr (v0.6.1):
   * https://github.com/niklasramo/mezr/blob/0.6.1/mezr.js#L607
   */


  function checkTransformLeak() {
    // No transforms -> definitely leaks.
    if (!isTransformSupported) return true; // No body available -> can't check it.

    if (!document.body) return null; // Do the test.

    var elems = [0, 1].map(function (elem, isInner) {
      elem = document.createElement('div');
      elem.style.position = isInner ? 'fixed' : 'absolute';
      elem.style.display = 'block';
      elem.style.visibility = 'hidden';
      elem.style.left = isInner ? '0px' : '1px';
      elem.style[transformProp] = 'none';
      return elem;
    });
    var outer = document.body.appendChild(elems[0]);
    var inner = outer.appendChild(elems[1]);
    var left = inner.getBoundingClientRect().left;
    outer.style[transformProp] = 'scale(1)';
    var ret = left === inner.getBoundingClientRect().left;
    document.body.removeChild(outer);
    return ret;
  }
  /**
   * Queue constructor.
   *
   * @class
   */


  function Queue() {
    this._queue = [];
    this._isDestroyed = false;
  }
  /**
   * Public prototype methods
   * ************************
   */

  /**
   * Add callback to the queue.
   *
   * @public
   * @memberof Queue.prototype
   * @param {Function} callback
   * @returns {Queue}
   */


  Queue.prototype.add = function (callback) {
    if (this._isDestroyed) return this;

    this._queue.push(callback);

    return this;
  };
  /**
   * Process queue callbacks and reset the queue.
   *
   * @public
   * @memberof Queue.prototype
   * @param {*} arg1
   * @param {*} arg2
   * @returns {Queue}
   */


  Queue.prototype.flush = function (arg1, arg2) {
    if (this._isDestroyed) return this;
    var queue = this._queue;
    var length = queue.length;
    var i; // Quit early if the queue is empty.

    if (!length) return this;
    var singleCallback = length === 1;
    var snapshot = singleCallback ? queue[0] : queue.slice(0); // Reset queue.

    queue.length = 0; // If we only have a single callback let's just call it.

    if (singleCallback) {
      snapshot(arg1, arg2);
      return this;
    } // If we have multiple callbacks, let's process them.


    for (i = 0; i < length; i++) {
      snapshot[i](arg1, arg2);
      if (this._isDestroyed) break;
    }

    return this;
  };
  /**
   * Destroy Queue instance.
   *
   * @public
   * @memberof Queue.prototype
   * @returns {Queue}
   */


  Queue.prototype.destroy = function () {
    if (this._isDestroyed) return this;
    this._isDestroyed = true;
    this._queue.length = 0;
    return this;
  };
  /**
   * Layout manager for Item instance.
   *
   * @class
   * @param {Item} item
   */


  function ItemLayout(item) {
    this._item = item;
    this._isActive = false;
    this._isDestroyed = false;
    this._isInterrupted = false;
    this._currentStyles = {};
    this._targetStyles = {};
    this._currentLeft = 0;
    this._currentTop = 0;
    this._offsetLeft = 0;
    this._offsetTop = 0;
    this._skipNextAnimation = false;
    this._animateOptions = {
      onFinish: this._finish.bind(this)
    };
    this._queue = new Queue(); // Bind animation handlers and finish method.

    this._setupAnimation = this._setupAnimation.bind(this);
    this._startAnimation = this._startAnimation.bind(this);
  }
  /**
   * Public prototype methods
   * ************************
   */

  /**
   * Start item layout based on it's current data.
   *
   * @public
   * @memberof ItemLayout.prototype
   * @param {Boolean} [instant=false]
   * @param {Function} [onFinish]
   * @returns {ItemLayout}
   */


  ItemLayout.prototype.start = function (instant, onFinish) {
    if (this._isDestroyed) return;
    var item = this._item;
    var element = item._element;
    var release = item._release;

    var gridSettings = item.getGrid()._settings;

    var isPositioning = this._isActive;
    var isJustReleased = release._isActive && release._isPositioningStarted === false;
    var animDuration = isJustReleased ? gridSettings.dragReleaseDuration : gridSettings.layoutDuration;
    var animEasing = isJustReleased ? gridSettings.dragReleaseEasing : gridSettings.layoutEasing;
    var animEnabled = !instant && !this._skipNextAnimation && animDuration > 0;
    var isAnimating; // If the item is currently positioning process current layout callback
    // queue with interrupted flag on.

    if (isPositioning) this._queue.flush(true, item); // Mark release positioning as started.

    if (isJustReleased) release._isPositioningStarted = true; // Push the callback to the callback queue.

    if (typeof onFinish === 'function') this._queue.add(onFinish); // If no animations are needed, easy peasy!

    if (!animEnabled) {
      this._updateOffsets();

      this._updateTargetStyles();

      isPositioning && cancelLayoutTick(item._id);
      isAnimating = item._animate.isAnimating();
      this.stop(false, this._targetStyles);
      !isAnimating && setStyles(element, this._targetStyles);
      this._skipNextAnimation = false;
      return this._finish();
    } // Set item active and store some data for the animation that is about to be
    // triggered.


    this._isActive = true;
    this._animateOptions.easing = animEasing;
    this._animateOptions.duration = animDuration;
    this._isInterrupted = isPositioning; // Start the item's layout animation in the next tick.

    addLayoutTick(item._id, this._setupAnimation, this._startAnimation);
    return this;
  };
  /**
   * Stop item's position animation if it is currently animating.
   *
   * @public
   * @memberof ItemLayout.prototype
   * @param {Boolean} [processCallbackQueue=false]
   * @param {Object} [targetStyles]
   * @returns {ItemLayout}
   */


  ItemLayout.prototype.stop = function (processCallbackQueue, targetStyles) {
    if (this._isDestroyed || !this._isActive) return this;
    var item = this._item; // Cancel animation init.

    cancelLayoutTick(item._id); // Stop animation.

    item._animate.stop(targetStyles); // Remove positioning class.


    removeClass(item._element, item.getGrid()._settings.itemPositioningClass); // Reset active state.

    this._isActive = false; // Process callback queue if needed.

    if (processCallbackQueue) this._queue.flush(true, item);
    return this;
  };
  /**
   * Destroy the instance and stop current animation if it is running.
   *
   * @public
   * @memberof ItemLayout.prototype
   * @returns {ItemLayout}
   */


  ItemLayout.prototype.destroy = function () {
    if (this._isDestroyed) return this;
    this.stop(true, {});

    this._queue.destroy();

    this._item = this._currentStyles = this._targetStyles = this._animateOptions = null;
    this._isDestroyed = true;
    return this;
  };
  /**
   * Private prototype methods
   * *************************
   */

  /**
   * Calculate and update item's current layout offset data.
   *
   * @private
   * @memberof ItemLayout.prototype
   */


  ItemLayout.prototype._updateOffsets = function () {
    if (this._isDestroyed) return;
    var item = this._item;
    var migrate = item._migrate;
    var release = item._release;
    this._offsetLeft = release._isActive ? release._containerDiffX : migrate._isActive ? migrate._containerDiffX : 0;
    this._offsetTop = release._isActive ? release._containerDiffY : migrate._isActive ? migrate._containerDiffY : 0;
  };
  /**
   * Calculate and update item's layout target styles.
   *
   * @private
   * @memberof ItemLayout.prototype
   */


  ItemLayout.prototype._updateTargetStyles = function () {
    if (this._isDestroyed) return;
    var item = this._item;
    this._targetStyles.transform = getTranslateString(item._left + this._offsetLeft, item._top + this._offsetTop);
  };
  /**
   * Finish item layout procedure.
   *
   * @private
   * @memberof ItemLayout.prototype
   */


  ItemLayout.prototype._finish = function () {
    if (this._isDestroyed) return;
    var item = this._item;
    var migrate = item._migrate;
    var release = item._release; // Mark the item as inactive and remove positioning classes.

    if (this._isActive) {
      this._isActive = false;
      removeClass(item._element, item.getGrid()._settings.itemPositioningClass);
    } // Finish up release and migration.


    if (release._isActive) release.stop();
    if (migrate._isActive) migrate.stop(); // Process the callback queue.

    this._queue.flush(false, item);
  };
  /**
   * Prepare item for layout animation.
   *
   * @private
   * @memberof ItemLayout.prototype
   */


  ItemLayout.prototype._setupAnimation = function () {
    var element = this._item._element;
    var translate = getTranslate(element);
    this._currentLeft = translate.x;
    this._currentTop = translate.y;
  };
  /**
   * Start layout animation.
   *
   * @private
   * @memberof ItemLayout.prototype
   */


  ItemLayout.prototype._startAnimation = function () {
    var item = this._item;
    var element = item._element;
    var grid = item.getGrid();
    var settings = grid._settings; // Let's update the offset data and target styles.

    this._updateOffsets();

    this._updateTargetStyles(); // If the item is already in correct position let's quit early.


    if (item._left === this._currentLeft - this._offsetLeft && item._top === this._currentTop - this._offsetTop) {
      if (this._isInterrupted) this.stop(false, this._targetStyles);
      this._isActive = false;

      this._finish();

      return;
    } // Set item's positioning class if needed.


    !this._isInterrupted && addClass(element, settings.itemPositioningClass); // Get current styles for animation.

    this._currentStyles.transform = getTranslateString(this._currentLeft, this._currentTop); // Animate.

    item._animate.start(this._currentStyles, this._targetStyles, this._animateOptions);
  };

  var tempStyles = {};
  /**
   * The migrate process handler constructor.
   *
   * @class
   * @param {Item} item
   */

  function ItemMigrate(item) {
    // Private props.
    this._item = item;
    this._isActive = false;
    this._isDestroyed = false;
    this._container = false;
    this._containerDiffX = 0;
    this._containerDiffY = 0;
  }
  /**
   * Public prototype methods
   * ************************
   */

  /**
   * Start the migrate process of an item.
   *
   * @public
   * @memberof ItemMigrate.prototype
   * @param {Grid} targetGrid
   * @param {GridSingleItemQuery} position
   * @param {HTMLElement} [container]
   * @returns {ItemMigrate}
   */


  ItemMigrate.prototype.start = function (targetGrid, position, container) {
    if (this._isDestroyed) return this;
    var item = this._item;
    var element = item._element;
    var isVisible = item.isVisible();
    var grid = item.getGrid();
    var settings = grid._settings;
    var targetSettings = targetGrid._settings;
    var targetElement = targetGrid._element;
    var targetItems = targetGrid._items;

    var currentIndex = grid._items.indexOf(item);

    var targetContainer = container || document.body;
    var targetIndex;
    var targetItem;
    var currentContainer;
    var offsetDiff;
    var containerDiff;
    var translate;
    var translateX;
    var translateY; // Get target index.

    if (typeof position === 'number') {
      targetIndex = normalizeArrayIndex(targetItems, position, true);
    } else {
      targetItem = targetGrid._getItem(position);
      /** @todo Consider throwing an error here instead of silently failing. */

      if (!targetItem) return this;
      targetIndex = targetItems.indexOf(targetItem);
    } // Get current translateX and translateY values if needed.


    if (item.isPositioning() || this._isActive || item.isReleasing()) {
      translate = getTranslate(element);
      translateX = translate.x;
      translateY = translate.y;
    } // Abort current positioning.


    if (item.isPositioning()) {
      item._layout.stop(true, {
        transform: getTranslateString(translateX, translateY)
      });
    } // Abort current migration.


    if (this._isActive) {
      translateX -= this._containerDiffX;
      translateY -= this._containerDiffY;
      this.stop(true, {
        transform: getTranslateString(translateX, translateY)
      });
    } // Abort current release.


    if (item.isReleasing()) {
      translateX -= item._release._containerDiffX;
      translateY -= item._release._containerDiffY;

      item._release.stop(true, {
        transform: getTranslateString(translateX, translateY)
      });
    } // Stop current visibility animations.


    item._visibility._stopAnimation(); // Destroy current drag.


    if (item._drag) item._drag.destroy(); // Process current visibility animation queue.

    item._visibility._queue.flush(true, item); // Emit beforeSend event.


    if (grid._hasListeners(eventBeforeSend)) {
      grid._emit(eventBeforeSend, {
        item: item,
        fromGrid: grid,
        fromIndex: currentIndex,
        toGrid: targetGrid,
        toIndex: targetIndex
      });
    } // Emit beforeReceive event.


    if (targetGrid._hasListeners(eventBeforeReceive)) {
      targetGrid._emit(eventBeforeReceive, {
        item: item,
        fromGrid: grid,
        fromIndex: currentIndex,
        toGrid: targetGrid,
        toIndex: targetIndex
      });
    } // Remove current classnames.


    removeClass(element, settings.itemClass);
    removeClass(element, settings.itemVisibleClass);
    removeClass(element, settings.itemHiddenClass); // Add new classnames.

    addClass(element, targetSettings.itemClass);
    addClass(element, isVisible ? targetSettings.itemVisibleClass : targetSettings.itemHiddenClass); // Move item instance from current grid to target grid.

    grid._items.splice(currentIndex, 1);

    arrayInsert(targetItems, item, targetIndex); // Update item's grid id reference.

    item._gridId = targetGrid._id; // Get current container.

    currentContainer = element.parentNode; // Move the item inside the target container if it's different than the
    // current container.

    if (targetContainer !== currentContainer) {
      targetContainer.appendChild(element);
      offsetDiff = getOffsetDiff(targetContainer, currentContainer, true);

      if (!translate) {
        translate = getTranslate(element);
        translateX = translate.x;
        translateY = translate.y;
      }

      element.style[transformProp] = getTranslateString(translateX + offsetDiff.left, translateY + offsetDiff.top);
    } // Update child element's styles to reflect the current visibility state.


    item._child.removeAttribute('style');

    setStyles(item._child, isVisible ? targetSettings.visibleStyles : targetSettings.hiddenStyles); // Update display style.

    element.style.display = isVisible ? 'block' : 'hidden'; // Get offset diff for the migration data.

    containerDiff = getOffsetDiff(targetContainer, targetElement, true); // Update item's cached dimensions and sort data.

    item._refreshDimensions();

    item._refreshSortData(); // Create new drag handler.


    item._drag = targetSettings.dragEnabled ? new ItemDrag(item) : null; // Setup migration data.

    this._isActive = true;
    this._container = targetContainer;
    this._containerDiffX = containerDiff.left;
    this._containerDiffY = containerDiff.top; // Emit send event.

    if (grid._hasListeners(eventSend)) {
      grid._emit(eventSend, {
        item: item,
        fromGrid: grid,
        fromIndex: currentIndex,
        toGrid: targetGrid,
        toIndex: targetIndex
      });
    } // Emit receive event.


    if (targetGrid._hasListeners(eventReceive)) {
      targetGrid._emit(eventReceive, {
        item: item,
        fromGrid: grid,
        fromIndex: currentIndex,
        toGrid: targetGrid,
        toIndex: targetIndex
      });
    }

    return this;
  };
  /**
   * End the migrate process of an item. This method can be used to abort an
   * ongoing migrate process (animation) or finish the migrate process.
   *
   * @public
   * @memberof ItemMigrate.prototype
   * @param {Boolean} [abort=false]
   *  - Should the migration be aborted?
   * @param {Object} [currentStyles]
   *  - Optional current translateX and translateY styles.
   * @returns {ItemMigrate}
   */


  ItemMigrate.prototype.stop = function (abort, currentStyles) {
    if (this._isDestroyed || !this._isActive) return this;
    var item = this._item;
    var element = item._element;
    var grid = item.getGrid();
    var gridElement = grid._element;
    var translate;

    if (this._container !== gridElement) {
      if (!currentStyles) {
        if (abort) {
          translate = getTranslate(element);
          tempStyles.transform = getTranslateString(translate.x - this._containerDiffX, translate.y - this._containerDiffY);
        } else {
          tempStyles.transform = getTranslateString(item._left, item._top);
        }

        currentStyles = tempStyles;
      }

      gridElement.appendChild(element);
      setStyles(element, currentStyles);
    }

    this._isActive = false;
    this._container = null;
    this._containerDiffX = 0;
    this._containerDiffY = 0;
    return this;
  };
  /**
   * Destroy instance.
   *
   * @public
   * @memberof ItemMigrate.prototype
   * @returns {ItemMigrate}
   */


  ItemMigrate.prototype.destroy = function () {
    if (this._isDestroyed) return this;
    this.stop(true);
    this._item = null;
    this._isDestroyed = true;
    return this;
  };

  var tempStyles$1 = {};
  /**
   * The release process handler constructor. Although this might seem as proper
   * fit for the drag process this needs to be separated into it's own logic
   * because there might be a scenario where drag is disabled, but the release
   * process still needs to be implemented (dragging from a grid to another).
   *
   * @class
   * @param {Item} item
   */

  function ItemRelease(item) {
    this._item = item;
    this._isActive = false;
    this._isDestroyed = false;
    this._isPositioningStarted = false;
    this._containerDiffX = 0;
    this._containerDiffY = 0;
  }
  /**
   * Public prototype methods
   * ************************
   */

  /**
   * Start the release process of an item.
   *
   * @public
   * @memberof ItemRelease.prototype
   * @returns {ItemRelease}
   */


  ItemRelease.prototype.start = function () {
    if (this._isDestroyed || this._isActive) return this;
    var item = this._item;
    var grid = item.getGrid(); // Flag release as active.

    this._isActive = true; // Add release class name to the released element.

    addClass(item._element, grid._settings.itemReleasingClass); // Emit dragReleaseStart event.

    grid._emit(eventDragReleaseStart, item); // Position the released item.


    item._layout.start(false);

    return this;
  };
  /**
   * End the release process of an item. This method can be used to abort an
   * ongoing release process (animation) or finish the release process.
   *
   * @public
   * @memberof ItemRelease.prototype
   * @param {Boolean} [abort=false]
   *  - Should the release be aborted? When true, the release end event won't be
   *    emitted. Set to true only when you need to abort the release process
   *    while the item is animating to it's position.
   * @param {Object} [currentStyles]
   *  - Optional current translateX and translateY styles.
   * @returns {ItemRelease}
   */


  ItemRelease.prototype.stop = function (abort, currentStyles) {
    if (this._isDestroyed || !this._isActive) return this;
    var item = this._item;
    var element = item._element;
    var grid = item.getGrid();
    var container = grid._element;
    var translate; // Reset data and remove releasing class name from the element.

    this._reset(); // If the released element is outside the grid's container element put it
    // back there and adjust position accordingly.


    if (element.parentNode !== container) {
      if (!currentStyles) {
        if (abort) {
          translate = getTranslate(element);
          tempStyles$1.transform = getTranslateString(translate.x - this._containerDiffX, translate.y - this._containerDiffY);
        } else {
          tempStyles$1.transform = getTranslateString(item._left, item._top);
        }

        currentStyles = tempStyles$1;
      }

      container.appendChild(element);
      setStyles(element, currentStyles);
    } // Emit dragReleaseEnd event.


    if (!abort) grid._emit(eventDragReleaseEnd, item);
    return this;
  };
  /**
   * Destroy instance.
   *
   * @public
   * @memberof ItemRelease.prototype
   * @returns {ItemRelease}
   */


  ItemRelease.prototype.destroy = function () {
    if (this._isDestroyed) return this;
    this.stop(true);
    this._item = null;
    this._isDestroyed = true;
    return this;
  };
  /**
   * Private prototype methods
   * *************************
   */

  /**
   * Reset public data and remove releasing class.
   *
   * @private
   * @memberof ItemRelease.prototype
   */


  ItemRelease.prototype._reset = function () {
    if (this._isDestroyed) return;
    var item = this._item;
    this._isActive = false;
    this._isPositioningStarted = false;
    this._containerDiffX = 0;
    this._containerDiffY = 0;
    removeClass(item._element, item.getGrid()._settings.itemReleasingClass);
  };
  /**
   * Get current values of the provided styles definition object.
   *
   * @param {HTMLElement} element
   * @param {Object} styles
   * @return {Object}
   */


  function getCurrentStyles(element, styles) {
    var current = {};

    for (var prop in styles) {
      current[prop] = getStyle(element, getStyleName(prop));
    }

    return current;
  }
  /**
   * Visibility manager for Item instance.
   *
   * @class
   * @param {Item} item
   */


  function ItemVisibility(item) {
    var isActive = item._isActive;
    var element = item._element;

    var settings = item.getGrid()._settings;

    this._item = item;
    this._isDestroyed = false; // Set up visibility states.

    this._isHidden = !isActive;
    this._isHiding = false;
    this._isShowing = false; // Callback queue.

    this._queue = new Queue(); // Bind show/hide finishers.

    this._finishShow = this._finishShow.bind(this);
    this._finishHide = this._finishHide.bind(this); // Force item to be either visible or hidden on init.

    element.style.display = isActive ? 'block' : 'none'; // Set visible/hidden class.

    addClass(element, isActive ? settings.itemVisibleClass : settings.itemHiddenClass); // Set initial styles for the child element.

    setStyles(item._child, isActive ? settings.visibleStyles : settings.hiddenStyles);
  }
  /**
   * Public prototype methods
   * ************************
   */

  /**
   * Show item.
   *
   * @public
   * @memberof ItemVisibility.prototype
   * @param {Boolean} instant
   * @param {Function} [onFinish]
   * @returns {ItemVisibility}
   */


  ItemVisibility.prototype.show = function (instant, onFinish) {
    if (this._isDestroyed) return this;
    var item = this._item;
    var element = item._element;
    var queue = this._queue;
    var callback = typeof onFinish === 'function' ? onFinish : null;
    var grid = item.getGrid();
    var settings = grid._settings; // If item is visible call the callback and be done with it.

    if (!this._isShowing && !this._isHidden) {
      callback && callback(false, item);
      return this;
    } // If item is showing and does not need to be shown instantly, let's just
    // push callback to the callback queue and be done with it.


    if (this._isShowing && !instant) {
      callback && queue.add(callback);
      return this;
    } // If the item is hiding or hidden process the current visibility callback
    // queue with the interrupted flag active, update classes and set display
    // to block if necessary.


    if (!this._isShowing) {
      queue.flush(true, item);
      removeClass(element, settings.itemHiddenClass);
      addClass(element, settings.itemVisibleClass);
      if (!this._isHiding) element.style.display = 'block';
    } // Push callback to the callback queue.


    callback && queue.add(callback); // Update visibility states.

    item._isActive = this._isShowing = true;
    this._isHiding = this._isHidden = false; // Finally let's start show animation.

    this._startAnimation(true, instant, this._finishShow);

    return this;
  };
  /**
   * Hide item.
   *
   * @public
   * @memberof ItemVisibility.prototype
   * @param {Boolean} instant
   * @param {Function} [onFinish]
   * @returns {ItemVisibility}
   */


  ItemVisibility.prototype.hide = function (instant, onFinish) {
    if (this._isDestroyed) return this;
    var item = this._item;
    var element = item._element;
    var queue = this._queue;
    var callback = typeof onFinish === 'function' ? onFinish : null;
    var grid = item.getGrid();
    var settings = grid._settings; // If item is already hidden call the callback and be done with it.

    if (!this._isHiding && this._isHidden) {
      callback && callback(false, item);
      return this;
    } // If item is hiding and does not need to be hidden instantly, let's just
    // push callback to the callback queue and be done with it.


    if (this._isHiding && !instant) {
      callback && queue.add(callback);
      return this;
    } // If the item is showing or visible process the current visibility callback
    // queue with the interrupted flag active, update classes and set display
    // to block if necessary.


    if (!this._isHiding) {
      queue.flush(true, item);
      addClass(element, settings.itemHiddenClass);
      removeClass(element, settings.itemVisibleClass);
    } // Push callback to the callback queue.


    callback && queue.add(callback); // Update visibility states.

    this._isHidden = this._isHiding = true;
    item._isActive = this._isShowing = false; // Finally let's start hide animation.

    this._startAnimation(false, instant, this._finishHide);

    return this;
  };
  /**
   * Destroy the instance and stop current animation if it is running.
   *
   * @public
   * @memberof ItemVisibility.prototype
   * @returns {ItemVisibility}
   */


  ItemVisibility.prototype.destroy = function () {
    if (this._isDestroyed) return this;
    var item = this._item;
    var element = item._element;
    var grid = item.getGrid();
    var queue = this._queue;
    var settings = grid._settings; // Stop visibility animation.

    this._stopAnimation({}); // Fire all uncompleted callbacks with interrupted flag and destroy the queue.


    queue.flush(true, item).destroy(); // Remove visible/hidden classes.

    removeClass(element, settings.itemVisibleClass);
    removeClass(element, settings.itemHiddenClass); // Reset state.

    this._item = null;
    this._isHiding = this._isShowing = false;
    this._isDestroyed = this._isHidden = true;
    return this;
  };
  /**
   * Private prototype methods
   * *************************
   */

  /**
   * Start visibility animation.
   *
   * @private
   * @memberof ItemVisibility.prototype
   * @param {Boolean} toVisible
   * @param {Boolean} [instant]
   * @param {Function} [onFinish]
   */


  ItemVisibility.prototype._startAnimation = function (toVisible, instant, onFinish) {
    if (this._isDestroyed) return;
    var item = this._item;

    var settings = item.getGrid()._settings;

    var targetStyles = toVisible ? settings.visibleStyles : settings.hiddenStyles;
    var duration = parseInt(toVisible ? settings.showDuration : settings.hideDuration) || 0;
    var easing = (toVisible ? settings.showEasing : settings.hideEasing) || 'ease';
    var isInstant = instant || duration <= 0;
    var currentStyles; // No target styles? Let's quit early.

    if (!targetStyles) {
      onFinish && onFinish();
      return;
    } // Cancel queued visibility tick.


    cancelVisibilityTick(item._id); // If we need to apply the styles instantly without animation.

    if (isInstant) {
      if (item._animateChild.isAnimating()) {
        item._animateChild.stop(targetStyles);
      } else {
        setStyles(item._child, targetStyles);
      }

      onFinish && onFinish();
      return;
    } // Start the animation in the next tick (to avoid layout thrashing).


    addVisibilityTick(item._id, function () {
      currentStyles = getCurrentStyles(item._child, targetStyles);
    }, function () {
      item._animateChild.start(currentStyles, targetStyles, {
        duration: duration,
        easing: easing,
        onFinish: onFinish
      });
    });
  };
  /**
   * Stop visibility animation.
   *
   * @private
   * @memberof ItemVisibility.prototype
   * @param {Object} [targetStyles]
   */


  ItemVisibility.prototype._stopAnimation = function (targetStyles) {
    if (this._isDestroyed) return;
    var item = this._item;
    cancelVisibilityTick(item._id);

    item._animateChild.stop(targetStyles);
  };
  /**
   * Finish show procedure.
   *
   * @private
   * @memberof ItemVisibility.prototype
   */


  ItemVisibility.prototype._finishShow = function () {
    if (this._isHidden) return;
    this._isShowing = false;

    this._queue.flush(false, this._item);
  };
  /**
   * Finish hide procedure.
   *
   * @private
   * @memberof ItemVisibility.prototype
   */


  var finishStyles = {};

  ItemVisibility.prototype._finishHide = function () {
    if (!this._isHidden) return;
    var item = this._item;
    this._isHiding = false;
    finishStyles.transform = getTranslateString(0, 0);

    item._layout.stop(true, finishStyles);

    item._element.style.display = 'none';

    this._queue.flush(false, item);
  };

  var id = 0;
  /**
   * Returns a unique numeric id (increments a base value on every call).
   * @returns {Number}
   */

  function createUid() {
    return ++id;
  }
  /**
   * Creates a new Item instance for a Grid instance.
   *
   * @class
   * @param {Grid} grid
   * @param {HTMLElement} element
   * @param {Boolean} [isActive]
   */


  function Item(grid, element, isActive) {
    var settings = grid._settings; // Create instance id.

    this._id = createUid(); // Reference to connected Grid instance's id.

    this._gridId = grid._id; // Destroyed flag.

    this._isDestroyed = false; // Set up initial positions.

    this._left = 0;
    this._top = 0; // The elements.

    this._element = element;
    this._child = element.children[0]; // If the provided item element is not a direct child of the grid container
    // element, append it to the grid container.

    if (element.parentNode !== grid._element) {
      grid._element.appendChild(element);
    } // Set item class.


    addClass(element, settings.itemClass); // If isActive is not defined, let's try to auto-detect it.

    if (typeof isActive !== 'boolean') {
      isActive = getStyle(element, 'display') !== 'none';
    } // Set up active state (defines if the item is considered part of the layout
    // or not).


    this._isActive = isActive; // Set element's initial position styles.

    element.style.left = '0';
    element.style.top = '0';
    element.style[transformProp] = getTranslateString(0, 0); // Initiate item's animation controllers.

    this._animate = new ItemAnimate(element);
    this._animateChild = new ItemAnimate(this._child); // Setup visibility handler.

    this._visibility = new ItemVisibility(this); // Set up layout handler.

    this._layout = new ItemLayout(this); // Set up migration handler data.

    this._migrate = new ItemMigrate(this); // Set up release handler

    this._release = new ItemRelease(this); // Set up drag handler.

    this._drag = settings.dragEnabled ? new ItemDrag(this) : null; // Set up the initial dimensions and sort data.

    this._refreshDimensions();

    this._refreshSortData();
  }
  /**
   * Public prototype methods
   * ************************
   */

  /**
   * Get the instance grid reference.
   *
   * @public
   * @memberof Item.prototype
   * @returns {Grid}
   */


  Item.prototype.getGrid = function () {
    return gridInstances[this._gridId];
  };
  /**
   * Get the instance element.
   *
   * @public
   * @memberof Item.prototype
   * @returns {HTMLElement}
   */


  Item.prototype.getElement = function () {
    return this._element;
  };
  /**
   * Get instance element's cached width.
   *
   * @public
   * @memberof Item.prototype
   * @returns {Number}
   */


  Item.prototype.getWidth = function () {
    return this._width;
  };
  /**
   * Get instance element's cached height.
   *
   * @public
   * @memberof Item.prototype
   * @returns {Number}
   */


  Item.prototype.getHeight = function () {
    return this._height;
  };
  /**
   * Get instance element's cached margins.
   *
   * @public
   * @memberof Item.prototype
   * @returns {Object}
   *   - The returned object contains left, right, top and bottom properties
   *     which indicate the item element's cached margins.
   */


  Item.prototype.getMargin = function () {
    return {
      left: this._marginLeft,
      right: this._marginRight,
      top: this._marginTop,
      bottom: this._marginBottom
    };
  };
  /**
   * Get instance element's cached position.
   *
   * @public
   * @memberof Item.prototype
   * @returns {Object}
   *   - The returned object contains left and top properties which indicate the
   *     item element's cached position in the grid.
   */


  Item.prototype.getPosition = function () {
    return {
      left: this._left,
      top: this._top
    };
  };
  /**
   * Is the item active?
   *
   * @public
   * @memberof Item.prototype
   * @returns {Boolean}
   */


  Item.prototype.isActive = function () {
    return this._isActive;
  };
  /**
   * Is the item visible?
   *
   * @public
   * @memberof Item.prototype
   * @returns {Boolean}
   */


  Item.prototype.isVisible = function () {
    return !!this._visibility && !this._visibility._isHidden;
  };
  /**
   * Is the item being animated to visible?
   *
   * @public
   * @memberof Item.prototype
   * @returns {Boolean}
   */


  Item.prototype.isShowing = function () {
    return !!(this._visibility && this._visibility._isShowing);
  };
  /**
   * Is the item being animated to hidden?
   *
   * @public
   * @memberof Item.prototype
   * @returns {Boolean}
   */


  Item.prototype.isHiding = function () {
    return !!(this._visibility && this._visibility._isHiding);
  };
  /**
   * Is the item positioning?
   *
   * @public
   * @memberof Item.prototype
   * @returns {Boolean}
   */


  Item.prototype.isPositioning = function () {
    return !!(this._layout && this._layout._isActive);
  };
  /**
   * Is the item being dragged?
   *
   * @public
   * @memberof Item.prototype
   * @returns {Boolean}
   */


  Item.prototype.isDragging = function () {
    return !!(this._drag && this._drag._isActive);
  };
  /**
   * Is the item being released?
   *
   * @public
   * @memberof Item.prototype
   * @returns {Boolean}
   */


  Item.prototype.isReleasing = function () {
    return !!(this._release && this._release._isActive);
  };
  /**
   * Is the item destroyed?
   *
   * @public
   * @memberof Item.prototype
   * @returns {Boolean}
   */


  Item.prototype.isDestroyed = function () {
    return this._isDestroyed;
  };
  /**
   * Private prototype methods
   * *************************
   */

  /**
   * Recalculate item's dimensions.
   *
   * @private
   * @memberof Item.prototype
   */


  Item.prototype._refreshDimensions = function () {
    if (this._isDestroyed || this._visibility._isHidden) return;
    var element = this._element;
    var rect = element.getBoundingClientRect(); // Calculate width and height.

    this._width = rect.width;
    this._height = rect.height; // Calculate margins (ignore negative margins).

    this._marginLeft = Math.max(0, getStyleAsFloat(element, 'margin-left'));
    this._marginRight = Math.max(0, getStyleAsFloat(element, 'margin-right'));
    this._marginTop = Math.max(0, getStyleAsFloat(element, 'margin-top'));
    this._marginBottom = Math.max(0, getStyleAsFloat(element, 'margin-bottom'));
  };
  /**
   * Fetch and store item's sort data.
   *
   * @private
   * @memberof Item.prototype
   */


  Item.prototype._refreshSortData = function () {
    if (this._isDestroyed) return;
    var data = this._sortData = {};

    var getters = this.getGrid()._settings.sortData;

    var prop;

    for (prop in getters) {
      data[prop] = getters[prop](this, this._element);
    }
  };
  /**
   * Destroy item instance.
   *
   * @private
   * @memberof Item.prototype
   * @param {Boolean} [removeElement=false]
   */


  Item.prototype._destroy = function (removeElement) {
    if (this._isDestroyed) return;
    var element = this._element;
    var grid = this.getGrid();
    var settings = grid._settings;

    var index = grid._items.indexOf(this); // Destroy handlers.


    this._release.destroy();

    this._migrate.destroy();

    this._layout.destroy();

    this._visibility.destroy();

    this._animate.destroy();

    this._animateChild.destroy();

    this._drag && this._drag.destroy(); // Remove all inline styles.

    element.removeAttribute('style');

    this._child.removeAttribute('style'); // Remove item class.


    removeClass(element, settings.itemClass); // Remove item from Grid instance if it still exists there.

    index > -1 && grid._items.splice(index, 1); // Remove element from DOM.

    removeElement && element.parentNode.removeChild(element); // Reset state.

    this._isActive = false;
    this._isDestroyed = true;
  };
  /**
   * This is the default layout algorithm for Muuri. Based on MAXRECTS approach
   * as described by Jukka Jylänki in his survey: "A Thousand Ways to Pack the
   * Bin - A Practical Approach to Two-Dimensional Rectangle Bin Packing.".
   *
   * @class
   */


  function Packer() {
    this._slots = [];
    this._slotSizes = [];
    this._freeSlots = [];
    this._newSlots = [];
    this._rectItem = {};
    this._rectStore = [];
    this._rectId = 0; // The layout return data, which will be populated in getLayout.

    this._layout = {
      slots: null,
      setWidth: false,
      setHeight: false,
      width: false,
      height: false
    }; // Bind sort handlers.

    this._sortRectsLeftTop = this._sortRectsLeftTop.bind(this);
    this._sortRectsTopLeft = this._sortRectsTopLeft.bind(this);
  }
  /**
   * @public
   * @memberof Packer.prototype
   * @param {Item[]} items
   * @param {Number} width
   * @param {Number} height
   * @param {Number[]} [slots]
   * @param {Object} [options]
   * @param {Boolean} [options.fillGaps=false]
   * @param {Boolean} [options.horizontal=false]
   * @param {Boolean} [options.alignRight=false]
   * @param {Boolean} [options.alignBottom=false]
   * @returns {LayoutData}
   */


  Packer.prototype.getLayout = function (items, width, height, slots, options) {
    var layout = this._layout;
    var fillGaps = !!(options && options.fillGaps);
    var isHorizontal = !!(options && options.horizontal);
    var alignRight = !!(options && options.alignRight);
    var alignBottom = !!(options && options.alignBottom);
    var rounding = !!(options && options.rounding);
    var slotSizes = this._slotSizes;
    var i; // Reset layout data.

    layout.slots = slots ? slots : this._slots;
    layout.width = isHorizontal ? 0 : rounding ? Math.round(width) : width;
    layout.height = !isHorizontal ? 0 : rounding ? Math.round(height) : height;
    layout.setWidth = isHorizontal;
    layout.setHeight = !isHorizontal; // Make sure slots and slot size arrays are reset.

    layout.slots.length = 0;
    slotSizes.length = 0; // No need to go further if items do not exist.

    if (!items.length) return layout; // Find slots for items.

    for (i = 0; i < items.length; i++) {
      this._addSlot(items[i], isHorizontal, fillGaps, rounding, alignRight || alignBottom);
    } // If the alignment is set to right we need to adjust the results.


    if (alignRight) {
      for (i = 0; i < layout.slots.length; i = i + 2) {
        layout.slots[i] = layout.width - (layout.slots[i] + slotSizes[i]);
      }
    } // If the alignment is set to bottom we need to adjust the results.


    if (alignBottom) {
      for (i = 1; i < layout.slots.length; i = i + 2) {
        layout.slots[i] = layout.height - (layout.slots[i] + slotSizes[i]);
      }
    } // Reset slots arrays and rect id.


    slotSizes.length = 0;
    this._freeSlots.length = 0;
    this._newSlots.length = 0;
    this._rectId = 0;
    return layout;
  };
  /**
   * Calculate position for the layout item. Returns the left and top position
   * of the item in pixels.
   *
   * @private
   * @memberof Packer.prototype
   * @param {Item} item
   * @param {Boolean} isHorizontal
   * @param {Boolean} fillGaps
   * @param {Boolean} rounding
   * @returns {Array}
   */


  Packer.prototype._addSlot = function () {
    var leeway = 0.001;
    var itemSlot = {};
    return function (item, isHorizontal, fillGaps, rounding, trackSize) {
      var layout = this._layout;
      var freeSlots = this._freeSlots;
      var newSlots = this._newSlots;
      var rect;
      var rectId;
      var potentialSlots;
      var ignoreCurrentSlots;
      var i;
      var ii; // Reset new slots.

      newSlots.length = 0; // Set item slot initial data.

      itemSlot.left = null;
      itemSlot.top = null;
      itemSlot.width = item._width + item._marginLeft + item._marginRight;
      itemSlot.height = item._height + item._marginTop + item._marginBottom; // Round item slot width and height if needed.

      if (rounding) {
        itemSlot.width = Math.round(itemSlot.width);
        itemSlot.height = Math.round(itemSlot.height);
      } // Try to find a slot for the item.


      for (i = 0; i < freeSlots.length; i++) {
        rectId = freeSlots[i];
        if (!rectId) continue;
        rect = this._getRect(rectId);

        if (itemSlot.width <= rect.width + leeway && itemSlot.height <= rect.height + leeway) {
          itemSlot.left = rect.left;
          itemSlot.top = rect.top;
          break;
        }
      } // If no slot was found for the item.


      if (itemSlot.left === null) {
        // Position the item in to the bottom left (vertical mode) or top right
        // (horizontal mode) of the grid.
        itemSlot.left = !isHorizontal ? 0 : layout.width;
        itemSlot.top = !isHorizontal ? layout.height : 0; // If gaps don't needs filling do not add any current slots to the new
        // slots array.

        if (!fillGaps) {
          ignoreCurrentSlots = true;
        }
      } // In vertical mode, if the item's bottom overlaps the grid's bottom.


      if (!isHorizontal && itemSlot.top + itemSlot.height > layout.height) {
        // If item is not aligned to the left edge, create a new slot.
        if (itemSlot.left > 0) {
          newSlots.push(this._addRect(0, layout.height, itemSlot.left, Infinity));
        } // If item is not aligned to the right edge, create a new slot.


        if (itemSlot.left + itemSlot.width < layout.width) {
          newSlots.push(this._addRect(itemSlot.left + itemSlot.width, layout.height, layout.width - itemSlot.left - itemSlot.width, Infinity));
        } // Update grid height.


        layout.height = itemSlot.top + itemSlot.height;
      } // In horizontal mode, if the item's right overlaps the grid's right edge.


      if (isHorizontal && itemSlot.left + itemSlot.width > layout.width) {
        // If item is not aligned to the top, create a new slot.
        if (itemSlot.top > 0) {
          newSlots.push(this._addRect(layout.width, 0, Infinity, itemSlot.top));
        } // If item is not aligned to the bottom, create a new slot.


        if (itemSlot.top + itemSlot.height < layout.height) {
          newSlots.push(this._addRect(layout.width, itemSlot.top + itemSlot.height, Infinity, layout.height - itemSlot.top - itemSlot.height));
        } // Update grid width.


        layout.width = itemSlot.left + itemSlot.width;
      } // Clean up the current slots making sure there are no old slots that
      // overlap with the item. If an old slot overlaps with the item, split it
      // into smaller slots if necessary.


      for (i = fillGaps ? 0 : ignoreCurrentSlots ? freeSlots.length : i; i < freeSlots.length; i++) {
        rectId = freeSlots[i];
        if (!rectId) continue;
        rect = this._getRect(rectId);
        potentialSlots = this._splitRect(rect, itemSlot);

        for (ii = 0; ii < potentialSlots.length; ii++) {
          rectId = potentialSlots[ii];
          rect = this._getRect(rectId); // Let's make sure here that we have a big enough slot
          // (width/height > 0.49px) and also let's make sure that the slot is
          // within the boundaries of the grid.

          if (rect.width > 0.49 && rect.height > 0.49 && (!isHorizontal && rect.top < layout.height || isHorizontal && rect.left < layout.width)) {
            newSlots.push(rectId);
          }
        }
      } // Sanitize new slots.


      if (newSlots.length) {
        this._purgeRects(newSlots).sort(isHorizontal ? this._sortRectsLeftTop : this._sortRectsTopLeft);
      } // Update layout width/height.


      if (isHorizontal) {
        layout.width = Math.max(layout.width, itemSlot.left + itemSlot.width);
      } else {
        layout.height = Math.max(layout.height, itemSlot.top + itemSlot.height);
      } // Add item slot data to layout slots (and store the slot size for later
      // usage too if necessary).


      layout.slots.push(itemSlot.left, itemSlot.top);
      if (trackSize) this._slotSizes.push(itemSlot.width, itemSlot.height); // Free/new slots switcheroo!

      this._freeSlots = newSlots;
      this._newSlots = freeSlots;
    };
  }();
  /**
   * Add a new rectangle to the rectangle store. Returns the id of the new
   * rectangle.
   *
   * @private
   * @memberof Packer.prototype
   * @param {Number} left
   * @param {Number} top
   * @param {Number} width
   * @param {Number} height
   * @returns {RectId}
   */


  Packer.prototype._addRect = function (left, top, width, height) {
    var rectId = ++this._rectId;
    var rectStore = this._rectStore;
    rectStore[rectId] = left || 0;
    rectStore[++this._rectId] = top || 0;
    rectStore[++this._rectId] = width || 0;
    rectStore[++this._rectId] = height || 0;
    return rectId;
  };
  /**
   * Get rectangle data from the rectangle store by id. Optionally you can
   * provide a target object where the rectangle data will be written in. By
   * default an internal object is reused as a target object.
   *
   * @private
   * @memberof Packer.prototype
   * @param {RectId} id
   * @param {Object} [target]
   * @returns {Object}
   */


  Packer.prototype._getRect = function (id, target) {
    var rectItem = target ? target : this._rectItem;
    var rectStore = this._rectStore;
    rectItem.left = rectStore[id] || 0;
    rectItem.top = rectStore[++id] || 0;
    rectItem.width = rectStore[++id] || 0;
    rectItem.height = rectStore[++id] || 0;
    return rectItem;
  };
  /**
   * Punch a hole into a rectangle and split the remaining area into smaller
   * rectangles (4 at max).
   *
   * @private
   * @memberof Packer.prototype
   * @param {Rectangle} rect
   * @param {Rectangle} hole
   * @returns {RectId[]}
   */


  Packer.prototype._splitRect = function () {
    var results = [];
    return function (rect, hole) {
      // Reset old results.
      results.length = 0; // If the rect does not overlap with the hole add rect to the return data
      // as is.

      if (!this._doRectsOverlap(rect, hole)) {
        results.push(this._addRect(rect.left, rect.top, rect.width, rect.height));
        return results;
      } // Left split.


      if (rect.left < hole.left) {
        results.push(this._addRect(rect.left, rect.top, hole.left - rect.left, rect.height));
      } // Right split.


      if (rect.left + rect.width > hole.left + hole.width) {
        results.push(this._addRect(hole.left + hole.width, rect.top, rect.left + rect.width - (hole.left + hole.width), rect.height));
      } // Top split.


      if (rect.top < hole.top) {
        results.push(this._addRect(rect.left, rect.top, rect.width, hole.top - rect.top));
      } // Bottom split.


      if (rect.top + rect.height > hole.top + hole.height) {
        results.push(this._addRect(rect.left, hole.top + hole.height, rect.width, rect.top + rect.height - (hole.top + hole.height)));
      }

      return results;
    };
  }();
  /**
   * Check if two rectangles overlap.
   *
   * @private
   * @memberof Packer.prototype
   * @param {Rectangle} a
   * @param {Rectangle} b
   * @returns {Boolean}
   */


  Packer.prototype._doRectsOverlap = function (a, b) {
    return !(a.left + a.width <= b.left || b.left + b.width <= a.left || a.top + a.height <= b.top || b.top + b.height <= a.top);
  };
  /**
   * Check if a rectangle is fully within another rectangle.
   *
   * @private
   * @memberof Packer.prototype
   * @param {Rectangle} a
   * @param {Rectangle} b
   * @returns {Boolean}
   */


  Packer.prototype._isRectWithinRect = function (a, b) {
    return a.left >= b.left && a.top >= b.top && a.left + a.width <= b.left + b.width && a.top + a.height <= b.top + b.height;
  };
  /**
   * Loops through an array of rectangle ids and resets all that are fully
   * within another rectangle in the array. Resetting in this case means that
   * the rectangle id value is replaced with zero.
   *
   * @private
   * @memberof Packer.prototype
   * @param {RectId[]} rectIds
   * @returns {RectId[]}
   */


  Packer.prototype._purgeRects = function () {
    var rectA = {};
    var rectB = {};
    return function (rectIds) {
      var i = rectIds.length;
      var ii;

      while (i--) {
        ii = rectIds.length;
        if (!rectIds[i]) continue;

        this._getRect(rectIds[i], rectA);

        while (ii--) {
          if (!rectIds[ii] || i === ii) continue;

          if (this._isRectWithinRect(rectA, this._getRect(rectIds[ii], rectB))) {
            rectIds[i] = 0;
            break;
          }
        }
      }

      return rectIds;
    };
  }();
  /**
   * Sort rectangles with top-left gravity.
   *
   * @private
   * @memberof Packer.prototype
   * @param {RectId} aId
   * @param {RectId} bId
   * @returns {Number}
   */


  Packer.prototype._sortRectsTopLeft = function () {
    var rectA = {};
    var rectB = {};
    return function (aId, bId) {
      this._getRect(aId, rectA);

      this._getRect(bId, rectB); // prettier-ignore


      return rectA.top < rectB.top ? -1 : rectA.top > rectB.top ? 1 : rectA.left < rectB.left ? -1 : rectA.left > rectB.left ? 1 : 0;
    };
  }();
  /**
   * Sort rectangles with left-top gravity.
   *
   * @private
   * @memberof Packer.prototype
   * @param {RectId} aId
   * @param {RectId} bId
   * @returns {Number}
   */


  Packer.prototype._sortRectsLeftTop = function () {
    var rectA = {};
    var rectB = {};
    return function (aId, bId) {
      this._getRect(aId, rectA);

      this._getRect(bId, rectB); // prettier-ignore


      return rectA.left < rectB.left ? -1 : rectA.left > rectB.left ? 1 : rectA.top < rectB.top ? -1 : rectA.top > rectB.top ? 1 : 0;
    };
  }();

  var htmlCollectionType = '[object HTMLCollection]';
  var nodeListType = '[object NodeList]';
  /**
   * Check if a value is a node list
   *
   * @param {*} val
   * @returns {Boolean}
   */

  function isNodeList(val) {
    var type = Object.prototype.toString.call(val);
    return type === htmlCollectionType || type === nodeListType;
  }
  /**
   * Converts a value to an array or clones an array.
   *
   * @param {*} target
   * @returns {Array}
   */


  function toArray(target) {
    return isNodeList(target) ? Array.prototype.slice.call(target) : Array.prototype.concat(target);
  }

  var packer = new Packer();

  var noop = function noop() {};
  /**
   * Creates a new Grid instance.
   *
   * @class
   * @param {(HTMLElement|String)} element
   * @param {Object} [options]
   * @param {(?HTMLElement[]|NodeList|String)} [options.items]
   * @param {Number} [options.showDuration=300]
   * @param {String} [options.showEasing="ease"]
   * @param {Object} [options.visibleStyles]
   * @param {Number} [options.hideDuration=300]
   * @param {String} [options.hideEasing="ease"]
   * @param {Object} [options.hiddenStyles]
   * @param {(Function|Object)} [options.layout]
   * @param {Boolean} [options.layout.fillGaps=false]
   * @param {Boolean} [options.layout.horizontal=false]
   * @param {Boolean} [options.layout.alignRight=false]
   * @param {Boolean} [options.layout.alignBottom=false]
   * @param {Boolean} [options.layout.rounding=true]
   * @param {(Boolean|Number)} [options.layoutOnResize=100]
   * @param {Boolean} [options.layoutOnInit=true]
   * @param {Number} [options.layoutDuration=300]
   * @param {String} [options.layoutEasing="ease"]
   * @param {?Object} [options.sortData=null]
   * @param {Boolean} [options.dragEnabled=false]
   * @param {?HtmlElement} [options.dragContainer=null]
   * @param {?Function} [options.dragStartPredicate]
   * @param {Number} [options.dragStartPredicate.distance=0]
   * @param {Number} [options.dragStartPredicate.delay=0]
   * @param {(Boolean|String)} [options.dragStartPredicate.handle=false]
   * @param {?String} [options.dragAxis]
   * @param {(Boolean|Function)} [options.dragSort=true]
   * @param {Number} [options.dragSortInterval=100]
   * @param {(Function|Object)} [options.dragSortPredicate]
   * @param {Number} [options.dragSortPredicate.threshold=50]
   * @param {String} [options.dragSortPredicate.action="move"]
   * @param {Number} [options.dragReleaseDuration=300]
   * @param {String} [options.dragReleaseEasing="ease"]
   * @param {Object} [options.dragHammerSettings={touchAction: "none"}]
   * @param {String} [options.containerClass="muuri"]
   * @param {String} [options.itemClass="muuri-item"]
   * @param {String} [options.itemVisibleClass="muuri-item-visible"]
   * @param {String} [options.itemHiddenClass="muuri-item-hidden"]
   * @param {String} [options.itemPositioningClass="muuri-item-positioning"]
   * @param {String} [options.itemDraggingClass="muuri-item-dragging"]
   * @param {String} [options.itemReleasingClass="muuri-item-releasing"]
   */


  function Grid(element, options) {
    var inst = this;
    var settings;
    var items;
    var layoutOnResize; // Allow passing element as selector string. Store element for instance.

    element = this._element = typeof element === 'string' ? document.querySelector(element) : element; // Throw an error if the container element is not body element or does not
    // exist within the body element.

    if (!document.body.contains(element)) {
      throw new Error('Container element must be an existing DOM element');
    } // Create instance settings by merging the options with default options.


    settings = this._settings = mergeSettings(Grid.defaultOptions, options); // Sanitize dragSort setting.

    if (typeof settings.dragSort !== 'function') {
      settings.dragSort = !!settings.dragSort;
    } // Create instance id and store it to the grid instances collection.


    this._id = createUid();
    gridInstances[this._id] = inst; // Destroyed flag.

    this._isDestroyed = false; // The layout object (mutated on every layout).

    this._layout = {
      id: 0,
      items: [],
      slots: [],
      setWidth: false,
      setHeight: false,
      width: 0,
      height: 0
    }; // Create private Emitter instance.

    this._emitter = new Emitter(); // Add container element's class name.

    addClass(element, settings.containerClass); // Create initial items.

    this._items = [];
    items = settings.items;

    if (typeof items === 'string') {
      toArray(element.children).forEach(function (itemElement) {
        if (items === '*' || elementMatches(itemElement, items)) {
          inst._items.push(new Item(inst, itemElement));
        }
      });
    } else if (Array.isArray(items) || isNodeList(items)) {
      this._items = toArray(items).map(function (itemElement) {
        return new Item(inst, itemElement);
      });
    } // If layoutOnResize option is a valid number sanitize it and bind the resize
    // handler.


    layoutOnResize = settings.layoutOnResize;

    if (typeof layoutOnResize !== 'number') {
      layoutOnResize = layoutOnResize === true ? 0 : -1;
    }

    if (layoutOnResize >= 0) {
      window.addEventListener('resize', inst._resizeHandler = debounce(function () {
        inst.refreshItems().layout();
      }, layoutOnResize));
    } // Layout on init if necessary.


    if (settings.layoutOnInit) {
      this.layout(true);
    }
  }
  /**
   * Public properties
   * *****************
   */

  /**
   * @see Item
   */


  Grid.Item = Item;
  /**
   * @see ItemLayout
   */

  Grid.ItemLayout = ItemLayout;
  /**
   * @see ItemVisibility
   */

  Grid.ItemVisibility = ItemVisibility;
  /**
   * @see ItemRelease
   */

  Grid.ItemRelease = ItemRelease;
  /**
   * @see ItemMigrate
   */

  Grid.ItemMigrate = ItemMigrate;
  /**
   * @see ItemAnimate
   */

  Grid.ItemAnimate = ItemAnimate;
  /**
   * @see ItemDrag
   */

  Grid.ItemDrag = ItemDrag;
  /**
   * @see Emitter
   */

  Grid.Emitter = Emitter;
  /**
   * Default options for Grid instance.
   *
   * @public
   * @memberof Grid
   */

  Grid.defaultOptions = {
    // Item elements
    items: '*',
    // Default show animation
    showDuration: 300,
    showEasing: 'ease',
    // Default hide animation
    hideDuration: 300,
    hideEasing: 'ease',
    // Item's visible/hidden state styles
    visibleStyles: {
      opacity: '1',
      transform: 'scale(1)'
    },
    hiddenStyles: {
      opacity: '0',
      transform: 'scale(0.5)'
    },
    // Layout
    layout: {
      fillGaps: false,
      horizontal: false,
      alignRight: false,
      alignBottom: false,
      rounding: true
    },
    layoutOnResize: 100,
    layoutOnInit: true,
    layoutDuration: 300,
    layoutEasing: 'ease',
    // Sorting
    sortData: null,
    // Drag & Drop
    dragEnabled: false,
    dragContainer: null,
    dragStartPredicate: {
      distance: 0,
      delay: 0,
      handle: false
    },
    dragAxis: null,
    dragSort: true,
    dragSortInterval: 100,
    dragSortPredicate: {
      threshold: 50,
      action: 'move'
    },
    dragReleaseDuration: 300,
    dragReleaseEasing: 'ease',
    dragHammerSettings: {
      touchAction: 'none'
    },
    // Classnames
    containerClass: 'muuri',
    itemClass: 'muuri-item',
    itemVisibleClass: 'muuri-item-shown',
    itemHiddenClass: 'muuri-item-hidden',
    itemPositioningClass: 'muuri-item-positioning',
    itemDraggingClass: 'muuri-item-dragging',
    itemReleasingClass: 'muuri-item-releasing'
  };
  /**
   * Public prototype methods
   * ************************
   */

  /**
   * Bind an event listener.
   *
   * @public
   * @memberof Grid.prototype
   * @param {String} event
   * @param {Function} listener
   * @returns {Grid}
   */

  Grid.prototype.on = function (event, listener) {
    this._emitter.on(event, listener);

    return this;
  };
  /**
   * Bind an event listener that is triggered only once.
   *
   * @public
   * @memberof Grid.prototype
   * @param {String} event
   * @param {Function} listener
   * @returns {Grid}
   */


  Grid.prototype.once = function (event, listener) {
    this._emitter.once(event, listener);

    return this;
  };
  /**
   * Unbind an event listener.
   *
   * @public
   * @memberof Grid.prototype
   * @param {String} event
   * @param {Function} listener
   * @returns {Grid}
   */


  Grid.prototype.off = function (event, listener) {
    this._emitter.off(event, listener);

    return this;
  };
  /**
   * Get the container element.
   *
   * @public
   * @memberof Grid.prototype
   * @returns {HTMLElement}
   */


  Grid.prototype.getElement = function () {
    return this._element;
  };
  /**
   * Get all items. Optionally you can provide specific targets (elements and
   * indices). Note that the returned array is not the same object used by the
   * instance so modifying it will not affect instance's items. All items that
   * are not found are omitted from the returned array.
   *
   * @public
   * @memberof Grid.prototype
   * @param {GridMultiItemQuery} [targets]
   * @returns {Item[]}
   */


  Grid.prototype.getItems = function (targets) {
    // Return all items immediately if no targets were provided or if the
    // instance is destroyed.
    if (this._isDestroyed || !targets && targets !== 0) {
      return this._items.slice(0);
    }

    var ret = [];
    var targetItems = toArray(targets);
    var item;
    var i; // If target items are defined return filtered results.

    for (i = 0; i < targetItems.length; i++) {
      item = this._getItem(targetItems[i]);
      item && ret.push(item);
    }

    return ret;
  };
  /**
   * Update the cached dimensions of the instance's items.
   *
   * @public
   * @memberof Grid.prototype
   * @param {GridMultiItemQuery} [items]
   * @returns {Grid}
   */


  Grid.prototype.refreshItems = function (items) {
    if (this._isDestroyed) return this;
    var targets = this.getItems(items);
    var i;

    for (i = 0; i < targets.length; i++) {
      targets[i]._refreshDimensions();
    }

    return this;
  };
  /**
   * Update the sort data of the instance's items.
   *
   * @public
   * @memberof Grid.prototype
   * @param {GridMultiItemQuery} [items]
   * @returns {Grid}
   */


  Grid.prototype.refreshSortData = function (items) {
    if (this._isDestroyed) return this;
    var targetItems = this.getItems(items);
    var i;

    for (i = 0; i < targetItems.length; i++) {
      targetItems[i]._refreshSortData();
    }

    return this;
  };
  /**
   * Synchronize the item elements to match the order of the items in the DOM.
   * This comes handy if you need to keep the DOM structure matched with the
   * order of the items. Note that if an item's element is not currently a child
   * of the container element (if it is dragged for example) it is ignored and
   * left untouched.
   *
   * @public
   * @memberof Grid.prototype
   * @returns {Grid}
   */


  Grid.prototype.synchronize = function () {
    if (this._isDestroyed) return this;
    var container = this._element;
    var items = this._items;
    var fragment;
    var element;
    var i; // Append all elements in order to the container element.

    if (items.length) {
      for (i = 0; i < items.length; i++) {
        element = items[i]._element;

        if (element.parentNode === container) {
          fragment = fragment || document.createDocumentFragment();
          fragment.appendChild(element);
        }
      }

      if (fragment) container.appendChild(fragment);
    } // Emit synchronize event.


    this._emit(eventSynchronize);

    return this;
  };
  /**
   * Calculate and apply item positions.
   *
   * @public
   * @memberof Grid.prototype
   * @param {Boolean} [instant=false]
   * @param {LayoutCallback} [onFinish]
   * @returns {Grid}
   */


  Grid.prototype.layout = function (instant, onFinish) {
    if (this._isDestroyed) return this;
    var inst = this;
    var element = this._element;

    var layout = this._updateLayout();

    var layoutId = layout.id;
    var itemsLength = layout.items.length;
    var counter = itemsLength;
    var callback = typeof instant === 'function' ? instant : onFinish;
    var isCallbackFunction = typeof callback === 'function';
    var callbackItems = isCallbackFunction ? layout.items.slice(0) : null;
    var isBorderBox;
    var item;
    var i; // The finish function, which will be used for checking if all the items
    // have laid out yet. After all items have finished their animations call
    // callback and emit layoutEnd event. Only emit layoutEnd event if there
    // hasn't been a new layout call during this layout.

    function tryFinish() {
      if (--counter > 0) return;
      var hasLayoutChanged = inst._layout.id !== layoutId;
      isCallbackFunction && callback(hasLayoutChanged, callbackItems);

      if (!hasLayoutChanged && inst._hasListeners(eventLayoutEnd)) {
        inst._emit(eventLayoutEnd, layout.items.slice(0));
      }
    } // If grid's width or height was modified, we need to update it's cached
    // dimensions. Also keep in mind that grid's cached width/height should
    // always equal to what elem.getBoundingClientRect() would return, so
    // therefore we need to add the grid element's borders to the dimensions if
    // it's box-sizing is border-box.


    if (layout.setHeight && typeof layout.height === 'number' || layout.setWidth && typeof layout.width === 'number') {
      isBorderBox = getStyle(element, 'box-sizing') === 'border-box';
    }

    if (layout.setHeight) {
      if (typeof layout.height === 'number') {
        element.style.height = (isBorderBox ? layout.height + this._borderTop + this._borderBottom : layout.height) + 'px';
      } else {
        element.style.height = layout.height;
      }
    }

    if (layout.setWidth) {
      if (typeof layout.width === 'number') {
        element.style.width = (isBorderBox ? layout.width + this._borderLeft + this._borderRight : layout.width) + 'px';
      } else {
        element.style.width = layout.width;
      }
    } // Emit layoutStart event. Note that this is intentionally emitted after the
    // container element's dimensions are set, because otherwise there would be
    // no hook for reacting to container dimension changes.


    if (this._hasListeners(eventLayoutStart)) {
      this._emit(eventLayoutStart, layout.items.slice(0));
    } // If there are no items let's finish quickly.


    if (!itemsLength) {
      tryFinish();
      return this;
    } // If there are items let's position them.


    for (i = 0; i < itemsLength; i++) {
      item = layout.items[i];
      if (!item) continue; // Update item's position.

      item._left = layout.slots[i * 2];
      item._top = layout.slots[i * 2 + 1]; // Layout item if it is not dragged.

      item.isDragging() ? tryFinish() : item._layout.start(instant === true, tryFinish);
    }

    return this;
  };
  /**
   * Add new items by providing the elements you wish to add to the instance and
   * optionally provide the index where you want the items to be inserted into.
   * All elements that are not already children of the container element will be
   * automatically appended to the container element. If an element has it's CSS
   * display property set to "none" it will be marked as inactive during the
   * initiation process. As long as the item is inactive it will not be part of
   * the layout, but it will retain it's index. You can activate items at any
   * point with grid.show() method. This method will automatically call
   * grid.layout() if one or more of the added elements are visible. If only
   * hidden items are added no layout will be called. All the new visible items
   * are positioned without animation during their first layout.
   *
   * @public
   * @memberof Grid.prototype
   * @param {(HTMLElement|HTMLElement[])} elements
   * @param {Object} [options]
   * @param {Number} [options.index=-1]
   * @param {Boolean} [options.isActive]
   * @param {(Boolean|LayoutCallback|String)} [options.layout=true]
   * @returns {Item[]}
   */


  Grid.prototype.add = function (elements, options) {
    if (this._isDestroyed || !elements) return [];
    var newItems = toArray(elements);
    if (!newItems.length) return newItems;
    var opts = options || 0;
    var layout = opts.layout ? opts.layout : opts.layout === undefined;
    var items = this._items;
    var needsLayout = false;
    var item;
    var i; // Map provided elements into new grid items.

    for (i = 0; i < newItems.length; i++) {
      item = new Item(this, newItems[i], opts.isActive);
      newItems[i] = item; // If the item to be added is active, we need to do a layout. Also, we
      // need to mark the item with the skipNextAnimation flag to make it
      // position instantly (without animation) during the next layout. Without
      // the hack the item would animate to it's new position from the northwest
      // corner of the grid, which feels a bit buggy (imho).

      if (item._isActive) {
        needsLayout = true;
        item._layout._skipNextAnimation = true;
      }
    } // Add the new items to the items collection to correct index.


    arrayInsert(items, newItems, opts.index); // Emit add event.

    if (this._hasListeners(eventAdd)) {
      this._emit(eventAdd, newItems.slice(0));
    } // If layout is needed.


    if (needsLayout && layout) {
      this.layout(layout === 'instant', typeof layout === 'function' ? layout : undefined);
    }

    return newItems;
  };
  /**
   * Remove items from the instance.
   *
   * @public
   * @memberof Grid.prototype
   * @param {GridMultiItemQuery} items
   * @param {Object} [options]
   * @param {Boolean} [options.removeElements=false]
   * @param {(Boolean|LayoutCallback|String)} [options.layout=true]
   * @returns {Item[]}
   */


  Grid.prototype.remove = function (items, options) {
    if (this._isDestroyed) return this;
    var opts = options || 0;
    var layout = opts.layout ? opts.layout : opts.layout === undefined;
    var needsLayout = false;
    var allItems = this.getItems();
    var targetItems = this.getItems(items);
    var indices = [];
    var item;
    var i; // Remove the individual items.

    for (i = 0; i < targetItems.length; i++) {
      item = targetItems[i];
      indices.push(allItems.indexOf(item));
      if (item._isActive) needsLayout = true;

      item._destroy(opts.removeElements);
    } // Emit remove event.


    if (this._hasListeners(eventRemove)) {
      this._emit(eventRemove, targetItems.slice(0), indices);
    } // If layout is needed.


    if (needsLayout && layout) {
      this.layout(layout === 'instant', typeof layout === 'function' ? layout : undefined);
    }

    return targetItems;
  };
  /**
   * Show instance items.
   *
   * @public
   * @memberof Grid.prototype
   * @param {GridMultiItemQuery} items
   * @param {Object} [options]
   * @param {Boolean} [options.instant=false]
   * @param {ShowCallback} [options.onFinish]
   * @param {(Boolean|LayoutCallback|String)} [options.layout=true]
   * @returns {Grid}
   */


  Grid.prototype.show = function (items, options) {
    if (this._isDestroyed) return this;

    this._setItemsVisibility(items, true, options);

    return this;
  };
  /**
   * Hide instance items.
   *
   * @public
   * @memberof Grid.prototype
   * @param {GridMultiItemQuery} items
   * @param {Object} [options]
   * @param {Boolean} [options.instant=false]
   * @param {HideCallback} [options.onFinish]
   * @param {(Boolean|LayoutCallback|String)} [options.layout=true]
   * @returns {Grid}
   */


  Grid.prototype.hide = function (items, options) {
    if (this._isDestroyed) return this;

    this._setItemsVisibility(items, false, options);

    return this;
  };
  /**
   * Filter items. Expects at least one argument, a predicate, which should be
   * either a function or a string. The predicate callback is executed for every
   * item in the instance. If the return value of the predicate is truthy the
   * item in question will be shown and otherwise hidden. The predicate callback
   * receives the item instance as it's argument. If the predicate is a string
   * it is considered to be a selector and it is checked against every item
   * element in the instance with the native element.matches() method. All the
   * matching items will be shown and others hidden.
   *
   * @public
   * @memberof Grid.prototype
   * @param {(Function|String)} predicate
   * @param {Object} [options]
   * @param {Boolean} [options.instant=false]
   * @param {FilterCallback} [options.onFinish]
   * @param {(Boolean|LayoutCallback|String)} [options.layout=true]
   * @returns {Grid}
   */


  Grid.prototype.filter = function (predicate, options) {
    if (this._isDestroyed || !this._items.length) return this;
    var itemsToShow = [];
    var itemsToHide = [];
    var isPredicateString = typeof predicate === 'string';
    var isPredicateFn = typeof predicate === 'function';
    var opts = options || 0;
    var isInstant = opts.instant === true;
    var layout = opts.layout ? opts.layout : opts.layout === undefined;
    var onFinish = typeof opts.onFinish === 'function' ? opts.onFinish : null;
    var tryFinishCounter = -1;
    var tryFinish = noop;
    var item;
    var i; // If we have onFinish callback, let's create proper tryFinish callback.

    if (onFinish) {
      tryFinish = function tryFinish() {
        ++tryFinishCounter && onFinish(itemsToShow.slice(0), itemsToHide.slice(0));
      };
    } // Check which items need to be shown and which hidden.


    if (isPredicateFn || isPredicateString) {
      for (i = 0; i < this._items.length; i++) {
        item = this._items[i];

        if (isPredicateFn ? predicate(item) : elementMatches(item._element, predicate)) {
          itemsToShow.push(item);
        } else {
          itemsToHide.push(item);
        }
      }
    } // Show items that need to be shown.


    if (itemsToShow.length) {
      this.show(itemsToShow, {
        instant: isInstant,
        onFinish: tryFinish,
        layout: false
      });
    } else {
      tryFinish();
    } // Hide items that need to be hidden.


    if (itemsToHide.length) {
      this.hide(itemsToHide, {
        instant: isInstant,
        onFinish: tryFinish,
        layout: false
      });
    } else {
      tryFinish();
    } // If there are any items to filter.


    if (itemsToShow.length || itemsToHide.length) {
      // Emit filter event.
      if (this._hasListeners(eventFilter)) {
        this._emit(eventFilter, itemsToShow.slice(0), itemsToHide.slice(0));
      } // If layout is needed.


      if (layout) {
        this.layout(layout === 'instant', typeof layout === 'function' ? layout : undefined);
      }
    }

    return this;
  };
  /**
   * Sort items. There are three ways to sort the items. The first is simply by
   * providing a function as the comparer which works identically to native
   * array sort. Alternatively you can sort by the sort data you have provided
   * in the instance's options. Just provide the sort data key(s) as a string
   * (separated by space) and the items will be sorted based on the provided
   * sort data keys. Lastly you have the opportunity to provide a presorted
   * array of items which will be used to sync the internal items array in the
   * same order.
   *
   * @public
   * @memberof Grid.prototype
   * @param {(Function|Item[]|String|String[])} comparer
   * @param {Object} [options]
   * @param {Boolean} [options.descending=false]
   * @param {(Boolean|LayoutCallback|String)} [options.layout=true]
   * @returns {Grid}
   */


  Grid.prototype.sort = function () {
    var sortComparer;
    var isDescending;
    var origItems;
    var indexMap;

    function parseCriteria(data) {
      return data.trim().split(' ').map(function (val) {
        return val.split(':');
      });
    }

    function getIndexMap(items) {
      var ret = {};

      for (var i = 0; i < items.length; i++) {
        ret[items[i]._id] = i;
      }

      return ret;
    }

    function compareIndices(itemA, itemB) {
      var indexA = indexMap[itemA._id];
      var indexB = indexMap[itemB._id];
      return isDescending ? indexB - indexA : indexA - indexB;
    }

    function defaultComparer(a, b) {
      var result = 0;
      var criteriaName;
      var criteriaOrder;
      var valA;
      var valB; // Loop through the list of sort criteria.

      for (var i = 0; i < sortComparer.length; i++) {
        // Get the criteria name, which should match an item's sort data key.
        criteriaName = sortComparer[i][0];
        criteriaOrder = sortComparer[i][1]; // Get items' cached sort values for the criteria. If the item has no sort
        // data let's update the items sort data (this is a lazy load mechanism).

        valA = (a._sortData ? a : a._refreshSortData())._sortData[criteriaName];
        valB = (b._sortData ? b : b._refreshSortData())._sortData[criteriaName]; // Sort the items in descending order if defined so explicitly. Otherwise
        // sort items in ascending order.

        if (criteriaOrder === 'desc' || !criteriaOrder && isDescending) {
          result = valB < valA ? -1 : valB > valA ? 1 : 0;
        } else {
          result = valA < valB ? -1 : valA > valB ? 1 : 0;
        } // If we have -1 or 1 as the return value, let's return it immediately.


        if (result) return result;
      } // If values are equal let's compare the item indices to make sure we
      // have a stable sort.


      if (!result) {
        if (!indexMap) indexMap = getIndexMap(origItems);
        result = compareIndices(a, b);
      }

      return result;
    }

    function customComparer(a, b) {
      var result = sortComparer(a, b); // If descending let's invert the result value.

      if (isDescending && result) result = -result; // If we have a valid result (not zero) let's return it right away.

      if (result) return result; // If result is zero let's compare the item indices to make sure we have a
      // stable sort.

      if (!indexMap) indexMap = getIndexMap(origItems);
      return compareIndices(a, b);
    }

    return function (comparer, options) {
      if (this._isDestroyed || this._items.length < 2) return this;
      var items = this._items;
      var opts = options || 0;
      var layout = opts.layout ? opts.layout : opts.layout === undefined;
      var i; // Setup parent scope data.

      sortComparer = comparer;
      isDescending = !!opts.descending;
      origItems = items.slice(0);
      indexMap = null; // If function is provided do a native array sort.

      if (typeof sortComparer === 'function') {
        items.sort(customComparer);
      } // Otherwise if we got a string, let's sort by the sort data as provided in
      // the instance's options.
      else if (typeof sortComparer === 'string') {
          sortComparer = parseCriteria(comparer);
          items.sort(defaultComparer);
        } // Otherwise if we got an array, let's assume it's a presorted array of the
        // items and order the items based on it.
        else if (Array.isArray(sortComparer)) {
            if (sortComparer.length !== items.length) {
              throw new Error('[' + namespace + '] sort reference items do not match with grid items.');
            }

            for (i = 0; i < items.length; i++) {
              if (sortComparer.indexOf(items[i]) < 0) {
                throw new Error('[' + namespace + '] sort reference items do not match with grid items.');
              }

              items[i] = sortComparer[i];
            }

            if (isDescending) items.reverse();
          } // Otherwise let's just skip it, nothing we can do here.
          else {
              /** @todo Maybe throw an error here? */
              return this;
            } // Emit sort event.


      if (this._hasListeners(eventSort)) {
        this._emit(eventSort, items.slice(0), origItems);
      } // If layout is needed.


      if (layout) {
        this.layout(layout === 'instant', typeof layout === 'function' ? layout : undefined);
      }

      return this;
    };
  }();
  /**
   * Move item to another index or in place of another item.
   *
   * @public
   * @memberof Grid.prototype
   * @param {GridSingleItemQuery} item
   * @param {GridSingleItemQuery} position
   * @param {Object} [options]
   * @param {String} [options.action="move"]
   *   - Accepts either "move" or "swap".
   *   - "move" moves the item in place of the other item.
   *   - "swap" swaps the position of the items.
   * @param {(Boolean|LayoutCallback|String)} [options.layout=true]
   * @returns {Grid}
   */


  Grid.prototype.move = function (item, position, options) {
    if (this._isDestroyed || this._items.length < 2) return this;
    var items = this._items;
    var opts = options || 0;
    var layout = opts.layout ? opts.layout : opts.layout === undefined;
    var isSwap = opts.action === 'swap';
    var action = isSwap ? 'swap' : 'move';

    var fromItem = this._getItem(item);

    var toItem = this._getItem(position);

    var fromIndex;
    var toIndex; // Make sure the items exist and are not the same.

    if (fromItem && toItem && fromItem !== toItem) {
      // Get the indices of the items.
      fromIndex = items.indexOf(fromItem);
      toIndex = items.indexOf(toItem); // Do the move/swap.

      if (isSwap) {
        arraySwap(items, fromIndex, toIndex);
      } else {
        arrayMove(items, fromIndex, toIndex);
      } // Emit move event.


      if (this._hasListeners(eventMove)) {
        this._emit(eventMove, {
          item: fromItem,
          fromIndex: fromIndex,
          toIndex: toIndex,
          action: action
        });
      } // If layout is needed.


      if (layout) {
        this.layout(layout === 'instant', typeof layout === 'function' ? layout : undefined);
      }
    }

    return this;
  };
  /**
   * Send item to another Grid instance.
   *
   * @public
   * @memberof Grid.prototype
   * @param {GridSingleItemQuery} item
   * @param {Grid} grid
   * @param {GridSingleItemQuery} position
   * @param {Object} [options]
   * @param {HTMLElement} [options.appendTo=document.body]
   * @param {(Boolean|LayoutCallback|String)} [options.layoutSender=true]
   * @param {(Boolean|LayoutCallback|String)} [options.layoutReceiver=true]
   * @returns {Grid}
   */


  Grid.prototype.send = function (item, grid, position, options) {
    if (this._isDestroyed || grid._isDestroyed || this === grid) return this; // Make sure we have a valid target item.

    item = this._getItem(item);
    if (!item) return this;
    var opts = options || 0;
    var container = opts.appendTo || document.body;
    var layoutSender = opts.layoutSender ? opts.layoutSender : opts.layoutSender === undefined;
    var layoutReceiver = opts.layoutReceiver ? opts.layoutReceiver : opts.layoutReceiver === undefined; // Start the migration process.

    item._migrate.start(grid, position, container); // If migration was started successfully and the item is active, let's layout
    // the grids.


    if (item._migrate._isActive && item._isActive) {
      if (layoutSender) {
        this.layout(layoutSender === 'instant', typeof layoutSender === 'function' ? layoutSender : undefined);
      }

      if (layoutReceiver) {
        grid.layout(layoutReceiver === 'instant', typeof layoutReceiver === 'function' ? layoutReceiver : undefined);
      }
    }

    return this;
  };
  /**
   * Destroy the instance.
   *
   * @public
   * @memberof Grid.prototype
   * @param {Boolean} [removeElements=false]
   * @returns {Grid}
   */


  Grid.prototype.destroy = function (removeElements) {
    if (this._isDestroyed) return this;
    var container = this._element;

    var items = this._items.slice(0);

    var i; // Unbind window resize event listener.

    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    } // Destroy items.


    for (i = 0; i < items.length; i++) {
      items[i]._destroy(removeElements);
    } // Restore container.


    removeClass(container, this._settings.containerClass);
    container.style.height = '';
    container.style.width = ''; // Emit destroy event and unbind all events.

    this._emit(eventDestroy);

    this._emitter.destroy(); // Remove reference from the grid instances collection.


    gridInstances[this._id] = undefined; // Flag instance as destroyed.

    this._isDestroyed = true;
    return this;
  };
  /**
   * Private prototype methods
   * *************************
   */

  /**
   * Get instance's item by element or by index. Target can also be an Item
   * instance in which case the function returns the item if it exists within
   * related Grid instance. If nothing is found with the provided target, null
   * is returned.
   *
   * @private
   * @memberof Grid.prototype
   * @param {GridSingleItemQuery} [target]
   * @returns {?Item}
   */


  Grid.prototype._getItem = function (target) {
    // If no target is specified or the instance is destroyed, return null.
    if (this._isDestroyed || !target && target !== 0) {
      return null;
    } // If target is number return the item in that index. If the number is lower
    // than zero look for the item starting from the end of the items array. For
    // example -1 for the last item, -2 for the second last item, etc.


    if (typeof target === 'number') {
      return this._items[target > -1 ? target : this._items.length + target] || null;
    } // If the target is an instance of Item return it if it is attached to this
    // Grid instance, otherwise return null.


    if (target instanceof Item) {
      return target._gridId === this._id ? target : null;
    } // In other cases let's assume that the target is an element, so let's try
    // to find an item that matches the element and return it. If item is not
    // found return null.

    /** @todo This could be made a lot faster by using Map/WeakMap of elements. */


    for (var i = 0; i < this._items.length; i++) {
      if (this._items[i]._element === target) {
        return this._items[i];
      }
    }

    return null;
  };
  /**
   * Recalculates and updates instance's layout data.
   *
   * @private
   * @memberof Grid.prototype
   * @returns {LayoutData}
   */


  Grid.prototype._updateLayout = function () {
    var layout = this._layout;
    var settings = this._settings.layout;
    var width;
    var height;
    var newLayout;
    var i; // Let's increment layout id.

    ++layout.id; // Let's update layout items

    layout.items.length = 0;

    for (i = 0; i < this._items.length; i++) {
      if (this._items[i]._isActive) layout.items.push(this._items[i]);
    } // Let's make sure we have the correct container dimensions.


    this._refreshDimensions(); // Calculate container width and height (without borders).


    width = this._width - this._borderLeft - this._borderRight;
    height = this._height - this._borderTop - this._borderBottom; // Calculate new layout.

    if (typeof settings === 'function') {
      newLayout = settings(layout.items, width, height);
    } else {
      newLayout = packer.getLayout(layout.items, width, height, layout.slots, settings);
    } // Let's update the grid's layout.


    layout.slots = newLayout.slots;
    layout.setWidth = Boolean(newLayout.setWidth);
    layout.setHeight = Boolean(newLayout.setHeight);
    layout.width = newLayout.width;
    layout.height = newLayout.height;
    return layout;
  };
  /**
   * Emit a grid event.
   *
   * @private
   * @memberof Grid.prototype
   * @param {String} event
   * @param {...*} [arg]
   */


  Grid.prototype._emit = function () {
    if (this._isDestroyed) return;

    this._emitter.emit.apply(this._emitter, arguments);
  };
  /**
   * Check if there are any events listeners for an event.
   *
   * @private
   * @memberof Grid.prototype
   * @param {String} event
   * @returns {Boolean}
   */


  Grid.prototype._hasListeners = function (event) {
    var listeners = this._emitter._events[event];
    return !!(listeners && listeners.length);
  };
  /**
   * Update container's width, height and offsets.
   *
   * @private
   * @memberof Grid.prototype
   */


  Grid.prototype._updateBoundingRect = function () {
    var element = this._element;
    var rect = element.getBoundingClientRect();
    this._width = rect.width;
    this._height = rect.height;
    this._left = rect.left;
    this._top = rect.top;
  };
  /**
   * Update container's border sizes.
   *
   * @private
   * @memberof Grid.prototype
   * @param {Boolean} left
   * @param {Boolean} right
   * @param {Boolean} top
   * @param {Boolean} bottom
   */


  Grid.prototype._updateBorders = function (left, right, top, bottom) {
    var element = this._element;
    if (left) this._borderLeft = getStyleAsFloat(element, 'border-left-width');
    if (right) this._borderRight = getStyleAsFloat(element, 'border-right-width');
    if (top) this._borderTop = getStyleAsFloat(element, 'border-top-width');
    if (bottom) this._borderBottom = getStyleAsFloat(element, 'border-bottom-width');
  };
  /**
   * Refresh all of container's internal dimensions and offsets.
   *
   * @private
   * @memberof Grid.prototype
   */


  Grid.prototype._refreshDimensions = function () {
    this._updateBoundingRect();

    this._updateBorders(1, 1, 1, 1);
  };
  /**
   * Show or hide Grid instance's items.
   *
   * @private
   * @memberof Grid.prototype
   * @param {GridMultiItemQuery} items
   * @param {Boolean} toVisible
   * @param {Object} [options]
   * @param {Boolean} [options.instant=false]
   * @param {(ShowCallback|HideCallback)} [options.onFinish]
   * @param {(Boolean|LayoutCallback|String)} [options.layout=true]
   */


  Grid.prototype._setItemsVisibility = function (items, toVisible, options) {
    var grid = this;
    var targetItems = this.getItems(items);
    var opts = options || 0;
    var isInstant = opts.instant === true;
    var callback = opts.onFinish;
    var layout = opts.layout ? opts.layout : opts.layout === undefined;
    var counter = targetItems.length;
    var startEvent = toVisible ? eventShowStart : eventHideStart;
    var endEvent = toVisible ? eventShowEnd : eventHideEnd;
    var method = toVisible ? 'show' : 'hide';
    var needsLayout = false;
    var completedItems = [];
    var hiddenItems = [];
    var item;
    var i; // If there are no items call the callback, but don't emit any events.

    if (!counter) {
      if (typeof callback === 'function') callback(targetItems);
      return;
    } // Emit showStart/hideStart event.


    if (this._hasListeners(startEvent)) {
      this._emit(startEvent, targetItems.slice(0));
    } // Show/hide items.


    for (i = 0; i < targetItems.length; i++) {
      item = targetItems[i]; // If inactive item is shown or active item is hidden we need to do
      // layout.

      if (toVisible && !item._isActive || !toVisible && item._isActive) {
        needsLayout = true;
      } // If inactive item is shown we also need to do a little hack to make the
      // item not animate it's next positioning (layout).


      if (toVisible && !item._isActive) {
        item._layout._skipNextAnimation = true;
      } // If a hidden item is being shown we need to refresh the item's
      // dimensions.


      if (toVisible && item._visibility._isHidden) {
        hiddenItems.push(item);
      } // Show/hide the item.


      item._visibility[method](isInstant, function (interrupted, item) {
        // If the current item's animation was not interrupted add it to the
        // completedItems array.
        if (!interrupted) completedItems.push(item); // If all items have finished their animations call the callback
        // and emit showEnd/hideEnd event.

        if (--counter < 1) {
          if (typeof callback === 'function') callback(completedItems.slice(0));
          if (grid._hasListeners(endEvent)) grid._emit(endEvent, completedItems.slice(0));
        }
      });
    } // Refresh hidden items.


    if (hiddenItems.length) this.refreshItems(hiddenItems); // Layout if needed.

    if (needsLayout && layout) {
      this.layout(layout === 'instant', typeof layout === 'function' ? layout : undefined);
    }
  };
  /**
   * Private helpers
   * ***************
   */

  /**
   * Merge default settings with user settings. The returned object is a new
   * object with merged values. The merging is a deep merge meaning that all
   * objects and arrays within the provided settings objects will be also merged
   * so that modifying the values of the settings object will have no effect on
   * the returned object.
   *
   * @param {Object} defaultSettings
   * @param {Object} [userSettings]
   * @returns {Object} Returns a new object.
   */


  function mergeSettings(defaultSettings, userSettings) {
    // Create a fresh copy of default settings.
    var ret = mergeObjects({}, defaultSettings); // Merge user settings to default settings.

    if (userSettings) {
      ret = mergeObjects(ret, userSettings);
    } // Handle visible/hidden styles manually so that the whole object is
    // overridden instead of the props.


    ret.visibleStyles = (userSettings || 0).visibleStyles || (defaultSettings || 0).visibleStyles;
    ret.hiddenStyles = (userSettings || 0).hiddenStyles || (defaultSettings || 0).hiddenStyles;
    return ret;
  }
  /**
   * Merge two objects recursively (deep merge). The source object's properties
   * are merged to the target object.
   *
   * @param {Object} target
   *   - The target object.
   * @param {Object} source
   *   - The source object.
   * @returns {Object} Returns the target object.
   */


  function mergeObjects(target, source) {
    var sourceKeys = Object.keys(source);
    var length = sourceKeys.length;
    var isSourceObject;
    var propName;
    var i;

    for (i = 0; i < length; i++) {
      propName = sourceKeys[i];
      isSourceObject = isPlainObject(source[propName]); // If target and source values are both objects, merge the objects and
      // assign the merged value to the target property.

      if (isPlainObject(target[propName]) && isSourceObject) {
        target[propName] = mergeObjects(mergeObjects({}, target[propName]), source[propName]);
        continue;
      } // If source's value is object and target's is not let's clone the object as
      // the target's value.


      if (isSourceObject) {
        target[propName] = mergeObjects({}, source[propName]);
        continue;
      } // If source's value is an array let's clone the array as the target's
      // value.


      if (Array.isArray(source[propName])) {
        target[propName] = source[propName].slice(0);
        continue;
      } // In all other cases let's just directly assign the source's value as the
      // target's value.


      target[propName] = source[propName];
    }

    return target;
  }

  return Grid;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2h0bWwvanMvYXBwL211dXJpLmpzIl0sIm5hbWVzIjpbImRlZmluZSIsIkhhbW1lciIsIm5hbWVzcGFjZSIsImdyaWRJbnN0YW5jZXMiLCJldmVudFN5bmNocm9uaXplIiwiZXZlbnRMYXlvdXRTdGFydCIsImV2ZW50TGF5b3V0RW5kIiwiZXZlbnRBZGQiLCJldmVudFJlbW92ZSIsImV2ZW50U2hvd1N0YXJ0IiwiZXZlbnRTaG93RW5kIiwiZXZlbnRIaWRlU3RhcnQiLCJldmVudEhpZGVFbmQiLCJldmVudEZpbHRlciIsImV2ZW50U29ydCIsImV2ZW50TW92ZSIsImV2ZW50U2VuZCIsImV2ZW50QmVmb3JlU2VuZCIsImV2ZW50UmVjZWl2ZSIsImV2ZW50QmVmb3JlUmVjZWl2ZSIsImV2ZW50RHJhZ0luaXQiLCJldmVudERyYWdTdGFydCIsImV2ZW50RHJhZ01vdmUiLCJldmVudERyYWdTY3JvbGwiLCJldmVudERyYWdFbmQiLCJldmVudERyYWdSZWxlYXNlU3RhcnQiLCJldmVudERyYWdSZWxlYXNlRW5kIiwiZXZlbnREZXN0cm95IiwiRW1pdHRlciIsIl9ldmVudHMiLCJfcXVldWUiLCJfY291bnRlciIsIl9pc0Rlc3Ryb3llZCIsInByb3RvdHlwZSIsIm9uIiwiZXZlbnQiLCJsaXN0ZW5lciIsImxpc3RlbmVycyIsInB1c2giLCJvbmNlIiwiY2FsbGJhY2siLCJvZmYiLCJhcHBseSIsImFyZ3VtZW50cyIsImJpbmQiLCJsZW5ndGgiLCJpIiwic3BsaWNlIiwiZW1pdCIsImFyZzEiLCJhcmcyIiwiYXJnMyIsInF1ZXVlIiwicUxlbmd0aCIsImFMZW5ndGgiLCJkZXN0cm95IiwiZXZlbnRzIiwidW5kZWZpbmVkIiwiaXNUcmFuc2Zvcm1TdXBwb3J0ZWQiLCJ0cmFuc2Zvcm1TdHlsZSIsInRyYW5zZm9ybVByb3AiLCJzdHlsZSIsInN0eWxlQ2FwIiwiZm9yRWFjaCIsInByZWZpeCIsInByb3BOYW1lIiwiZG9jdW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJ0b0xvd2VyQ2FzZSIsInN0eWxlc0NhY2hlIiwiV2Vha01hcCIsImdldFN0eWxlIiwiZWxlbWVudCIsInN0eWxlcyIsImdldCIsIndpbmRvdyIsImdldENvbXB1dGVkU3R5bGUiLCJzZXQiLCJnZXRQcm9wZXJ0eVZhbHVlIiwic3R5bGVOYW1lUmVnRXgiLCJnZXRTdHlsZU5hbWUiLCJzdHJpbmciLCJyZXBsYWNlIiwic2V0U3R5bGVzIiwicHJvcCIsIkl0ZW1BbmltYXRlIiwiX2VsZW1lbnQiLCJfYW5pbWF0aW9uIiwiX2NhbGxiYWNrIiwiX3Byb3BzIiwiX3ZhbHVlcyIsIl9rZXlmcmFtZXMiLCJfb3B0aW9ucyIsIl9vbkZpbmlzaCIsInN0YXJ0IiwicHJvcHNGcm9tIiwicHJvcHNUbyIsIm9wdGlvbnMiLCJhbmltYXRpb24iLCJjdXJyZW50UHJvcHMiLCJjdXJyZW50VmFsdWVzIiwib3B0cyIsImNhbmNlbEFuaW1hdGlvbiIsInByb3BDb3VudCIsInByb3BJbmRleCIsImluZGV4T2YiLCJjYW5jZWwiLCJvbkZpbmlzaCIsImFuaW1LZXlmcmFtZXMiLCJhbmltT3B0aW9ucyIsImR1cmF0aW9uIiwiZWFzaW5nIiwiYW5pbWF0ZSIsIm9uZmluaXNoIiwic3RvcCIsInByb3BWYWx1ZSIsImlzQW5pbWF0aW5nIiwicmFmIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwid2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwibW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwibXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJyYWZGYWxsYmFjayIsImNiIiwic2V0VGltZW91dCIsIlRpY2tlciIsIl9uZXh0VGljayIsIl9yZWFkcyIsIl93cml0ZXMiLCJfYmF0Y2giLCJfYmF0Y2hSZWFkcyIsIl9iYXRjaFdyaXRlcyIsIl9mbHVzaCIsImFkZCIsImlkIiwicmVhZENhbGxiYWNrIiwid3JpdGVDYWxsYmFjayIsImlzSW1wb3J0YW50IiwiY3VycmVudEluZGV4IiwidW5zaGlmdCIsInJlYWRzIiwid3JpdGVzIiwiYmF0Y2giLCJiYXRjaFJlYWRzIiwiYmF0Y2hXcml0ZXMiLCJ0aWNrZXIiLCJsYXlvdXRUaWNrIiwidmlzaWJpbGl0eVRpY2siLCJtb3ZlVGljayIsInNjcm9sbFRpY2siLCJhZGRMYXlvdXRUaWNrIiwiaXRlbUlkIiwiY2FuY2VsTGF5b3V0VGljayIsImFkZFZpc2liaWxpdHlUaWNrIiwiY2FuY2VsVmlzaWJpbGl0eVRpY2siLCJhZGRNb3ZlVGljayIsImNhbmNlbE1vdmVUaWNrIiwiYWRkU2Nyb2xsVGljayIsImNhbmNlbFNjcm9sbFRpY2siLCJwcm90byIsIkVsZW1lbnQiLCJtYXRjaGVzIiwibWF0Y2hlc1NlbGVjdG9yIiwid2Via2l0TWF0Y2hlc1NlbGVjdG9yIiwibW96TWF0Y2hlc1NlbGVjdG9yIiwibXNNYXRjaGVzU2VsZWN0b3IiLCJvTWF0Y2hlc1NlbGVjdG9yIiwiZWxlbWVudE1hdGNoZXMiLCJlbCIsInNlbGVjdG9yIiwiY2FsbCIsImFkZENsYXNzTW9kZXJuIiwiY2xhc3NOYW1lIiwiY2xhc3NMaXN0IiwiYWRkQ2xhc3NMZWdhY3kiLCJhZGRDbGFzcyIsIm5vcm1hbGl6ZUFycmF5SW5kZXgiLCJhcnJheSIsImluZGV4IiwiaXNNaWdyYXRpb24iLCJtYXhJbmRleCIsIk1hdGgiLCJtYXgiLCJhcnJheU1vdmUiLCJmcm9tSW5kZXgiLCJ0b0luZGV4IiwiZnJvbSIsInRvIiwiYXJyYXlTd2FwIiwid2l0aEluZGV4IiwiaW5kZXhBIiwiaW5kZXhCIiwidGVtcCIsImFjdGlvbkNhbmNlbCIsImFjdGlvbkZpbmlzaCIsImRlYm91bmNlIiwiZm4iLCJ3YWl0IiwidGltZW91dCIsImFjdGlvbiIsImNsZWFyVGltZW91dCIsImlzVHJhbnNmb3JtZWQiLCJ0cmFuc2Zvcm0iLCJkaXNwbGF5IiwiZ2V0Q29udGFpbmluZ0Jsb2NrIiwiaW5jbHVkZVNlbGYiLCJyZXQiLCJwYXJlbnRFbGVtZW50IiwiZ2V0U3R5bGVBc0Zsb2F0IiwicGFyc2VGbG9hdCIsIm9mZnNldEEiLCJvZmZzZXRCIiwib2Zmc2V0RGlmZiIsImdldE9mZnNldCIsIm9mZnNldERhdGEiLCJyZWN0IiwibGVmdCIsInRvcCIsInBhZ2VYT2Zmc2V0IiwicGFnZVlPZmZzZXQiLCJzZWxmIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiZ2V0T2Zmc2V0RGlmZiIsImVsZW1BIiwiZWxlbUIiLCJjb21wYXJlQ29udGFpbmluZ0Jsb2NrcyIsInRyYW5zbGF0ZURhdGEiLCJnZXRUcmFuc2xhdGUiLCJ4IiwieSIsIm1hdHJpeERhdGEiLCJzcGxpdCIsImdldFRyYW5zbGF0ZVN0cmluZyIsInRlbXBBcnJheSIsImFycmF5SW5zZXJ0IiwiaXRlbXMiLCJzdGFydEluZGV4IiwiY29uY2F0Iiwib2JqZWN0VHlwZSIsInRvU3RyaW5nIiwiT2JqZWN0IiwiaXNQbGFpbk9iamVjdCIsInZhbCIsInJlbW92ZUNsYXNzTW9kZXJuIiwicmVtb3ZlIiwicmVtb3ZlQ2xhc3NMZWdhY3kiLCJ0cmltIiwicmVtb3ZlQ2xhc3MiLCJoYXNUcmFuc2Zvcm1MZWFrIiwiY2hlY2tUcmFuc2Zvcm1MZWFrIiwic3RhcnRQcmVkaWNhdGVJbmFjdGl2ZSIsInN0YXJ0UHJlZGljYXRlUGVuZGluZyIsInN0YXJ0UHJlZGljYXRlUmVzb2x2ZWQiLCJzdGFydFByZWRpY2F0ZVJlamVjdGVkIiwiSXRlbURyYWciLCJpdGVtIiwiRXJyb3IiLCJkcmFnIiwiZ3JpZCIsImdldEdyaWQiLCJzZXR0aW5ncyIsIl9zZXR0aW5ncyIsImhhbW1lciIsInN0YXJ0UHJlZGljYXRlIiwiZHJhZ1N0YXJ0UHJlZGljYXRlIiwiZGVmYXVsdFN0YXJ0UHJlZGljYXRlIiwic3RhcnRQcmVkaWNhdGVTdGF0ZSIsInN0YXJ0UHJlZGljYXRlUmVzdWx0IiwiX2l0ZW0iLCJfZ3JpZElkIiwiX2lkIiwiX2hhbW1lciIsIk1hbmFnZXIiLCJfaXNNaWdyYXRpbmciLCJfcmVzZXQiLCJfb25TY3JvbGwiLCJfcHJlcGFyZU1vdmUiLCJfYXBwbHlNb3ZlIiwiX3ByZXBhcmVTY3JvbGwiLCJfYXBwbHlTY3JvbGwiLCJfY2hlY2tPdmVybGFwIiwiX2ZvcmNlUmVzb2x2ZVN0YXJ0UHJlZGljYXRlIiwiX29uU3RhcnQiLCJfY2hlY2tPdmVybGFwRGVib3VuY2UiLCJkcmFnU29ydEludGVydmFsIiwiUGFuIiwicG9pbnRlcnMiLCJ0aHJlc2hvbGQiLCJkaXJlY3Rpb24iLCJESVJFQ1RJT05fQUxMIiwiUHJlc3MiLCJ0aW1lIiwiZHJhZ0hhbW1lclNldHRpbmdzIiwiZSIsIl9pc0FjdGl2ZSIsIl9vbk1vdmUiLCJpc1Jlc29sdmVkIiwiX29uRW5kIiwiYWRkRXZlbnRMaXN0ZW5lciIsInByZXZlbnREZWZhdWx0IiwiX2RyYWciLCJwcmVkaWNhdGUiLCJfc3RhcnRQcmVkaWNhdGVEYXRhIiwiX3NldHVwU3RhcnRQcmVkaWNhdGUiLCJpc0ZpbmFsIiwiX2ZpbmlzaFN0YXJ0UHJlZGljYXRlIiwiaGFuZGxlRWxlbWVudCIsIl9nZXRTdGFydFByZWRpY2F0ZUhhbmRsZSIsImRlbGF5IiwiZGVsYXlUaW1lciIsIl9yZXNvbHZlU3RhcnRQcmVkaWNhdGUiLCJfcmVzZXRTdGFydFByZWRpY2F0ZSIsImRlZmF1bHRTb3J0UHJlZGljYXRlIiwiaXRlbVJlY3QiLCJ0YXJnZXRSZWN0IiwicmV0dXJuRGF0YSIsInJvb3RHcmlkQXJyYXkiLCJnZXRUYXJnZXRHcmlkIiwicm9vdEdyaWQiLCJ0YXJnZXQiLCJkcmFnU29ydCIsImJlc3RTY29yZSIsImdyaWRTY29yZSIsImdyaWRzIiwiQXJyYXkiLCJpc0FycmF5IiwiX3VwZGF0ZUJvdW5kaW5nUmVjdCIsIndpZHRoIiwiX3dpZHRoIiwiaGVpZ2h0IiwiX2hlaWdodCIsIl9sZWZ0IiwiX3RvcCIsImdldFJlY3RPdmVybGFwU2NvcmUiLCJfZ2V0R3JpZCIsInNvcnRUaHJlc2hvbGQiLCJzb3J0QWN0aW9uIiwiX2VsZW1lbnRDbGllbnRYIiwiX2VsZW1lbnRDbGllbnRZIiwiZ3JpZE9mZnNldExlZnQiLCJncmlkT2Zmc2V0VG9wIiwibWF0Y2hTY29yZSIsIm1hdGNoSW5kZXgiLCJoYXNWYWxpZFRhcmdldHMiLCJzY29yZSIsIl9ncmlkWCIsIl9tYXJnaW5MZWZ0IiwiX2dyaWRZIiwiX21hcmdpblRvcCIsIl91cGRhdGVCb3JkZXJzIiwiX2JvcmRlckxlZnQiLCJfYm9yZGVyVG9wIiwiX2l0ZW1zIiwiSW5maW5pdHkiLCJfZmluaXNoTWlncmF0aW9uIiwiX3VuYmluZFNjcm9sbExpc3RlbmVycyIsInBhcmVudE5vZGUiLCJhcHBlbmRDaGlsZCIsIml0ZW1EcmFnZ2luZ0NsYXNzIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIl9jb250YWluZXIiLCJfY29udGFpbmluZ0Jsb2NrIiwiX2xhc3RFdmVudCIsIl9sYXN0U2Nyb2xsRXZlbnQiLCJfc2Nyb2xsZXJzIiwiX2NvbnRhaW5lckRpZmZYIiwiX2NvbnRhaW5lckRpZmZZIiwiX2JpbmRTY3JvbGxMaXN0ZW5lcnMiLCJncmlkQ29udGFpbmVyIiwiZHJhZ0NvbnRhaW5lciIsInNjcm9sbGVycyIsImNvbnRhaW5lclNjcm9sbGVycyIsImdldFNjcm9sbFBhcmVudHMiLCJjb25maWciLCJkaXN0YW5jZSIsImFicyIsImhhbmRsZSIsImNoYW5nZWRQb2ludGVycyIsInBvaW50ZXIiLCJwYWdlWCIsInBhZ2VZIiwiaGFuZGxlUmVjdCIsImhhbmRsZUxlZnQiLCJoYW5kbGVUb3AiLCJoYW5kbGVXaWR0aCIsImhhbmRsZUhlaWdodCIsImlzQ2xpY2siLCJvcGVuQW5jaG9ySHJlZiIsInJlc3VsdCIsImN1cnJlbnRHcmlkIiwidGFyZ2V0R3JpZCIsInRhcmdldEluZGV4IiwiZHJhZ1NvcnRQcmVkaWNhdGUiLCJfaGFzTGlzdGVuZXJzIiwiX2VtaXQiLCJsYXlvdXQiLCJmcm9tR3JpZCIsInRvR3JpZCIsIl9zb3J0RGF0YSIsInJlbGVhc2UiLCJfcmVsZWFzZSIsImlzQWN0aXZlIiwidGFyZ2V0R3JpZEVsZW1lbnQiLCJ0YXJnZXRTZXR0aW5ncyIsInRhcmdldENvbnRhaW5lciIsImN1cnJlbnRTZXR0aW5ncyIsImN1cnJlbnRDb250YWluZXIiLCJ0cmFuc2xhdGUiLCJpdGVtQ2xhc3MiLCJpdGVtVmlzaWJsZUNsYXNzIiwiaXRlbUhpZGRlbkNsYXNzIiwiX3JlZnJlc2hEaW1lbnNpb25zIiwiX3JlZnJlc2hTb3J0RGF0YSIsImRyYWdFbmFibGVkIiwiX2NoaWxkIiwicmVtb3ZlQXR0cmlidXRlIiwidmlzaWJsZVN0eWxlcyIsImhpZGRlblN0eWxlcyIsIm1pZ3JhdGUiLCJfbWlncmF0ZSIsImNvbnRhaW5pbmdCbG9jayIsImN1cnJlbnRMZWZ0IiwiY3VycmVudFRvcCIsImVsZW1lbnRSZWN0IiwiaGFzRHJhZ0NvbnRhaW5lciIsImlzUG9zaXRpb25pbmciLCJfbGF5b3V0IiwiaXNSZWxlYXNpbmciLCJheGlzIiwiZHJhZ0F4aXMiLCJ4RGlmZiIsImRlbHRhWCIsInlEaWZmIiwiZGVsdGFZIiwiYSIsImIiLCJtaW4iLCJtYXhXaWR0aCIsIm1heEhlaWdodCIsImRhdGEiLCJwYXJlbnQiLCJpc1Njcm9sbGFibGUiLCJvdmVyZmxvdyIsImRlbHRhVGltZSIsInRhZ05hbWUiLCJocmVmIiwiZ2V0QXR0cmlidXRlIiwib3BlbiIsImxvY2F0aW9uIiwiYm9keSIsImVsZW1zIiwibWFwIiwiZWxlbSIsImlzSW5uZXIiLCJjcmVhdGVFbGVtZW50IiwicG9zaXRpb24iLCJ2aXNpYmlsaXR5Iiwib3V0ZXIiLCJpbm5lciIsInJlbW92ZUNoaWxkIiwiUXVldWUiLCJmbHVzaCIsInNpbmdsZUNhbGxiYWNrIiwic25hcHNob3QiLCJzbGljZSIsIkl0ZW1MYXlvdXQiLCJfaXNJbnRlcnJ1cHRlZCIsIl9jdXJyZW50U3R5bGVzIiwiX3RhcmdldFN0eWxlcyIsIl9jdXJyZW50TGVmdCIsIl9jdXJyZW50VG9wIiwiX29mZnNldExlZnQiLCJfb2Zmc2V0VG9wIiwiX3NraXBOZXh0QW5pbWF0aW9uIiwiX2FuaW1hdGVPcHRpb25zIiwiX2ZpbmlzaCIsIl9zZXR1cEFuaW1hdGlvbiIsIl9zdGFydEFuaW1hdGlvbiIsImluc3RhbnQiLCJncmlkU2V0dGluZ3MiLCJpc0p1c3RSZWxlYXNlZCIsIl9pc1Bvc2l0aW9uaW5nU3RhcnRlZCIsImFuaW1EdXJhdGlvbiIsImRyYWdSZWxlYXNlRHVyYXRpb24iLCJsYXlvdXREdXJhdGlvbiIsImFuaW1FYXNpbmciLCJkcmFnUmVsZWFzZUVhc2luZyIsImxheW91dEVhc2luZyIsImFuaW1FbmFibGVkIiwiX3VwZGF0ZU9mZnNldHMiLCJfdXBkYXRlVGFyZ2V0U3R5bGVzIiwiX2FuaW1hdGUiLCJwcm9jZXNzQ2FsbGJhY2tRdWV1ZSIsInRhcmdldFN0eWxlcyIsIml0ZW1Qb3NpdGlvbmluZ0NsYXNzIiwidGVtcFN0eWxlcyIsIkl0ZW1NaWdyYXRlIiwiY29udGFpbmVyIiwiaXNWaXNpYmxlIiwidGFyZ2V0RWxlbWVudCIsInRhcmdldEl0ZW1zIiwidGFyZ2V0SXRlbSIsImNvbnRhaW5lckRpZmYiLCJ0cmFuc2xhdGVYIiwidHJhbnNsYXRlWSIsIl9nZXRJdGVtIiwiX3Zpc2liaWxpdHkiLCJfc3RvcEFuaW1hdGlvbiIsImFib3J0IiwiY3VycmVudFN0eWxlcyIsImdyaWRFbGVtZW50IiwidGVtcFN0eWxlcyQxIiwiSXRlbVJlbGVhc2UiLCJpdGVtUmVsZWFzaW5nQ2xhc3MiLCJnZXRDdXJyZW50U3R5bGVzIiwiY3VycmVudCIsIkl0ZW1WaXNpYmlsaXR5IiwiX2lzSGlkZGVuIiwiX2lzSGlkaW5nIiwiX2lzU2hvd2luZyIsIl9maW5pc2hTaG93IiwiX2ZpbmlzaEhpZGUiLCJzaG93IiwiaGlkZSIsInRvVmlzaWJsZSIsInBhcnNlSW50Iiwic2hvd0R1cmF0aW9uIiwiaGlkZUR1cmF0aW9uIiwic2hvd0Vhc2luZyIsImhpZGVFYXNpbmciLCJpc0luc3RhbnQiLCJfYW5pbWF0ZUNoaWxkIiwiZmluaXNoU3R5bGVzIiwiY3JlYXRlVWlkIiwiSXRlbSIsImNoaWxkcmVuIiwiZ2V0RWxlbWVudCIsImdldFdpZHRoIiwiZ2V0SGVpZ2h0IiwiZ2V0TWFyZ2luIiwicmlnaHQiLCJfbWFyZ2luUmlnaHQiLCJib3R0b20iLCJfbWFyZ2luQm90dG9tIiwiZ2V0UG9zaXRpb24iLCJpc1Nob3dpbmciLCJpc0hpZGluZyIsImlzRHJhZ2dpbmciLCJpc0Rlc3Ryb3llZCIsImdldHRlcnMiLCJzb3J0RGF0YSIsIl9kZXN0cm95IiwicmVtb3ZlRWxlbWVudCIsIlBhY2tlciIsIl9zbG90cyIsIl9zbG90U2l6ZXMiLCJfZnJlZVNsb3RzIiwiX25ld1Nsb3RzIiwiX3JlY3RJdGVtIiwiX3JlY3RTdG9yZSIsIl9yZWN0SWQiLCJzbG90cyIsInNldFdpZHRoIiwic2V0SGVpZ2h0IiwiX3NvcnRSZWN0c0xlZnRUb3AiLCJfc29ydFJlY3RzVG9wTGVmdCIsImdldExheW91dCIsImZpbGxHYXBzIiwiaXNIb3Jpem9udGFsIiwiaG9yaXpvbnRhbCIsImFsaWduUmlnaHQiLCJhbGlnbkJvdHRvbSIsInJvdW5kaW5nIiwic2xvdFNpemVzIiwicm91bmQiLCJfYWRkU2xvdCIsImxlZXdheSIsIml0ZW1TbG90IiwidHJhY2tTaXplIiwiZnJlZVNsb3RzIiwibmV3U2xvdHMiLCJyZWN0SWQiLCJwb3RlbnRpYWxTbG90cyIsImlnbm9yZUN1cnJlbnRTbG90cyIsImlpIiwiX2dldFJlY3QiLCJfYWRkUmVjdCIsIl9zcGxpdFJlY3QiLCJfcHVyZ2VSZWN0cyIsInNvcnQiLCJyZWN0U3RvcmUiLCJyZWN0SXRlbSIsInJlc3VsdHMiLCJob2xlIiwiX2RvUmVjdHNPdmVybGFwIiwiX2lzUmVjdFdpdGhpblJlY3QiLCJyZWN0QSIsInJlY3RCIiwicmVjdElkcyIsImFJZCIsImJJZCIsImh0bWxDb2xsZWN0aW9uVHlwZSIsIm5vZGVMaXN0VHlwZSIsImlzTm9kZUxpc3QiLCJ0eXBlIiwidG9BcnJheSIsInBhY2tlciIsIm5vb3AiLCJHcmlkIiwiaW5zdCIsImxheW91dE9uUmVzaXplIiwicXVlcnlTZWxlY3RvciIsImNvbnRhaW5zIiwibWVyZ2VTZXR0aW5ncyIsImRlZmF1bHRPcHRpb25zIiwiX2VtaXR0ZXIiLCJjb250YWluZXJDbGFzcyIsIml0ZW1FbGVtZW50IiwiX3Jlc2l6ZUhhbmRsZXIiLCJyZWZyZXNoSXRlbXMiLCJsYXlvdXRPbkluaXQiLCJvcGFjaXR5IiwidG91Y2hBY3Rpb24iLCJnZXRJdGVtcyIsInRhcmdldHMiLCJyZWZyZXNoU29ydERhdGEiLCJzeW5jaHJvbml6ZSIsImZyYWdtZW50IiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsIl91cGRhdGVMYXlvdXQiLCJsYXlvdXRJZCIsIml0ZW1zTGVuZ3RoIiwiY291bnRlciIsImlzQ2FsbGJhY2tGdW5jdGlvbiIsImNhbGxiYWNrSXRlbXMiLCJpc0JvcmRlckJveCIsInRyeUZpbmlzaCIsImhhc0xheW91dENoYW5nZWQiLCJfYm9yZGVyQm90dG9tIiwiX2JvcmRlclJpZ2h0IiwiZWxlbWVudHMiLCJuZXdJdGVtcyIsIm5lZWRzTGF5b3V0IiwiYWxsSXRlbXMiLCJpbmRpY2VzIiwicmVtb3ZlRWxlbWVudHMiLCJfc2V0SXRlbXNWaXNpYmlsaXR5IiwiZmlsdGVyIiwiaXRlbXNUb1Nob3ciLCJpdGVtc1RvSGlkZSIsImlzUHJlZGljYXRlU3RyaW5nIiwiaXNQcmVkaWNhdGVGbiIsInRyeUZpbmlzaENvdW50ZXIiLCJzb3J0Q29tcGFyZXIiLCJpc0Rlc2NlbmRpbmciLCJvcmlnSXRlbXMiLCJpbmRleE1hcCIsInBhcnNlQ3JpdGVyaWEiLCJnZXRJbmRleE1hcCIsImNvbXBhcmVJbmRpY2VzIiwiaXRlbUEiLCJpdGVtQiIsImRlZmF1bHRDb21wYXJlciIsImNyaXRlcmlhTmFtZSIsImNyaXRlcmlhT3JkZXIiLCJ2YWxBIiwidmFsQiIsImN1c3RvbUNvbXBhcmVyIiwiY29tcGFyZXIiLCJkZXNjZW5kaW5nIiwicmV2ZXJzZSIsIm1vdmUiLCJpc1N3YXAiLCJmcm9tSXRlbSIsInRvSXRlbSIsInNlbmQiLCJhcHBlbmRUbyIsImxheW91dFNlbmRlciIsImxheW91dFJlY2VpdmVyIiwibmV3TGF5b3V0IiwiQm9vbGVhbiIsInN0YXJ0RXZlbnQiLCJlbmRFdmVudCIsIm1ldGhvZCIsImNvbXBsZXRlZEl0ZW1zIiwiaGlkZGVuSXRlbXMiLCJpbnRlcnJ1cHRlZCIsImRlZmF1bHRTZXR0aW5ncyIsInVzZXJTZXR0aW5ncyIsIm1lcmdlT2JqZWN0cyIsInNvdXJjZSIsInNvdXJjZUtleXMiLCJrZXlzIiwiaXNTb3VyY2VPYmplY3QiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQUEsTUFBTSxDQUFDLENBQUMsZ0JBQUQsQ0FBRCxFQUFxQixVQUFVQyxNQUFWLEVBQWtCO0FBQ3pDOztBQUVBLE1BQUlDLFNBQVMsR0FBRyxPQUFoQjtBQUNBLE1BQUlDLGFBQWEsR0FBRyxFQUFwQjtBQUVBLE1BQUlDLGdCQUFnQixHQUFHLGFBQXZCO0FBQ0EsTUFBSUMsZ0JBQWdCLEdBQUcsYUFBdkI7QUFDQSxNQUFJQyxjQUFjLEdBQUcsV0FBckI7QUFDQSxNQUFJQyxRQUFRLEdBQUcsS0FBZjtBQUNBLE1BQUlDLFdBQVcsR0FBRyxRQUFsQjtBQUNBLE1BQUlDLGNBQWMsR0FBRyxXQUFyQjtBQUNBLE1BQUlDLFlBQVksR0FBRyxTQUFuQjtBQUNBLE1BQUlDLGNBQWMsR0FBRyxXQUFyQjtBQUNBLE1BQUlDLFlBQVksR0FBRyxTQUFuQjtBQUNBLE1BQUlDLFdBQVcsR0FBRyxRQUFsQjtBQUNBLE1BQUlDLFNBQVMsR0FBRyxNQUFoQjtBQUNBLE1BQUlDLFNBQVMsR0FBRyxNQUFoQjtBQUNBLE1BQUlDLFNBQVMsR0FBRyxNQUFoQjtBQUNBLE1BQUlDLGVBQWUsR0FBRyxZQUF0QjtBQUNBLE1BQUlDLFlBQVksR0FBRyxTQUFuQjtBQUNBLE1BQUlDLGtCQUFrQixHQUFHLGVBQXpCO0FBQ0EsTUFBSUMsYUFBYSxHQUFHLFVBQXBCO0FBQ0EsTUFBSUMsY0FBYyxHQUFHLFdBQXJCO0FBQ0EsTUFBSUMsYUFBYSxHQUFHLFVBQXBCO0FBQ0EsTUFBSUMsZUFBZSxHQUFHLFlBQXRCO0FBQ0EsTUFBSUMsWUFBWSxHQUFHLFNBQW5CO0FBQ0EsTUFBSUMscUJBQXFCLEdBQUcsa0JBQTVCO0FBQ0EsTUFBSUMsbUJBQW1CLEdBQUcsZ0JBQTFCO0FBQ0EsTUFBSUMsWUFBWSxHQUFHLFNB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ampMSyxDQUFOIiwic291cmNlc0NvbnRlbnQiOlsiZGVmaW5lKFsnbGliL2hhbW1lci5taW4nXSwgZnVuY3Rpb24gKEhhbW1lcikge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBuYW1lc3BhY2UgPSAnTXV1cmknO1xyXG4gICAgdmFyIGdyaWRJbnN0YW5jZXMgPSB7fTtcclxuXHJcbiAgICB2YXIgZXZlbnRTeW5jaHJvbml6ZSA9ICdzeW5jaHJvbml6ZSc7XHJcbiAgICB2YXIgZXZlbnRMYXlvdXRTdGFydCA9ICdsYXlvdXRTdGFydCc7XHJcbiAgICB2YXIgZXZlbnRMYXlvdXRFbmQgPSAnbGF5b3V0RW5kJztcclxuICAgIHZhciBldmVudEFkZCA9ICdhZGQnO1xyXG4gICAgdmFyIGV2ZW50UmVtb3ZlID0gJ3JlbW92ZSc7XHJcbiAgICB2YXIgZXZlbnRTaG93U3RhcnQgPSAnc2hvd1N0YXJ0JztcclxuICAgIHZhciBldmVudFNob3dFbmQgPSAnc2hvd0VuZCc7XHJcbiAgICB2YXIgZXZlbnRIaWRlU3RhcnQgPSAnaGlkZVN0YXJ0JztcclxuICAgIHZhciBldmVudEhpZGVFbmQgPSAnaGlkZUVuZCc7XHJcbiAgICB2YXIgZXZlbnRGaWx0ZXIgPSAnZmlsdGVyJztcclxuICAgIHZhciBldmVudFNvcnQgPSAnc29ydCc7XHJcbiAgICB2YXIgZXZlbnRNb3ZlID0gJ21vdmUnO1xyXG4gICAgdmFyIGV2ZW50U2VuZCA9ICdzZW5kJztcclxuICAgIHZhciBldmVudEJlZm9yZVNlbmQgPSAnYmVmb3JlU2VuZCc7XHJcbiAgICB2YXIgZXZlbnRSZWNlaXZlID0gJ3JlY2VpdmUnO1xyXG4gICAgdmFyIGV2ZW50QmVmb3JlUmVjZWl2ZSA9ICdiZWZvcmVSZWNlaXZlJztcclxuICAgIHZhciBldmVudERyYWdJbml0ID0gJ2RyYWdJbml0JztcclxuICAgIHZhciBldmVudERyYWdTdGFydCA9ICdkcmFnU3RhcnQnO1xyXG4gICAgdmFyIGV2ZW50RHJhZ01vdmUgPSAnZHJhZ01vdmUnO1xyXG4gICAgdmFyIGV2ZW50RHJhZ1Njcm9sbCA9ICdkcmFnU2Nyb2xsJztcclxuICAgIHZhciBldmVudERyYWdFbmQgPSAnZHJhZ0VuZCc7XHJcbiAgICB2YXIgZXZlbnREcmFnUmVsZWFzZVN0YXJ0ID0gJ2RyYWdSZWxlYXNlU3RhcnQnO1xyXG4gICAgdmFyIGV2ZW50RHJhZ1JlbGVhc2VFbmQgPSAnZHJhZ1JlbGVhc2VFbmQnO1xyXG4gICAgdmFyIGV2ZW50RGVzdHJveSA9ICdkZXN0cm95JztcclxuXHJcbiAgICAvKipcclxuICAgICAqIEV2ZW50IGVtaXR0ZXIgY29uc3RydWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICogQGNsYXNzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIEVtaXR0ZXIoKSB7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRzID0ge307XHJcbiAgICAgICAgdGhpcy5fcXVldWUgPSBbXTtcclxuICAgICAgICB0aGlzLl9jb3VudGVyID0gMDtcclxuICAgICAgICB0aGlzLl9pc0Rlc3Ryb3llZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHVibGljIHByb3RvdHlwZSBtZXRob2RzXHJcbiAgICAgKiAqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmluZCBhbiBldmVudCBsaXN0ZW5lci5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgRW1pdHRlci5wcm90b3R5cGVcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcclxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfVxyXG4gICAgICovXHJcbiAgICBFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudCwgbGlzdGVuZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQpIHJldHVybiB0aGlzO1xyXG5cclxuICAgICAgICAvLyBHZXQgbGlzdGVuZXJzIHF1ZXVlIGFuZCBjcmVhdGUgaXQgaWYgaXQgZG9lcyBub3QgZXhpc3QuXHJcbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldmVudF07XHJcbiAgICAgICAgaWYgKCFsaXN0ZW5lcnMpIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldmVudF0gPSBbXTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHRoZSBsaXN0ZW5lciB0byB0aGUgcXVldWUuXHJcbiAgICAgICAgbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCaW5kIGFuIGV2ZW50IGxpc3RlbmVyIHRoYXQgaXMgdHJpZ2dlcmVkIG9ubHkgb25jZS5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgRW1pdHRlci5wcm90b3R5cGVcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcclxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfVxyXG4gICAgICovXHJcbiAgICBFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gKGV2ZW50LCBsaXN0ZW5lcikge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5vZmYoZXZlbnQsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgbGlzdGVuZXIuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLm9uKGV2ZW50LCBjYWxsYmFjayk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5iaW5kIGFsbCBldmVudCBsaXN0ZW5lcnMgdGhhdCBtYXRjaCB0aGUgcHJvdmlkZWQgbGlzdGVuZXIgZnVuY3Rpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEVtaXR0ZXIucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtsaXN0ZW5lcl1cclxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfVxyXG4gICAgICovXHJcbiAgICBFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbiAoZXZlbnQsIGxpc3RlbmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSByZXR1cm4gdGhpcztcclxuXHJcbiAgICAgICAgLy8gR2V0IGxpc3RlbmVycyBhbmQgcmV0dXJuIGltbWVkaWF0ZWx5IGlmIG5vbmUgaXMgZm91bmQuXHJcbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldmVudF07XHJcbiAgICAgICAgaWYgKCFsaXN0ZW5lcnMgfHwgIWxpc3RlbmVycy5sZW5ndGgpIHJldHVybiB0aGlzO1xyXG5cclxuICAgICAgICAvLyBJZiBubyBzcGVjaWZpYyBsaXN0ZW5lciBpcyBwcm92aWRlZCByZW1vdmUgYWxsIGxpc3RlbmVycy5cclxuICAgICAgICBpZiAoIWxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIGxpc3RlbmVycy5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBhbGwgbWF0Y2hpbmcgbGlzdGVuZXJzLlxyXG4gICAgICAgIHZhciBpID0gbGlzdGVuZXJzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lciA9PT0gbGlzdGVuZXJzW2ldKSBsaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRW1pdCBhbGwgbGlzdGVuZXJzIGluIGEgc3BlY2lmaWVkIGV2ZW50IHdpdGggdGhlIHByb3ZpZGVkIGFyZ3VtZW50cy5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgRW1pdHRlci5wcm90b3R5cGVcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gICAgICogQHBhcmFtIHsqfSBbYXJnMV1cclxuICAgICAqIEBwYXJhbSB7Kn0gW2FyZzJdXHJcbiAgICAgKiBAcGFyYW0geyp9IFthcmczXVxyXG4gICAgICogQHJldHVybnMge0VtaXR0ZXJ9XHJcbiAgICAgKi9cclxuICAgIEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiAoZXZlbnQsIGFyZzEsIGFyZzIsIGFyZzMpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQpIHJldHVybiB0aGlzO1xyXG5cclxuICAgICAgICAvLyBHZXQgZXZlbnQgbGlzdGVuZXJzIGFuZCBxdWl0IGVhcmx5IGlmIHRoZXJlJ3Mgbm8gbGlzdGVuZXJzLlxyXG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZlbnRdO1xyXG4gICAgICAgIGlmICghbGlzdGVuZXJzIHx8ICFsaXN0ZW5lcnMubGVuZ3RoKSByZXR1cm4gdGhpcztcclxuXHJcbiAgICAgICAgdmFyIHF1ZXVlID0gdGhpcy5fcXVldWU7XHJcbiAgICAgICAgdmFyIHFMZW5ndGggPSBxdWV1ZS5sZW5ndGg7XHJcbiAgICAgICAgdmFyIGFMZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoIC0gMTtcclxuICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHRoZSBjdXJyZW50IGxpc3RlbmVycyB0byB0aGUgY2FsbGJhY2sgcXVldWUgYmVmb3JlIHdlIHByb2Nlc3MgdGhlbS5cclxuICAgICAgICAvLyBUaGlzIGlzIG5lY2Vzc2FyeSB0byBndWFyYW50ZWUgdGhhdCBhbGwgb2YgdGhlIGxpc3RlbmVycyBhcmUgY2FsbGVkIGluXHJcbiAgICAgICAgLy8gY29ycmVjdCBvcmRlciBldmVuIGlmIG5ldyBldmVudCBsaXN0ZW5lcnMgYXJlIHJlbW92ZWQvYWRkZWQgZHVyaW5nXHJcbiAgICAgICAgLy8gcHJvY2Vzc2luZyBhbmQvb3IgZXZlbnRzIGFyZSBlbWl0dGVkIGR1cmluZyBwcm9jZXNzaW5nLlxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgcXVldWUucHVzaChsaXN0ZW5lcnNbaV0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5jcmVtZW50IHF1ZXVlIGNvdW50ZXIuIFRoaXMgaXMgbmVlZGVkIGZvciB0aGUgc2NlbmFyaW9zIHdoZXJlIGVtaXQgaXNcclxuICAgICAgICAvLyB0cmlnZ2VyZWQgd2hpbGUgdGhlIHF1ZXVlIGlzIGFscmVhZHkgcHJvY2Vzc2luZy4gV2UgbmVlZCB0byBrZWVwIHRyYWNrIG9mXHJcbiAgICAgICAgLy8gaG93IG1hbnkgXCJxdWV1ZSBwcm9jZXNzb3JzXCIgdGhlcmUgYXJlIGFjdGl2ZSBzbyB0aGF0IHdlIGNhbiBzYWZlbHkgcmVzZXRcclxuICAgICAgICAvLyB0aGUgcXVldWUgaW4gdGhlIGVuZCB3aGVuIHRoZSBsYXN0IHF1ZXVlIHByb2Nlc3NvciBpcyBmaW5pc2hlZC5cclxuICAgICAgICArK3RoaXMuX2NvdW50ZXI7XHJcblxyXG4gICAgICAgIC8vIFByb2Nlc3MgdGhlIHF1ZXVlICh0aGUgc3BlY2lmaWMgcGFydCBvZiBpdCBmb3IgdGhpcyBlbWl0KS5cclxuICAgICAgICBmb3IgKGkgPSBxTGVuZ3RoLCBxTGVuZ3RoID0gcXVldWUubGVuZ3RoOyBpIDwgcUxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIC8vIHByZXR0aWVyLWlnbm9yZVxyXG4gICAgICAgICAgICBhTGVuZ3RoID09PSAwID8gcXVldWVbaV0oKSA6XHJcbiAgICAgICAgICAgICAgICBhTGVuZ3RoID09PSAxID8gcXVldWVbaV0oYXJnMSkgOlxyXG4gICAgICAgICAgICAgICAgICAgIGFMZW5ndGggPT09IDIgPyBxdWV1ZVtpXShhcmcxLCBhcmcyKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlW2ldKGFyZzEsIGFyZzIsIGFyZzMpO1xyXG5cclxuICAgICAgICAgICAgLy8gU3RvcCBwcm9jZXNzaW5nIGlmIHRoZSBlbWl0dGVyIGlzIGRlc3Ryb3llZC5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERlY3JlbWVudCBxdWV1ZSBwcm9jZXNzIGNvdW50ZXIuXHJcbiAgICAgICAgLS10aGlzLl9jb3VudGVyO1xyXG5cclxuICAgICAgICAvLyBSZXNldCB0aGUgcXVldWUgaWYgdGhlcmUgYXJlIG5vIG1vcmUgcXVldWUgcHJvY2Vzc2VzIHJ1bm5pbmcuXHJcbiAgICAgICAgaWYgKCF0aGlzLl9jb3VudGVyKSBxdWV1ZS5sZW5ndGggPSAwO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXN0cm95IGVtaXR0ZXIgaW5zdGFuY2UuIEJhc2ljYWxseSBqdXN0IHJlbW92ZXMgYWxsIGJvdW5kIGxpc3RlbmVycy5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgRW1pdHRlci5wcm90b3R5cGVcclxuICAgICAqIEByZXR1cm5zIHtFbWl0dGVyfVxyXG4gICAgICovXHJcbiAgICBFbWl0dGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgICAgIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XHJcbiAgICAgICAgdmFyIGV2ZW50O1xyXG5cclxuICAgICAgICAvLyBGbGFnIGFzIGRlc3Ryb3llZC5cclxuICAgICAgICB0aGlzLl9pc0Rlc3Ryb3llZCA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHF1ZXVlIChpZiBxdWV1ZSBpcyBjdXJyZW50bHkgcHJvY2Vzc2luZyB0aGlzIHdpbGwgYWxzbyBzdG9wIHRoYXQpLlxyXG4gICAgICAgIHRoaXMuX3F1ZXVlLmxlbmd0aCA9IHRoaXMuX2NvdW50ZXIgPSAwO1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgYWxsIGxpc3RlbmVycy5cclxuICAgICAgICBmb3IgKGV2ZW50IGluIGV2ZW50cykge1xyXG4gICAgICAgICAgICBpZiAoZXZlbnRzW2V2ZW50XSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW2V2ZW50XS5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW2V2ZW50XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFNldCB1cCB0aGUgZGVmYXVsdCBleHBvcnQgdmFsdWVzLlxyXG4gICAgdmFyIGlzVHJhbnNmb3JtU3VwcG9ydGVkID0gZmFsc2U7XHJcbiAgICB2YXIgdHJhbnNmb3JtU3R5bGUgPSAndHJhbnNmb3JtJztcclxuICAgIHZhciB0cmFuc2Zvcm1Qcm9wID0gJ3RyYW5zZm9ybSc7XHJcblxyXG4gICAgLy8gRmluZCB0aGUgc3VwcG9ydGVkIHRyYW5zZm9ybSBwcm9wIGFuZCBzdHlsZSBuYW1lcy5cclxuICAgIHZhciBzdHlsZSA9ICd0cmFuc2Zvcm0nO1xyXG4gICAgdmFyIHN0eWxlQ2FwID0gJ1RyYW5zZm9ybSc7XHJcbiAgICBbJycsICdXZWJraXQnLCAnTW96JywgJ08nLCAnbXMnXS5mb3JFYWNoKGZ1bmN0aW9uIChwcmVmaXgpIHtcclxuICAgICAgICBpZiAoaXNUcmFuc2Zvcm1TdXBwb3J0ZWQpIHJldHVybjtcclxuICAgICAgICB2YXIgcHJvcE5hbWUgPSBwcmVmaXggPyBwcmVmaXggKyBzdHlsZUNhcCA6IHN0eWxlO1xyXG4gICAgICAgIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGVbcHJvcE5hbWVdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcHJlZml4ID0gcHJlZml4LnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIHRyYW5zZm9ybVN0eWxlID0gcHJlZml4ID8gJy0nICsgcHJlZml4ICsgJy0nICsgc3R5bGUgOiBzdHlsZTtcclxuICAgICAgICAgICAgdHJhbnNmb3JtUHJvcCA9IHByb3BOYW1lO1xyXG4gICAgICAgICAgICBpc1RyYW5zZm9ybVN1cHBvcnRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIHN0eWxlc0NhY2hlID0gdHlwZW9mIFdlYWtNYXAgPT09ICdmdW5jdGlvbicgPyBuZXcgV2Vha01hcCgpIDogbnVsbDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGNvbXB1dGVkIHZhbHVlIG9mIGFuIGVsZW1lbnQncyBzdHlsZSBwcm9wZXJ0eSBhcyBhIHN0cmluZy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3R5bGVcclxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGdldFN0eWxlKGVsZW1lbnQsIHN0eWxlKSB7XHJcbiAgICAgICAgdmFyIHN0eWxlcyA9IHN0eWxlc0NhY2hlICYmIHN0eWxlc0NhY2hlLmdldChlbGVtZW50KTtcclxuICAgICAgICBpZiAoIXN0eWxlcykge1xyXG4gICAgICAgICAgICBzdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50LCBudWxsKTtcclxuICAgICAgICAgICAgc3R5bGVzQ2FjaGUgJiYgc3R5bGVzQ2FjaGUuc2V0KGVsZW1lbnQsIHN0eWxlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdHlsZXMuZ2V0UHJvcGVydHlWYWx1ZShzdHlsZSA9PT0gJ3RyYW5zZm9ybScgPyB0cmFuc2Zvcm1TdHlsZSA6IHN0eWxlKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc3R5bGVOYW1lUmVnRXggPSAvKFtBLVpdKS9nO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhbnNmb3JtcyBhIGNhbWVsIGNhc2Ugc3R5bGUgcHJvcGVydHkgdG8ga2ViYWIgY2FzZSBzdHlsZSBwcm9wZXJ0eS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXHJcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXRTdHlsZU5hbWUoc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKHN0eWxlTmFtZVJlZ0V4LCAnLSQxJykudG9Mb3dlckNhc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBpbmxpbmUgc3R5bGVzIHRvIGFuIGVsZW1lbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHN0eWxlc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzZXRTdHlsZXMoZWxlbWVudCwgc3R5bGVzKSB7XHJcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBzdHlsZXMpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZVtwcm9wID09PSAndHJhbnNmb3JtJyA/IHRyYW5zZm9ybVByb3AgOiBwcm9wXSA9IHN0eWxlc1twcm9wXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJdGVtIGFuaW1hdGlvbiBoYW5kbGVyIHBvd2VyZWQgYnkgV2ViIEFuaW1hdGlvbnMgQVBJLlxyXG4gICAgICpcclxuICAgICAqIEBjbGFzc1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBJdGVtQW5pbWF0ZShlbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9jYWxsYmFjayA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fcHJvcHMgPSBbXTtcclxuICAgICAgICB0aGlzLl92YWx1ZXMgPSBbXTtcclxuICAgICAgICB0aGlzLl9rZXlmcmFtZXMgPSBbXTtcclxuICAgICAgICB0aGlzLl9vcHRpb25zID0ge307XHJcbiAgICAgICAgdGhpcy5faXNEZXN0cm95ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9vbkZpbmlzaCA9IHRoaXMuX29uRmluaXNoLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQdWJsaWMgcHJvdG90eXBlIG1ldGhvZHNcclxuICAgICAqICoqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGFydCBpbnN0YW5jZSdzIGFuaW1hdGlvbi4gQXV0b21hdGljYWxseSBzdG9wcyBjdXJyZW50IGFuaW1hdGlvbiBpZiBpdCBpc1xyXG4gICAgICogcnVubmluZy5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbUFuaW1hdGUucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcHNGcm9tXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcHNUb1xyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmR1cmF0aW9uPTMwMF1cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5lYXNpbmc9J2Vhc2UnXVxyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW29wdGlvbnMub25GaW5pc2hdXHJcbiAgICAgKi9cclxuICAgIEl0ZW1BbmltYXRlLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uIChwcm9wc0Zyb20sIHByb3BzVG8sIG9wdGlvbnMpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIGFuaW1hdGlvbiA9IHRoaXMuX2FuaW1hdGlvbjtcclxuICAgICAgICB2YXIgY3VycmVudFByb3BzID0gdGhpcy5fcHJvcHM7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZXMgPSB0aGlzLl92YWx1ZXM7XHJcbiAgICAgICAgdmFyIG9wdHMgPSBvcHRpb25zIHx8IDA7XHJcbiAgICAgICAgdmFyIGNhbmNlbEFuaW1hdGlvbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBJZiB3ZSBoYXZlIGFuIGV4aXN0aW5nIGFuaW1hdGlvbiBydW5uaW5nLCBsZXQncyBjaGVjayBpZiBpdCBuZWVkcyB0byBiZVxyXG4gICAgICAgIC8vIGNhbmNlbGxlZCBvciBpZiBpdCBjYW4gY29udGludWUgcnVubmluZy5cclxuICAgICAgICBpZiAoYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgIHZhciBwcm9wQ291bnQgPSAwO1xyXG4gICAgICAgICAgICB2YXIgcHJvcEluZGV4O1xyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIHJlcXVlc3RlZCBhbmltYXRpb24gdGFyZ2V0IHByb3BzIGFuZCB2YWx1ZXMgbWF0Y2ggd2l0aCB0aGVcclxuICAgICAgICAgICAgLy8gY3VycmVudCBwcm9wcyBhbmQgdmFsdWVzLlxyXG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wTmFtZSBpbiBwcm9wc1RvKSB7XHJcbiAgICAgICAgICAgICAgICArK3Byb3BDb3VudDtcclxuICAgICAgICAgICAgICAgIHByb3BJbmRleCA9IGN1cnJlbnRQcm9wcy5pbmRleE9mKHByb3BOYW1lKTtcclxuICAgICAgICAgICAgICAgIGlmIChwcm9wSW5kZXggPT09IC0xIHx8IHByb3BzVG9bcHJvcE5hbWVdICE9PSBjdXJyZW50VmFsdWVzW3Byb3BJbmRleF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBjYW5jZWxBbmltYXRpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgdGFyZ2V0IHByb3BzIGNvdW50IG1hdGNoZXMgY3VycmVudCBwcm9wcyBjb3VudC4gVGhpcyBpc1xyXG4gICAgICAgICAgICAvLyBuZWVkZWQgZm9yIHRoZSBlZGdlIGNhc2Ugc2NlbmFyaW8gd2hlcmUgdGFyZ2V0IHByb3BzIGNvbnRhaW4gdGhlIHNhbWVcclxuICAgICAgICAgICAgLy8gc3R5bGVzIGFzIGN1cnJlbnQgcHJvcHMsIGJ1dCB0aGUgY3VycmVudCBwcm9wcyBoYXZlIHNvbWUgYWRkaXRpb25hbFxyXG4gICAgICAgICAgICAvLyBwcm9wcy5cclxuICAgICAgICAgICAgaWYgKCFjYW5jZWxBbmltYXRpb24gJiYgcHJvcENvdW50ICE9PSBjdXJyZW50UHJvcHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBjYW5jZWxBbmltYXRpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDYW5jZWwgYW5pbWF0aW9uIChpZiByZXF1aXJlZCkuXHJcbiAgICAgICAgaWYgKGNhbmNlbEFuaW1hdGlvbikgYW5pbWF0aW9uLmNhbmNlbCgpO1xyXG5cclxuICAgICAgICAvLyBTdG9yZSBhbmltYXRpb24gY2FsbGJhY2suXHJcbiAgICAgICAgdGhpcy5fY2FsbGJhY2sgPSB0eXBlb2Ygb3B0cy5vbkZpbmlzaCA9PT0gJ2Z1bmN0aW9uJyA/IG9wdHMub25GaW5pc2ggOiBudWxsO1xyXG5cclxuICAgICAgICAvLyBJZiB3ZSBoYXZlIGEgcnVubmluZyBhbmltYXRpb24gdGhhdCBkb2VzIG5vdCBuZWVkIHRvIGJlIGNhbmNlbGxlZCwgbGV0J3NcclxuICAgICAgICAvLyBjYWxsIGl0IGEgZGF5IGhlcmUgYW5kIGxldCBpdCBydW4uXHJcbiAgICAgICAgaWYgKGFuaW1hdGlvbiAmJiAhY2FuY2VsQW5pbWF0aW9uKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIFN0b3JlIHRhcmdldCBwcm9wcyBhbmQgdmFsdWVzIHRvIGluc3RhbmNlLlxyXG4gICAgICAgIGN1cnJlbnRQcm9wcy5sZW5ndGggPSBjdXJyZW50VmFsdWVzLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgZm9yIChwcm9wTmFtZSBpbiBwcm9wc1RvKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRQcm9wcy5wdXNoKHByb3BOYW1lKTtcclxuICAgICAgICAgICAgY3VycmVudFZhbHVlcy5wdXNoKHByb3BzVG9bcHJvcE5hbWVdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNldCB1cCBrZXlmcmFtZXMuXHJcbiAgICAgICAgdmFyIGFuaW1LZXlmcmFtZXMgPSB0aGlzLl9rZXlmcmFtZXM7XHJcbiAgICAgICAgYW5pbUtleWZyYW1lc1swXSA9IHByb3BzRnJvbTtcclxuICAgICAgICBhbmltS2V5ZnJhbWVzWzFdID0gcHJvcHNUbztcclxuXHJcbiAgICAgICAgLy8gU2V0IHVwIG9wdGlvbnMuXHJcbiAgICAgICAgdmFyIGFuaW1PcHRpb25zID0gdGhpcy5fb3B0aW9ucztcclxuICAgICAgICBhbmltT3B0aW9ucy5kdXJhdGlvbiA9IG9wdHMuZHVyYXRpb24gfHwgMzAwO1xyXG4gICAgICAgIGFuaW1PcHRpb25zLmVhc2luZyA9IG9wdHMuZWFzaW5nIHx8ICdlYXNlJztcclxuXHJcbiAgICAgICAgLy8gU3RhcnQgdGhlIGFuaW1hdGlvblxyXG4gICAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5fZWxlbWVudDtcclxuICAgICAgICBhbmltYXRpb24gPSBlbGVtZW50LmFuaW1hdGUoYW5pbUtleWZyYW1lcywgYW5pbU9wdGlvbnMpO1xyXG4gICAgICAgIGFuaW1hdGlvbi5vbmZpbmlzaCA9IHRoaXMuX29uRmluaXNoO1xyXG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbiA9IGFuaW1hdGlvbjtcclxuXHJcbiAgICAgICAgLy8gU2V0IHRoZSBlbmQgc3R5bGVzLiBUaGlzIG1ha2VzIHN1cmUgdGhhdCB0aGUgZWxlbWVudCBzdGF5cyBhdCB0aGUgZW5kXHJcbiAgICAgICAgLy8gdmFsdWVzIGFmdGVyIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC5cclxuICAgICAgICBzZXRTdHlsZXMoZWxlbWVudCwgcHJvcHNUbyk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RvcCBpbnN0YW5jZSdzIGN1cnJlbnQgYW5pbWF0aW9uIGlmIHJ1bm5pbmcuXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEl0ZW1BbmltYXRlLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtzdHlsZXNdXHJcbiAgICAgKi9cclxuICAgIEl0ZW1BbmltYXRlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKHN0eWxlcykge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCB8fCAhdGhpcy5fYW5pbWF0aW9uKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5fZWxlbWVudDtcclxuICAgICAgICB2YXIgY3VycmVudFByb3BzID0gdGhpcy5fcHJvcHM7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZXMgPSB0aGlzLl92YWx1ZXM7XHJcbiAgICAgICAgdmFyIHByb3BOYW1lO1xyXG4gICAgICAgIHZhciBwcm9wVmFsdWU7XHJcbiAgICAgICAgdmFyIGk7XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0ZSAoaWYgbm90IHByb3ZpZGVkKSBhbmQgc2V0IHN0eWxlcy5cclxuICAgICAgICBpZiAoIXN0eWxlcykge1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY3VycmVudFByb3BzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9wTmFtZSA9IGN1cnJlbnRQcm9wc1tpXTtcclxuICAgICAgICAgICAgICAgIHByb3BWYWx1ZSA9IGdldFN0eWxlKGVsZW1lbnQsIGdldFN0eWxlTmFtZShwcm9wTmFtZSkpO1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5zdHlsZVtwcm9wTmFtZSA9PT0gJ3RyYW5zZm9ybScgPyB0cmFuc2Zvcm1Qcm9wIDogcHJvcE5hbWVdID0gcHJvcFZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2V0U3R5bGVzKGVsZW1lbnQsIHN0eWxlcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyAgQ2FuY2VsIGFuaW1hdGlvbi5cclxuICAgICAgICB0aGlzLl9hbmltYXRpb24uY2FuY2VsKCk7XHJcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uID0gdGhpcy5fY2FsbGJhY2sgPSBudWxsO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBjdXJyZW50IHByb3BzIGFuZCB2YWx1ZXMuXHJcbiAgICAgICAgY3VycmVudFByb3BzLmxlbmd0aCA9IGN1cnJlbnRWYWx1ZXMubGVuZ3RoID0gMDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayBpZiB0aGUgaXRlbSBpcyBiZWluZyBhbmltYXRlZCBjdXJyZW50bHkuXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEl0ZW1BbmltYXRlLnByb3RvdHlwZVxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgSXRlbUFuaW1hdGUucHJvdG90eXBlLmlzQW5pbWF0aW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuX2FuaW1hdGlvbjtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXN0cm95IHRoZSBpbnN0YW5jZSBhbmQgc3RvcCBjdXJyZW50IGFuaW1hdGlvbiBpZiBpdCBpcyBydW5uaW5nLlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtQW5pbWF0ZS5wcm90b3R5cGVcclxuICAgICAqL1xyXG4gICAgSXRlbUFuaW1hdGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IHRoaXMuX29wdGlvbnMgPSB0aGlzLl9rZXlmcmFtZXMgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2lzRGVzdHJveWVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQcml2YXRlIHByb3RvdHlwZSBtZXRob2RzXHJcbiAgICAgKiAqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFuaW1hdGlvbiBlbmQgaGFuZGxlci5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQG1lbWJlcm9mIEl0ZW1BbmltYXRlLnByb3RvdHlwZVxyXG4gICAgICovXHJcbiAgICBJdGVtQW5pbWF0ZS5wcm90b3R5cGUuX29uRmluaXNoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBjYWxsYmFjayA9IHRoaXMuX2NhbGxiYWNrO1xyXG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbiA9IHRoaXMuX2NhbGxiYWNrID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9wcm9wcy5sZW5ndGggPSB0aGlzLl92YWx1ZXMubGVuZ3RoID0gMDtcclxuICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgcmFmID0gKFxyXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcclxuICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XHJcbiAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG4gICAgICAgIHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxyXG4gICAgICAgIHJhZkZhbGxiYWNrXHJcbiAgICApLmJpbmQod2luZG93KTtcclxuXHJcbiAgICBmdW5jdGlvbiByYWZGYWxsYmFjayhjYikge1xyXG4gICAgICAgIHJldHVybiB3aW5kb3cuc2V0VGltZW91dChjYiwgMTYpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSB0aWNrZXIgc3lzdGVtIGZvciBoYW5kbGluZyBET00gcmVhZHMgYW5kIHdyaXRlcyBpbiBhbiBlZmZpY2llbnQgd2F5LlxyXG4gICAgICogQ29udGFpbnMgYSByZWFkIHF1ZXVlIGFuZCBhIHdyaXRlIHF1ZXVlIHRoYXQgYXJlIHByb2Nlc3NlZCBvbiB0aGUgbmV4dFxyXG4gICAgICogYW5pbWF0aW9uIGZyYW1lIHdoZW4gbmVlZGVkLlxyXG4gICAgICpcclxuICAgICAqIEBjbGFzc1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBUaWNrZXIoKSB7XHJcbiAgICAgICAgdGhpcy5fbmV4dFRpY2sgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLl9xdWV1ZSA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3JlYWRzID0ge307XHJcbiAgICAgICAgdGhpcy5fd3JpdGVzID0ge307XHJcblxyXG4gICAgICAgIHRoaXMuX2JhdGNoID0gW107XHJcbiAgICAgICAgdGhpcy5fYmF0Y2hSZWFkcyA9IHt9O1xyXG4gICAgICAgIHRoaXMuX2JhdGNoV3JpdGVzID0ge307XHJcblxyXG4gICAgICAgIHRoaXMuX2ZsdXNoID0gdGhpcy5fZmx1c2guYmluZCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBUaWNrZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChpZCwgcmVhZENhbGxiYWNrLCB3cml0ZUNhbGxiYWNrLCBpc0ltcG9ydGFudCkge1xyXG4gICAgICAgIC8vIEZpcnN0LCBsZXQncyBjaGVjayBpZiBhbiBpdGVtIGhhcyBiZWVuIGFkZGVkIHRvIHRoZSBxdWV1ZXMgd2l0aCB0aGUgc2FtZSBpZFxyXG4gICAgICAgIC8vIGFuZCBpZiBzbyAtPiByZW1vdmUgaXQuXHJcbiAgICAgICAgdmFyIGN1cnJlbnRJbmRleCA9IHRoaXMuX3F1ZXVlLmluZGV4T2YoaWQpO1xyXG4gICAgICAgIGlmIChjdXJyZW50SW5kZXggPiAtMSkgdGhpcy5fcXVldWVbY3VycmVudEluZGV4XSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgLy8gQWRkIGFsbCBpbXBvcnRhbnQgY2FsbGJhY2tzIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHF1ZXVlIGFuZCBvdGhlclxyXG4gICAgICAgIC8vIGNhbGxiYWNrcyB0byB0aGUgZW5kIG9mIHRoZSBxdWV1ZS5cclxuICAgICAgICBpc0ltcG9ydGFudCA/IHRoaXMuX3F1ZXVlLnVuc2hpZnQoaWQpIDogdGhpcy5fcXVldWUucHVzaChpZCk7XHJcblxyXG4gICAgICAgIC8vIFN0b3JlIGNhbGxiYWNrcy5cclxuICAgICAgICB0aGlzLl9yZWFkc1tpZF0gPSByZWFkQ2FsbGJhY2s7XHJcbiAgICAgICAgdGhpcy5fd3JpdGVzW2lkXSA9IHdyaXRlQ2FsbGJhY2s7XHJcblxyXG4gICAgICAgIC8vIEZpbmFsbHksIGxldCdzIGtpY2stc3RhcnQgdGhlIG5leHQgdGljayBpZiBpdCBpcyBub3QgcnVubmluZyB5ZXQuXHJcbiAgICAgICAgaWYgKCF0aGlzLl9uZXh0VGljaykgdGhpcy5fbmV4dFRpY2sgPSByYWYodGhpcy5fZmx1c2gpO1xyXG4gICAgfTtcclxuXHJcbiAgICBUaWNrZXIucHJvdG90eXBlLmNhbmNlbCA9IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgIHZhciBjdXJyZW50SW5kZXggPSB0aGlzLl9xdWV1ZS5pbmRleE9mKGlkKTtcclxuICAgICAgICBpZiAoY3VycmVudEluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5fcXVldWVbY3VycmVudEluZGV4XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgdGhpcy5fcmVhZHNbaWRdID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB0aGlzLl93cml0ZXNbaWRdID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgVGlja2VyLnByb3RvdHlwZS5fZmx1c2ggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHF1ZXVlID0gdGhpcy5fcXVldWU7XHJcbiAgICAgICAgdmFyIHJlYWRzID0gdGhpcy5fcmVhZHM7XHJcbiAgICAgICAgdmFyIHdyaXRlcyA9IHRoaXMuX3dyaXRlcztcclxuICAgICAgICB2YXIgYmF0Y2ggPSB0aGlzLl9iYXRjaDtcclxuICAgICAgICB2YXIgYmF0Y2hSZWFkcyA9IHRoaXMuX2JhdGNoUmVhZHM7XHJcbiAgICAgICAgdmFyIGJhdGNoV3JpdGVzID0gdGhpcy5fYmF0Y2hXcml0ZXM7XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHF1ZXVlLmxlbmd0aDtcclxuICAgICAgICB2YXIgaWQ7XHJcbiAgICAgICAgdmFyIGk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHRpY2tlci5cclxuICAgICAgICB0aGlzLl9uZXh0VGljayA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vIFNldHVwIHF1ZXVlcyBhbmQgY2FsbGJhY2sgcGxhY2Vob2xkZXJzLlxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZCA9IHF1ZXVlW2ldO1xyXG4gICAgICAgICAgICBpZiAoIWlkKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgIGJhdGNoLnB1c2goaWQpO1xyXG5cclxuICAgICAgICAgICAgYmF0Y2hSZWFkc1tpZF0gPSByZWFkc1tpZF07XHJcbiAgICAgICAgICAgIHJlYWRzW2lkXSA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgICAgIGJhdGNoV3JpdGVzW2lkXSA9IHdyaXRlc1tpZF07XHJcbiAgICAgICAgICAgIHdyaXRlc1tpZF0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZXNldCBxdWV1ZS5cclxuICAgICAgICBxdWV1ZS5sZW5ndGggPSAwO1xyXG5cclxuICAgICAgICAvLyBQcm9jZXNzIHJlYWQgY2FsbGJhY2tzLlxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZCA9IGJhdGNoW2ldO1xyXG4gICAgICAgICAgICBpZiAoYmF0Y2hSZWFkc1tpZF0pIHtcclxuICAgICAgICAgICAgICAgIGJhdGNoUmVhZHNbaWRdKCk7XHJcbiAgICAgICAgICAgICAgICBiYXRjaFJlYWRzW2lkXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUHJvY2VzcyB3cml0ZSBjYWxsYmFja3MuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlkID0gYmF0Y2hbaV07XHJcbiAgICAgICAgICAgIGlmIChiYXRjaFdyaXRlc1tpZF0pIHtcclxuICAgICAgICAgICAgICAgIGJhdGNoV3JpdGVzW2lkXSgpO1xyXG4gICAgICAgICAgICAgICAgYmF0Y2hXcml0ZXNbaWRdID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZXNldCBiYXRjaC5cclxuICAgICAgICBiYXRjaC5sZW5ndGggPSAwO1xyXG5cclxuICAgICAgICAvLyBSZXN0YXJ0IHRoZSB0aWNrZXIgaWYgbmVlZGVkLlxyXG4gICAgICAgIGlmICghdGhpcy5fbmV4dFRpY2sgJiYgcXVldWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX25leHRUaWNrID0gcmFmKHRoaXMuX2ZsdXNoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciB0aWNrZXIgPSBuZXcgVGlja2VyKCk7XHJcblxyXG4gICAgdmFyIGxheW91dFRpY2sgPSAnbGF5b3V0JztcclxuICAgIHZhciB2aXNpYmlsaXR5VGljayA9ICd2aXNpYmlsaXR5JztcclxuICAgIHZhciBtb3ZlVGljayA9ICdtb3ZlJztcclxuICAgIHZhciBzY3JvbGxUaWNrID0gJ3Njcm9sbCc7XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkTGF5b3V0VGljayhpdGVtSWQsIHJlYWRDYWxsYmFjaywgd3JpdGVDYWxsYmFjaykge1xyXG4gICAgICAgIHJldHVybiB0aWNrZXIuYWRkKGl0ZW1JZCArIGxheW91dFRpY2ssIHJlYWRDYWxsYmFjaywgd3JpdGVDYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2FuY2VsTGF5b3V0VGljayhpdGVtSWQpIHtcclxuICAgICAgICByZXR1cm4gdGlja2VyLmNhbmNlbChpdGVtSWQgKyBsYXlvdXRUaWNrKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhZGRWaXNpYmlsaXR5VGljayhpdGVtSWQsIHJlYWRDYWxsYmFjaywgd3JpdGVDYWxsYmFjaykge1xyXG4gICAgICAgIHJldHVybiB0aWNrZXIuYWRkKGl0ZW1JZCArIHZpc2liaWxpdHlUaWNrLCByZWFkQ2FsbGJhY2ssIHdyaXRlQ2FsbGJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNhbmNlbFZpc2liaWxpdHlUaWNrKGl0ZW1JZCkge1xyXG4gICAgICAgIHJldHVybiB0aWNrZXIuY2FuY2VsKGl0ZW1JZCArIHZpc2liaWxpdHlUaWNrKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhZGRNb3ZlVGljayhpdGVtSWQsIHJlYWRDYWxsYmFjaywgd3JpdGVDYWxsYmFjaykge1xyXG4gICAgICAgIHJldHVybiB0aWNrZXIuYWRkKGl0ZW1JZCArIG1vdmVUaWNrLCByZWFkQ2FsbGJhY2ssIHdyaXRlQ2FsbGJhY2ssIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNhbmNlbE1vdmVUaWNrKGl0ZW1JZCkge1xyXG4gICAgICAgIHJldHVybiB0aWNrZXIuY2FuY2VsKGl0ZW1JZCArIG1vdmVUaWNrKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhZGRTY3JvbGxUaWNrKGl0ZW1JZCwgcmVhZENhbGxiYWNrLCB3cml0ZUNhbGxiYWNrKSB7XHJcbiAgICAgICAgcmV0dXJuIHRpY2tlci5hZGQoaXRlbUlkICsgc2Nyb2xsVGljaywgcmVhZENhbGxiYWNrLCB3cml0ZUNhbGxiYWNrLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjYW5jZWxTY3JvbGxUaWNrKGl0ZW1JZCkge1xyXG4gICAgICAgIHJldHVybiB0aWNrZXIuY2FuY2VsKGl0ZW1JZCArIHNjcm9sbFRpY2spO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBwcm90byA9IEVsZW1lbnQucHJvdG90eXBlO1xyXG4gICAgdmFyIG1hdGNoZXMgPVxyXG4gICAgICAgIHByb3RvLm1hdGNoZXMgfHxcclxuICAgICAgICBwcm90by5tYXRjaGVzU2VsZWN0b3IgfHxcclxuICAgICAgICBwcm90by53ZWJraXRNYXRjaGVzU2VsZWN0b3IgfHxcclxuICAgICAgICBwcm90by5tb3pNYXRjaGVzU2VsZWN0b3IgfHxcclxuICAgICAgICBwcm90by5tc01hdGNoZXNTZWxlY3RvciB8fFxyXG4gICAgICAgIHByb3RvLm9NYXRjaGVzU2VsZWN0b3I7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayBpZiBlbGVtZW50IG1hdGNoZXMgYSBDU1Mgc2VsZWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHsqfSB2YWxcclxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBlbGVtZW50TWF0Y2hlcyhlbCwgc2VsZWN0b3IpIHtcclxuICAgICAgICByZXR1cm4gbWF0Y2hlcy5jYWxsKGVsLCBzZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgY2xhc3MgdG8gYW4gZWxlbWVudC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGFkZENsYXNzTW9kZXJuKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIGNsYXNzIHRvIGFuIGVsZW1lbnQgKGxlZ2FjeSB2ZXJzaW9uLCBmb3IgSUU5IHN1cHBvcnQpLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gYWRkQ2xhc3NMZWdhY3koZWxlbWVudCwgY2xhc3NOYW1lKSB7XHJcbiAgICAgICAgaWYgKCFlbGVtZW50TWF0Y2hlcyhlbGVtZW50LCAnLicgKyBjbGFzc05hbWUpKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzTmFtZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGFkZENsYXNzID0gKCdjbGFzc0xpc3QnIGluIEVsZW1lbnQucHJvdG90eXBlID8gYWRkQ2xhc3NNb2Rlcm4gOiBhZGRDbGFzc0xlZ2FjeSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBOb3JtYWxpemUgYXJyYXkgaW5kZXguIEJhc2ljYWxseSB0aGlzIGZ1bmN0aW9uIG1ha2VzIHN1cmUgdGhhdCB0aGUgcHJvdmlkZWRcclxuICAgICAqIGFycmF5IGluZGV4IGlzIHdpdGhpbiB0aGUgYm91bmRzIG9mIHRoZSBwcm92aWRlZCBhcnJheSBhbmQgYWxzbyB0cmFuc2Zvcm1zXHJcbiAgICAgKiBuZWdhdGl2ZSBpbmRleCB0byB0aGUgbWF0Y2hpbmcgcG9zaXRpdmUgaW5kZXguXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXlcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc01pZ3JhdGlvblxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBub3JtYWxpemVBcnJheUluZGV4KGFycmF5LCBpbmRleCwgaXNNaWdyYXRpb24pIHtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xyXG4gICAgICAgIHZhciBtYXhJbmRleCA9IE1hdGgubWF4KDAsIGlzTWlncmF0aW9uID8gbGVuZ3RoIDogbGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgcmV0dXJuIGluZGV4ID4gbWF4SW5kZXggPyBtYXhJbmRleCA6IGluZGV4IDwgMCA/IE1hdGgubWF4KG1heEluZGV4ICsgaW5kZXggKyAxLCAwKSA6IGluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTW92ZSBhcnJheSBpdGVtIHRvIGFub3RoZXIgaW5kZXguXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXlcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBmcm9tSW5kZXhcclxuICAgICAqICAgLSBJbmRleCAocG9zaXRpdmUgb3IgbmVnYXRpdmUpIG9mIHRoZSBpdGVtIHRoYXQgd2lsbCBiZSBtb3ZlZC5cclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB0b0luZGV4XHJcbiAgICAgKiAgIC0gSW5kZXggKHBvc2l0aXZlIG9yIG5lZ2F0aXZlKSB3aGVyZSB0aGUgaXRlbSBzaG91bGQgYmUgbW92ZWQgdG8uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGFycmF5TW92ZShhcnJheSwgZnJvbUluZGV4LCB0b0luZGV4KSB7XHJcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBhcnJheSBoYXMgdHdvIG9yIG1vcmUgaXRlbXMuXHJcbiAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCA8IDIpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gTm9ybWFsaXplIHRoZSBpbmRpY2VzLlxyXG4gICAgICAgIHZhciBmcm9tID0gbm9ybWFsaXplQXJyYXlJbmRleChhcnJheSwgZnJvbUluZGV4KTtcclxuICAgICAgICB2YXIgdG8gPSBub3JtYWxpemVBcnJheUluZGV4KGFycmF5LCB0b0luZGV4KTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHRhcmdldCBpdGVtIHRvIHRoZSBuZXcgcG9zaXRpb24uXHJcbiAgICAgICAgaWYgKGZyb20gIT09IHRvKSB7XHJcbiAgICAgICAgICAgIGFycmF5LnNwbGljZSh0bywgMCwgYXJyYXkuc3BsaWNlKGZyb20sIDEpWzBdKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTd2FwIGFycmF5IGl0ZW1zLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5XHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcclxuICAgICAqICAgLSBJbmRleCAocG9zaXRpdmUgb3IgbmVnYXRpdmUpIG9mIHRoZSBpdGVtIHRoYXQgd2lsbCBiZSBzd2FwcGVkLlxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHdpdGhJbmRleFxyXG4gICAgICogICAtIEluZGV4IChwb3NpdGl2ZSBvciBuZWdhdGl2ZSkgb2YgdGhlIG90aGVyIGl0ZW0gdGhhdCB3aWxsIGJlIHN3YXBwZWQuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGFycmF5U3dhcChhcnJheSwgaW5kZXgsIHdpdGhJbmRleCkge1xyXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgYXJyYXkgaGFzIHR3byBvciBtb3JlIGl0ZW1zLlxyXG4gICAgICAgIGlmIChhcnJheS5sZW5ndGggPCAyKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIE5vcm1hbGl6ZSB0aGUgaW5kaWNlcy5cclxuICAgICAgICB2YXIgaW5kZXhBID0gbm9ybWFsaXplQXJyYXlJbmRleChhcnJheSwgaW5kZXgpO1xyXG4gICAgICAgIHZhciBpbmRleEIgPSBub3JtYWxpemVBcnJheUluZGV4KGFycmF5LCB3aXRoSW5kZXgpO1xyXG4gICAgICAgIHZhciB0ZW1wO1xyXG5cclxuICAgICAgICAvLyBTd2FwIHRoZSBpdGVtcy5cclxuICAgICAgICBpZiAoaW5kZXhBICE9PSBpbmRleEIpIHtcclxuICAgICAgICAgICAgdGVtcCA9IGFycmF5W2luZGV4QV07XHJcbiAgICAgICAgICAgIGFycmF5W2luZGV4QV0gPSBhcnJheVtpbmRleEJdO1xyXG4gICAgICAgICAgICBhcnJheVtpbmRleEJdID0gdGVtcDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGFjdGlvbkNhbmNlbCA9ICdjYW5jZWwnO1xyXG4gICAgdmFyIGFjdGlvbkZpbmlzaCA9ICdmaW5pc2gnO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCBhcyBsb25nIGFzIGl0IGNvbnRpbnVlcyB0byBiZSBpbnZva2VkLCB3aWxsIG5vdFxyXG4gICAgICogYmUgdHJpZ2dlcmVkLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgaXQgc3RvcHMgYmVpbmcgY2FsbGVkIGZvclxyXG4gICAgICogTiBtaWxsaXNlY29uZHMuIFRoZSByZXR1cm5lZCBmdW5jdGlvbiBhY2NlcHRzIG9uZSBhcmd1bWVudCB3aGljaCwgd2hlblxyXG4gICAgICogYmVpbmcgXCJmaW5pc2hcIiwgY2FsbHMgdGhlIGRlYm91bmNlIGZ1bmN0aW9uIGltbWVkaWF0ZWx5IGlmIGl0IGlzIGN1cnJlbnRseVxyXG4gICAgICogd2FpdGluZyB0byBiZSBjYWxsZWQsIGFuZCB3aGVuIGJlaW5nIFwiY2FuY2VsXCIgY2FuY2VscyB0aGUgY3VycmVudGx5IHF1ZXVlZFxyXG4gICAgICogZnVuY3Rpb24gY2FsbC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHdhaXRcclxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZGVib3VuY2UoZm4sIHdhaXQpIHtcclxuICAgICAgICB2YXIgdGltZW91dDtcclxuXHJcbiAgICAgICAgaWYgKHdhaXQgPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoYWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGltZW91dCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dCA9IHdpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gYWN0aW9uRmluaXNoKSBmbigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChhY3Rpb24gIT09IGFjdGlvbkNhbmNlbCAmJiBhY3Rpb24gIT09IGFjdGlvbkZpbmlzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZuKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgd2FpdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGFjdGlvbikge1xyXG4gICAgICAgICAgICBpZiAoYWN0aW9uICE9PSBhY3Rpb25DYW5jZWwpIGZuKCk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiBlbGVtZW50IGlzIHRyYW5zZm9ybWVkLCBmYWxzZSBpZiBub3QuIEluIHByYWN0aWNlIHRoZVxyXG4gICAgICogZWxlbWVudCdzIGRpc3BsYXkgdmFsdWUgbXVzdCBiZSBhbnl0aGluZyBlbHNlIHRoYW4gXCJub25lXCIgb3IgXCJpbmxpbmVcIiBhc1xyXG4gICAgICogd2VsbCBhcyBoYXZlIGEgdmFsaWQgdHJhbnNmb3JtIHZhbHVlIGFwcGxpZWQgaW4gb3JkZXIgdG8gYmUgY291bnRlZCBhcyBhXHJcbiAgICAgKiB0cmFuc2Zvcm1lZCBlbGVtZW50LlxyXG4gICAgICpcclxuICAgICAqIEJvcnJvd2VkIGZyb20gTWV6ciAodjAuNi4xKTpcclxuICAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9uaWtsYXNyYW1vL21lenIvYmxvYi8wLjYuMS9tZXpyLmpzI0w2NjFcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaXNUcmFuc2Zvcm1lZChlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyIHRyYW5zZm9ybSA9IGdldFN0eWxlKGVsZW1lbnQsICd0cmFuc2Zvcm0nKTtcclxuICAgICAgICBpZiAoIXRyYW5zZm9ybSB8fCB0cmFuc2Zvcm0gPT09ICdub25lJykgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICB2YXIgZGlzcGxheSA9IGdldFN0eWxlKGVsZW1lbnQsICdkaXNwbGF5Jyk7XHJcbiAgICAgICAgaWYgKGRpc3BsYXkgPT09ICdpbmxpbmUnIHx8IGRpc3BsYXkgPT09ICdub25lJykgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYW4gYWJzb2x1dGUgcG9zaXRpb25lZCBlbGVtZW50J3MgY29udGFpbmluZyBibG9jaywgd2hpY2ggaXNcclxuICAgICAqIGNvbnNpZGVyZWQgdG8gYmUgdGhlIGNsb3Nlc3QgYW5jZXN0b3IgZWxlbWVudCB0aGF0IHRoZSB0YXJnZXQgZWxlbWVudCdzXHJcbiAgICAgKiBwb3NpdGlvbmluZyBpcyByZWxhdGl2ZSB0by4gRGlzY2xhaW1lcjogdGhpcyBvbmx5IHdvcmtzIGFzIGludGVuZGVkIGZvclxyXG4gICAgICogYWJzb2x1dGUgcG9zaXRpb25lZCBlbGVtZW50cy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtpbmNsdWRlU2VsZj1mYWxzZV1cclxuICAgICAqICAgLSBXaGVuIHRoaXMgaXMgc2V0IHRvIHRydWUgdGhlIGNvbnRhaW5pbmcgYmxvY2sgY2hlY2tpbmcgaXMgc3RhcnRlZCBmcm9tXHJcbiAgICAgKiAgICAgdGhlIHByb3ZpZGVkIGVsZW1lbnQuIE90aGVyd2lzZSB0aGUgY2hlY2tpbmcgaXMgc3RhcnRlZCBmcm9tIHRoZVxyXG4gICAgICogICAgIHByb3ZpZGVkIGVsZW1lbnQncyBwYXJlbnQgZWxlbWVudC5cclxuICAgICAqIEByZXR1cm5zIHsoRG9jdW1lbnR8RWxlbWVudCl9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGdldENvbnRhaW5pbmdCbG9jayhlbGVtZW50LCBpbmNsdWRlU2VsZikge1xyXG4gICAgICAgIC8vIEFzIGxvbmcgYXMgdGhlIGNvbnRhaW5pbmcgYmxvY2sgaXMgYW4gZWxlbWVudCwgc3RhdGljIGFuZCBub3RcclxuICAgICAgICAvLyB0cmFuc2Zvcm1lZCwgdHJ5IHRvIGdldCB0aGUgZWxlbWVudCdzIHBhcmVudCBlbGVtZW50IGFuZCBmYWxsYmFjayB0b1xyXG4gICAgICAgIC8vIGRvY3VtZW50LiBodHRwczovL2dpdGh1Yi5jb20vbmlrbGFzcmFtby9tZXpyL2Jsb2IvMC42LjEvbWV6ci5qcyNMMzM5XHJcbiAgICAgICAgdmFyIHJldCA9IChpbmNsdWRlU2VsZiA/IGVsZW1lbnQgOiBlbGVtZW50LnBhcmVudEVsZW1lbnQpIHx8IGRvY3VtZW50O1xyXG4gICAgICAgIHdoaWxlIChyZXQgJiYgcmV0ICE9PSBkb2N1bWVudCAmJiBnZXRTdHlsZShyZXQsICdwb3NpdGlvbicpID09PSAnc3RhdGljJyAmJiAhaXNUcmFuc2Zvcm1lZChyZXQpKSB7XHJcbiAgICAgICAgICAgIHJldCA9IHJldC5wYXJlbnRFbGVtZW50IHx8IGRvY3VtZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgY29tcHV0ZWQgdmFsdWUgb2YgYW4gZWxlbWVudCdzIHN0eWxlIHByb3BlcnR5IHRyYW5zZm9ybWVkIGludG9cclxuICAgICAqIGEgZmxvYXQgdmFsdWUuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHlsZVxyXG4gICAgICogQHJldHVybnMge051bWJlcn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2V0U3R5bGVBc0Zsb2F0KGVsLCBzdHlsZSkge1xyXG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGdldFN0eWxlKGVsLCBzdHlsZSkpIHx8IDA7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG9mZnNldEEgPSB7fTtcclxuICAgIHZhciBvZmZzZXRCID0ge307XHJcbiAgICB2YXIgb2Zmc2V0RGlmZiA9IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZWxlbWVudCdzIGRvY3VtZW50IG9mZnNldCwgd2hpY2ggaW4gcHJhY3RpY2UgbWVhbnMgdGhlIHZlcnRpY2FsXHJcbiAgICAgKiBhbmQgaG9yaXpvbnRhbCBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBlbGVtZW50J3Mgbm9ydGh3ZXN0IGNvcm5lciBhbmQgdGhlXHJcbiAgICAgKiBkb2N1bWVudCdzIG5vcnRod2VzdCBjb3JuZXIuIE5vdGUgdGhhdCB0aGlzIGZ1bmN0aW9uIGFsd2F5cyByZXR1cm5zIHRoZSBzYW1lXHJcbiAgICAgKiBvYmplY3Qgc28gYmUgc3VyZSB0byByZWFkIHRoZSBkYXRhIGZyb20gaXQgaW5zdGVhZCB1c2luZyBpdCBhcyBhIHJlZmVyZW5jZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0geyhEb2N1bWVudHxFbGVtZW50fFdpbmRvdyl9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb2Zmc2V0RGF0YV1cclxuICAgICAqICAgLSBPcHRpb25hbCBkYXRhIG9iamVjdCB3aGVyZSB0aGUgb2Zmc2V0IGRhdGEgd2lsbCBiZSBpbnNlcnRlZCB0by4gSWYgbm90XHJcbiAgICAgKiAgICAgcHJvdmlkZWQgYSBuZXcgb2JqZWN0IHdpbGwgYmUgY3JlYXRlZCBmb3IgdGhlIHJldHVybiBkYXRhLlxyXG4gICAgICogQHJldHVybnMge09iamVjdH1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2V0T2Zmc2V0KGVsZW1lbnQsIG9mZnNldERhdGEpIHtcclxuICAgICAgICB2YXIgcmV0ID0gb2Zmc2V0RGF0YSB8fCB7fTtcclxuICAgICAgICB2YXIgcmVjdDtcclxuXHJcbiAgICAgICAgLy8gU2V0IHVwIHJldHVybiBkYXRhLlxyXG4gICAgICAgIHJldC5sZWZ0ID0gMDtcclxuICAgICAgICByZXQudG9wID0gMDtcclxuXHJcbiAgICAgICAgLy8gRG9jdW1lbnQncyBvZmZzZXRzIGFyZSBhbHdheXMgMC5cclxuICAgICAgICBpZiAoZWxlbWVudCA9PT0gZG9jdW1lbnQpIHJldHVybiByZXQ7XHJcblxyXG4gICAgICAgIC8vIEFkZCB2aWV3cG9ydCBzY3JvbGwgbGVmdC90b3AgdG8gdGhlIHJlc3BlY3RpdmUgb2Zmc2V0cy5cclxuICAgICAgICByZXQubGVmdCA9IHdpbmRvdy5wYWdlWE9mZnNldCB8fCAwO1xyXG4gICAgICAgIHJldC50b3AgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgMDtcclxuXHJcbiAgICAgICAgLy8gV2luZG93J3Mgb2Zmc2V0cyBhcmUgdGhlIHZpZXdwb3J0IHNjcm9sbCBsZWZ0L3RvcCB2YWx1ZXMuXHJcbiAgICAgICAgaWYgKGVsZW1lbnQuc2VsZiA9PT0gd2luZG93LnNlbGYpIHJldHVybiByZXQ7XHJcblxyXG4gICAgICAgIC8vIEFkZCBlbGVtZW50J3MgY2xpZW50IHJlY3RzIHRvIHRoZSBvZmZzZXRzLlxyXG4gICAgICAgIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHJldC5sZWZ0ICs9IHJlY3QubGVmdDtcclxuICAgICAgICByZXQudG9wICs9IHJlY3QudG9wO1xyXG5cclxuICAgICAgICAvLyBFeGNsdWRlIGVsZW1lbnQncyBib3JkZXJzIGZyb20gdGhlIG9mZnNldC5cclxuICAgICAgICByZXQubGVmdCArPSBnZXRTdHlsZUFzRmxvYXQoZWxlbWVudCwgJ2JvcmRlci1sZWZ0LXdpZHRoJyk7XHJcbiAgICAgICAgcmV0LnRvcCArPSBnZXRTdHlsZUFzRmxvYXQoZWxlbWVudCwgJ2JvcmRlci10b3Atd2lkdGgnKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSB0aGUgb2Zmc2V0IGRpZmZlcmVuY2UgdHdvIGVsZW1lbnRzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1BXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtQlxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbY29tcGFyZUNvbnRhaW5pbmdCbG9ja3M9ZmFsc2VdXHJcbiAgICAgKiAgIC0gV2hlbiB0aGlzIGlzIHNldCB0byB0cnVlIHRoZSBjb250YWluaW5nIGJsb2NrcyBvZiB0aGUgcHJvdmlkZWQgZWxlbWVudHNcclxuICAgICAqICAgICB3aWxsIGJlIHVzZWQgZm9yIGNhbGN1bGF0aW5nIHRoZSBkaWZmZXJlbmNlLiBPdGhlcndpc2UgdGhlIHByb3ZpZGVkXHJcbiAgICAgKiAgICAgZWxlbWVudHMgd2lsbCBiZSBjb21wYXJlZCBkaXJlY3RseS5cclxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGdldE9mZnNldERpZmYoZWxlbUEsIGVsZW1CLCBjb21wYXJlQ29udGFpbmluZ0Jsb2Nrcykge1xyXG4gICAgICAgIG9mZnNldERpZmYubGVmdCA9IDA7XHJcbiAgICAgICAgb2Zmc2V0RGlmZi50b3AgPSAwO1xyXG5cclxuICAgICAgICAvLyBJZiBlbGVtZW50cyBhcmUgc2FtZSBsZXQncyByZXR1cm4gZWFybHkuXHJcbiAgICAgICAgaWYgKGVsZW1BID09PSBlbGVtQikgcmV0dXJuIG9mZnNldERpZmY7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgY29udGFpbmluZyBibG9ja3MgaWYgbmVjZXNzYXJ5LlxyXG4gICAgICAgIGlmIChjb21wYXJlQ29udGFpbmluZ0Jsb2Nrcykge1xyXG4gICAgICAgICAgICBlbGVtQSA9IGdldENvbnRhaW5pbmdCbG9jayhlbGVtQSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIGVsZW1CID0gZ2V0Q29udGFpbmluZ0Jsb2NrKGVsZW1CLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIGNvbnRhaW5pbmcgYmxvY2tzIGFyZSBpZGVudGljYWwsIGxldCdzIHJldHVybiBlYXJseS5cclxuICAgICAgICAgICAgaWYgKGVsZW1BID09PSBlbGVtQikgcmV0dXJuIG9mZnNldERpZmY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBGaW5hbGx5LCBsZXQncyBjYWxjdWxhdGUgdGhlIG9mZnNldCBkaWZmLlxyXG4gICAgICAgIGdldE9mZnNldChlbGVtQSwgb2Zmc2V0QSk7XHJcbiAgICAgICAgZ2V0T2Zmc2V0KGVsZW1CLCBvZmZzZXRCKTtcclxuICAgICAgICBvZmZzZXREaWZmLmxlZnQgPSBvZmZzZXRCLmxlZnQgLSBvZmZzZXRBLmxlZnQ7XHJcbiAgICAgICAgb2Zmc2V0RGlmZi50b3AgPSBvZmZzZXRCLnRvcCAtIG9mZnNldEEudG9wO1xyXG5cclxuICAgICAgICByZXR1cm4gb2Zmc2V0RGlmZjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdHJhbnNsYXRlRGF0YSA9IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZWxlbWVudCdzIGNvbXB1dGVkIHRyYW5zbGF0ZVggYW5kIHRyYW5zbGF0ZVkgdmFsdWVzIGFzIGEgZmxvYXRzLlxyXG4gICAgICogVGhlIHJldHVybmVkIG9iamVjdCBpcyBhbHdheXMgdGhlIHNhbWUgb2JqZWN0IGFuZCB1cGRhdGVkIGV2ZXJ5IHRpbWUgdGhpc1xyXG4gICAgICogZnVuY3Rpb24gaXMgY2FsbGVkLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGdldFRyYW5zbGF0ZShlbGVtZW50KSB7XHJcbiAgICAgICAgdHJhbnNsYXRlRGF0YS54ID0gMDtcclxuICAgICAgICB0cmFuc2xhdGVEYXRhLnkgPSAwO1xyXG5cclxuICAgICAgICB2YXIgdHJhbnNmb3JtID0gZ2V0U3R5bGUoZWxlbWVudCwgJ3RyYW5zZm9ybScpO1xyXG4gICAgICAgIGlmICghdHJhbnNmb3JtKSByZXR1cm4gdHJhbnNsYXRlRGF0YTtcclxuXHJcbiAgICAgICAgdmFyIG1hdHJpeERhdGEgPSB0cmFuc2Zvcm0ucmVwbGFjZSgnbWF0cml4KCcsICcnKS5zcGxpdCgnLCcpO1xyXG4gICAgICAgIHRyYW5zbGF0ZURhdGEueCA9IHBhcnNlRmxvYXQobWF0cml4RGF0YVs0XSkgfHwgMDtcclxuICAgICAgICB0cmFuc2xhdGVEYXRhLnkgPSBwYXJzZUZsb2F0KG1hdHJpeERhdGFbNV0pIHx8IDA7XHJcblxyXG4gICAgICAgIHJldHVybiB0cmFuc2xhdGVEYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhbnNmb3JtIHRyYW5zbGF0ZVggYW5kIHRyYW5zbGF0ZVkgdmFsdWUgaW50byBDU1MgdHJhbnNmb3JtIHN0eWxlXHJcbiAgICAgKiBwcm9wZXJ0eSdzIHZhbHVlLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geVxyXG4gICAgICogQHJldHVybnMge1N0cmluZ31cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2V0VHJhbnNsYXRlU3RyaW5nKHgsIHkpIHtcclxuICAgICAgICByZXR1cm4gJ3RyYW5zbGF0ZVgoJyArIHggKyAncHgpIHRyYW5zbGF0ZVkoJyArIHkgKyAncHgpJztcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdGVtcEFycmF5ID0gW107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnNlcnQgYW4gaXRlbSBvciBhbiBhcnJheSBvZiBpdGVtcyB0byBhcnJheSB0byBhIHNwZWNpZmllZCBpbmRleC4gTXV0YXRlc1xyXG4gICAgICogdGhlIGFycmF5LiBUaGUgaW5kZXggY2FuIGJlIG5lZ2F0aXZlIGluIHdoaWNoIGNhc2UgdGhlIGl0ZW1zIHdpbGwgYmUgYWRkZWRcclxuICAgICAqIHRvIHRoZSBlbmQgb2YgdGhlIGFycmF5LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5XHJcbiAgICAgKiBAcGFyYW0geyp9IGl0ZW1zXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW2luZGV4PS0xXVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBhcnJheUluc2VydChhcnJheSwgaXRlbXMsIGluZGV4KSB7XHJcbiAgICAgICAgdmFyIHN0YXJ0SW5kZXggPSB0eXBlb2YgaW5kZXggPT09ICdudW1iZXInID8gaW5kZXggOiAtMTtcclxuICAgICAgICBpZiAoc3RhcnRJbmRleCA8IDApIHN0YXJ0SW5kZXggPSBhcnJheS5sZW5ndGggLSBzdGFydEluZGV4ICsgMTtcclxuXHJcbiAgICAgICAgYXJyYXkuc3BsaWNlLmFwcGx5KGFycmF5LCB0ZW1wQXJyYXkuY29uY2F0KHN0YXJ0SW5kZXgsIDAsIGl0ZW1zKSk7XHJcbiAgICAgICAgdGVtcEFycmF5Lmxlbmd0aCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG9iamVjdFR5cGUgPSAnW29iamVjdCBPYmplY3RdJztcclxuICAgIHZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayBpZiBhIHZhbHVlIGlzIGEgcGxhaW4gb2JqZWN0LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7Kn0gdmFsXHJcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgJiYgdG9TdHJpbmcuY2FsbCh2YWwpID09PSBvYmplY3RUeXBlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlIGNsYXNzIGZyb20gYW4gZWxlbWVudC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJlbW92ZUNsYXNzTW9kZXJuKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlIGNsYXNzIGZyb20gYW4gZWxlbWVudCAobGVnYWN5IHZlcnNpb24sIGZvciBJRTkgc3VwcG9ydCkuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiByZW1vdmVDbGFzc0xlZ2FjeShlbGVtZW50LCBjbGFzc05hbWUpIHtcclxuICAgICAgICBpZiAoZWxlbWVudE1hdGNoZXMoZWxlbWVudCwgJy4nICsgY2xhc3NOYW1lKSkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9ICgnICcgKyBlbGVtZW50LmNsYXNzTmFtZSArICcgJykucmVwbGFjZSgnICcgKyBjbGFzc05hbWUgKyAnICcsICcgJykudHJpbSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgcmVtb3ZlQ2xhc3MgPSAoJ2NsYXNzTGlzdCcgaW4gRWxlbWVudC5wcm90b3R5cGUgPyByZW1vdmVDbGFzc01vZGVybiA6IHJlbW92ZUNsYXNzTGVnYWN5KTtcclxuXHJcbiAgICAvLyBUbyBwcm92aWRlIGNvbnNpc3RlbnRseSBjb3JyZWN0IGRyYWdnaW5nIGV4cGVyaWVuY2Ugd2UgbmVlZCB0byBrbm93IGlmXHJcbiAgICAvLyB0cmFuc2Zvcm1lZCBlbGVtZW50cyBsZWFrIGZpeGVkIGVsZW1lbnRzIG9yIG5vdC5cclxuICAgIHZhciBoYXNUcmFuc2Zvcm1MZWFrID0gY2hlY2tUcmFuc2Zvcm1MZWFrKCk7XHJcblxyXG4gICAgLy8gRHJhZyBzdGFydCBwcmVkaWNhdGUgc3RhdGVzLlxyXG4gICAgdmFyIHN0YXJ0UHJlZGljYXRlSW5hY3RpdmUgPSAwO1xyXG4gICAgdmFyIHN0YXJ0UHJlZGljYXRlUGVuZGluZyA9IDE7XHJcbiAgICB2YXIgc3RhcnRQcmVkaWNhdGVSZXNvbHZlZCA9IDI7XHJcbiAgICB2YXIgc3RhcnRQcmVkaWNhdGVSZWplY3RlZCA9IDM7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCaW5kIEhhbW1lciB0b3VjaCBpbnRlcmFjdGlvbiB0byBhbiBpdGVtLlxyXG4gICAgICpcclxuICAgICAqIEBjbGFzc1xyXG4gICAgICogQHBhcmFtIHtJdGVtfSBpdGVtXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIEl0ZW1EcmFnKGl0ZW0pIHtcclxuICAgICAgICBpZiAoIUhhbW1lcikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1snICsgbmFtZXNwYWNlICsgJ10gcmVxdWlyZWQgZGVwZW5kZW5jeSBIYW1tZXIgaXMgbm90IGRlZmluZWQuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgdmFsaWQgdHJhbnNmb3JtIGxlYWsgdGVzdCByZXN1bHQgeWV0LCBsZXQncyBydW4gdGhlXHJcbiAgICAgICAgLy8gdGVzdCBvbiBmaXJzdCBJdGVtRHJhZyBpbml0LiBUaGUgdGVzdCBuZWVkcyBib2R5IGVsZW1lbnQgdG8gYmUgcmVhZHkgYW5kXHJcbiAgICAgICAgLy8gaGVyZSB3ZSBjYW4gYmUgc3VyZSB0aGF0IGl0IGlzIHJlYWR5LlxyXG4gICAgICAgIGlmIChoYXNUcmFuc2Zvcm1MZWFrID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGhhc1RyYW5zZm9ybUxlYWsgPSBjaGVja1RyYW5zZm9ybUxlYWsoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBkcmFnID0gdGhpcztcclxuICAgICAgICB2YXIgZWxlbWVudCA9IGl0ZW0uX2VsZW1lbnQ7XHJcbiAgICAgICAgdmFyIGdyaWQgPSBpdGVtLmdldEdyaWQoKTtcclxuICAgICAgICB2YXIgc2V0dGluZ3MgPSBncmlkLl9zZXR0aW5ncztcclxuICAgICAgICB2YXIgaGFtbWVyO1xyXG5cclxuICAgICAgICAvLyBTdGFydCBwcmVkaWNhdGUgcHJpdmF0ZSBkYXRhLlxyXG4gICAgICAgIHZhciBzdGFydFByZWRpY2F0ZSA9XHJcbiAgICAgICAgICAgIHR5cGVvZiBzZXR0aW5ncy5kcmFnU3RhcnRQcmVkaWNhdGUgPT09ICdmdW5jdGlvbidcclxuICAgICAgICAgICAgICAgID8gc2V0dGluZ3MuZHJhZ1N0YXJ0UHJlZGljYXRlXHJcbiAgICAgICAgICAgICAgICA6IEl0ZW1EcmFnLmRlZmF1bHRTdGFydFByZWRpY2F0ZTtcclxuICAgICAgICB2YXIgc3RhcnRQcmVkaWNhdGVTdGF0ZSA9IHN0YXJ0UHJlZGljYXRlSW5hY3RpdmU7XHJcbiAgICAgICAgdmFyIHN0YXJ0UHJlZGljYXRlUmVzdWx0O1xyXG5cclxuICAgICAgICAvLyBQcm90ZWN0ZWQgZGF0YS5cclxuICAgICAgICB0aGlzLl9pdGVtID0gaXRlbTtcclxuICAgICAgICB0aGlzLl9ncmlkSWQgPSBncmlkLl9pZDtcclxuICAgICAgICB0aGlzLl9oYW1tZXIgPSBoYW1tZXIgPSBuZXcgSGFtbWVyLk1hbmFnZXIoZWxlbWVudCk7XHJcbiAgICAgICAgdGhpcy5faXNEZXN0cm95ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pc01pZ3JhdGluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBpdGVtJ3MgaW5pdGlhbCBkcmFnIGRhdGEuXHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKTtcclxuXHJcbiAgICAgICAgLy8gQmluZCBzb21lIG1ldGhvZHMgdGhhdCBuZWVkcyBiaW5kaW5nLlxyXG4gICAgICAgIHRoaXMuX29uU2Nyb2xsID0gdGhpcy5fb25TY3JvbGwuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9wcmVwYXJlTW92ZSA9IHRoaXMuX3ByZXBhcmVNb3ZlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fYXBwbHlNb3ZlID0gdGhpcy5fYXBwbHlNb3ZlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fcHJlcGFyZVNjcm9sbCA9IHRoaXMuX3ByZXBhcmVTY3JvbGwuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9hcHBseVNjcm9sbCA9IHRoaXMuX2FwcGx5U2Nyb2xsLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fY2hlY2tPdmVybGFwID0gdGhpcy5fY2hlY2tPdmVybGFwLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhIHByaXZhdGUgZHJhZyBzdGFydCByZXNvbHZlciB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlc29sdmUgdGhlIGRyYWdcclxuICAgICAgICAvLyBzdGFydCBwcmVkaWNhdGUgYXN5bmNocm9ub3VzbHkuXHJcbiAgICAgICAgdGhpcy5fZm9yY2VSZXNvbHZlU3RhcnRQcmVkaWNhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc0Rlc3Ryb3llZCAmJiBzdGFydFByZWRpY2F0ZVN0YXRlID09PSBzdGFydFByZWRpY2F0ZVBlbmRpbmcpIHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0UHJlZGljYXRlU3RhdGUgPSBzdGFydFByZWRpY2F0ZVJlc29sdmVkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25TdGFydChldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgZGVib3VuY2Ugb3ZlcmxhcCBjaGVja2VyIGZ1bmN0aW9uLlxyXG4gICAgICAgIHRoaXMuX2NoZWNrT3ZlcmxhcERlYm91bmNlID0gZGVib3VuY2UodGhpcy5fY2hlY2tPdmVybGFwLCBzZXR0aW5ncy5kcmFnU29ydEludGVydmFsKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGRyYWcgcmVjb2duaXplciB0byBoYW1tZXIuXHJcbiAgICAgICAgaGFtbWVyLmFkZChcclxuICAgICAgICAgICAgbmV3IEhhbW1lci5QYW4oe1xyXG4gICAgICAgICAgICAgICAgZXZlbnQ6ICdkcmFnJyxcclxuICAgICAgICAgICAgICAgIHBvaW50ZXJzOiAxLFxyXG4gICAgICAgICAgICAgICAgdGhyZXNob2xkOiAwLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBIYW1tZXIuRElSRUNUSU9OX0FMTFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBkcmFnIGluaXQgcmVjb2duaXplciB0byBoYW1tZXIuXHJcbiAgICAgICAgaGFtbWVyLmFkZChcclxuICAgICAgICAgICAgbmV3IEhhbW1lci5QcmVzcyh7XHJcbiAgICAgICAgICAgICAgICBldmVudDogJ2RyYWdpbml0JyxcclxuICAgICAgICAgICAgICAgIHBvaW50ZXJzOiAxLFxyXG4gICAgICAgICAgICAgICAgdGhyZXNob2xkOiAxMDAwLFxyXG4gICAgICAgICAgICAgICAgdGltZTogMFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIENvbmZpZ3VyZSB0aGUgaGFtbWVyIGluc3RhbmNlLlxyXG4gICAgICAgIGlmIChpc1BsYWluT2JqZWN0KHNldHRpbmdzLmRyYWdIYW1tZXJTZXR0aW5ncykpIHtcclxuICAgICAgICAgICAgaGFtbWVyLnNldChzZXR0aW5ncy5kcmFnSGFtbWVyU2V0dGluZ3MpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQmluZCBkcmFnIGV2ZW50cy5cclxuICAgICAgICBoYW1tZXJcclxuICAgICAgICAgICAgLm9uKCdkcmFnaW5pdCBkcmFnc3RhcnQgZHJhZ21vdmUnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gTGV0J3MgYWN0aXZhdGUgZHJhZyBzdGFydCBwcmVkaWNhdGUgc3RhdGUuXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnRQcmVkaWNhdGVTdGF0ZSA9PT0gc3RhcnRQcmVkaWNhdGVJbmFjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0UHJlZGljYXRlU3RhdGUgPSBzdGFydFByZWRpY2F0ZVBlbmRpbmc7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgcHJlZGljYXRlIGlzIHBlbmRpbmcgdHJ5IHRvIHJlc29sdmUgaXQuXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnRQcmVkaWNhdGVTdGF0ZSA9PT0gc3RhcnRQcmVkaWNhdGVQZW5kaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRQcmVkaWNhdGVSZXN1bHQgPSBzdGFydFByZWRpY2F0ZShkcmFnLl9pdGVtLCBlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnRQcmVkaWNhdGVSZXN1bHQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRQcmVkaWNhdGVTdGF0ZSA9IHN0YXJ0UHJlZGljYXRlUmVzb2x2ZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWcuX29uU3RhcnQoZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdGFydFByZWRpY2F0ZVJlc3VsdCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRQcmVkaWNhdGVTdGF0ZSA9IHN0YXJ0UHJlZGljYXRlUmVqZWN0ZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSBpZiBwcmVkaWNhdGUgaXMgcmVzb2x2ZWQgYW5kIGRyYWcgaXMgYWN0aXZlLCBtb3ZlIHRoZSBpdGVtLlxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhcnRQcmVkaWNhdGVTdGF0ZSA9PT0gc3RhcnRQcmVkaWNhdGVSZXNvbHZlZCAmJiBkcmFnLl9pc0FjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWcuX29uTW92ZShlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLm9uKCdkcmFnZW5kIGRyYWdjYW5jZWwgZHJhZ2luaXR1cCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgc3RhcnQgcHJlZGljYXRlIHdhcyByZXNvbHZlZCBkdXJpbmcgZHJhZy5cclxuICAgICAgICAgICAgICAgIHZhciBpc1Jlc29sdmVkID0gc3RhcnRQcmVkaWNhdGVTdGF0ZSA9PT0gc3RhcnRQcmVkaWNhdGVSZXNvbHZlZDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBEbyBmaW5hbCBwcmVkaWNhdGUgY2hlY2sgdG8gYWxsb3cgdXNlciB0byB1bmJpbmQgc3R1ZmYgZm9yIHRoZSBjdXJyZW50XHJcbiAgICAgICAgICAgICAgICAvLyBkcmFnIHByb2NlZHVyZSB3aXRoaW4gdGhlIHByZWRpY2F0ZSBjYWxsYmFjay4gVGhlIHJldHVybiB2YWx1ZSBvZiB0aGlzXHJcbiAgICAgICAgICAgICAgICAvLyBjaGVjayB3aWxsIGhhdmUgbm8gZWZmZWN0IHRvIHRoZSBzdGF0ZSBvZiB0aGUgcHJlZGljYXRlLlxyXG4gICAgICAgICAgICAgICAgc3RhcnRQcmVkaWNhdGUoZHJhZy5faXRlbSwgZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUmVzZXQgc3RhcnQgcHJlZGljYXRlIHN0YXRlLlxyXG4gICAgICAgICAgICAgICAgc3RhcnRQcmVkaWNhdGVTdGF0ZSA9IHN0YXJ0UHJlZGljYXRlSW5hY3RpdmU7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgcHJlZGljYXRlIGlzIHJlc29sdmVkIGFuZCBkcmFnZ2luZyBpcyBhY3RpdmUsIGNhbGwgdGhlIGVuZCBoYW5kbGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGlzUmVzb2x2ZWQgJiYgZHJhZy5faXNBY3RpdmUpIGRyYWcuX29uRW5kKGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUHJldmVudCBuYXRpdmUgbGluay9pbWFnZSBkcmFnZ2luZyBmb3IgdGhlIGl0ZW0gYW5kIGl0J3MgYW5jZXN0b3JzLlxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgcHJldmVudERlZmF1bHQsIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFB1YmxpYyBzdGF0aWMgbWV0aG9kc1xyXG4gICAgICogKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlZmF1bHQgZHJhZyBzdGFydCBwcmVkaWNhdGUgaGFuZGxlciB0aGF0IGhhbmRsZXMgYW5jaG9yIGVsZW1lbnRzXHJcbiAgICAgKiBncmFjZWZ1bGx5LiBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoaXMgZnVuY3Rpb24gZGVmaW5lcyBpZiB0aGUgZHJhZyBpc1xyXG4gICAgICogc3RhcnRlZCwgcmVqZWN0ZWQgb3IgcGVuZGluZy4gV2hlbiB0cnVlIGlzIHJldHVybmVkIHRoZSBkcmFnZ2luZyBpcyBzdGFydGVkXHJcbiAgICAgKiBhbmQgd2hlbiBmYWxzZSBpcyByZXR1cm5lZCB0aGUgZHJhZ2dpbmcgaXMgcmVqZWN0ZWQuIElmIG5vdGhpbmcgaXMgcmV0dXJuZWRcclxuICAgICAqIHRoZSBwcmVkaWNhdGUgd2lsbCBiZSBjYWxsZWQgYWdhaW4gb24gdGhlIG5leHQgZHJhZyBtb3ZlbWVudC5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbURyYWdcclxuICAgICAqIEBwYXJhbSB7SXRlbX0gaXRlbVxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiAgIC0gQW4gb3B0aW9uYWwgb3B0aW9ucyBvYmplY3Qgd2hpY2ggY2FuIGJlIHVzZWQgdG8gcGFzcyB0aGUgcHJlZGljYXRlXHJcbiAgICAgKiAgICAgaXQncyBvcHRpb25zIG1hbnVhbGx5LiBCeSBkZWZhdWx0IHRoZSBwcmVkaWNhdGUgcmV0cmlldmVzIHRoZSBvcHRpb25zXHJcbiAgICAgKiAgICAgZnJvbSB0aGUgZ3JpZCdzIHNldHRpbmdzLlxyXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIEl0ZW1EcmFnLmRlZmF1bHRTdGFydFByZWRpY2F0ZSA9IGZ1bmN0aW9uIChpdGVtLCBldmVudCwgb3B0aW9ucykge1xyXG4gICAgICAgIHZhciBkcmFnID0gaXRlbS5fZHJhZztcclxuICAgICAgICB2YXIgcHJlZGljYXRlID0gZHJhZy5fc3RhcnRQcmVkaWNhdGVEYXRhIHx8IGRyYWcuX3NldHVwU3RhcnRQcmVkaWNhdGUob3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIEZpbmFsIGV2ZW50IGxvZ2ljLiBBdCB0aGlzIHN0YWdlIHJldHVybiB2YWx1ZSBkb2VzIG5vdCBtYXR0ZXIgYW55bW9yZSxcclxuICAgICAgICAvLyB0aGUgcHJlZGljYXRlIGlzIGVpdGhlciByZXNvbHZlZCBvciBpdCdzIG5vdCBhbmQgdGhlcmUncyBub3RoaW5nIHRvIGRvXHJcbiAgICAgICAgLy8gYWJvdXQgaXQuIEhlcmUgd2UganVzdCByZXNldCBkYXRhIGFuZCBpZiB0aGUgaXRlbSBlbGVtZW50IGlzIGEgbGlua1xyXG4gICAgICAgIC8vIHdlIGZvbGxvdyBpdCAoaWYgdGhlcmUgaGFzIG9ubHkgYmVlbiBzbGlnaHQgbW92ZW1lbnQpLlxyXG4gICAgICAgIGlmIChldmVudC5pc0ZpbmFsKSB7XHJcbiAgICAgICAgICAgIGRyYWcuX2ZpbmlzaFN0YXJ0UHJlZGljYXRlKGV2ZW50KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRmluZCBhbmQgc3RvcmUgdGhlIGhhbmRsZSBlbGVtZW50IHNvIHdlIGNhbiBjaGVjayBsYXRlciBvbiBpZiB0aGVcclxuICAgICAgICAvLyBjdXJzb3IgaXMgd2l0aGluIHRoZSBoYW5kbGUuIElmIHdlIGhhdmUgYSBoYW5kbGUgc2VsZWN0b3IgbGV0J3MgZmluZFxyXG4gICAgICAgIC8vIHRoZSBjb3JyZXNwb25kaW5nIGVsZW1lbnQuIE90aGVyd2lzZSBsZXQncyB1c2UgdGhlIGl0ZW0gZWxlbWVudCBhcyB0aGVcclxuICAgICAgICAvLyBoYW5kbGUuXHJcbiAgICAgICAgaWYgKCFwcmVkaWNhdGUuaGFuZGxlRWxlbWVudCkge1xyXG4gICAgICAgICAgICBwcmVkaWNhdGUuaGFuZGxlRWxlbWVudCA9IGRyYWcuX2dldFN0YXJ0UHJlZGljYXRlSGFuZGxlKGV2ZW50KTtcclxuICAgICAgICAgICAgaWYgKCFwcmVkaWNhdGUuaGFuZGxlRWxlbWVudCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgZGVsYXkgaXMgZGVmaW5lZCBsZXQncyBrZWVwIHRyYWNrIG9mIHRoZSBsYXRlc3QgZXZlbnQgYW5kIGluaXRpYXRlXHJcbiAgICAgICAgLy8gZGVsYXkgaWYgaXQgaGFzIG5vdCBiZWVuIGRvbmUgeWV0LlxyXG4gICAgICAgIGlmIChwcmVkaWNhdGUuZGVsYXkpIHtcclxuICAgICAgICAgICAgcHJlZGljYXRlLmV2ZW50ID0gZXZlbnQ7XHJcbiAgICAgICAgICAgIGlmICghcHJlZGljYXRlLmRlbGF5VGltZXIpIHtcclxuICAgICAgICAgICAgICAgIHByZWRpY2F0ZS5kZWxheVRpbWVyID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWRpY2F0ZS5kZWxheSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWcuX3Jlc29sdmVTdGFydFByZWRpY2F0ZShwcmVkaWNhdGUuZXZlbnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWcuX2ZvcmNlUmVzb2x2ZVN0YXJ0UHJlZGljYXRlKHByZWRpY2F0ZS5ldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWcuX3Jlc2V0U3RhcnRQcmVkaWNhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCBwcmVkaWNhdGUuZGVsYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZHJhZy5fcmVzb2x2ZVN0YXJ0UHJlZGljYXRlKGV2ZW50KTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZhdWx0IGRyYWcgc29ydCBwcmVkaWNhdGUuXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEl0ZW1EcmFnXHJcbiAgICAgKiBAcGFyYW0ge0l0ZW19IGl0ZW1cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy50aHJlc2hvbGQ9NTBdXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuYWN0aW9uPSdtb3ZlJ11cclxuICAgICAqIEByZXR1cm5zIHsoQm9vbGVhbnxEcmFnU29ydENvbW1hbmQpfVxyXG4gICAgICogICAtIFJldHVybnMgZmFsc2UgaWYgbm8gdmFsaWQgaW5kZXggd2FzIGZvdW5kLiBPdGhlcndpc2UgcmV0dXJucyBkcmFnIHNvcnRcclxuICAgICAqICAgICBjb21tYW5kLlxyXG4gICAgICovXHJcbiAgICBJdGVtRHJhZy5kZWZhdWx0U29ydFByZWRpY2F0ZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1SZWN0ID0ge307XHJcbiAgICAgICAgdmFyIHRhcmdldFJlY3QgPSB7fTtcclxuICAgICAgICB2YXIgcmV0dXJuRGF0YSA9IHt9O1xyXG4gICAgICAgIHZhciByb290R3JpZEFycmF5ID0gW107XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFRhcmdldEdyaWQoaXRlbSwgcm9vdEdyaWQsIHRocmVzaG9sZCkge1xyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gbnVsbDtcclxuICAgICAgICAgICAgdmFyIGRyYWdTb3J0ID0gcm9vdEdyaWQuX3NldHRpbmdzLmRyYWdTb3J0O1xyXG4gICAgICAgICAgICB2YXIgYmVzdFNjb3JlID0gLTE7XHJcbiAgICAgICAgICAgIHZhciBncmlkU2NvcmU7XHJcbiAgICAgICAgICAgIHZhciBncmlkcztcclxuICAgICAgICAgICAgdmFyIGdyaWQ7XHJcbiAgICAgICAgICAgIHZhciBpO1xyXG5cclxuICAgICAgICAgICAgLy8gR2V0IHBvdGVudGlhbCB0YXJnZXQgZ3JpZHMuXHJcbiAgICAgICAgICAgIGlmIChkcmFnU29ydCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgcm9vdEdyaWRBcnJheVswXSA9IHJvb3RHcmlkO1xyXG4gICAgICAgICAgICAgICAgZ3JpZHMgPSByb290R3JpZEFycmF5O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZ3JpZHMgPSBkcmFnU29ydC5jYWxsKHJvb3RHcmlkLCBpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmV0dXJuIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGFyZSBubyBncmlkcy5cclxuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGdyaWRzKSkgcmV0dXJuIHRhcmdldDtcclxuXHJcbiAgICAgICAgICAgIC8vIExvb3AgdGhyb3VnaCB0aGUgZ3JpZHMgYW5kIGdldCB0aGUgYmVzdCBtYXRjaC5cclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGdyaWRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBncmlkID0gZ3JpZHNbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRmlsdGVyIG91dCBhbGwgZGVzdHJveWVkIGdyaWRzLlxyXG4gICAgICAgICAgICAgICAgaWYgKGdyaWQuX2lzRGVzdHJveWVkKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBXZSBuZWVkIHRvIHVwZGF0ZSB0aGUgZ3JpZCdzIG9mZnNldHMgYW5kIGRpbWVuc2lvbnMgc2luY2UgdGhleSBtaWdodFxyXG4gICAgICAgICAgICAgICAgLy8gaGF2ZSBjaGFuZ2VkIChlLmcgZHVyaW5nIHNjcm9sbGluZykuXHJcbiAgICAgICAgICAgICAgICBncmlkLl91cGRhdGVCb3VuZGluZ1JlY3QoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBob3cgbXVjaCBkcmFnZ2VkIGVsZW1lbnQgb3ZlcmxhcHMgdGhlIGNvbnRhaW5lciBlbGVtZW50LlxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0UmVjdC53aWR0aCA9IGdyaWQuX3dpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0UmVjdC5oZWlnaHQgPSBncmlkLl9oZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRSZWN0LmxlZnQgPSBncmlkLl9sZWZ0O1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0UmVjdC50b3AgPSBncmlkLl90b3A7XHJcbiAgICAgICAgICAgICAgICBncmlkU2NvcmUgPSBnZXRSZWN0T3ZlcmxhcFNjb3JlKGl0ZW1SZWN0LCB0YXJnZXRSZWN0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGdyaWQgaXMgdGhlIGJlc3QgbWF0Y2ggc28gZmFyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGdyaWRTY29yZSA+IHRocmVzaG9sZCAmJiBncmlkU2NvcmUgPiBiZXN0U2NvcmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0U2NvcmUgPSBncmlkU2NvcmU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gZ3JpZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWx3YXlzIHJlc2V0IHJvb3QgZ3JpZCBhcnJheS5cclxuICAgICAgICAgICAgcm9vdEdyaWRBcnJheS5sZW5ndGggPSAwO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoaXRlbSwgb3B0aW9ucykge1xyXG4gICAgICAgICAgICB2YXIgZHJhZyA9IGl0ZW0uX2RyYWc7XHJcbiAgICAgICAgICAgIHZhciByb290R3JpZCA9IGRyYWcuX2dldEdyaWQoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEdldCBkcmFnIHNvcnQgcHJlZGljYXRlIHNldHRpbmdzLlxyXG4gICAgICAgICAgICB2YXIgc29ydFRocmVzaG9sZCA9IG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMudGhyZXNob2xkID09PSAnbnVtYmVyJyA/IG9wdGlvbnMudGhyZXNob2xkIDogNTA7XHJcbiAgICAgICAgICAgIHZhciBzb3J0QWN0aW9uID0gb3B0aW9ucyAmJiBvcHRpb25zLmFjdGlvbiA9PT0gJ3N3YXAnID8gJ3N3YXAnIDogJ21vdmUnO1xyXG5cclxuICAgICAgICAgICAgLy8gUG9wdWxhdGUgaXRlbSByZWN0IGRhdGEuXHJcbiAgICAgICAgICAgIGl0ZW1SZWN0LndpZHRoID0gaXRlbS5fd2lkdGg7XHJcbiAgICAgICAgICAgIGl0ZW1SZWN0LmhlaWdodCA9IGl0ZW0uX2hlaWdodDtcclxuICAgICAgICAgICAgaXRlbVJlY3QubGVmdCA9IGRyYWcuX2VsZW1lbnRDbGllbnRYO1xyXG4gICAgICAgICAgICBpdGVtUmVjdC50b3AgPSBkcmFnLl9lbGVtZW50Q2xpZW50WTtcclxuXHJcbiAgICAgICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgdGFyZ2V0IGdyaWQuXHJcbiAgICAgICAgICAgIHZhciBncmlkID0gZ2V0VGFyZ2V0R3JpZChpdGVtLCByb290R3JpZCwgc29ydFRocmVzaG9sZCk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXR1cm4gZWFybHkgaWYgd2UgZm91bmQgbm8gZ3JpZCBjb250YWluZXIgZWxlbWVudCB0aGF0IG92ZXJsYXBzIHRoZVxyXG4gICAgICAgICAgICAvLyBkcmFnZ2VkIGl0ZW0gZW5vdWdoLlxyXG4gICAgICAgICAgICBpZiAoIWdyaWQpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHZhciBncmlkT2Zmc2V0TGVmdCA9IDA7XHJcbiAgICAgICAgICAgIHZhciBncmlkT2Zmc2V0VG9wID0gMDtcclxuICAgICAgICAgICAgdmFyIG1hdGNoU2NvcmUgPSAtMTtcclxuICAgICAgICAgICAgdmFyIG1hdGNoSW5kZXg7XHJcbiAgICAgICAgICAgIHZhciBoYXNWYWxpZFRhcmdldHM7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQ7XHJcbiAgICAgICAgICAgIHZhciBzY29yZTtcclxuICAgICAgICAgICAgdmFyIGk7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBpdGVtIGlzIG1vdmVkIHdpdGhpbiBpdCdzIG9yaWdpbmF0aW5nIGdyaWQgYWRqdXN0IGl0ZW0ncyBsZWZ0IGFuZFxyXG4gICAgICAgICAgICAvLyB0b3AgcHJvcHMuIE90aGVyd2lzZSBpZiBpdGVtIGlzIG1vdmVkIHRvL3dpdGhpbiBhbm90aGVyIGdyaWQgZ2V0IHRoZVxyXG4gICAgICAgICAgICAvLyBjb250YWluZXIgZWxlbWVudCdzIG9mZnNldCAoZnJvbSB0aGUgZWxlbWVudCdzIGNvbnRlbnQgZWRnZSkuXHJcbiAgICAgICAgICAgIGlmIChncmlkID09PSByb290R3JpZCkge1xyXG4gICAgICAgICAgICAgICAgaXRlbVJlY3QubGVmdCA9IGRyYWcuX2dyaWRYICsgaXRlbS5fbWFyZ2luTGVmdDtcclxuICAgICAgICAgICAgICAgIGl0ZW1SZWN0LnRvcCA9IGRyYWcuX2dyaWRZICsgaXRlbS5fbWFyZ2luVG9wO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZ3JpZC5fdXBkYXRlQm9yZGVycygxLCAwLCAxLCAwKTtcclxuICAgICAgICAgICAgICAgIGdyaWRPZmZzZXRMZWZ0ID0gZ3JpZC5fbGVmdCArIGdyaWQuX2JvcmRlckxlZnQ7XHJcbiAgICAgICAgICAgICAgICBncmlkT2Zmc2V0VG9wID0gZ3JpZC5fdG9wICsgZ3JpZC5fYm9yZGVyVG9wO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBMb29wIHRocm91Z2ggdGhlIHRhcmdldCBncmlkIGl0ZW1zIGFuZCB0cnkgdG8gZmluZCB0aGUgYmVzdCBtYXRjaC5cclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGdyaWQuX2l0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBncmlkLl9pdGVtc1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgdGFyZ2V0IGl0ZW0gaXMgbm90IGFjdGl2ZSBvciB0aGUgdGFyZ2V0IGl0ZW0gaXMgdGhlIGRyYWdnZWRcclxuICAgICAgICAgICAgICAgIC8vIGl0ZW0gbGV0J3Mgc2tpcCB0byB0aGUgbmV4dCBpdGVtLlxyXG4gICAgICAgICAgICAgICAgaWYgKCF0YXJnZXQuX2lzQWN0aXZlIHx8IHRhcmdldCA9PT0gaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIE1hcmsgdGhlIGdyaWQgYXMgaGF2aW5nIHZhbGlkIHRhcmdldCBpdGVtcy5cclxuICAgICAgICAgICAgICAgIGhhc1ZhbGlkVGFyZ2V0cyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSB0YXJnZXQncyBvdmVybGFwIHNjb3JlIHdpdGggdGhlIGRyYWdnZWQgaXRlbS5cclxuICAgICAgICAgICAgICAgIHRhcmdldFJlY3Qud2lkdGggPSB0YXJnZXQuX3dpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0UmVjdC5oZWlnaHQgPSB0YXJnZXQuX2hlaWdodDtcclxuICAgICAgICAgICAgICAgIHRhcmdldFJlY3QubGVmdCA9IHRhcmdldC5fbGVmdCArIHRhcmdldC5fbWFyZ2luTGVmdCArIGdyaWRPZmZzZXRMZWZ0O1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0UmVjdC50b3AgPSB0YXJnZXQuX3RvcCArIHRhcmdldC5fbWFyZ2luVG9wICsgZ3JpZE9mZnNldFRvcDtcclxuICAgICAgICAgICAgICAgIHNjb3JlID0gZ2V0UmVjdE92ZXJsYXBTY29yZShpdGVtUmVjdCwgdGFyZ2V0UmVjdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGJlc3QgbWF0Y2ggaW5kZXggYW5kIHNjb3JlIGlmIHRoZSB0YXJnZXQncyBvdmVybGFwIHNjb3JlIHdpdGhcclxuICAgICAgICAgICAgICAgIC8vIHRoZSBkcmFnZ2VkIGl0ZW0gaXMgaGlnaGVyIHRoYW4gdGhlIGN1cnJlbnQgYmVzdCBtYXRjaCBzY29yZS5cclxuICAgICAgICAgICAgICAgIGlmIChzY29yZSA+IG1hdGNoU2NvcmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXRjaEluZGV4ID0gaTtcclxuICAgICAgICAgICAgICAgICAgICBtYXRjaFNjb3JlID0gc2NvcmU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIHZhbGlkIG1hdGNoIGFuZCB0aGUgaXRlbSBpcyBiZWluZyBtb3ZlZCBpbnRvIGFub3RoZXJcclxuICAgICAgICAgICAgLy8gZ3JpZC5cclxuICAgICAgICAgICAgaWYgKG1hdGNoU2NvcmUgPCBzb3J0VGhyZXNob2xkICYmIGl0ZW0uZ2V0R3JpZCgpICE9PSBncmlkKSB7XHJcbiAgICAgICAgICAgICAgICBtYXRjaEluZGV4ID0gaGFzVmFsaWRUYXJnZXRzID8gLTEgOiAwO1xyXG4gICAgICAgICAgICAgICAgbWF0Y2hTY29yZSA9IEluZmluaXR5O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgYmVzdCBtYXRjaCBvdmVybGFwcyBlbm91Z2ggdG8ganVzdGlmeSBhIHBsYWNlbWVudCBzd2l0Y2guXHJcbiAgICAgICAgICAgIGlmIChtYXRjaFNjb3JlID49IHNvcnRUaHJlc2hvbGQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybkRhdGEuZ3JpZCA9IGdyaWQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm5EYXRhLmluZGV4ID0gbWF0Y2hJbmRleDtcclxuICAgICAgICAgICAgICAgIHJldHVybkRhdGEuYWN0aW9uID0gc29ydEFjdGlvbjtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXR1cm5EYXRhO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfTtcclxuICAgIH0pKCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQdWJsaWMgcHJvdG90eXBlIG1ldGhvZHNcclxuICAgICAqICoqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBYm9ydCBkcmFnZ2luZyBhbmQgcmVzZXQgZHJhZyBkYXRhLlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtRHJhZy5wcm90b3R5cGVcclxuICAgICAqIEByZXR1cm5zIHtJdGVtRHJhZ31cclxuICAgICAqL1xyXG4gICAgSXRlbURyYWcucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLl9pdGVtO1xyXG4gICAgICAgIHZhciBlbGVtZW50ID0gaXRlbS5fZWxlbWVudDtcclxuICAgICAgICB2YXIgZ3JpZCA9IHRoaXMuX2dldEdyaWQoKTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc0FjdGl2ZSkgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBpdGVtIGlzIGJlaW5nIGRyb3BwZWQgaW50byBhbm90aGVyIGdyaWQsIGZpbmlzaCBpdCB1cCBhbmQgcmV0dXJuXHJcbiAgICAgICAgLy8gaW1tZWRpYXRlbHkuXHJcbiAgICAgICAgaWYgKHRoaXMuX2lzTWlncmF0aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbmlzaE1pZ3JhdGlvbigpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENhbmNlbCBxdWV1ZWQgbW92ZSBhbmQgc2Nyb2xsIHRpY2tzLlxyXG4gICAgICAgIGNhbmNlbE1vdmVUaWNrKGl0ZW0uX2lkKTtcclxuICAgICAgICBjYW5jZWxTY3JvbGxUaWNrKGl0ZW0uX2lkKTtcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHNjcm9sbCBsaXN0ZW5lcnMuXHJcbiAgICAgICAgdGhpcy5fdW5iaW5kU2Nyb2xsTGlzdGVuZXJzKCk7XHJcblxyXG4gICAgICAgIC8vIENhbmNlbCBvdmVybGFwIGNoZWNrLlxyXG4gICAgICAgIHRoaXMuX2NoZWNrT3ZlcmxhcERlYm91bmNlKCdjYW5jZWwnKTtcclxuXHJcbiAgICAgICAgLy8gQXBwZW5kIGl0ZW0gZWxlbWVudCB0byB0aGUgY29udGFpbmVyIGlmIGl0J3Mgbm90IGl0J3MgY2hpbGQuIEFsc28gbWFrZVxyXG4gICAgICAgIC8vIHN1cmUgdGhlIHRyYW5zbGF0ZSB2YWx1ZXMgYXJlIGFkanVzdGVkIHRvIGFjY291bnQgZm9yIHRoZSBET00gc2hpZnQuXHJcbiAgICAgICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZSAhPT0gZ3JpZC5fZWxlbWVudCkge1xyXG4gICAgICAgICAgICBncmlkLl9lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlW3RyYW5zZm9ybVByb3BdID0gZ2V0VHJhbnNsYXRlU3RyaW5nKHRoaXMuX2dyaWRYLCB0aGlzLl9ncmlkWSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgZHJhZ2dpbmcgY2xhc3MuXHJcbiAgICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgZ3JpZC5fc2V0dGluZ3MuaXRlbURyYWdnaW5nQ2xhc3MpO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBkcmFnIGRhdGEuXHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVzdHJveSBpbnN0YW5jZS5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbURyYWcucHJvdG90eXBlXHJcbiAgICAgKiBAcmV0dXJucyB7SXRlbURyYWd9XHJcbiAgICAgKi9cclxuICAgIEl0ZW1EcmFnLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgdGhpcy5faGFtbWVyLmRlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLl9pdGVtLl9lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHByZXZlbnREZWZhdWx0LCBmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5faXNEZXN0cm95ZWQgPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFByaXZhdGUgcHJvdG90eXBlIG1ldGhvZHNcclxuICAgICAqICoqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IEdyaWQgaW5zdGFuY2UuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtRHJhZy5wcm90b3R5cGVcclxuICAgICAqIEByZXR1cm5zIHs/R3JpZH1cclxuICAgICAqL1xyXG4gICAgSXRlbURyYWcucHJvdG90eXBlLl9nZXRHcmlkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBncmlkSW5zdGFuY2VzW3RoaXMuX2dyaWRJZF0gfHwgbnVsbDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXR1cC9yZXNldCBkcmFnIGRhdGEuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtRHJhZy5wcm90b3R5cGVcclxuICAgICAqL1xyXG4gICAgSXRlbURyYWcucHJvdG90eXBlLl9yZXNldCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBJcyBpdGVtIGJlaW5nIGRyYWdnZWQ/XHJcbiAgICAgICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gVGhlIGRyYWdnZWQgaXRlbSdzIGNvbnRhaW5lciBlbGVtZW50LlxyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vIFRoZSBkcmFnZ2VkIGl0ZW0ncyBjb250YWluaW5nIGJsb2NrLlxyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5pbmdCbG9jayA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vIEhhbW1lciBldmVudCBkYXRhLlxyXG4gICAgICAgIHRoaXMuX2xhc3RFdmVudCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fbGFzdFNjcm9sbEV2ZW50ID0gbnVsbDtcclxuXHJcbiAgICAgICAgLy8gQWxsIHRoZSBlbGVtZW50cyB3aGljaCBuZWVkIHRvIGJlIGxpc3RlbmVkIGZvciBzY3JvbGwgZXZlbnRzIGR1cmluZ1xyXG4gICAgICAgIC8vIGRyYWdnaW5nLlxyXG4gICAgICAgIHRoaXMuX3Njcm9sbGVycyA9IFtdO1xyXG5cclxuICAgICAgICAvLyBUaGUgY3VycmVudCB0cmFuc2xhdGVYL3RyYW5zbGF0ZVkgcG9zaXRpb24uXHJcbiAgICAgICAgdGhpcy5fbGVmdCA9IDA7XHJcbiAgICAgICAgdGhpcy5fdG9wID0gMDtcclxuXHJcbiAgICAgICAgLy8gRHJhZ2dlZCBlbGVtZW50J3MgY3VycmVudCBwb3NpdGlvbiB3aXRoaW4gdGhlIGdyaWQuXHJcbiAgICAgICAgdGhpcy5fZ3JpZFggPSAwO1xyXG4gICAgICAgIHRoaXMuX2dyaWRZID0gMDtcclxuXHJcbiAgICAgICAgLy8gRHJhZ2dlZCBlbGVtZW50J3MgY3VycmVudCBvZmZzZXQgZnJvbSB3aW5kb3cncyBub3J0aHdlc3QgY29ybmVyLiBEb2VzXHJcbiAgICAgICAgLy8gbm90IGFjY291bnQgZm9yIGVsZW1lbnQncyBtYXJnaW5zLlxyXG4gICAgICAgIHRoaXMuX2VsZW1lbnRDbGllbnRYID0gMDtcclxuICAgICAgICB0aGlzLl9lbGVtZW50Q2xpZW50WSA9IDA7XHJcblxyXG4gICAgICAgIC8vIE9mZnNldCBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIGRyYWdnZWQgZWxlbWVudCdzIHRlbXBvcmFyeSBkcmFnXHJcbiAgICAgICAgLy8gY29udGFpbmVyIGFuZCBpdCdzIG9yaWdpbmFsIGNvbnRhaW5lci5cclxuICAgICAgICB0aGlzLl9jb250YWluZXJEaWZmWCA9IDA7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyRGlmZlkgPSAwO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEJpbmQgZHJhZyBzY3JvbGwgaGFuZGxlcnMgdG8gYWxsIHNjcm9sbGFibGUgYW5jZXN0b3IgZWxlbWVudHMgb2YgdGhlXHJcbiAgICAgKiBkcmFnZ2VkIGVsZW1lbnQgYW5kIHRoZSBkcmFnIGNvbnRhaW5lciBlbGVtZW50LlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbURyYWcucHJvdG90eXBlXHJcbiAgICAgKi9cclxuICAgIEl0ZW1EcmFnLnByb3RvdHlwZS5fYmluZFNjcm9sbExpc3RlbmVycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZ3JpZENvbnRhaW5lciA9IHRoaXMuX2dldEdyaWQoKS5fZWxlbWVudDtcclxuICAgICAgICB2YXIgZHJhZ0NvbnRhaW5lciA9IHRoaXMuX2NvbnRhaW5lcjtcclxuICAgICAgICB2YXIgc2Nyb2xsZXJzID0gdGhpcy5fc2Nyb2xsZXJzO1xyXG4gICAgICAgIHZhciBjb250YWluZXJTY3JvbGxlcnM7XHJcbiAgICAgICAgdmFyIGk7XHJcblxyXG4gICAgICAgIC8vIEdldCBkcmFnZ2VkIGVsZW1lbnQncyBzY3JvbGxpbmcgcGFyZW50cy5cclxuICAgICAgICBzY3JvbGxlcnMubGVuZ3RoID0gMDtcclxuICAgICAgICBnZXRTY3JvbGxQYXJlbnRzKHRoaXMuX2l0ZW0uX2VsZW1lbnQsIHNjcm9sbGVycyk7XHJcblxyXG4gICAgICAgIC8vIElmIGRyYWcgY29udGFpbmVyIGlzIGRlZmluZWQgYW5kIGl0J3Mgbm90IHRoZSBzYW1lIGVsZW1lbnQgYXMgZ3JpZFxyXG4gICAgICAgIC8vIGNvbnRhaW5lciB0aGVuIHdlIG5lZWQgdG8gYWRkIHRoZSBncmlkIGNvbnRhaW5lciBhbmQgaXQncyBzY3JvbGwgcGFyZW50c1xyXG4gICAgICAgIC8vIHRvIHRoZSBlbGVtZW50cyB3aGljaCBhcmUgZ29pbmcgdG8gYmUgbGlzdGVuZXIgZm9yIHNjcm9sbCBldmVudHMuXHJcbiAgICAgICAgaWYgKGRyYWdDb250YWluZXIgIT09IGdyaWRDb250YWluZXIpIHtcclxuICAgICAgICAgICAgY29udGFpbmVyU2Nyb2xsZXJzID0gW107XHJcbiAgICAgICAgICAgIGdldFNjcm9sbFBhcmVudHMoZ3JpZENvbnRhaW5lciwgY29udGFpbmVyU2Nyb2xsZXJzKTtcclxuICAgICAgICAgICAgY29udGFpbmVyU2Nyb2xsZXJzLnB1c2goZ3JpZENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb250YWluZXJTY3JvbGxlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChzY3JvbGxlcnMuaW5kZXhPZihjb250YWluZXJTY3JvbGxlcnNbaV0pIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbGVycy5wdXNoKGNvbnRhaW5lclNjcm9sbGVyc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEJpbmQgc2Nyb2xsIGxpc3RlbmVycy5cclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc2Nyb2xsZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHNjcm9sbGVyc1tpXS5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLl9vblNjcm9sbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVuYmluZCBjdXJyZW50bHkgYm91bmQgZHJhZyBzY3JvbGwgaGFuZGxlcnMgZnJvbSBhbGwgc2Nyb2xsYWJsZSBhbmNlc3RvclxyXG4gICAgICogZWxlbWVudHMgb2YgdGhlIGRyYWdnZWQgZWxlbWVudCBhbmQgdGhlIGRyYWcgY29udGFpbmVyIGVsZW1lbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtRHJhZy5wcm90b3R5cGVcclxuICAgICAqL1xyXG4gICAgSXRlbURyYWcucHJvdG90eXBlLl91bmJpbmRTY3JvbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNjcm9sbGVycyA9IHRoaXMuX3Njcm9sbGVycztcclxuICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHNjcm9sbGVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBzY3JvbGxlcnNbaV0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5fb25TY3JvbGwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2Nyb2xsZXJzLmxlbmd0aCA9IDA7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0dXAgZGVmYXVsdCBzdGFydCBwcmVkaWNhdGUuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtRHJhZy5wcm90b3R5cGVcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9XHJcbiAgICAgKi9cclxuICAgIEl0ZW1EcmFnLnByb3RvdHlwZS5fc2V0dXBTdGFydFByZWRpY2F0ZSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIGNvbmZpZyA9IG9wdGlvbnMgfHwgdGhpcy5fZ2V0R3JpZCgpLl9zZXR0aW5ncy5kcmFnU3RhcnRQcmVkaWNhdGUgfHwgMDtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX3N0YXJ0UHJlZGljYXRlRGF0YSA9IHtcclxuICAgICAgICAgICAgZGlzdGFuY2U6IE1hdGguYWJzKGNvbmZpZy5kaXN0YW5jZSkgfHwgMCxcclxuICAgICAgICAgICAgZGVsYXk6IE1hdGgubWF4KGNvbmZpZy5kZWxheSwgMCkgfHwgMCxcclxuICAgICAgICAgICAgaGFuZGxlOiB0eXBlb2YgY29uZmlnLmhhbmRsZSA9PT0gJ3N0cmluZycgPyBjb25maWcuaGFuZGxlIDogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXR1cCBkZWZhdWx0IHN0YXJ0IHByZWRpY2F0ZSBoYW5kbGUuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtRHJhZy5wcm90b3R5cGVcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxyXG4gICAgICogQHJldHVybnMgez9IVE1MRWxlbWVudH1cclxuICAgICAqL1xyXG4gICAgSXRlbURyYWcucHJvdG90eXBlLl9nZXRTdGFydFByZWRpY2F0ZUhhbmRsZSA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBwcmVkaWNhdGUgPSB0aGlzLl9zdGFydFByZWRpY2F0ZURhdGE7XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLl9pdGVtLl9lbGVtZW50O1xyXG4gICAgICAgIHZhciBoYW5kbGVFbGVtZW50ID0gZWxlbWVudDtcclxuXHJcbiAgICAgICAgLy8gTm8gaGFuZGxlLCBubyBoYXNzbGUgLT4gbGV0J3MgdXNlIHRoZSBpdGVtIGVsZW1lbnQgYXMgdGhlIGhhbmRsZS5cclxuICAgICAgICBpZiAoIXByZWRpY2F0ZS5oYW5kbGUpIHJldHVybiBoYW5kbGVFbGVtZW50O1xyXG5cclxuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIHNwZWNpZmljIHByZWRpY2F0ZSBoYW5kbGUgZGVmaW5lZCwgbGV0J3MgdHJ5IHRvIGdldCBpdC5cclxuICAgICAgICBoYW5kbGVFbGVtZW50ID0gKGV2ZW50LmNoYW5nZWRQb2ludGVyc1swXSB8fCAwKS50YXJnZXQ7XHJcbiAgICAgICAgd2hpbGUgKGhhbmRsZUVsZW1lbnQgJiYgIWVsZW1lbnRNYXRjaGVzKGhhbmRsZUVsZW1lbnQsIHByZWRpY2F0ZS5oYW5kbGUpKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZUVsZW1lbnQgPSBoYW5kbGVFbGVtZW50ICE9PSBlbGVtZW50ID8gaGFuZGxlRWxlbWVudC5wYXJlbnRFbGVtZW50IDogbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZUVsZW1lbnQgfHwgbnVsbDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbmJpbmQgY3VycmVudGx5IGJvdW5kIGRyYWcgc2Nyb2xsIGhhbmRsZXJzIGZyb20gYWxsIHNjcm9sbGFibGUgYW5jZXN0b3JcclxuICAgICAqIGVsZW1lbnRzIG9mIHRoZSBkcmFnZ2VkIGVsZW1lbnQgYW5kIHRoZSBkcmFnIGNvbnRhaW5lciBlbGVtZW50LlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbURyYWcucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcclxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBJdGVtRHJhZy5wcm90b3R5cGUuX3Jlc29sdmVTdGFydFByZWRpY2F0ZSA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBwcmVkaWNhdGUgPSB0aGlzLl9zdGFydFByZWRpY2F0ZURhdGE7XHJcbiAgICAgICAgdmFyIHBvaW50ZXIgPSBldmVudC5jaGFuZ2VkUG9pbnRlcnNbMF07XHJcbiAgICAgICAgdmFyIHBhZ2VYID0gKHBvaW50ZXIgJiYgcG9pbnRlci5wYWdlWCkgfHwgMDtcclxuICAgICAgICB2YXIgcGFnZVkgPSAocG9pbnRlciAmJiBwb2ludGVyLnBhZ2VZKSB8fCAwO1xyXG4gICAgICAgIHZhciBoYW5kbGVSZWN0O1xyXG4gICAgICAgIHZhciBoYW5kbGVMZWZ0O1xyXG4gICAgICAgIHZhciBoYW5kbGVUb3A7XHJcbiAgICAgICAgdmFyIGhhbmRsZVdpZHRoO1xyXG4gICAgICAgIHZhciBoYW5kbGVIZWlnaHQ7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBtb3ZlZCBkaXN0YW5jZSBpcyBzbWFsbGVyIHRoYW4gdGhlIHRocmVzaG9sZCBkaXN0YW5jZSBvciB0aGVyZSBpc1xyXG4gICAgICAgIC8vIHNvbWUgZGVsYXkgbGVmdCwgaWdub3JlIHRoaXMgcHJlZGljYXRlIGN5Y2xlLlxyXG4gICAgICAgIGlmIChldmVudC5kaXN0YW5jZSA8IHByZWRpY2F0ZS5kaXN0YW5jZSB8fCBwcmVkaWNhdGUuZGVsYXkpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gR2V0IGhhbmRsZSByZWN0IGRhdGEuXHJcbiAgICAgICAgaGFuZGxlUmVjdCA9IHByZWRpY2F0ZS5oYW5kbGVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGhhbmRsZUxlZnQgPSBoYW5kbGVSZWN0LmxlZnQgKyAod2luZG93LnBhZ2VYT2Zmc2V0IHx8IDApO1xyXG4gICAgICAgIGhhbmRsZVRvcCA9IGhhbmRsZVJlY3QudG9wICsgKHdpbmRvdy5wYWdlWU9mZnNldCB8fCAwKTtcclxuICAgICAgICBoYW5kbGVXaWR0aCA9IGhhbmRsZVJlY3Qud2lkdGg7XHJcbiAgICAgICAgaGFuZGxlSGVpZ2h0ID0gaGFuZGxlUmVjdC5oZWlnaHQ7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHByZWRpY2F0ZSBkYXRhLlxyXG4gICAgICAgIHRoaXMuX3Jlc2V0U3RhcnRQcmVkaWNhdGUoKTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIGN1cnNvciBpcyBzdGlsbCB3aXRoaW4gdGhlIGhhbmRsZSBsZXQncyBzdGFydCB0aGUgZHJhZy5cclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICBoYW5kbGVXaWR0aCAmJlxyXG4gICAgICAgICAgICBoYW5kbGVIZWlnaHQgJiZcclxuICAgICAgICAgICAgcGFnZVggPj0gaGFuZGxlTGVmdCAmJlxyXG4gICAgICAgICAgICBwYWdlWCA8IGhhbmRsZUxlZnQgKyBoYW5kbGVXaWR0aCAmJlxyXG4gICAgICAgICAgICBwYWdlWSA+PSBoYW5kbGVUb3AgJiZcclxuICAgICAgICAgICAgcGFnZVkgPCBoYW5kbGVUb3AgKyBoYW5kbGVIZWlnaHRcclxuICAgICAgICApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmFsaXplIHN0YXJ0IHByZWRpY2F0ZS5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQG1lbWJlcm9mIEl0ZW1EcmFnLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XHJcbiAgICAgKi9cclxuICAgIEl0ZW1EcmFnLnByb3RvdHlwZS5fZmluaXNoU3RhcnRQcmVkaWNhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB2YXIgZWxlbWVudCA9IHRoaXMuX2l0ZW0uX2VsZW1lbnQ7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHByZWRpY2F0ZS5cclxuICAgICAgICB0aGlzLl9yZXNldFN0YXJ0UHJlZGljYXRlKCk7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBnZXN0dXJlIGNhbiBiZSBpbnRlcnByZXRlZCBhcyBjbGljayBsZXQncyB0cnkgdG8gb3BlbiB0aGUgZWxlbWVudCdzXHJcbiAgICAgICAgLy8gaHJlZiB1cmwgKGlmIGl0IGlzIGFuIGFuY2hvciBlbGVtZW50KS5cclxuICAgICAgICBpZiAoaXNDbGljayhldmVudCkpIG9wZW5BbmNob3JIcmVmKGVsZW1lbnQpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlc2V0IGZvciBkZWZhdWx0IGRyYWcgc3RhcnQgcHJlZGljYXRlIGZ1bmN0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbURyYWcucHJvdG90eXBlXHJcbiAgICAgKi9cclxuICAgIEl0ZW1EcmFnLnByb3RvdHlwZS5fcmVzZXRTdGFydFByZWRpY2F0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcHJlZGljYXRlID0gdGhpcy5fc3RhcnRQcmVkaWNhdGVEYXRhO1xyXG4gICAgICAgIGlmIChwcmVkaWNhdGUpIHtcclxuICAgICAgICAgICAgaWYgKHByZWRpY2F0ZS5kZWxheVRpbWVyKSB7XHJcbiAgICAgICAgICAgICAgICBwcmVkaWNhdGUuZGVsYXlUaW1lciA9IHdpbmRvdy5jbGVhclRpbWVvdXQocHJlZGljYXRlLmRlbGF5VGltZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0UHJlZGljYXRlRGF0YSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIChkdXJpbmcgZHJhZykgaWYgYW4gaXRlbSBpcyBvdmVybGFwcGluZyBvdGhlciBpdGVtcyBhbmQgYmFzZWQgb25cclxuICAgICAqIHRoZSBjb25maWd1cmF0aW9uIGxheW91dCB0aGUgaXRlbXMuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtRHJhZy5wcm90b3R5cGVcclxuICAgICAqL1xyXG4gICAgSXRlbURyYWcucHJvdG90eXBlLl9jaGVja092ZXJsYXAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc0FjdGl2ZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2l0ZW07XHJcbiAgICAgICAgdmFyIHNldHRpbmdzID0gdGhpcy5fZ2V0R3JpZCgpLl9zZXR0aW5ncztcclxuICAgICAgICB2YXIgcmVzdWx0O1xyXG4gICAgICAgIHZhciBjdXJyZW50R3JpZDtcclxuICAgICAgICB2YXIgY3VycmVudEluZGV4O1xyXG4gICAgICAgIHZhciB0YXJnZXRHcmlkO1xyXG4gICAgICAgIHZhciB0YXJnZXRJbmRleDtcclxuICAgICAgICB2YXIgc29ydEFjdGlvbjtcclxuICAgICAgICB2YXIgaXNNaWdyYXRpb247XHJcblxyXG4gICAgICAgIC8vIEdldCBvdmVybGFwIGNoZWNrIHJlc3VsdC5cclxuICAgICAgICBpZiAodHlwZW9mIHNldHRpbmdzLmRyYWdTb3J0UHJlZGljYXRlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHNldHRpbmdzLmRyYWdTb3J0UHJlZGljYXRlKGl0ZW0sIHRoaXMuX2xhc3RFdmVudCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gSXRlbURyYWcuZGVmYXVsdFNvcnRQcmVkaWNhdGUoaXRlbSwgc2V0dGluZ3MuZHJhZ1NvcnRQcmVkaWNhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTGV0J3MgbWFrZSBzdXJlIHRoZSByZXN1bHQgb2JqZWN0IGhhcyBhIHZhbGlkIGluZGV4IGJlZm9yZSBnb2luZyBmdXJ0aGVyLlxyXG4gICAgICAgIGlmICghcmVzdWx0IHx8IHR5cGVvZiByZXN1bHQuaW5kZXggIT09ICdudW1iZXInKSByZXR1cm47XHJcblxyXG4gICAgICAgIGN1cnJlbnRHcmlkID0gaXRlbS5nZXRHcmlkKCk7XHJcbiAgICAgICAgdGFyZ2V0R3JpZCA9IHJlc3VsdC5ncmlkIHx8IGN1cnJlbnRHcmlkO1xyXG4gICAgICAgIGlzTWlncmF0aW9uID0gY3VycmVudEdyaWQgIT09IHRhcmdldEdyaWQ7XHJcbiAgICAgICAgY3VycmVudEluZGV4ID0gY3VycmVudEdyaWQuX2l0ZW1zLmluZGV4T2YoaXRlbSk7XHJcbiAgICAgICAgdGFyZ2V0SW5kZXggPSBub3JtYWxpemVBcnJheUluZGV4KHRhcmdldEdyaWQuX2l0ZW1zLCByZXN1bHQuaW5kZXgsIGlzTWlncmF0aW9uKTtcclxuICAgICAgICBzb3J0QWN0aW9uID0gcmVzdWx0LmFjdGlvbiA9PT0gJ3N3YXAnID8gJ3N3YXAnIDogJ21vdmUnO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgaXRlbSB3YXMgbW92ZWQgd2l0aGluIGl0J3MgY3VycmVudCBncmlkLlxyXG4gICAgICAgIGlmICghaXNNaWdyYXRpb24pIHtcclxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSB0YXJnZXQgaW5kZXggaXMgbm90IHRoZSBjdXJyZW50IGluZGV4LlxyXG4gICAgICAgICAgICBpZiAoY3VycmVudEluZGV4ICE9PSB0YXJnZXRJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgLy8gRG8gdGhlIHNvcnQuXHJcbiAgICAgICAgICAgICAgICAoc29ydEFjdGlvbiA9PT0gJ3N3YXAnID8gYXJyYXlTd2FwIDogYXJyYXlNb3ZlKShcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50R3JpZC5faXRlbXMsXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEluZGV4XHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEVtaXQgbW92ZSBldmVudC5cclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50R3JpZC5faGFzTGlzdGVuZXJzKGV2ZW50TW92ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50R3JpZC5fZW1pdChldmVudE1vdmUsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbUluZGV4OiBjdXJyZW50SW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvSW5kZXg6IHRhcmdldEluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHNvcnRBY3Rpb25cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBMYXlvdXQgdGhlIGdyaWQuXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50R3JpZC5sYXlvdXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIGl0ZW0gd2FzIG1vdmVkIHRvIGFub3RoZXIgZ3JpZC5cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gRW1pdCBiZWZvcmVTZW5kIGV2ZW50LlxyXG4gICAgICAgICAgICBpZiAoY3VycmVudEdyaWQuX2hhc0xpc3RlbmVycyhldmVudEJlZm9yZVNlbmQpKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50R3JpZC5fZW1pdChldmVudEJlZm9yZVNlbmQsIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyb21HcmlkOiBjdXJyZW50R3JpZCxcclxuICAgICAgICAgICAgICAgICAgICBmcm9tSW5kZXg6IGN1cnJlbnRJbmRleCxcclxuICAgICAgICAgICAgICAgICAgICB0b0dyaWQ6IHRhcmdldEdyaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9JbmRleDogdGFyZ2V0SW5kZXhcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBFbWl0IGJlZm9yZVJlY2VpdmUgZXZlbnQuXHJcbiAgICAgICAgICAgIGlmICh0YXJnZXRHcmlkLl9oYXNMaXN0ZW5lcnMoZXZlbnRCZWZvcmVSZWNlaXZlKSkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0R3JpZC5fZW1pdChldmVudEJlZm9yZVJlY2VpdmUsIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgIGZyb21HcmlkOiBjdXJyZW50R3JpZCxcclxuICAgICAgICAgICAgICAgICAgICBmcm9tSW5kZXg6IGN1cnJlbnRJbmRleCxcclxuICAgICAgICAgICAgICAgICAgICB0b0dyaWQ6IHRhcmdldEdyaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9JbmRleDogdGFyZ2V0SW5kZXhcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgaXRlbSdzIGdyaWQgaWQgcmVmZXJlbmNlLlxyXG4gICAgICAgICAgICBpdGVtLl9ncmlkSWQgPSB0YXJnZXRHcmlkLl9pZDtcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSBkcmFnIGluc3RhbmNlJ3MgbWlncmF0aW5nIGluZGljYXRvci5cclxuICAgICAgICAgICAgdGhpcy5faXNNaWdyYXRpbmcgPSBpdGVtLl9ncmlkSWQgIT09IHRoaXMuX2dyaWRJZDtcclxuXHJcbiAgICAgICAgICAgIC8vIE1vdmUgaXRlbSBpbnN0YW5jZSBmcm9tIGN1cnJlbnQgZ3JpZCB0byB0YXJnZXQgZ3JpZC5cclxuICAgICAgICAgICAgY3VycmVudEdyaWQuX2l0ZW1zLnNwbGljZShjdXJyZW50SW5kZXgsIDEpO1xyXG4gICAgICAgICAgICBhcnJheUluc2VydCh0YXJnZXRHcmlkLl9pdGVtcywgaXRlbSwgdGFyZ2V0SW5kZXgpO1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IHNvcnQgZGF0YSBhcyBudWxsLCB3aGljaCBpcyBhbiBpbmRpY2F0b3IgZm9yIHRoZSBpdGVtIGNvbXBhcmlzb25cclxuICAgICAgICAgICAgLy8gZnVuY3Rpb24gdGhhdCB0aGUgc29ydCBkYXRhIG9mIHRoaXMgc3BlY2lmaWMgaXRlbSBzaG91bGQgYmUgZmV0Y2hlZFxyXG4gICAgICAgICAgICAvLyBsYXppbHkuXHJcbiAgICAgICAgICAgIGl0ZW0uX3NvcnREYXRhID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vIEVtaXQgc2VuZCBldmVudC5cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRHcmlkLl9oYXNMaXN0ZW5lcnMoZXZlbnRTZW5kKSkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEdyaWQuX2VtaXQoZXZlbnRTZW5kLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcclxuICAgICAgICAgICAgICAgICAgICBmcm9tR3JpZDogY3VycmVudEdyaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZnJvbUluZGV4OiBjdXJyZW50SW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9HcmlkOiB0YXJnZXRHcmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvSW5kZXg6IHRhcmdldEluZGV4XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRW1pdCByZWNlaXZlIGV2ZW50LlxyXG4gICAgICAgICAgICBpZiAodGFyZ2V0R3JpZC5faGFzTGlzdGVuZXJzKGV2ZW50UmVjZWl2ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldEdyaWQuX2VtaXQoZXZlbnRSZWNlaXZlLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcclxuICAgICAgICAgICAgICAgICAgICBmcm9tR3JpZDogY3VycmVudEdyaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZnJvbUluZGV4OiBjdXJyZW50SW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9HcmlkOiB0YXJnZXRHcmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvSW5kZXg6IHRhcmdldEluZGV4XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gTGF5b3V0IGJvdGggZ3JpZHMuXHJcbiAgICAgICAgICAgIGN1cnJlbnRHcmlkLmxheW91dCgpO1xyXG4gICAgICAgICAgICB0YXJnZXRHcmlkLmxheW91dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiBpdGVtIGlzIGRyYWdnZWQgaW50byBhbm90aGVyIGdyaWQsIGZpbmlzaCB0aGUgbWlncmF0aW9uIHByb2Nlc3NcclxuICAgICAqIGdyYWNlZnVsbHkuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtRHJhZy5wcm90b3R5cGVcclxuICAgICAqL1xyXG4gICAgSXRlbURyYWcucHJvdG90eXBlLl9maW5pc2hNaWdyYXRpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLl9pdGVtO1xyXG4gICAgICAgIHZhciByZWxlYXNlID0gaXRlbS5fcmVsZWFzZTtcclxuICAgICAgICB2YXIgZWxlbWVudCA9IGl0ZW0uX2VsZW1lbnQ7XHJcbiAgICAgICAgdmFyIGlzQWN0aXZlID0gaXRlbS5faXNBY3RpdmU7XHJcbiAgICAgICAgdmFyIHRhcmdldEdyaWQgPSBpdGVtLmdldEdyaWQoKTtcclxuICAgICAgICB2YXIgdGFyZ2V0R3JpZEVsZW1lbnQgPSB0YXJnZXRHcmlkLl9lbGVtZW50O1xyXG4gICAgICAgIHZhciB0YXJnZXRTZXR0aW5ncyA9IHRhcmdldEdyaWQuX3NldHRpbmdzO1xyXG4gICAgICAgIHZhciB0YXJnZXRDb250YWluZXIgPSB0YXJnZXRTZXR0aW5ncy5kcmFnQ29udGFpbmVyIHx8IHRhcmdldEdyaWRFbGVtZW50O1xyXG4gICAgICAgIHZhciBjdXJyZW50U2V0dGluZ3MgPSB0aGlzLl9nZXRHcmlkKCkuX3NldHRpbmdzO1xyXG4gICAgICAgIHZhciBjdXJyZW50Q29udGFpbmVyID0gZWxlbWVudC5wYXJlbnROb2RlO1xyXG4gICAgICAgIHZhciB0cmFuc2xhdGU7XHJcbiAgICAgICAgdmFyIG9mZnNldERpZmY7XHJcblxyXG4gICAgICAgIC8vIERlc3Ryb3kgY3VycmVudCBkcmFnLiBOb3RlIHRoYXQgd2UgbmVlZCB0byBzZXQgdGhlIG1pZ3JhdGluZyBmbGFnIHRvXHJcbiAgICAgICAgLy8gZmFsc2UgZmlyc3QsIGJlY2F1c2Ugb3RoZXJ3aXNlIHdlIGNyZWF0ZSBhbiBpbmZpbml0ZSBsb29wIGJldHdlZW4gdGhpc1xyXG4gICAgICAgIC8vIGFuZCB0aGUgZHJhZy5zdG9wKCkgbWV0aG9kLlxyXG4gICAgICAgIHRoaXMuX2lzTWlncmF0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5kZXN0cm95KCk7XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBjdXJyZW50IGNsYXNzbmFtZXMuXHJcbiAgICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgY3VycmVudFNldHRpbmdzLml0ZW1DbGFzcyk7XHJcbiAgICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgY3VycmVudFNldHRpbmdzLml0ZW1WaXNpYmxlQ2xhc3MpO1xyXG4gICAgICAgIHJlbW92ZUNsYXNzKGVsZW1lbnQsIGN1cnJlbnRTZXR0aW5ncy5pdGVtSGlkZGVuQ2xhc3MpO1xyXG5cclxuICAgICAgICAvLyBBZGQgbmV3IGNsYXNzbmFtZXMuXHJcbiAgICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgdGFyZ2V0U2V0dGluZ3MuaXRlbUNsYXNzKTtcclxuICAgICAgICBhZGRDbGFzcyhlbGVtZW50LCBpc0FjdGl2ZSA/IHRhcmdldFNldHRpbmdzLml0ZW1WaXNpYmxlQ2xhc3MgOiB0YXJnZXRTZXR0aW5ncy5pdGVtSGlkZGVuQ2xhc3MpO1xyXG5cclxuICAgICAgICAvLyBNb3ZlIHRoZSBpdGVtIGluc2lkZSB0aGUgdGFyZ2V0IGNvbnRhaW5lciBpZiBpdCdzIGRpZmZlcmVudCB0aGFuIHRoZVxyXG4gICAgICAgIC8vIGN1cnJlbnQgY29udGFpbmVyLlxyXG4gICAgICAgIGlmICh0YXJnZXRDb250YWluZXIgIT09IGN1cnJlbnRDb250YWluZXIpIHtcclxuICAgICAgICAgICAgdGFyZ2V0Q29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICBvZmZzZXREaWZmID0gZ2V0T2Zmc2V0RGlmZihjdXJyZW50Q29udGFpbmVyLCB0YXJnZXRDb250YWluZXIsIHRydWUpO1xyXG4gICAgICAgICAgICB0cmFuc2xhdGUgPSBnZXRUcmFuc2xhdGUoZWxlbWVudCk7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZS54IC09IG9mZnNldERpZmYubGVmdDtcclxuICAgICAgICAgICAgdHJhbnNsYXRlLnkgLT0gb2Zmc2V0RGlmZi50b3A7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBVcGRhdGUgaXRlbSdzIGNhY2hlZCBkaW1lbnNpb25zIGFuZCBzb3J0IGRhdGEuXHJcbiAgICAgICAgaXRlbS5fcmVmcmVzaERpbWVuc2lvbnMoKTtcclxuICAgICAgICBpdGVtLl9yZWZyZXNoU29ydERhdGEoKTtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBvZmZzZXQgZGlmZmVyZW5jZSBiZXR3ZWVuIHRhcmdldCdzIGRyYWcgY29udGFpbmVyIChpZiBhbnkpXHJcbiAgICAgICAgLy8gYW5kIGFjdHVhbCBncmlkIGNvbnRhaW5lciBlbGVtZW50LiBXZSBzYXZlIGl0IGxhdGVyIGZvciB0aGUgcmVsZWFzZVxyXG4gICAgICAgIC8vIHByb2Nlc3MuXHJcbiAgICAgICAgb2Zmc2V0RGlmZiA9IGdldE9mZnNldERpZmYodGFyZ2V0Q29udGFpbmVyLCB0YXJnZXRHcmlkRWxlbWVudCwgdHJ1ZSk7XHJcbiAgICAgICAgcmVsZWFzZS5fY29udGFpbmVyRGlmZlggPSBvZmZzZXREaWZmLmxlZnQ7XHJcbiAgICAgICAgcmVsZWFzZS5fY29udGFpbmVyRGlmZlkgPSBvZmZzZXREaWZmLnRvcDtcclxuXHJcbiAgICAgICAgLy8gUmVjcmVhdGUgaXRlbSdzIGRyYWcgaGFuZGxlci5cclxuICAgICAgICBpdGVtLl9kcmFnID0gdGFyZ2V0U2V0dGluZ3MuZHJhZ0VuYWJsZWQgPyBuZXcgSXRlbURyYWcoaXRlbSkgOiBudWxsO1xyXG5cclxuICAgICAgICAvLyBBZGp1c3QgdGhlIHBvc2l0aW9uIG9mIHRoZSBpdGVtIGVsZW1lbnQgaWYgaXQgd2FzIG1vdmVkIGZyb20gYSBjb250YWluZXJcclxuICAgICAgICAvLyB0byBhbm90aGVyLlxyXG4gICAgICAgIGlmICh0YXJnZXRDb250YWluZXIgIT09IGN1cnJlbnRDb250YWluZXIpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZVt0cmFuc2Zvcm1Qcm9wXSA9IGdldFRyYW5zbGF0ZVN0cmluZyh0cmFuc2xhdGUueCwgdHJhbnNsYXRlLnkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGNoaWxkIGVsZW1lbnQncyBzdHlsZXMgdG8gcmVmbGVjdCB0aGUgY3VycmVudCB2aXNpYmlsaXR5IHN0YXRlLlxyXG4gICAgICAgIGl0ZW0uX2NoaWxkLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcclxuICAgICAgICBzZXRTdHlsZXMoaXRlbS5fY2hpbGQsIGlzQWN0aXZlID8gdGFyZ2V0U2V0dGluZ3MudmlzaWJsZVN0eWxlcyA6IHRhcmdldFNldHRpbmdzLmhpZGRlblN0eWxlcyk7XHJcblxyXG4gICAgICAgIC8vIFN0YXJ0IHRoZSByZWxlYXNlLlxyXG4gICAgICAgIHJlbGVhc2Uuc3RhcnQoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEcmFnIHN0YXJ0IGhhbmRsZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtRHJhZy5wcm90b3R5cGVcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxyXG4gICAgICovXHJcbiAgICBJdGVtRHJhZy5wcm90b3R5cGUuX29uU3RhcnQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2l0ZW07XHJcblxyXG4gICAgICAgIC8vIElmIGl0ZW0gaXMgbm90IGFjdGl2ZSwgZG9uJ3Qgc3RhcnQgdGhlIGRyYWcuXHJcbiAgICAgICAgaWYgKCFpdGVtLl9pc0FjdGl2ZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgZWxlbWVudCA9IGl0ZW0uX2VsZW1lbnQ7XHJcbiAgICAgICAgdmFyIGdyaWQgPSB0aGlzLl9nZXRHcmlkKCk7XHJcbiAgICAgICAgdmFyIHNldHRpbmdzID0gZ3JpZC5fc2V0dGluZ3M7XHJcbiAgICAgICAgdmFyIHJlbGVhc2UgPSBpdGVtLl9yZWxlYXNlO1xyXG4gICAgICAgIHZhciBtaWdyYXRlID0gaXRlbS5fbWlncmF0ZTtcclxuICAgICAgICB2YXIgZ3JpZENvbnRhaW5lciA9IGdyaWQuX2VsZW1lbnQ7XHJcbiAgICAgICAgdmFyIGRyYWdDb250YWluZXIgPSBzZXR0aW5ncy5kcmFnQ29udGFpbmVyIHx8IGdyaWRDb250YWluZXI7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5pbmdCbG9jayA9IGdldENvbnRhaW5pbmdCbG9jayhkcmFnQ29udGFpbmVyLCB0cnVlKTtcclxuICAgICAgICB2YXIgdHJhbnNsYXRlID0gZ2V0VHJhbnNsYXRlKGVsZW1lbnQpO1xyXG4gICAgICAgIHZhciBjdXJyZW50TGVmdCA9IHRyYW5zbGF0ZS54O1xyXG4gICAgICAgIHZhciBjdXJyZW50VG9wID0gdHJhbnNsYXRlLnk7XHJcbiAgICAgICAgdmFyIGVsZW1lbnRSZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICB2YXIgaGFzRHJhZ0NvbnRhaW5lciA9IGRyYWdDb250YWluZXIgIT09IGdyaWRDb250YWluZXI7XHJcbiAgICAgICAgdmFyIG9mZnNldERpZmY7XHJcblxyXG4gICAgICAgIC8vIElmIGdyaWQgY29udGFpbmVyIGlzIG5vdCB0aGUgZHJhZyBjb250YWluZXIsIHdlIG5lZWQgdG8gY2FsY3VsYXRlIHRoZVxyXG4gICAgICAgIC8vIG9mZnNldCBkaWZmZXJlbmNlIGJldHdlZW4gZ3JpZCBjb250YWluZXIgYW5kIGRyYWcgY29udGFpbmVyJ3MgY29udGFpbmluZ1xyXG4gICAgICAgIC8vIGVsZW1lbnQuXHJcbiAgICAgICAgaWYgKGhhc0RyYWdDb250YWluZXIpIHtcclxuICAgICAgICAgICAgb2Zmc2V0RGlmZiA9IGdldE9mZnNldERpZmYoY29udGFpbmluZ0Jsb2NrLCBncmlkQ29udGFpbmVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFN0b3AgY3VycmVudCBwb3NpdGlvbmluZyBhbmltYXRpb24uXHJcbiAgICAgICAgaWYgKGl0ZW0uaXNQb3NpdGlvbmluZygpKSB7XHJcbiAgICAgICAgICAgIGl0ZW0uX2xheW91dC5zdG9wKHRydWUsIHsgdHJhbnNmb3JtOiBnZXRUcmFuc2xhdGVTdHJpbmcoY3VycmVudExlZnQsIGN1cnJlbnRUb3ApIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU3RvcCBjdXJyZW50IG1pZ3JhdGlvbiBhbmltYXRpb24uXHJcbiAgICAgICAgaWYgKG1pZ3JhdGUuX2lzQWN0aXZlKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRMZWZ0IC09IG1pZ3JhdGUuX2NvbnRhaW5lckRpZmZYO1xyXG4gICAgICAgICAgICBjdXJyZW50VG9wIC09IG1pZ3JhdGUuX2NvbnRhaW5lckRpZmZZO1xyXG4gICAgICAgICAgICBtaWdyYXRlLnN0b3AodHJ1ZSwgeyB0cmFuc2Zvcm06IGdldFRyYW5zbGF0ZVN0cmluZyhjdXJyZW50TGVmdCwgY3VycmVudFRvcCkgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBpdGVtIGlzIGJlaW5nIHJlbGVhc2VkIHJlc2V0IHJlbGVhc2UgZGF0YS5cclxuICAgICAgICBpZiAoaXRlbS5pc1JlbGVhc2luZygpKSByZWxlYXNlLl9yZXNldCgpO1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBkcmFnIGRhdGEuXHJcbiAgICAgICAgdGhpcy5faXNBY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX2xhc3RFdmVudCA9IGV2ZW50O1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lciA9IGRyYWdDb250YWluZXI7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmluZ0Jsb2NrID0gY29udGFpbmluZ0Jsb2NrO1xyXG4gICAgICAgIHRoaXMuX2VsZW1lbnRDbGllbnRYID0gZWxlbWVudFJlY3QubGVmdDtcclxuICAgICAgICB0aGlzLl9lbGVtZW50Q2xpZW50WSA9IGVsZW1lbnRSZWN0LnRvcDtcclxuICAgICAgICB0aGlzLl9sZWZ0ID0gdGhpcy5fZ3JpZFggPSBjdXJyZW50TGVmdDtcclxuICAgICAgICB0aGlzLl90b3AgPSB0aGlzLl9ncmlkWSA9IGN1cnJlbnRUb3A7XHJcblxyXG4gICAgICAgIC8vIEVtaXQgZHJhZ0luaXQgZXZlbnQuXHJcbiAgICAgICAgZ3JpZC5fZW1pdChldmVudERyYWdJbml0LCBpdGVtLCBldmVudCk7XHJcblxyXG4gICAgICAgIC8vIElmIGEgc3BlY2lmaWMgZHJhZyBjb250YWluZXIgaXMgc2V0IGFuZCBpdCBpcyBkaWZmZXJlbnQgZnJvbSB0aGVcclxuICAgICAgICAvLyBncmlkJ3MgY29udGFpbmVyIGVsZW1lbnQgd2UgbmVlZCB0byBjYXN0IHNvbWUgZXh0cmEgc3BlbGxzLlxyXG4gICAgICAgIGlmIChoYXNEcmFnQ29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgIC8vIFN0b3JlIHRoZSBjb250YWluZXIgb2Zmc2V0IGRpZmZzIHRvIGRyYWcgZGF0YS5cclxuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyRGlmZlggPSBvZmZzZXREaWZmLmxlZnQ7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lckRpZmZZID0gb2Zmc2V0RGlmZi50b3A7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiB0aGUgZHJhZ2dlZCBlbGVtZW50IGlzIGEgY2hpbGQgb2YgdGhlIGRyYWcgY29udGFpbmVyIGFsbCB3ZSBuZWVkIHRvXHJcbiAgICAgICAgICAgIC8vIGRvIGlzIHNldHVwIHRoZSByZWxhdGl2ZSBkcmFnIHBvc2l0aW9uIGRhdGEuXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnBhcmVudE5vZGUgPT09IGRyYWdDb250YWluZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2dyaWRYID0gY3VycmVudExlZnQgLSB0aGlzLl9jb250YWluZXJEaWZmWDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2dyaWRZID0gY3VycmVudFRvcCAtIHRoaXMuX2NvbnRhaW5lckRpZmZZO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBPdGhlcndpc2Ugd2UgbmVlZCB0byBhcHBlbmQgdGhlIGVsZW1lbnQgaW5zaWRlIHRoZSBjb3JyZWN0IGNvbnRhaW5lcixcclxuICAgICAgICAgICAgLy8gc2V0dXAgdGhlIGFjdHVhbCBkcmFnIHBvc2l0aW9uIGRhdGEgYW5kIGFkanVzdCB0aGUgZWxlbWVudCdzIHRyYW5zbGF0ZVxyXG4gICAgICAgICAgICAvLyB2YWx1ZXMgdG8gYWNjb3VudCBmb3IgdGhlIERPTSBwb3NpdGlvbiBzaGlmdC5cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sZWZ0ID0gY3VycmVudExlZnQgKyB0aGlzLl9jb250YWluZXJEaWZmWDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RvcCA9IGN1cnJlbnRUb3AgKyB0aGlzLl9jb250YWluZXJEaWZmWTtcclxuICAgICAgICAgICAgICAgIGRyYWdDb250YWluZXIuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlW3RyYW5zZm9ybVByb3BdID0gZ2V0VHJhbnNsYXRlU3RyaW5nKHRoaXMuX2xlZnQsIHRoaXMuX3RvcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNldCBkcmFnIGNsYXNzIGFuZCBiaW5kIHNjcm9sbGVycy5cclxuICAgICAgICBhZGRDbGFzcyhlbGVtZW50LCBzZXR0aW5ncy5pdGVtRHJhZ2dpbmdDbGFzcyk7XHJcbiAgICAgICAgdGhpcy5fYmluZFNjcm9sbExpc3RlbmVycygpO1xyXG5cclxuICAgICAgICAvLyBFbWl0IGRyYWdTdGFydCBldmVudC5cclxuICAgICAgICBncmlkLl9lbWl0KGV2ZW50RHJhZ1N0YXJ0LCBpdGVtLCBldmVudCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRHJhZyBtb3ZlIGhhbmRsZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtRHJhZy5wcm90b3R5cGVcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxyXG4gICAgICovXHJcbiAgICBJdGVtRHJhZy5wcm90b3R5cGUuX29uTW92ZSA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5faXRlbTtcclxuXHJcbiAgICAgICAgLy8gSWYgaXRlbSBpcyBub3QgYWN0aXZlLCByZXNldCBkcmFnLlxyXG4gICAgICAgIGlmICghaXRlbS5faXNBY3RpdmUpIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBzZXR0aW5ncyA9IHRoaXMuX2dldEdyaWQoKS5fc2V0dGluZ3M7XHJcbiAgICAgICAgdmFyIGF4aXMgPSBzZXR0aW5ncy5kcmFnQXhpcztcclxuICAgICAgICB2YXIgeERpZmYgPSBldmVudC5kZWx0YVggLSB0aGlzLl9sYXN0RXZlbnQuZGVsdGFYO1xyXG4gICAgICAgIHZhciB5RGlmZiA9IGV2ZW50LmRlbHRhWSAtIHRoaXMuX2xhc3RFdmVudC5kZWx0YVk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBsYXN0IGV2ZW50LlxyXG4gICAgICAgIHRoaXMuX2xhc3RFdmVudCA9IGV2ZW50O1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgaG9yaXpvbnRhbCBwb3NpdGlvbiBkYXRhLlxyXG4gICAgICAgIGlmIChheGlzICE9PSAneScpIHtcclxuICAgICAgICAgICAgdGhpcy5fbGVmdCArPSB4RGlmZjtcclxuICAgICAgICAgICAgdGhpcy5fZ3JpZFggKz0geERpZmY7XHJcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRDbGllbnRYICs9IHhEaWZmO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHZlcnRpY2FsIHBvc2l0aW9uIGRhdGEuXHJcbiAgICAgICAgaWYgKGF4aXMgIT09ICd4Jykge1xyXG4gICAgICAgICAgICB0aGlzLl90b3AgKz0geURpZmY7XHJcbiAgICAgICAgICAgIHRoaXMuX2dyaWRZICs9IHlEaWZmO1xyXG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50Q2xpZW50WSArPSB5RGlmZjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERvIG1vdmUgcHJlcGFyZS9hcHBseSBoYW5kbGluZyBpbiB0aGUgbmV4dCB0aWNrLlxyXG4gICAgICAgIGFkZE1vdmVUaWNrKGl0ZW0uX2lkLCB0aGlzLl9wcmVwYXJlTW92ZSwgdGhpcy5fYXBwbHlNb3ZlKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQcmVwYXJlIGRyYWdnZWQgaXRlbSBmb3IgbW92aW5nLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbURyYWcucHJvdG90eXBlXHJcbiAgICAgKi9cclxuICAgIEl0ZW1EcmFnLnByb3RvdHlwZS5fcHJlcGFyZU1vdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8gRG8gbm90aGluZyBpZiBpdGVtIGlzIG5vdCBhY3RpdmUuXHJcbiAgICAgICAgaWYgKCF0aGlzLl9pdGVtLl9pc0FjdGl2ZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBJZiBkcmFnIHNvcnQgaXMgZW5hYmxlZCAtPiBjaGVjayBvdmVybGFwLlxyXG4gICAgICAgIGlmICh0aGlzLl9nZXRHcmlkKCkuX3NldHRpbmdzLmRyYWdTb3J0KSB0aGlzLl9jaGVja092ZXJsYXBEZWJvdW5jZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFwcGx5IG1vdmVtZW50IHRvIGRyYWdnZWQgaXRlbS5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQG1lbWJlcm9mIEl0ZW1EcmFnLnByb3RvdHlwZVxyXG4gICAgICovXHJcbiAgICBJdGVtRHJhZy5wcm90b3R5cGUuX2FwcGx5TW92ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2l0ZW07XHJcblxyXG4gICAgICAgIC8vIERvIG5vdGhpbmcgaWYgaXRlbSBpcyBub3QgYWN0aXZlLlxyXG4gICAgICAgIGlmICghaXRlbS5faXNBY3RpdmUpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGVsZW1lbnQncyB0cmFuc2xhdGVYL1kgdmFsdWVzLlxyXG4gICAgICAgIGl0ZW0uX2VsZW1lbnQuc3R5bGVbdHJhbnNmb3JtUHJvcF0gPSBnZXRUcmFuc2xhdGVTdHJpbmcodGhpcy5fbGVmdCwgdGhpcy5fdG9wKTtcclxuXHJcbiAgICAgICAgLy8gRW1pdCBkcmFnTW92ZSBldmVudC5cclxuICAgICAgICB0aGlzLl9nZXRHcmlkKCkuX2VtaXQoZXZlbnREcmFnTW92ZSwgaXRlbSwgdGhpcy5fbGFzdEV2ZW50KTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEcmFnIHNjcm9sbCBoYW5kbGVyLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbURyYWcucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcclxuICAgICAqL1xyXG4gICAgSXRlbURyYWcucHJvdG90eXBlLl9vblNjcm9sbCA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5faXRlbTtcclxuXHJcbiAgICAgICAgLy8gSWYgaXRlbSBpcyBub3QgYWN0aXZlLCByZXNldCBkcmFnLlxyXG4gICAgICAgIGlmICghaXRlbS5faXNBY3RpdmUpIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBsYXN0IHNjcm9sbCBldmVudC5cclxuICAgICAgICB0aGlzLl9sYXN0U2Nyb2xsRXZlbnQgPSBldmVudDtcclxuXHJcbiAgICAgICAgLy8gRG8gc2Nyb2xsIHByZXBhcmUvYXBwbHkgaGFuZGxpbmcgaW4gdGhlIG5leHQgdGljay5cclxuICAgICAgICBhZGRTY3JvbGxUaWNrKGl0ZW0uX2lkLCB0aGlzLl9wcmVwYXJlU2Nyb2xsLCB0aGlzLl9hcHBseVNjcm9sbCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJlcGFyZSBkcmFnZ2VkIGl0ZW0gZm9yIHNjcm9sbGluZy5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQG1lbWJlcm9mIEl0ZW1EcmFnLnByb3RvdHlwZVxyXG4gICAgICovXHJcbiAgICBJdGVtRHJhZy5wcm90b3R5cGUuX3ByZXBhcmVTY3JvbGwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLl9pdGVtO1xyXG5cclxuICAgICAgICAvLyBJZiBpdGVtIGlzIG5vdCBhY3RpdmUgZG8gbm90aGluZy5cclxuICAgICAgICBpZiAoIWl0ZW0uX2lzQWN0aXZlKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBlbGVtZW50ID0gaXRlbS5fZWxlbWVudDtcclxuICAgICAgICB2YXIgZ3JpZCA9IHRoaXMuX2dldEdyaWQoKTtcclxuICAgICAgICB2YXIgc2V0dGluZ3MgPSBncmlkLl9zZXR0aW5ncztcclxuICAgICAgICB2YXIgYXhpcyA9IHNldHRpbmdzLmRyYWdBeGlzO1xyXG4gICAgICAgIHZhciBncmlkQ29udGFpbmVyID0gZ3JpZC5fZWxlbWVudDtcclxuICAgICAgICB2YXIgb2Zmc2V0RGlmZjtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGVsZW1lbnQncyByZWN0IGFuZCB4L3kgZGlmZi5cclxuICAgICAgICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgdmFyIHhEaWZmID0gdGhpcy5fZWxlbWVudENsaWVudFggLSByZWN0LmxlZnQ7XHJcbiAgICAgICAgdmFyIHlEaWZmID0gdGhpcy5fZWxlbWVudENsaWVudFkgLSByZWN0LnRvcDtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGNvbnRhaW5lciBkaWZmLlxyXG4gICAgICAgIGlmICh0aGlzLl9jb250YWluZXIgIT09IGdyaWRDb250YWluZXIpIHtcclxuICAgICAgICAgICAgb2Zmc2V0RGlmZiA9IGdldE9mZnNldERpZmYodGhpcy5fY29udGFpbmluZ0Jsb2NrLCBncmlkQ29udGFpbmVyKTtcclxuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyRGlmZlggPSBvZmZzZXREaWZmLmxlZnQ7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lckRpZmZZID0gb2Zmc2V0RGlmZi50b3A7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBVcGRhdGUgaG9yaXpvbnRhbCBwb3NpdGlvbiBkYXRhLlxyXG4gICAgICAgIGlmIChheGlzICE9PSAneScpIHtcclxuICAgICAgICAgICAgdGhpcy5fbGVmdCArPSB4RGlmZjtcclxuICAgICAgICAgICAgdGhpcy5fZ3JpZFggPSB0aGlzLl9sZWZ0IC0gdGhpcy5fY29udGFpbmVyRGlmZlg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBVcGRhdGUgdmVydGljYWwgcG9zaXRpb24gZGF0YS5cclxuICAgICAgICBpZiAoYXhpcyAhPT0gJ3gnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RvcCArPSB5RGlmZjtcclxuICAgICAgICAgICAgdGhpcy5fZ3JpZFkgPSB0aGlzLl90b3AgLSB0aGlzLl9jb250YWluZXJEaWZmWTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE92ZXJsYXAgaGFuZGxpbmcuXHJcbiAgICAgICAgaWYgKHNldHRpbmdzLmRyYWdTb3J0KSB0aGlzLl9jaGVja092ZXJsYXBEZWJvdW5jZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFwcGx5IHNjcm9sbCB0byBkcmFnZ2VkIGl0ZW0uXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtRHJhZy5wcm90b3R5cGVcclxuICAgICAqL1xyXG4gICAgSXRlbURyYWcucHJvdG90eXBlLl9hcHBseVNjcm9sbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2l0ZW07XHJcblxyXG4gICAgICAgIC8vIElmIGl0ZW0gaXMgbm90IGFjdGl2ZSBkbyBub3RoaW5nLlxyXG4gICAgICAgIGlmICghaXRlbS5faXNBY3RpdmUpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGVsZW1lbnQncyB0cmFuc2xhdGVYL1kgdmFsdWVzLlxyXG4gICAgICAgIGl0ZW0uX2VsZW1lbnQuc3R5bGVbdHJhbnNmb3JtUHJvcF0gPSBnZXRUcmFuc2xhdGVTdHJpbmcodGhpcy5fbGVmdCwgdGhpcy5fdG9wKTtcclxuXHJcbiAgICAgICAgLy8gRW1pdCBkcmFnU2Nyb2xsIGV2ZW50LlxyXG4gICAgICAgIHRoaXMuX2dldEdyaWQoKS5fZW1pdChldmVudERyYWdTY3JvbGwsIGl0ZW0sIHRoaXMuX2xhc3RTY3JvbGxFdmVudCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRHJhZyBlbmQgaGFuZGxlci5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQG1lbWJlcm9mIEl0ZW1EcmFnLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XHJcbiAgICAgKi9cclxuICAgIEl0ZW1EcmFnLnByb3RvdHlwZS5fb25FbmQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2l0ZW07XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBpdGVtLl9lbGVtZW50O1xyXG4gICAgICAgIHZhciBncmlkID0gdGhpcy5fZ2V0R3JpZCgpO1xyXG4gICAgICAgIHZhciBzZXR0aW5ncyA9IGdyaWQuX3NldHRpbmdzO1xyXG4gICAgICAgIHZhciByZWxlYXNlID0gaXRlbS5fcmVsZWFzZTtcclxuXHJcbiAgICAgICAgLy8gSWYgaXRlbSBpcyBub3QgYWN0aXZlLCByZXNldCBkcmFnLlxyXG4gICAgICAgIGlmICghaXRlbS5faXNBY3RpdmUpIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENhbmNlbCBxdWV1ZWQgbW92ZSBhbmQgc2Nyb2xsIHRpY2tzLlxyXG4gICAgICAgIGNhbmNlbE1vdmVUaWNrKGl0ZW0uX2lkKTtcclxuICAgICAgICBjYW5jZWxTY3JvbGxUaWNrKGl0ZW0uX2lkKTtcclxuXHJcbiAgICAgICAgLy8gRmluaXNoIGN1cnJlbnRseSBxdWV1ZWQgb3ZlcmxhcCBjaGVjay5cclxuICAgICAgICBzZXR0aW5ncy5kcmFnU29ydCAmJiB0aGlzLl9jaGVja092ZXJsYXBEZWJvdW5jZSgnZmluaXNoJyk7XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBzY3JvbGwgbGlzdGVuZXJzLlxyXG4gICAgICAgIHRoaXMuX3VuYmluZFNjcm9sbExpc3RlbmVycygpO1xyXG5cclxuICAgICAgICAvLyBTZXR1cCByZWxlYXNlIGRhdGEuXHJcbiAgICAgICAgcmVsZWFzZS5fY29udGFpbmVyRGlmZlggPSB0aGlzLl9jb250YWluZXJEaWZmWDtcclxuICAgICAgICByZWxlYXNlLl9jb250YWluZXJEaWZmWSA9IHRoaXMuX2NvbnRhaW5lckRpZmZZO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBkcmFnIGRhdGEuXHJcbiAgICAgICAgdGhpcy5fcmVzZXQoKTtcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGRyYWcgY2xhc3MgbmFtZSBmcm9tIGVsZW1lbnQuXHJcbiAgICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgc2V0dGluZ3MuaXRlbURyYWdnaW5nQ2xhc3MpO1xyXG5cclxuICAgICAgICAvLyBFbWl0IGRyYWdFbmQgZXZlbnQuXHJcbiAgICAgICAgZ3JpZC5fZW1pdChldmVudERyYWdFbmQsIGl0ZW0sIGV2ZW50KTtcclxuXHJcbiAgICAgICAgLy8gRmluaXNoIHVwIHRoZSBtaWdyYXRpb24gcHJvY2VzcyBvciBzdGFydCB0aGUgcmVsZWFzZSBwcm9jZXNzLlxyXG4gICAgICAgIHRoaXMuX2lzTWlncmF0aW5nID8gdGhpcy5fZmluaXNoTWlncmF0aW9uKCkgOiByZWxlYXNlLnN0YXJ0KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJpdmF0ZSBoZWxwZXJzXHJcbiAgICAgKiAqKioqKioqKioqKioqKipcclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJldmVudCBkZWZhdWx0LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0KGUpIHtcclxuICAgICAgICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIGhvdyBtYW55IHBlcmNlbnQgdGhlIGludGVyc2VjdGlvbiBhcmVhIG9mIHR3byByZWN0YW5nbGVzIGlzIGZyb21cclxuICAgICAqIHRoZSBtYXhpbXVtIHBvdGVudGlhbCBpbnRlcnNlY3Rpb24gYXJlYSBiZXR3ZWVuIHRoZSByZWN0YW5nbGVzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7UmVjdGFuZ2xlfSBhXHJcbiAgICAgKiBAcGFyYW0ge1JlY3RhbmdsZX0gYlxyXG4gICAgICogQHJldHVybnMge051bWJlcn1cclxuICAgICAqICAgLSBBIG51bWJlciBiZXR3ZWVuIDAtMTAwLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXRSZWN0T3ZlcmxhcFNjb3JlKGEsIGIpIHtcclxuICAgICAgICAvLyBSZXR1cm4gMCBpbW1lZGlhdGVseSBpZiB0aGUgcmVjdGFuZ2xlcyBkbyBub3Qgb3ZlcmxhcC5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIGEubGVmdCArIGEud2lkdGggPD0gYi5sZWZ0IHx8XHJcbiAgICAgICAgICAgIGIubGVmdCArIGIud2lkdGggPD0gYS5sZWZ0IHx8XHJcbiAgICAgICAgICAgIGEudG9wICsgYS5oZWlnaHQgPD0gYi50b3AgfHxcclxuICAgICAgICAgICAgYi50b3AgKyBiLmhlaWdodCA8PSBhLnRvcFxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBpbnRlcnNlY3Rpb24gYXJlYSdzIHdpZHRoLCBoZWlnaHQsIG1heCBoZWlnaHQgYW5kIG1heCB3aWR0aC5cclxuICAgICAgICB2YXIgd2lkdGggPSBNYXRoLm1pbihhLmxlZnQgKyBhLndpZHRoLCBiLmxlZnQgKyBiLndpZHRoKSAtIE1hdGgubWF4KGEubGVmdCwgYi5sZWZ0KTtcclxuICAgICAgICB2YXIgaGVpZ2h0ID0gTWF0aC5taW4oYS50b3AgKyBhLmhlaWdodCwgYi50b3AgKyBiLmhlaWdodCkgLSBNYXRoLm1heChhLnRvcCwgYi50b3ApO1xyXG4gICAgICAgIHZhciBtYXhXaWR0aCA9IE1hdGgubWluKGEud2lkdGgsIGIud2lkdGgpO1xyXG4gICAgICAgIHZhciBtYXhIZWlnaHQgPSBNYXRoLm1pbihhLmhlaWdodCwgYi5oZWlnaHQpO1xyXG5cclxuICAgICAgICByZXR1cm4gKCh3aWR0aCAqIGhlaWdodCkgLyAobWF4V2lkdGggKiBtYXhIZWlnaHQpKSAqIDEwMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBlbGVtZW50J3Mgc2Nyb2xsIHBhcmVudHMuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtBcnJheX0gW2RhdGFdXHJcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnRbXX1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2V0U2Nyb2xsUGFyZW50cyhlbGVtZW50LCBkYXRhKSB7XHJcbiAgICAgICAgdmFyIHJldCA9IGRhdGEgfHwgW107XHJcbiAgICAgICAgdmFyIHBhcmVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuXHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyBJZiB0cmFuc2Zvcm1lZCBlbGVtZW50cyBsZWFrIGZpeGVkIGVsZW1lbnRzLlxyXG4gICAgICAgIC8vXHJcblxyXG4gICAgICAgIGlmIChoYXNUcmFuc2Zvcm1MZWFrKSB7XHJcbiAgICAgICAgICAgIC8vIElmIHRoZSBlbGVtZW50IGlzIGZpeGVkIGl0IGNhbiBub3QgaGF2ZSBhbnkgc2Nyb2xsIHBhcmVudHMuXHJcbiAgICAgICAgICAgIGlmIChnZXRTdHlsZShlbGVtZW50LCAncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJykgcmV0dXJuIHJldDtcclxuXHJcbiAgICAgICAgICAgIC8vIEZpbmQgc2Nyb2xsIHBhcmVudHMuXHJcbiAgICAgICAgICAgIHdoaWxlIChwYXJlbnQgJiYgcGFyZW50ICE9PSBkb2N1bWVudCAmJiBwYXJlbnQgIT09IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzU2Nyb2xsYWJsZShwYXJlbnQpKSByZXQucHVzaChwYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gZ2V0U3R5bGUocGFyZW50LCAncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJyA/IG51bGwgOiBwYXJlbnQucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgcGFyZW50IGlzIG5vdCBmaXhlZCBlbGVtZW50LCBhZGQgd2luZG93IG9iamVjdCBhcyB0aGUgbGFzdCBzY3JvbGxcclxuICAgICAgICAgICAgLy8gcGFyZW50LlxyXG4gICAgICAgICAgICBwYXJlbnQgIT09IG51bGwgJiYgcmV0LnB1c2god2luZG93KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJldDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gSWYgZml4ZWQgZWxlbWVudHMgYmVoYXZlIGFzIGRlZmluZWQgaW4gdGhlIFczQyBzcGVjaWZpY2F0aW9uLlxyXG4gICAgICAgIC8vXHJcblxyXG4gICAgICAgIC8vIEZpbmQgc2Nyb2xsIHBhcmVudHMuXHJcbiAgICAgICAgd2hpbGUgKHBhcmVudCAmJiBwYXJlbnQgIT09IGRvY3VtZW50KSB7XHJcbiAgICAgICAgICAgIC8vIElmIHRoZSBjdXJyZW50bHkgbG9vcGVkIGVsZW1lbnQgaXMgZml4ZWQgaWdub3JlIGFsbCBwYXJlbnRzIHRoYXQgYXJlXHJcbiAgICAgICAgICAgIC8vIG5vdCB0cmFuc2Zvcm1lZC5cclxuICAgICAgICAgICAgaWYgKGdldFN0eWxlKGVsZW1lbnQsICdwb3NpdGlvbicpID09PSAnZml4ZWQnICYmICFpc1RyYW5zZm9ybWVkKHBhcmVudCkpIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgcGFyZW50IGVsZW1lbnQgdG8gcmV0dXJuIGl0ZW1zIGlmIGl0IGlzIHNjcm9sbGFibGUuXHJcbiAgICAgICAgICAgIGlmIChpc1Njcm9sbGFibGUocGFyZW50KSkgcmV0LnB1c2gocGFyZW50KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSBlbGVtZW50IGFuZCBwYXJlbnQgcmVmZXJlbmNlcy5cclxuICAgICAgICAgICAgZWxlbWVudCA9IHBhcmVudDtcclxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiB0aGUgbGFzdCBpdGVtIGlzIHRoZSByb290IGVsZW1lbnQsIHJlcGxhY2UgaXQgd2l0aCB3aW5kb3cuIFRoZSByb290XHJcbiAgICAgICAgLy8gZWxlbWVudCBzY3JvbGwgaXMgcHJvcGFnYXRlZCB0byB0aGUgd2luZG93LlxyXG4gICAgICAgIGlmIChyZXRbcmV0Lmxlbmd0aCAtIDFdID09PSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0W3JldC5sZW5ndGggLSAxXSA9IHdpbmRvdztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCB3aW5kb3cgYXMgdGhlIGxhc3Qgc2Nyb2xsIHBhcmVudC5cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0LnB1c2god2luZG93KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayBpZiBhbiBlbGVtZW50IGlzIHNjcm9sbGFibGUuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGlzU2Nyb2xsYWJsZShlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyIG92ZXJmbG93ID0gZ2V0U3R5bGUoZWxlbWVudCwgJ292ZXJmbG93Jyk7XHJcbiAgICAgICAgaWYgKG92ZXJmbG93ID09PSAnYXV0bycgfHwgb3ZlcmZsb3cgPT09ICdzY3JvbGwnKSByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgICAgb3ZlcmZsb3cgPSBnZXRTdHlsZShlbGVtZW50LCAnb3ZlcmZsb3cteCcpO1xyXG4gICAgICAgIGlmIChvdmVyZmxvdyA9PT0gJ2F1dG8nIHx8IG92ZXJmbG93ID09PSAnc2Nyb2xsJykgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAgIG92ZXJmbG93ID0gZ2V0U3R5bGUoZWxlbWVudCwgJ292ZXJmbG93LXknKTtcclxuICAgICAgICBpZiAob3ZlcmZsb3cgPT09ICdhdXRvJyB8fCBvdmVyZmxvdyA9PT0gJ3Njcm9sbCcpIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayBpZiBkcmFnIGdlc3R1cmUgY2FuIGJlIGludGVycHJldGVkIGFzIGEgY2xpY2ssIGJhc2VkIG9uIGZpbmFsIGRyYWdcclxuICAgICAqIGV2ZW50IGRhdGEuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRcclxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpc0NsaWNrKGV2ZW50KSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKGV2ZW50LmRlbHRhWCkgPCAyICYmIE1hdGguYWJzKGV2ZW50LmRlbHRhWSkgPCAyICYmIGV2ZW50LmRlbHRhVGltZSA8IDIwMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGlmIGFuIGVsZW1lbnQgaXMgYW4gYW5jaG9yIGVsZW1lbnQgYW5kIG9wZW4gdGhlIGhyZWYgdXJsIGlmIHBvc3NpYmxlLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gb3BlbkFuY2hvckhyZWYoZWxlbWVudCkge1xyXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgZWxlbWVudCBpcyBhbmNob3IgZWxlbWVudC5cclxuICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09ICdhJykgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBHZXQgaHJlZiBhbmQgbWFrZSBzdXJlIGl0IGV4aXN0cy5cclxuICAgICAgICB2YXIgaHJlZiA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJyk7XHJcbiAgICAgICAgaWYgKCFocmVmKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIEZpbmFsbHkgbGV0J3MgbmF2aWdhdGUgdG8gdGhlIGxpbmsgaHJlZi5cclxuICAgICAgICB2YXIgdGFyZ2V0ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpO1xyXG4gICAgICAgIGlmICh0YXJnZXQgJiYgdGFyZ2V0ICE9PSAnX3NlbGYnKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5vcGVuKGhyZWYsIHRhcmdldCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBocmVmO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERldGVjdHMgaWYgdHJhbnNmb3JtZWQgZWxlbWVudHMgbGVhayBmaXhlZCBlbGVtZW50cy4gQWNjb3JkaW5nIFczQ1xyXG4gICAgICogdHJhbnNmb3JtIHJlbmRlcmluZyBzcGVjIGEgdHJhbnNmb3JtZWQgZWxlbWVudCBzaG91bGQgY29udGFpbiBldmVuIGZpeGVkXHJcbiAgICAgKiBlbGVtZW50cy4gTWVhbmluZyB0aGF0IGZpeGVkIGVsZW1lbnRzIGFyZSBwb3NpdGlvbmVkIHJlbGF0aXZlIHRvIHRoZVxyXG4gICAgICogY2xvc2VzdCB0cmFuc2Zvcm1lZCBhbmNlc3RvciBlbGVtZW50IGluc3RlYWQgb2Ygd2luZG93LiBIb3dldmVyLCBub3QgZXZlcnlcclxuICAgICAqIGJyb3dzZXIgZm9sbG93cyB0aGUgc3BlYyAoSUUgYW5kIG9sZGVyIEZpcmVmb3gpLiBTbyB3ZSBuZWVkIHRvIHRlc3QgaXQuXHJcbiAgICAgKiBodHRwczovL3d3dy53My5vcmcvVFIvY3NzMy0yZC10cmFuc2Zvcm1zLyN0cmFuc2Zvcm0tcmVuZGVyaW5nXHJcbiAgICAgKlxyXG4gICAgICogQm9ycm93ZWQgZnJvbSBNZXpyICh2MC42LjEpOlxyXG4gICAgICogaHR0cHM6Ly9naXRodWIuY29tL25pa2xhc3JhbW8vbWV6ci9ibG9iLzAuNi4xL21lenIuanMjTDYwN1xyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBjaGVja1RyYW5zZm9ybUxlYWsoKSB7XHJcbiAgICAgICAgLy8gTm8gdHJhbnNmb3JtcyAtPiBkZWZpbml0ZWx5IGxlYWtzLlxyXG4gICAgICAgIGlmICghaXNUcmFuc2Zvcm1TdXBwb3J0ZWQpIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgICAvLyBObyBib2R5IGF2YWlsYWJsZSAtPiBjYW4ndCBjaGVjayBpdC5cclxuICAgICAgICBpZiAoIWRvY3VtZW50LmJvZHkpIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICAvLyBEbyB0aGUgdGVzdC5cclxuICAgICAgICB2YXIgZWxlbXMgPSBbMCwgMV0ubWFwKGZ1bmN0aW9uIChlbGVtLCBpc0lubmVyKSB7XHJcbiAgICAgICAgICAgIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgZWxlbS5zdHlsZS5wb3NpdGlvbiA9IGlzSW5uZXIgPyAnZml4ZWQnIDogJ2Fic29sdXRlJztcclxuICAgICAgICAgICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICAgICAgZWxlbS5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XHJcbiAgICAgICAgICAgIGVsZW0uc3R5bGUubGVmdCA9IGlzSW5uZXIgPyAnMHB4JyA6ICcxcHgnO1xyXG4gICAgICAgICAgICBlbGVtLnN0eWxlW3RyYW5zZm9ybVByb3BdID0gJ25vbmUnO1xyXG4gICAgICAgICAgICByZXR1cm4gZWxlbTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgb3V0ZXIgPSBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsZW1zWzBdKTtcclxuICAgICAgICB2YXIgaW5uZXIgPSBvdXRlci5hcHBlbmRDaGlsZChlbGVtc1sxXSk7XHJcbiAgICAgICAgdmFyIGxlZnQgPSBpbm5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG4gICAgICAgIG91dGVyLnN0eWxlW3RyYW5zZm9ybVByb3BdID0gJ3NjYWxlKDEpJztcclxuICAgICAgICB2YXIgcmV0ID0gbGVmdCA9PT0gaW5uZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG91dGVyKTtcclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUXVldWUgY29uc3RydWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICogQGNsYXNzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIFF1ZXVlKCkge1xyXG4gICAgICAgIHRoaXMuX3F1ZXVlID0gW107XHJcbiAgICAgICAgdGhpcy5faXNEZXN0cm95ZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFB1YmxpYyBwcm90b3R5cGUgbWV0aG9kc1xyXG4gICAgICogKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBjYWxsYmFjayB0byB0aGUgcXVldWUuXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIFF1ZXVlLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcclxuICAgICAqIEByZXR1cm5zIHtRdWV1ZX1cclxuICAgICAqL1xyXG4gICAgUXVldWUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgdGhpcy5fcXVldWUucHVzaChjYWxsYmFjayk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJvY2VzcyBxdWV1ZSBjYWxsYmFja3MgYW5kIHJlc2V0IHRoZSBxdWV1ZS5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgUXVldWUucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0geyp9IGFyZzFcclxuICAgICAqIEBwYXJhbSB7Kn0gYXJnMlxyXG4gICAgICogQHJldHVybnMge1F1ZXVlfVxyXG4gICAgICovXHJcbiAgICBRdWV1ZS5wcm90b3R5cGUuZmx1c2ggPSBmdW5jdGlvbiAoYXJnMSwgYXJnMikge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgICAgIHZhciBxdWV1ZSA9IHRoaXMuX3F1ZXVlO1xyXG4gICAgICAgIHZhciBsZW5ndGggPSBxdWV1ZS5sZW5ndGg7XHJcbiAgICAgICAgdmFyIGk7XHJcblxyXG4gICAgICAgIC8vIFF1aXQgZWFybHkgaWYgdGhlIHF1ZXVlIGlzIGVtcHR5LlxyXG4gICAgICAgIGlmICghbGVuZ3RoKSByZXR1cm4gdGhpcztcclxuXHJcbiAgICAgICAgdmFyIHNpbmdsZUNhbGxiYWNrID0gbGVuZ3RoID09PSAxO1xyXG4gICAgICAgIHZhciBzbmFwc2hvdCA9IHNpbmdsZUNhbGxiYWNrID8gcXVldWVbMF0gOiBxdWV1ZS5zbGljZSgwKTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgcXVldWUuXHJcbiAgICAgICAgcXVldWUubGVuZ3RoID0gMDtcclxuXHJcbiAgICAgICAgLy8gSWYgd2Ugb25seSBoYXZlIGEgc2luZ2xlIGNhbGxiYWNrIGxldCdzIGp1c3QgY2FsbCBpdC5cclxuICAgICAgICBpZiAoc2luZ2xlQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgc25hcHNob3QoYXJnMSwgYXJnMik7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBtdWx0aXBsZSBjYWxsYmFja3MsIGxldCdzIHByb2Nlc3MgdGhlbS5cclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgc25hcHNob3RbaV0oYXJnMSwgYXJnMik7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXN0cm95IFF1ZXVlIGluc3RhbmNlLlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBRdWV1ZS5wcm90b3R5cGVcclxuICAgICAqIEByZXR1cm5zIHtRdWV1ZX1cclxuICAgICAqL1xyXG4gICAgUXVldWUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSByZXR1cm4gdGhpcztcclxuXHJcbiAgICAgICAgdGhpcy5faXNEZXN0cm95ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX3F1ZXVlLmxlbmd0aCA9IDA7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIExheW91dCBtYW5hZ2VyIGZvciBJdGVtIGluc3RhbmNlLlxyXG4gICAgICpcclxuICAgICAqIEBjbGFzc1xyXG4gICAgICogQHBhcmFtIHtJdGVtfSBpdGVtXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIEl0ZW1MYXlvdXQoaXRlbSkge1xyXG4gICAgICAgIHRoaXMuX2l0ZW0gPSBpdGVtO1xyXG4gICAgICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5faXNEZXN0cm95ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pc0ludGVycnVwdGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudFN0eWxlcyA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3RhcmdldFN0eWxlcyA9IHt9O1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnRMZWZ0ID0gMDtcclxuICAgICAgICB0aGlzLl9jdXJyZW50VG9wID0gMDtcclxuICAgICAgICB0aGlzLl9vZmZzZXRMZWZ0ID0gMDtcclxuICAgICAgICB0aGlzLl9vZmZzZXRUb3AgPSAwO1xyXG4gICAgICAgIHRoaXMuX3NraXBOZXh0QW5pbWF0aW9uID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fYW5pbWF0ZU9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIG9uRmluaXNoOiB0aGlzLl9maW5pc2guYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5fcXVldWUgPSBuZXcgUXVldWUoKTtcclxuXHJcbiAgICAgICAgLy8gQmluZCBhbmltYXRpb24gaGFuZGxlcnMgYW5kIGZpbmlzaCBtZXRob2QuXHJcbiAgICAgICAgdGhpcy5fc2V0dXBBbmltYXRpb24gPSB0aGlzLl9zZXR1cEFuaW1hdGlvbi5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3N0YXJ0QW5pbWF0aW9uID0gdGhpcy5fc3RhcnRBbmltYXRpb24uYmluZCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFB1YmxpYyBwcm90b3R5cGUgbWV0aG9kc1xyXG4gICAgICogKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0IGl0ZW0gbGF5b3V0IGJhc2VkIG9uIGl0J3MgY3VycmVudCBkYXRhLlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtTGF5b3V0LnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbaW5zdGFudD1mYWxzZV1cclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtvbkZpbmlzaF1cclxuICAgICAqIEByZXR1cm5zIHtJdGVtTGF5b3V0fVxyXG4gICAgICovXHJcbiAgICBJdGVtTGF5b3V0LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uIChpbnN0YW50LCBvbkZpbmlzaCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2l0ZW07XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBpdGVtLl9lbGVtZW50O1xyXG4gICAgICAgIHZhciByZWxlYXNlID0gaXRlbS5fcmVsZWFzZTtcclxuICAgICAgICB2YXIgZ3JpZFNldHRpbmdzID0gaXRlbS5nZXRHcmlkKCkuX3NldHRpbmdzO1xyXG4gICAgICAgIHZhciBpc1Bvc2l0aW9uaW5nID0gdGhpcy5faXNBY3RpdmU7XHJcbiAgICAgICAgdmFyIGlzSnVzdFJlbGVhc2VkID0gcmVsZWFzZS5faXNBY3RpdmUgJiYgcmVsZWFzZS5faXNQb3NpdGlvbmluZ1N0YXJ0ZWQgPT09IGZhbHNlO1xyXG4gICAgICAgIHZhciBhbmltRHVyYXRpb24gPSBpc0p1c3RSZWxlYXNlZFxyXG4gICAgICAgICAgICA/IGdyaWRTZXR0aW5ncy5kcmFnUmVsZWFzZUR1cmF0aW9uXHJcbiAgICAgICAgICAgIDogZ3JpZFNldHRpbmdzLmxheW91dER1cmF0aW9uO1xyXG4gICAgICAgIHZhciBhbmltRWFzaW5nID0gaXNKdXN0UmVsZWFzZWQgPyBncmlkU2V0dGluZ3MuZHJhZ1JlbGVhc2VFYXNpbmcgOiBncmlkU2V0dGluZ3MubGF5b3V0RWFzaW5nO1xyXG4gICAgICAgIHZhciBhbmltRW5hYmxlZCA9ICFpbnN0YW50ICYmICF0aGlzLl9za2lwTmV4dEFuaW1hdGlvbiAmJiBhbmltRHVyYXRpb24gPiAwO1xyXG4gICAgICAgIHZhciBpc0FuaW1hdGluZztcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIGl0ZW0gaXMgY3VycmVudGx5IHBvc2l0aW9uaW5nIHByb2Nlc3MgY3VycmVudCBsYXlvdXQgY2FsbGJhY2tcclxuICAgICAgICAvLyBxdWV1ZSB3aXRoIGludGVycnVwdGVkIGZsYWcgb24uXHJcbiAgICAgICAgaWYgKGlzUG9zaXRpb25pbmcpIHRoaXMuX3F1ZXVlLmZsdXNoKHRydWUsIGl0ZW0pO1xyXG5cclxuICAgICAgICAvLyBNYXJrIHJlbGVhc2UgcG9zaXRpb25pbmcgYXMgc3RhcnRlZC5cclxuICAgICAgICBpZiAoaXNKdXN0UmVsZWFzZWQpIHJlbGVhc2UuX2lzUG9zaXRpb25pbmdTdGFydGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gUHVzaCB0aGUgY2FsbGJhY2sgdG8gdGhlIGNhbGxiYWNrIHF1ZXVlLlxyXG4gICAgICAgIGlmICh0eXBlb2Ygb25GaW5pc2ggPT09ICdmdW5jdGlvbicpIHRoaXMuX3F1ZXVlLmFkZChvbkZpbmlzaCk7XHJcblxyXG4gICAgICAgIC8vIElmIG5vIGFuaW1hdGlvbnMgYXJlIG5lZWRlZCwgZWFzeSBwZWFzeSFcclxuICAgICAgICBpZiAoIWFuaW1FbmFibGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZU9mZnNldHMoKTtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlVGFyZ2V0U3R5bGVzKCk7XHJcbiAgICAgICAgICAgIGlzUG9zaXRpb25pbmcgJiYgY2FuY2VsTGF5b3V0VGljayhpdGVtLl9pZCk7XHJcbiAgICAgICAgICAgIGlzQW5pbWF0aW5nID0gaXRlbS5fYW5pbWF0ZS5pc0FuaW1hdGluZygpO1xyXG4gICAgICAgICAgICB0aGlzLnN0b3AoZmFsc2UsIHRoaXMuX3RhcmdldFN0eWxlcyk7XHJcbiAgICAgICAgICAgICFpc0FuaW1hdGluZyAmJiBzZXRTdHlsZXMoZWxlbWVudCwgdGhpcy5fdGFyZ2V0U3R5bGVzKTtcclxuICAgICAgICAgICAgdGhpcy5fc2tpcE5leHRBbmltYXRpb24gPSBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbmlzaCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2V0IGl0ZW0gYWN0aXZlIGFuZCBzdG9yZSBzb21lIGRhdGEgZm9yIHRoZSBhbmltYXRpb24gdGhhdCBpcyBhYm91dCB0byBiZVxyXG4gICAgICAgIC8vIHRyaWdnZXJlZC5cclxuICAgICAgICB0aGlzLl9pc0FjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fYW5pbWF0ZU9wdGlvbnMuZWFzaW5nID0gYW5pbUVhc2luZztcclxuICAgICAgICB0aGlzLl9hbmltYXRlT3B0aW9ucy5kdXJhdGlvbiA9IGFuaW1EdXJhdGlvbjtcclxuICAgICAgICB0aGlzLl9pc0ludGVycnVwdGVkID0gaXNQb3NpdGlvbmluZztcclxuXHJcbiAgICAgICAgLy8gU3RhcnQgdGhlIGl0ZW0ncyBsYXlvdXQgYW5pbWF0aW9uIGluIHRoZSBuZXh0IHRpY2suXHJcbiAgICAgICAgYWRkTGF5b3V0VGljayhpdGVtLl9pZCwgdGhpcy5fc2V0dXBBbmltYXRpb24sIHRoaXMuX3N0YXJ0QW5pbWF0aW9uKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RvcCBpdGVtJ3MgcG9zaXRpb24gYW5pbWF0aW9uIGlmIGl0IGlzIGN1cnJlbnRseSBhbmltYXRpbmcuXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEl0ZW1MYXlvdXQucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtwcm9jZXNzQ2FsbGJhY2tRdWV1ZT1mYWxzZV1cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbdGFyZ2V0U3R5bGVzXVxyXG4gICAgICogQHJldHVybnMge0l0ZW1MYXlvdXR9XHJcbiAgICAgKi9cclxuICAgIEl0ZW1MYXlvdXQucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAocHJvY2Vzc0NhbGxiYWNrUXVldWUsIHRhcmdldFN0eWxlcykge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCB8fCAhdGhpcy5faXNBY3RpdmUpIHJldHVybiB0aGlzO1xyXG5cclxuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2l0ZW07XHJcblxyXG4gICAgICAgIC8vIENhbmNlbCBhbmltYXRpb24gaW5pdC5cclxuICAgICAgICBjYW5jZWxMYXlvdXRUaWNrKGl0ZW0uX2lkKTtcclxuXHJcbiAgICAgICAgLy8gU3RvcCBhbmltYXRpb24uXHJcbiAgICAgICAgaXRlbS5fYW5pbWF0ZS5zdG9wKHRhcmdldFN0eWxlcyk7XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBwb3NpdGlvbmluZyBjbGFzcy5cclxuICAgICAgICByZW1vdmVDbGFzcyhpdGVtLl9lbGVtZW50LCBpdGVtLmdldEdyaWQoKS5fc2V0dGluZ3MuaXRlbVBvc2l0aW9uaW5nQ2xhc3MpO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBhY3RpdmUgc3RhdGUuXHJcbiAgICAgICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gUHJvY2VzcyBjYWxsYmFjayBxdWV1ZSBpZiBuZWVkZWQuXHJcbiAgICAgICAgaWYgKHByb2Nlc3NDYWxsYmFja1F1ZXVlKSB0aGlzLl9xdWV1ZS5mbHVzaCh0cnVlLCBpdGVtKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVzdHJveSB0aGUgaW5zdGFuY2UgYW5kIHN0b3AgY3VycmVudCBhbmltYXRpb24gaWYgaXQgaXMgcnVubmluZy5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbUxheW91dC5wcm90b3R5cGVcclxuICAgICAqIEByZXR1cm5zIHtJdGVtTGF5b3V0fVxyXG4gICAgICovXHJcbiAgICBJdGVtTGF5b3V0LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgdGhpcy5zdG9wKHRydWUsIHt9KTtcclxuICAgICAgICB0aGlzLl9xdWV1ZS5kZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy5faXRlbSA9IHRoaXMuX2N1cnJlbnRTdHlsZXMgPSB0aGlzLl90YXJnZXRTdHlsZXMgPSB0aGlzLl9hbmltYXRlT3B0aW9ucyA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5faXNEZXN0cm95ZWQgPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFByaXZhdGUgcHJvdG90eXBlIG1ldGhvZHNcclxuICAgICAqICoqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIGFuZCB1cGRhdGUgaXRlbSdzIGN1cnJlbnQgbGF5b3V0IG9mZnNldCBkYXRhLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbUxheW91dC5wcm90b3R5cGVcclxuICAgICAqL1xyXG4gICAgSXRlbUxheW91dC5wcm90b3R5cGUuX3VwZGF0ZU9mZnNldHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5faXRlbTtcclxuICAgICAgICB2YXIgbWlncmF0ZSA9IGl0ZW0uX21pZ3JhdGU7XHJcbiAgICAgICAgdmFyIHJlbGVhc2UgPSBpdGVtLl9yZWxlYXNlO1xyXG5cclxuICAgICAgICB0aGlzLl9vZmZzZXRMZWZ0ID0gcmVsZWFzZS5faXNBY3RpdmVcclxuICAgICAgICAgICAgPyByZWxlYXNlLl9jb250YWluZXJEaWZmWFxyXG4gICAgICAgICAgICA6IG1pZ3JhdGUuX2lzQWN0aXZlXHJcbiAgICAgICAgICAgICAgICA/IG1pZ3JhdGUuX2NvbnRhaW5lckRpZmZYXHJcbiAgICAgICAgICAgICAgICA6IDA7XHJcblxyXG4gICAgICAgIHRoaXMuX29mZnNldFRvcCA9IHJlbGVhc2UuX2lzQWN0aXZlXHJcbiAgICAgICAgICAgID8gcmVsZWFzZS5fY29udGFpbmVyRGlmZllcclxuICAgICAgICAgICAgOiBtaWdyYXRlLl9pc0FjdGl2ZVxyXG4gICAgICAgICAgICAgICAgPyBtaWdyYXRlLl9jb250YWluZXJEaWZmWVxyXG4gICAgICAgICAgICAgICAgOiAwO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSBhbmQgdXBkYXRlIGl0ZW0ncyBsYXlvdXQgdGFyZ2V0IHN0eWxlcy5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQG1lbWJlcm9mIEl0ZW1MYXlvdXQucHJvdG90eXBlXHJcbiAgICAgKi9cclxuICAgIEl0ZW1MYXlvdXQucHJvdG90eXBlLl91cGRhdGVUYXJnZXRTdHlsZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5faXRlbTtcclxuXHJcbiAgICAgICAgdGhpcy5fdGFyZ2V0U3R5bGVzLnRyYW5zZm9ybSA9IGdldFRyYW5zbGF0ZVN0cmluZyhcclxuICAgICAgICAgICAgaXRlbS5fbGVmdCArIHRoaXMuX29mZnNldExlZnQsXHJcbiAgICAgICAgICAgIGl0ZW0uX3RvcCArIHRoaXMuX29mZnNldFRvcFxyXG4gICAgICAgICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluaXNoIGl0ZW0gbGF5b3V0IHByb2NlZHVyZS5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQG1lbWJlcm9mIEl0ZW1MYXlvdXQucHJvdG90eXBlXHJcbiAgICAgKi9cclxuICAgIEl0ZW1MYXlvdXQucHJvdG90eXBlLl9maW5pc2ggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5faXRlbTtcclxuICAgICAgICB2YXIgbWlncmF0ZSA9IGl0ZW0uX21pZ3JhdGU7XHJcbiAgICAgICAgdmFyIHJlbGVhc2UgPSBpdGVtLl9yZWxlYXNlO1xyXG5cclxuICAgICAgICAvLyBNYXJrIHRoZSBpdGVtIGFzIGluYWN0aXZlIGFuZCByZW1vdmUgcG9zaXRpb25pbmcgY2xhc3Nlcy5cclxuICAgICAgICBpZiAodGhpcy5faXNBY3RpdmUpIHtcclxuICAgICAgICAgICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgcmVtb3ZlQ2xhc3MoaXRlbS5fZWxlbWVudCwgaXRlbS5nZXRHcmlkKCkuX3NldHRpbmdzLml0ZW1Qb3NpdGlvbmluZ0NsYXNzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEZpbmlzaCB1cCByZWxlYXNlIGFuZCBtaWdyYXRpb24uXHJcbiAgICAgICAgaWYgKHJlbGVhc2UuX2lzQWN0aXZlKSByZWxlYXNlLnN0b3AoKTtcclxuICAgICAgICBpZiAobWlncmF0ZS5faXNBY3RpdmUpIG1pZ3JhdGUuc3RvcCgpO1xyXG5cclxuICAgICAgICAvLyBQcm9jZXNzIHRoZSBjYWxsYmFjayBxdWV1ZS5cclxuICAgICAgICB0aGlzLl9xdWV1ZS5mbHVzaChmYWxzZSwgaXRlbSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJlcGFyZSBpdGVtIGZvciBsYXlvdXQgYW5pbWF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbUxheW91dC5wcm90b3R5cGVcclxuICAgICAqL1xyXG4gICAgSXRlbUxheW91dC5wcm90b3R5cGUuX3NldHVwQW5pbWF0aW9uID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5faXRlbS5fZWxlbWVudDtcclxuICAgICAgICB2YXIgdHJhbnNsYXRlID0gZ2V0VHJhbnNsYXRlKGVsZW1lbnQpO1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnRMZWZ0ID0gdHJhbnNsYXRlLng7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudFRvcCA9IHRyYW5zbGF0ZS55O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0IGxheW91dCBhbmltYXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtTGF5b3V0LnByb3RvdHlwZVxyXG4gICAgICovXHJcbiAgICBJdGVtTGF5b3V0LnByb3RvdHlwZS5fc3RhcnRBbmltYXRpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLl9pdGVtO1xyXG4gICAgICAgIHZhciBlbGVtZW50ID0gaXRlbS5fZWxlbWVudDtcclxuICAgICAgICB2YXIgZ3JpZCA9IGl0ZW0uZ2V0R3JpZCgpO1xyXG4gICAgICAgIHZhciBzZXR0aW5ncyA9IGdyaWQuX3NldHRpbmdzO1xyXG5cclxuICAgICAgICAvLyBMZXQncyB1cGRhdGUgdGhlIG9mZnNldCBkYXRhIGFuZCB0YXJnZXQgc3R5bGVzLlxyXG4gICAgICAgIHRoaXMuX3VwZGF0ZU9mZnNldHMoKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVUYXJnZXRTdHlsZXMoKTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIGl0ZW0gaXMgYWxyZWFkeSBpbiBjb3JyZWN0IHBvc2l0aW9uIGxldCdzIHF1aXQgZWFybHkuXHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICBpdGVtLl9sZWZ0ID09PSB0aGlzLl9jdXJyZW50TGVmdCAtIHRoaXMuX29mZnNldExlZnQgJiZcclxuICAgICAgICAgICAgaXRlbS5fdG9wID09PSB0aGlzLl9jdXJyZW50VG9wIC0gdGhpcy5fb2Zmc2V0VG9wXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0ludGVycnVwdGVkKSB0aGlzLnN0b3AoZmFsc2UsIHRoaXMuX3RhcmdldFN0eWxlcyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbmlzaCgpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTZXQgaXRlbSdzIHBvc2l0aW9uaW5nIGNsYXNzIGlmIG5lZWRlZC5cclxuICAgICAgICAhdGhpcy5faXNJbnRlcnJ1cHRlZCAmJiBhZGRDbGFzcyhlbGVtZW50LCBzZXR0aW5ncy5pdGVtUG9zaXRpb25pbmdDbGFzcyk7XHJcblxyXG4gICAgICAgIC8vIEdldCBjdXJyZW50IHN0eWxlcyBmb3IgYW5pbWF0aW9uLlxyXG4gICAgICAgIHRoaXMuX2N1cnJlbnRTdHlsZXMudHJhbnNmb3JtID0gZ2V0VHJhbnNsYXRlU3RyaW5nKHRoaXMuX2N1cnJlbnRMZWZ0LCB0aGlzLl9jdXJyZW50VG9wKTtcclxuXHJcbiAgICAgICAgLy8gQW5pbWF0ZS5cclxuICAgICAgICBpdGVtLl9hbmltYXRlLnN0YXJ0KHRoaXMuX2N1cnJlbnRTdHlsZXMsIHRoaXMuX3RhcmdldFN0eWxlcywgdGhpcy5fYW5pbWF0ZU9wdGlvbnMpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgdGVtcFN0eWxlcyA9IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIG1pZ3JhdGUgcHJvY2VzcyBoYW5kbGVyIGNvbnN0cnVjdG9yLlxyXG4gICAgICpcclxuICAgICAqIEBjbGFzc1xyXG4gICAgICogQHBhcmFtIHtJdGVtfSBpdGVtXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIEl0ZW1NaWdyYXRlKGl0ZW0pIHtcclxuICAgICAgICAvLyBQcml2YXRlIHByb3BzLlxyXG4gICAgICAgIHRoaXMuX2l0ZW0gPSBpdGVtO1xyXG4gICAgICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5faXNEZXN0cm95ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9jb250YWluZXIgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJEaWZmWCA9IDA7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyRGlmZlkgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHVibGljIHByb3RvdHlwZSBtZXRob2RzXHJcbiAgICAgKiAqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhcnQgdGhlIG1pZ3JhdGUgcHJvY2VzcyBvZiBhbiBpdGVtLlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtTWlncmF0ZS5wcm90b3R5cGVcclxuICAgICAqIEBwYXJhbSB7R3JpZH0gdGFyZ2V0R3JpZFxyXG4gICAgICogQHBhcmFtIHtHcmlkU2luZ2xlSXRlbVF1ZXJ5fSBwb3NpdGlvblxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW2NvbnRhaW5lcl1cclxuICAgICAqIEByZXR1cm5zIHtJdGVtTWlncmF0ZX1cclxuICAgICAqL1xyXG4gICAgSXRlbU1pZ3JhdGUucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKHRhcmdldEdyaWQsIHBvc2l0aW9uLCBjb250YWluZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQpIHJldHVybiB0aGlzO1xyXG5cclxuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2l0ZW07XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBpdGVtLl9lbGVtZW50O1xyXG4gICAgICAgIHZhciBpc1Zpc2libGUgPSBpdGVtLmlzVmlzaWJsZSgpO1xyXG4gICAgICAgIHZhciBncmlkID0gaXRlbS5nZXRHcmlkKCk7XHJcbiAgICAgICAgdmFyIHNldHRpbmdzID0gZ3JpZC5fc2V0dGluZ3M7XHJcbiAgICAgICAgdmFyIHRhcmdldFNldHRpbmdzID0gdGFyZ2V0R3JpZC5fc2V0dGluZ3M7XHJcbiAgICAgICAgdmFyIHRhcmdldEVsZW1lbnQgPSB0YXJnZXRHcmlkLl9lbGVtZW50O1xyXG4gICAgICAgIHZhciB0YXJnZXRJdGVtcyA9IHRhcmdldEdyaWQuX2l0ZW1zO1xyXG4gICAgICAgIHZhciBjdXJyZW50SW5kZXggPSBncmlkLl9pdGVtcy5pbmRleE9mKGl0ZW0pO1xyXG4gICAgICAgIHZhciB0YXJnZXRDb250YWluZXIgPSBjb250YWluZXIgfHwgZG9jdW1lbnQuYm9keTtcclxuICAgICAgICB2YXIgdGFyZ2V0SW5kZXg7XHJcbiAgICAgICAgdmFyIHRhcmdldEl0ZW07XHJcbiAgICAgICAgdmFyIGN1cnJlbnRDb250YWluZXI7XHJcbiAgICAgICAgdmFyIG9mZnNldERpZmY7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lckRpZmY7XHJcbiAgICAgICAgdmFyIHRyYW5zbGF0ZTtcclxuICAgICAgICB2YXIgdHJhbnNsYXRlWDtcclxuICAgICAgICB2YXIgdHJhbnNsYXRlWTtcclxuXHJcbiAgICAgICAgLy8gR2V0IHRhcmdldCBpbmRleC5cclxuICAgICAgICBpZiAodHlwZW9mIHBvc2l0aW9uID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICB0YXJnZXRJbmRleCA9IG5vcm1hbGl6ZUFycmF5SW5kZXgodGFyZ2V0SXRlbXMsIHBvc2l0aW9uLCB0cnVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0YXJnZXRJdGVtID0gdGFyZ2V0R3JpZC5fZ2V0SXRlbShwb3NpdGlvbik7XHJcbiAgICAgICAgICAgIC8qKiBAdG9kbyBDb25zaWRlciB0aHJvd2luZyBhbiBlcnJvciBoZXJlIGluc3RlYWQgb2Ygc2lsZW50bHkgZmFpbGluZy4gKi9cclxuICAgICAgICAgICAgaWYgKCF0YXJnZXRJdGVtKSByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgdGFyZ2V0SW5kZXggPSB0YXJnZXRJdGVtcy5pbmRleE9mKHRhcmdldEl0ZW0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gR2V0IGN1cnJlbnQgdHJhbnNsYXRlWCBhbmQgdHJhbnNsYXRlWSB2YWx1ZXMgaWYgbmVlZGVkLlxyXG4gICAgICAgIGlmIChpdGVtLmlzUG9zaXRpb25pbmcoKSB8fCB0aGlzLl9pc0FjdGl2ZSB8fCBpdGVtLmlzUmVsZWFzaW5nKCkpIHtcclxuICAgICAgICAgICAgdHJhbnNsYXRlID0gZ2V0VHJhbnNsYXRlKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICB0cmFuc2xhdGVYID0gdHJhbnNsYXRlLng7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZVkgPSB0cmFuc2xhdGUueTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFib3J0IGN1cnJlbnQgcG9zaXRpb25pbmcuXHJcbiAgICAgICAgaWYgKGl0ZW0uaXNQb3NpdGlvbmluZygpKSB7XHJcbiAgICAgICAgICAgIGl0ZW0uX2xheW91dC5zdG9wKHRydWUsIHsgdHJhbnNmb3JtOiBnZXRUcmFuc2xhdGVTdHJpbmcodHJhbnNsYXRlWCwgdHJhbnNsYXRlWSkgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBYm9ydCBjdXJyZW50IG1pZ3JhdGlvbi5cclxuICAgICAgICBpZiAodGhpcy5faXNBY3RpdmUpIHtcclxuICAgICAgICAgICAgdHJhbnNsYXRlWCAtPSB0aGlzLl9jb250YWluZXJEaWZmWDtcclxuICAgICAgICAgICAgdHJhbnNsYXRlWSAtPSB0aGlzLl9jb250YWluZXJEaWZmWTtcclxuICAgICAgICAgICAgdGhpcy5zdG9wKHRydWUsIHsgdHJhbnNmb3JtOiBnZXRUcmFuc2xhdGVTdHJpbmcodHJhbnNsYXRlWCwgdHJhbnNsYXRlWSkgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBYm9ydCBjdXJyZW50IHJlbGVhc2UuXHJcbiAgICAgICAgaWYgKGl0ZW0uaXNSZWxlYXNpbmcoKSkge1xyXG4gICAgICAgICAgICB0cmFuc2xhdGVYIC09IGl0ZW0uX3JlbGVhc2UuX2NvbnRhaW5lckRpZmZYO1xyXG4gICAgICAgICAgICB0cmFuc2xhdGVZIC09IGl0ZW0uX3JlbGVhc2UuX2NvbnRhaW5lckRpZmZZO1xyXG4gICAgICAgICAgICBpdGVtLl9yZWxlYXNlLnN0b3AodHJ1ZSwgeyB0cmFuc2Zvcm06IGdldFRyYW5zbGF0ZVN0cmluZyh0cmFuc2xhdGVYLCB0cmFuc2xhdGVZKSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFN0b3AgY3VycmVudCB2aXNpYmlsaXR5IGFuaW1hdGlvbnMuXHJcbiAgICAgICAgaXRlbS5fdmlzaWJpbGl0eS5fc3RvcEFuaW1hdGlvbigpO1xyXG5cclxuICAgICAgICAvLyBEZXN0cm95IGN1cnJlbnQgZHJhZy5cclxuICAgICAgICBpZiAoaXRlbS5fZHJhZykgaXRlbS5fZHJhZy5kZXN0cm95KCk7XHJcblxyXG4gICAgICAgIC8vIFByb2Nlc3MgY3VycmVudCB2aXNpYmlsaXR5IGFuaW1hdGlvbiBxdWV1ZS5cclxuICAgICAgICBpdGVtLl92aXNpYmlsaXR5Ll9xdWV1ZS5mbHVzaCh0cnVlLCBpdGVtKTtcclxuXHJcbiAgICAgICAgLy8gRW1pdCBiZWZvcmVTZW5kIGV2ZW50LlxyXG4gICAgICAgIGlmIChncmlkLl9oYXNMaXN0ZW5lcnMoZXZlbnRCZWZvcmVTZW5kKSkge1xyXG4gICAgICAgICAgICBncmlkLl9lbWl0KGV2ZW50QmVmb3JlU2VuZCwge1xyXG4gICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcclxuICAgICAgICAgICAgICAgIGZyb21HcmlkOiBncmlkLFxyXG4gICAgICAgICAgICAgICAgZnJvbUluZGV4OiBjdXJyZW50SW5kZXgsXHJcbiAgICAgICAgICAgICAgICB0b0dyaWQ6IHRhcmdldEdyaWQsXHJcbiAgICAgICAgICAgICAgICB0b0luZGV4OiB0YXJnZXRJbmRleFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEVtaXQgYmVmb3JlUmVjZWl2ZSBldmVudC5cclxuICAgICAgICBpZiAodGFyZ2V0R3JpZC5faGFzTGlzdGVuZXJzKGV2ZW50QmVmb3JlUmVjZWl2ZSkpIHtcclxuICAgICAgICAgICAgdGFyZ2V0R3JpZC5fZW1pdChldmVudEJlZm9yZVJlY2VpdmUsIHtcclxuICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW0sXHJcbiAgICAgICAgICAgICAgICBmcm9tR3JpZDogZ3JpZCxcclxuICAgICAgICAgICAgICAgIGZyb21JbmRleDogY3VycmVudEluZGV4LFxyXG4gICAgICAgICAgICAgICAgdG9HcmlkOiB0YXJnZXRHcmlkLFxyXG4gICAgICAgICAgICAgICAgdG9JbmRleDogdGFyZ2V0SW5kZXhcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgY3VycmVudCBjbGFzc25hbWVzLlxyXG4gICAgICAgIHJlbW92ZUNsYXNzKGVsZW1lbnQsIHNldHRpbmdzLml0ZW1DbGFzcyk7XHJcbiAgICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgc2V0dGluZ3MuaXRlbVZpc2libGVDbGFzcyk7XHJcbiAgICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgc2V0dGluZ3MuaXRlbUhpZGRlbkNsYXNzKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIG5ldyBjbGFzc25hbWVzLlxyXG4gICAgICAgIGFkZENsYXNzKGVsZW1lbnQsIHRhcmdldFNldHRpbmdzLml0ZW1DbGFzcyk7XHJcbiAgICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgaXNWaXNpYmxlID8gdGFyZ2V0U2V0dGluZ3MuaXRlbVZpc2libGVDbGFzcyA6IHRhcmdldFNldHRpbmdzLml0ZW1IaWRkZW5DbGFzcyk7XHJcblxyXG4gICAgICAgIC8vIE1vdmUgaXRlbSBpbnN0YW5jZSBmcm9tIGN1cnJlbnQgZ3JpZCB0byB0YXJnZXQgZ3JpZC5cclxuICAgICAgICBncmlkLl9pdGVtcy5zcGxpY2UoY3VycmVudEluZGV4LCAxKTtcclxuICAgICAgICBhcnJheUluc2VydCh0YXJnZXRJdGVtcywgaXRlbSwgdGFyZ2V0SW5kZXgpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgaXRlbSdzIGdyaWQgaWQgcmVmZXJlbmNlLlxyXG4gICAgICAgIGl0ZW0uX2dyaWRJZCA9IHRhcmdldEdyaWQuX2lkO1xyXG5cclxuICAgICAgICAvLyBHZXQgY3VycmVudCBjb250YWluZXIuXHJcbiAgICAgICAgY3VycmVudENvbnRhaW5lciA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuXHJcbiAgICAgICAgLy8gTW92ZSB0aGUgaXRlbSBpbnNpZGUgdGhlIHRhcmdldCBjb250YWluZXIgaWYgaXQncyBkaWZmZXJlbnQgdGhhbiB0aGVcclxuICAgICAgICAvLyBjdXJyZW50IGNvbnRhaW5lci5cclxuICAgICAgICBpZiAodGFyZ2V0Q29udGFpbmVyICE9PSBjdXJyZW50Q29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgIHRhcmdldENvbnRhaW5lci5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuICAgICAgICAgICAgb2Zmc2V0RGlmZiA9IGdldE9mZnNldERpZmYodGFyZ2V0Q29udGFpbmVyLCBjdXJyZW50Q29udGFpbmVyLCB0cnVlKTtcclxuICAgICAgICAgICAgaWYgKCF0cmFuc2xhdGUpIHtcclxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZSA9IGdldFRyYW5zbGF0ZShlbGVtZW50KTtcclxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVggPSB0cmFuc2xhdGUueDtcclxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVkgPSB0cmFuc2xhdGUueTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlW3RyYW5zZm9ybVByb3BdID0gZ2V0VHJhbnNsYXRlU3RyaW5nKFxyXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlWCArIG9mZnNldERpZmYubGVmdCxcclxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVkgKyBvZmZzZXREaWZmLnRvcFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGNoaWxkIGVsZW1lbnQncyBzdHlsZXMgdG8gcmVmbGVjdCB0aGUgY3VycmVudCB2aXNpYmlsaXR5IHN0YXRlLlxyXG4gICAgICAgIGl0ZW0uX2NoaWxkLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcclxuICAgICAgICBzZXRTdHlsZXMoaXRlbS5fY2hpbGQsIGlzVmlzaWJsZSA/IHRhcmdldFNldHRpbmdzLnZpc2libGVTdHlsZXMgOiB0YXJnZXRTZXR0aW5ncy5oaWRkZW5TdHlsZXMpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgZGlzcGxheSBzdHlsZS5cclxuICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBpc1Zpc2libGUgPyAnYmxvY2snIDogJ2hpZGRlbic7XHJcblxyXG4gICAgICAgIC8vIEdldCBvZmZzZXQgZGlmZiBmb3IgdGhlIG1pZ3JhdGlvbiBkYXRhLlxyXG4gICAgICAgIGNvbnRhaW5lckRpZmYgPSBnZXRPZmZzZXREaWZmKHRhcmdldENvbnRhaW5lciwgdGFyZ2V0RWxlbWVudCwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBpdGVtJ3MgY2FjaGVkIGRpbWVuc2lvbnMgYW5kIHNvcnQgZGF0YS5cclxuICAgICAgICBpdGVtLl9yZWZyZXNoRGltZW5zaW9ucygpO1xyXG4gICAgICAgIGl0ZW0uX3JlZnJlc2hTb3J0RGF0YSgpO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgbmV3IGRyYWcgaGFuZGxlci5cclxuICAgICAgICBpdGVtLl9kcmFnID0gdGFyZ2V0U2V0dGluZ3MuZHJhZ0VuYWJsZWQgPyBuZXcgSXRlbURyYWcoaXRlbSkgOiBudWxsO1xyXG5cclxuICAgICAgICAvLyBTZXR1cCBtaWdyYXRpb24gZGF0YS5cclxuICAgICAgICB0aGlzLl9pc0FjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyID0gdGFyZ2V0Q29udGFpbmVyO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lckRpZmZYID0gY29udGFpbmVyRGlmZi5sZWZ0O1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lckRpZmZZID0gY29udGFpbmVyRGlmZi50b3A7XHJcblxyXG4gICAgICAgIC8vIEVtaXQgc2VuZCBldmVudC5cclxuICAgICAgICBpZiAoZ3JpZC5faGFzTGlzdGVuZXJzKGV2ZW50U2VuZCkpIHtcclxuICAgICAgICAgICAgZ3JpZC5fZW1pdChldmVudFNlbmQsIHtcclxuICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW0sXHJcbiAgICAgICAgICAgICAgICBmcm9tR3JpZDogZ3JpZCxcclxuICAgICAgICAgICAgICAgIGZyb21JbmRleDogY3VycmVudEluZGV4LFxyXG4gICAgICAgICAgICAgICAgdG9HcmlkOiB0YXJnZXRHcmlkLFxyXG4gICAgICAgICAgICAgICAgdG9JbmRleDogdGFyZ2V0SW5kZXhcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFbWl0IHJlY2VpdmUgZXZlbnQuXHJcbiAgICAgICAgaWYgKHRhcmdldEdyaWQuX2hhc0xpc3RlbmVycyhldmVudFJlY2VpdmUpKSB7XHJcbiAgICAgICAgICAgIHRhcmdldEdyaWQuX2VtaXQoZXZlbnRSZWNlaXZlLCB7XHJcbiAgICAgICAgICAgICAgICBpdGVtOiBpdGVtLFxyXG4gICAgICAgICAgICAgICAgZnJvbUdyaWQ6IGdyaWQsXHJcbiAgICAgICAgICAgICAgICBmcm9tSW5kZXg6IGN1cnJlbnRJbmRleCxcclxuICAgICAgICAgICAgICAgIHRvR3JpZDogdGFyZ2V0R3JpZCxcclxuICAgICAgICAgICAgICAgIHRvSW5kZXg6IHRhcmdldEluZGV4XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRW5kIHRoZSBtaWdyYXRlIHByb2Nlc3Mgb2YgYW4gaXRlbS4gVGhpcyBtZXRob2QgY2FuIGJlIHVzZWQgdG8gYWJvcnQgYW5cclxuICAgICAqIG9uZ29pbmcgbWlncmF0ZSBwcm9jZXNzIChhbmltYXRpb24pIG9yIGZpbmlzaCB0aGUgbWlncmF0ZSBwcm9jZXNzLlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtTWlncmF0ZS5wcm90b3R5cGVcclxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2Fib3J0PWZhbHNlXVxyXG4gICAgICogIC0gU2hvdWxkIHRoZSBtaWdyYXRpb24gYmUgYWJvcnRlZD9cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbY3VycmVudFN0eWxlc11cclxuICAgICAqICAtIE9wdGlvbmFsIGN1cnJlbnQgdHJhbnNsYXRlWCBhbmQgdHJhbnNsYXRlWSBzdHlsZXMuXHJcbiAgICAgKiBAcmV0dXJucyB7SXRlbU1pZ3JhdGV9XHJcbiAgICAgKi9cclxuICAgIEl0ZW1NaWdyYXRlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKGFib3J0LCBjdXJyZW50U3R5bGVzKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkIHx8ICF0aGlzLl9pc0FjdGl2ZSkgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5faXRlbTtcclxuICAgICAgICB2YXIgZWxlbWVudCA9IGl0ZW0uX2VsZW1lbnQ7XHJcbiAgICAgICAgdmFyIGdyaWQgPSBpdGVtLmdldEdyaWQoKTtcclxuICAgICAgICB2YXIgZ3JpZEVsZW1lbnQgPSBncmlkLl9lbGVtZW50O1xyXG4gICAgICAgIHZhciB0cmFuc2xhdGU7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9jb250YWluZXIgIT09IGdyaWRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGlmICghY3VycmVudFN0eWxlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFib3J0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlID0gZ2V0VHJhbnNsYXRlKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBTdHlsZXMudHJhbnNmb3JtID0gZ2V0VHJhbnNsYXRlU3RyaW5nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGUueCAtIHRoaXMuX2NvbnRhaW5lckRpZmZYLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGUueSAtIHRoaXMuX2NvbnRhaW5lckRpZmZZXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcFN0eWxlcy50cmFuc2Zvcm0gPSBnZXRUcmFuc2xhdGVTdHJpbmcoaXRlbS5fbGVmdCwgaXRlbS5fdG9wKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGN1cnJlbnRTdHlsZXMgPSB0ZW1wU3R5bGVzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGdyaWRFbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICBzZXRTdHlsZXMoZWxlbWVudCwgY3VycmVudFN0eWxlcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyRGlmZlggPSAwO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lckRpZmZZID0gMDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVzdHJveSBpbnN0YW5jZS5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbU1pZ3JhdGUucHJvdG90eXBlXHJcbiAgICAgKiBAcmV0dXJucyB7SXRlbU1pZ3JhdGV9XHJcbiAgICAgKi9cclxuICAgIEl0ZW1NaWdyYXRlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgdGhpcy5zdG9wKHRydWUpO1xyXG4gICAgICAgIHRoaXMuX2l0ZW0gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2lzRGVzdHJveWVkID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHRlbXBTdHlsZXMkMSA9IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHJlbGVhc2UgcHJvY2VzcyBoYW5kbGVyIGNvbnN0cnVjdG9yLiBBbHRob3VnaCB0aGlzIG1pZ2h0IHNlZW0gYXMgcHJvcGVyXHJcbiAgICAgKiBmaXQgZm9yIHRoZSBkcmFnIHByb2Nlc3MgdGhpcyBuZWVkcyB0byBiZSBzZXBhcmF0ZWQgaW50byBpdCdzIG93biBsb2dpY1xyXG4gICAgICogYmVjYXVzZSB0aGVyZSBtaWdodCBiZSBhIHNjZW5hcmlvIHdoZXJlIGRyYWcgaXMgZGlzYWJsZWQsIGJ1dCB0aGUgcmVsZWFzZVxyXG4gICAgICogcHJvY2VzcyBzdGlsbCBuZWVkcyB0byBiZSBpbXBsZW1lbnRlZCAoZHJhZ2dpbmcgZnJvbSBhIGdyaWQgdG8gYW5vdGhlcikuXHJcbiAgICAgKlxyXG4gICAgICogQGNsYXNzXHJcbiAgICAgKiBAcGFyYW0ge0l0ZW19IGl0ZW1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gSXRlbVJlbGVhc2UoaXRlbSkge1xyXG4gICAgICAgIHRoaXMuX2l0ZW0gPSBpdGVtO1xyXG4gICAgICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5faXNEZXN0cm95ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pc1Bvc2l0aW9uaW5nU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lckRpZmZYID0gMDtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJEaWZmWSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQdWJsaWMgcHJvdG90eXBlIG1ldGhvZHNcclxuICAgICAqICoqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGFydCB0aGUgcmVsZWFzZSBwcm9jZXNzIG9mIGFuIGl0ZW0uXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEl0ZW1SZWxlYXNlLnByb3RvdHlwZVxyXG4gICAgICogQHJldHVybnMge0l0ZW1SZWxlYXNlfVxyXG4gICAgICovXHJcbiAgICBJdGVtUmVsZWFzZS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkIHx8IHRoaXMuX2lzQWN0aXZlKSByZXR1cm4gdGhpcztcclxuXHJcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLl9pdGVtO1xyXG4gICAgICAgIHZhciBncmlkID0gaXRlbS5nZXRHcmlkKCk7XHJcblxyXG4gICAgICAgIC8vIEZsYWcgcmVsZWFzZSBhcyBhY3RpdmUuXHJcbiAgICAgICAgdGhpcy5faXNBY3RpdmUgPSB0cnVlO1xyXG5cclxuICAgICAgICAvLyBBZGQgcmVsZWFzZSBjbGFzcyBuYW1lIHRvIHRoZSByZWxlYXNlZCBlbGVtZW50LlxyXG4gICAgICAgIGFkZENsYXNzKGl0ZW0uX2VsZW1lbnQsIGdyaWQuX3NldHRpbmdzLml0ZW1SZWxlYXNpbmdDbGFzcyk7XHJcblxyXG4gICAgICAgIC8vIEVtaXQgZHJhZ1JlbGVhc2VTdGFydCBldmVudC5cclxuICAgICAgICBncmlkLl9lbWl0KGV2ZW50RHJhZ1JlbGVhc2VTdGFydCwgaXRlbSk7XHJcblxyXG4gICAgICAgIC8vIFBvc2l0aW9uIHRoZSByZWxlYXNlZCBpdGVtLlxyXG4gICAgICAgIGl0ZW0uX2xheW91dC5zdGFydChmYWxzZSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEVuZCB0aGUgcmVsZWFzZSBwcm9jZXNzIG9mIGFuIGl0ZW0uIFRoaXMgbWV0aG9kIGNhbiBiZSB1c2VkIHRvIGFib3J0IGFuXHJcbiAgICAgKiBvbmdvaW5nIHJlbGVhc2UgcHJvY2VzcyAoYW5pbWF0aW9uKSBvciBmaW5pc2ggdGhlIHJlbGVhc2UgcHJvY2Vzcy5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbVJlbGVhc2UucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFthYm9ydD1mYWxzZV1cclxuICAgICAqICAtIFNob3VsZCB0aGUgcmVsZWFzZSBiZSBhYm9ydGVkPyBXaGVuIHRydWUsIHRoZSByZWxlYXNlIGVuZCBldmVudCB3b24ndCBiZVxyXG4gICAgICogICAgZW1pdHRlZC4gU2V0IHRvIHRydWUgb25seSB3aGVuIHlvdSBuZWVkIHRvIGFib3J0IHRoZSByZWxlYXNlIHByb2Nlc3NcclxuICAgICAqICAgIHdoaWxlIHRoZSBpdGVtIGlzIGFuaW1hdGluZyB0byBpdCdzIHBvc2l0aW9uLlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtjdXJyZW50U3R5bGVzXVxyXG4gICAgICogIC0gT3B0aW9uYWwgY3VycmVudCB0cmFuc2xhdGVYIGFuZCB0cmFuc2xhdGVZIHN0eWxlcy5cclxuICAgICAqIEByZXR1cm5zIHtJdGVtUmVsZWFzZX1cclxuICAgICAqL1xyXG4gICAgSXRlbVJlbGVhc2UucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoYWJvcnQsIGN1cnJlbnRTdHlsZXMpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQgfHwgIXRoaXMuX2lzQWN0aXZlKSByZXR1cm4gdGhpcztcclxuXHJcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLl9pdGVtO1xyXG4gICAgICAgIHZhciBlbGVtZW50ID0gaXRlbS5fZWxlbWVudDtcclxuICAgICAgICB2YXIgZ3JpZCA9IGl0ZW0uZ2V0R3JpZCgpO1xyXG4gICAgICAgIHZhciBjb250YWluZXIgPSBncmlkLl9lbGVtZW50O1xyXG4gICAgICAgIHZhciB0cmFuc2xhdGU7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IGRhdGEgYW5kIHJlbW92ZSByZWxlYXNpbmcgY2xhc3MgbmFtZSBmcm9tIHRoZSBlbGVtZW50LlxyXG4gICAgICAgIHRoaXMuX3Jlc2V0KCk7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSByZWxlYXNlZCBlbGVtZW50IGlzIG91dHNpZGUgdGhlIGdyaWQncyBjb250YWluZXIgZWxlbWVudCBwdXQgaXRcclxuICAgICAgICAvLyBiYWNrIHRoZXJlIGFuZCBhZGp1c3QgcG9zaXRpb24gYWNjb3JkaW5nbHkuXHJcbiAgICAgICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZSAhPT0gY29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgIGlmICghY3VycmVudFN0eWxlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFib3J0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlID0gZ2V0VHJhbnNsYXRlKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBTdHlsZXMkMS50cmFuc2Zvcm0gPSBnZXRUcmFuc2xhdGVTdHJpbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZS54IC0gdGhpcy5fY29udGFpbmVyRGlmZlgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZS55IC0gdGhpcy5fY29udGFpbmVyRGlmZllcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wU3R5bGVzJDEudHJhbnNmb3JtID0gZ2V0VHJhbnNsYXRlU3RyaW5nKGl0ZW0uX2xlZnQsIGl0ZW0uX3RvcCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U3R5bGVzID0gdGVtcFN0eWxlcyQxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuICAgICAgICAgICAgc2V0U3R5bGVzKGVsZW1lbnQsIGN1cnJlbnRTdHlsZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRW1pdCBkcmFnUmVsZWFzZUVuZCBldmVudC5cclxuICAgICAgICBpZiAoIWFib3J0KSBncmlkLl9lbWl0KGV2ZW50RHJhZ1JlbGVhc2VFbmQsIGl0ZW0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXN0cm95IGluc3RhbmNlLlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtUmVsZWFzZS5wcm90b3R5cGVcclxuICAgICAqIEByZXR1cm5zIHtJdGVtUmVsZWFzZX1cclxuICAgICAqL1xyXG4gICAgSXRlbVJlbGVhc2UucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSByZXR1cm4gdGhpcztcclxuICAgICAgICB0aGlzLnN0b3AodHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5faXRlbSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5faXNEZXN0cm95ZWQgPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFByaXZhdGUgcHJvdG90eXBlIG1ldGhvZHNcclxuICAgICAqICoqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVzZXQgcHVibGljIGRhdGEgYW5kIHJlbW92ZSByZWxlYXNpbmcgY2xhc3MuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtUmVsZWFzZS5wcm90b3R5cGVcclxuICAgICAqL1xyXG4gICAgSXRlbVJlbGVhc2UucHJvdG90eXBlLl9yZXNldCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQpIHJldHVybjtcclxuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2l0ZW07XHJcbiAgICAgICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pc1Bvc2l0aW9uaW5nU3RhcnRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lckRpZmZYID0gMDtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJEaWZmWSA9IDA7XHJcbiAgICAgICAgcmVtb3ZlQ2xhc3MoaXRlbS5fZWxlbWVudCwgaXRlbS5nZXRHcmlkKCkuX3NldHRpbmdzLml0ZW1SZWxlYXNpbmdDbGFzcyk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGN1cnJlbnQgdmFsdWVzIG9mIHRoZSBwcm92aWRlZCBzdHlsZXMgZGVmaW5pdGlvbiBvYmplY3QuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHN0eWxlc1xyXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50U3R5bGVzKGVsZW1lbnQsIHN0eWxlcykge1xyXG4gICAgICAgIHZhciBjdXJyZW50ID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBzdHlsZXMpIHtcclxuICAgICAgICAgICAgY3VycmVudFtwcm9wXSA9IGdldFN0eWxlKGVsZW1lbnQsIGdldFN0eWxlTmFtZShwcm9wKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXJyZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVmlzaWJpbGl0eSBtYW5hZ2VyIGZvciBJdGVtIGluc3RhbmNlLlxyXG4gICAgICpcclxuICAgICAqIEBjbGFzc1xyXG4gICAgICogQHBhcmFtIHtJdGVtfSBpdGVtXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIEl0ZW1WaXNpYmlsaXR5KGl0ZW0pIHtcclxuICAgICAgICB2YXIgaXNBY3RpdmUgPSBpdGVtLl9pc0FjdGl2ZTtcclxuICAgICAgICB2YXIgZWxlbWVudCA9IGl0ZW0uX2VsZW1lbnQ7XHJcbiAgICAgICAgdmFyIHNldHRpbmdzID0gaXRlbS5nZXRHcmlkKCkuX3NldHRpbmdzO1xyXG5cclxuICAgICAgICB0aGlzLl9pdGVtID0gaXRlbTtcclxuICAgICAgICB0aGlzLl9pc0Rlc3Ryb3llZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBTZXQgdXAgdmlzaWJpbGl0eSBzdGF0ZXMuXHJcbiAgICAgICAgdGhpcy5faXNIaWRkZW4gPSAhaXNBY3RpdmU7XHJcbiAgICAgICAgdGhpcy5faXNIaWRpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pc1Nob3dpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gQ2FsbGJhY2sgcXVldWUuXHJcbiAgICAgICAgdGhpcy5fcXVldWUgPSBuZXcgUXVldWUoKTtcclxuXHJcbiAgICAgICAgLy8gQmluZCBzaG93L2hpZGUgZmluaXNoZXJzLlxyXG4gICAgICAgIHRoaXMuX2ZpbmlzaFNob3cgPSB0aGlzLl9maW5pc2hTaG93LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fZmluaXNoSGlkZSA9IHRoaXMuX2ZpbmlzaEhpZGUuYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgLy8gRm9yY2UgaXRlbSB0byBiZSBlaXRoZXIgdmlzaWJsZSBvciBoaWRkZW4gb24gaW5pdC5cclxuICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBpc0FjdGl2ZSA/ICdibG9jaycgOiAnbm9uZSc7XHJcblxyXG4gICAgICAgIC8vIFNldCB2aXNpYmxlL2hpZGRlbiBjbGFzcy5cclxuICAgICAgICBhZGRDbGFzcyhlbGVtZW50LCBpc0FjdGl2ZSA/IHNldHRpbmdzLml0ZW1WaXNpYmxlQ2xhc3MgOiBzZXR0aW5ncy5pdGVtSGlkZGVuQ2xhc3MpO1xyXG5cclxuICAgICAgICAvLyBTZXQgaW5pdGlhbCBzdHlsZXMgZm9yIHRoZSBjaGlsZCBlbGVtZW50LlxyXG4gICAgICAgIHNldFN0eWxlcyhpdGVtLl9jaGlsZCwgaXNBY3RpdmUgPyBzZXR0aW5ncy52aXNpYmxlU3R5bGVzIDogc2V0dGluZ3MuaGlkZGVuU3R5bGVzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFB1YmxpYyBwcm90b3R5cGUgbWV0aG9kc1xyXG4gICAgICogKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3cgaXRlbS5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbVZpc2liaWxpdHkucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGluc3RhbnRcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtvbkZpbmlzaF1cclxuICAgICAqIEByZXR1cm5zIHtJdGVtVmlzaWJpbGl0eX1cclxuICAgICAqL1xyXG4gICAgSXRlbVZpc2liaWxpdHkucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoaW5zdGFudCwgb25GaW5pc2gpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQpIHJldHVybiB0aGlzO1xyXG5cclxuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2l0ZW07XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBpdGVtLl9lbGVtZW50O1xyXG4gICAgICAgIHZhciBxdWV1ZSA9IHRoaXMuX3F1ZXVlO1xyXG4gICAgICAgIHZhciBjYWxsYmFjayA9IHR5cGVvZiBvbkZpbmlzaCA9PT0gJ2Z1bmN0aW9uJyA/IG9uRmluaXNoIDogbnVsbDtcclxuICAgICAgICB2YXIgZ3JpZCA9IGl0ZW0uZ2V0R3JpZCgpO1xyXG4gICAgICAgIHZhciBzZXR0aW5ncyA9IGdyaWQuX3NldHRpbmdzO1xyXG5cclxuICAgICAgICAvLyBJZiBpdGVtIGlzIHZpc2libGUgY2FsbCB0aGUgY2FsbGJhY2sgYW5kIGJlIGRvbmUgd2l0aCBpdC5cclxuICAgICAgICBpZiAoIXRoaXMuX2lzU2hvd2luZyAmJiAhdGhpcy5faXNIaWRkZW4pIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soZmFsc2UsIGl0ZW0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIGl0ZW0gaXMgc2hvd2luZyBhbmQgZG9lcyBub3QgbmVlZCB0byBiZSBzaG93biBpbnN0YW50bHksIGxldCdzIGp1c3RcclxuICAgICAgICAvLyBwdXNoIGNhbGxiYWNrIHRvIHRoZSBjYWxsYmFjayBxdWV1ZSBhbmQgYmUgZG9uZSB3aXRoIGl0LlxyXG4gICAgICAgIGlmICh0aGlzLl9pc1Nob3dpbmcgJiYgIWluc3RhbnQpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sgJiYgcXVldWUuYWRkKGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiB0aGUgaXRlbSBpcyBoaWRpbmcgb3IgaGlkZGVuIHByb2Nlc3MgdGhlIGN1cnJlbnQgdmlzaWJpbGl0eSBjYWxsYmFja1xyXG4gICAgICAgIC8vIHF1ZXVlIHdpdGggdGhlIGludGVycnVwdGVkIGZsYWcgYWN0aXZlLCB1cGRhdGUgY2xhc3NlcyBhbmQgc2V0IGRpc3BsYXlcclxuICAgICAgICAvLyB0byBibG9jayBpZiBuZWNlc3NhcnkuXHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc1Nob3dpbmcpIHtcclxuICAgICAgICAgICAgcXVldWUuZmx1c2godHJ1ZSwgaXRlbSk7XHJcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKGVsZW1lbnQsIHNldHRpbmdzLml0ZW1IaWRkZW5DbGFzcyk7XHJcbiAgICAgICAgICAgIGFkZENsYXNzKGVsZW1lbnQsIHNldHRpbmdzLml0ZW1WaXNpYmxlQ2xhc3MpO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzSGlkaW5nKSBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUHVzaCBjYWxsYmFjayB0byB0aGUgY2FsbGJhY2sgcXVldWUuXHJcbiAgICAgICAgY2FsbGJhY2sgJiYgcXVldWUuYWRkKGNhbGxiYWNrKTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHZpc2liaWxpdHkgc3RhdGVzLlxyXG4gICAgICAgIGl0ZW0uX2lzQWN0aXZlID0gdGhpcy5faXNTaG93aW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9pc0hpZGluZyA9IHRoaXMuX2lzSGlkZGVuID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIEZpbmFsbHkgbGV0J3Mgc3RhcnQgc2hvdyBhbmltYXRpb24uXHJcbiAgICAgICAgdGhpcy5fc3RhcnRBbmltYXRpb24odHJ1ZSwgaW5zdGFudCwgdGhpcy5fZmluaXNoU2hvdyk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhpZGUgaXRlbS5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbVZpc2liaWxpdHkucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGluc3RhbnRcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtvbkZpbmlzaF1cclxuICAgICAqIEByZXR1cm5zIHtJdGVtVmlzaWJpbGl0eX1cclxuICAgICAqL1xyXG4gICAgSXRlbVZpc2liaWxpdHkucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoaW5zdGFudCwgb25GaW5pc2gpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQpIHJldHVybiB0aGlzO1xyXG5cclxuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2l0ZW07XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBpdGVtLl9lbGVtZW50O1xyXG4gICAgICAgIHZhciBxdWV1ZSA9IHRoaXMuX3F1ZXVlO1xyXG4gICAgICAgIHZhciBjYWxsYmFjayA9IHR5cGVvZiBvbkZpbmlzaCA9PT0gJ2Z1bmN0aW9uJyA/IG9uRmluaXNoIDogbnVsbDtcclxuICAgICAgICB2YXIgZ3JpZCA9IGl0ZW0uZ2V0R3JpZCgpO1xyXG4gICAgICAgIHZhciBzZXR0aW5ncyA9IGdyaWQuX3NldHRpbmdzO1xyXG5cclxuICAgICAgICAvLyBJZiBpdGVtIGlzIGFscmVhZHkgaGlkZGVuIGNhbGwgdGhlIGNhbGxiYWNrIGFuZCBiZSBkb25lIHdpdGggaXQuXHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc0hpZGluZyAmJiB0aGlzLl9pc0hpZGRlbikge1xyXG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhmYWxzZSwgaXRlbSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgaXRlbSBpcyBoaWRpbmcgYW5kIGRvZXMgbm90IG5lZWQgdG8gYmUgaGlkZGVuIGluc3RhbnRseSwgbGV0J3MganVzdFxyXG4gICAgICAgIC8vIHB1c2ggY2FsbGJhY2sgdG8gdGhlIGNhbGxiYWNrIHF1ZXVlIGFuZCBiZSBkb25lIHdpdGggaXQuXHJcbiAgICAgICAgaWYgKHRoaXMuX2lzSGlkaW5nICYmICFpbnN0YW50KSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIHF1ZXVlLmFkZChjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIGl0ZW0gaXMgc2hvd2luZyBvciB2aXNpYmxlIHByb2Nlc3MgdGhlIGN1cnJlbnQgdmlzaWJpbGl0eSBjYWxsYmFja1xyXG4gICAgICAgIC8vIHF1ZXVlIHdpdGggdGhlIGludGVycnVwdGVkIGZsYWcgYWN0aXZlLCB1cGRhdGUgY2xhc3NlcyBhbmQgc2V0IGRpc3BsYXlcclxuICAgICAgICAvLyB0byBibG9jayBpZiBuZWNlc3NhcnkuXHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc0hpZGluZykge1xyXG4gICAgICAgICAgICBxdWV1ZS5mbHVzaCh0cnVlLCBpdGVtKTtcclxuICAgICAgICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgc2V0dGluZ3MuaXRlbUhpZGRlbkNsYXNzKTtcclxuICAgICAgICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgc2V0dGluZ3MuaXRlbVZpc2libGVDbGFzcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBQdXNoIGNhbGxiYWNrIHRvIHRoZSBjYWxsYmFjayBxdWV1ZS5cclxuICAgICAgICBjYWxsYmFjayAmJiBxdWV1ZS5hZGQoY2FsbGJhY2spO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgdmlzaWJpbGl0eSBzdGF0ZXMuXHJcbiAgICAgICAgdGhpcy5faXNIaWRkZW4gPSB0aGlzLl9pc0hpZGluZyA9IHRydWU7XHJcbiAgICAgICAgaXRlbS5faXNBY3RpdmUgPSB0aGlzLl9pc1Nob3dpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gRmluYWxseSBsZXQncyBzdGFydCBoaWRlIGFuaW1hdGlvbi5cclxuICAgICAgICB0aGlzLl9zdGFydEFuaW1hdGlvbihmYWxzZSwgaW5zdGFudCwgdGhpcy5fZmluaXNoSGlkZSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERlc3Ryb3kgdGhlIGluc3RhbmNlIGFuZCBzdG9wIGN1cnJlbnQgYW5pbWF0aW9uIGlmIGl0IGlzIHJ1bm5pbmcuXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEl0ZW1WaXNpYmlsaXR5LnByb3RvdHlwZVxyXG4gICAgICogQHJldHVybnMge0l0ZW1WaXNpYmlsaXR5fVxyXG4gICAgICovXHJcbiAgICBJdGVtVmlzaWJpbGl0eS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQpIHJldHVybiB0aGlzO1xyXG5cclxuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2l0ZW07XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBpdGVtLl9lbGVtZW50O1xyXG4gICAgICAgIHZhciBncmlkID0gaXRlbS5nZXRHcmlkKCk7XHJcbiAgICAgICAgdmFyIHF1ZXVlID0gdGhpcy5fcXVldWU7XHJcbiAgICAgICAgdmFyIHNldHRpbmdzID0gZ3JpZC5fc2V0dGluZ3M7XHJcblxyXG4gICAgICAgIC8vIFN0b3AgdmlzaWJpbGl0eSBhbmltYXRpb24uXHJcbiAgICAgICAgdGhpcy5fc3RvcEFuaW1hdGlvbih7fSk7XHJcblxyXG4gICAgICAgIC8vIEZpcmUgYWxsIHVuY29tcGxldGVkIGNhbGxiYWNrcyB3aXRoIGludGVycnVwdGVkIGZsYWcgYW5kIGRlc3Ryb3kgdGhlIHF1ZXVlLlxyXG4gICAgICAgIHF1ZXVlLmZsdXNoKHRydWUsIGl0ZW0pLmRlc3Ryb3koKTtcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHZpc2libGUvaGlkZGVuIGNsYXNzZXMuXHJcbiAgICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgc2V0dGluZ3MuaXRlbVZpc2libGVDbGFzcyk7XHJcbiAgICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgc2V0dGluZ3MuaXRlbUhpZGRlbkNsYXNzKTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgc3RhdGUuXHJcbiAgICAgICAgdGhpcy5faXRlbSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5faXNIaWRpbmcgPSB0aGlzLl9pc1Nob3dpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pc0Rlc3Ryb3llZCA9IHRoaXMuX2lzSGlkZGVuID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJpdmF0ZSBwcm90b3R5cGUgbWV0aG9kc1xyXG4gICAgICogKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGFydCB2aXNpYmlsaXR5IGFuaW1hdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQG1lbWJlcm9mIEl0ZW1WaXNpYmlsaXR5LnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSB0b1Zpc2libGVcclxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2luc3RhbnRdXHJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb25GaW5pc2hdXHJcbiAgICAgKi9cclxuICAgIEl0ZW1WaXNpYmlsaXR5LnByb3RvdHlwZS5fc3RhcnRBbmltYXRpb24gPSBmdW5jdGlvbiAodG9WaXNpYmxlLCBpbnN0YW50LCBvbkZpbmlzaCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX2l0ZW07XHJcbiAgICAgICAgdmFyIHNldHRpbmdzID0gaXRlbS5nZXRHcmlkKCkuX3NldHRpbmdzO1xyXG4gICAgICAgIHZhciB0YXJnZXRTdHlsZXMgPSB0b1Zpc2libGUgPyBzZXR0aW5ncy52aXNpYmxlU3R5bGVzIDogc2V0dGluZ3MuaGlkZGVuU3R5bGVzO1xyXG4gICAgICAgIHZhciBkdXJhdGlvbiA9IHBhcnNlSW50KHRvVmlzaWJsZSA/IHNldHRpbmdzLnNob3dEdXJhdGlvbiA6IHNldHRpbmdzLmhpZGVEdXJhdGlvbikgfHwgMDtcclxuICAgICAgICB2YXIgZWFzaW5nID0gKHRvVmlzaWJsZSA/IHNldHRpbmdzLnNob3dFYXNpbmcgOiBzZXR0aW5ncy5oaWRlRWFzaW5nKSB8fCAnZWFzZSc7XHJcbiAgICAgICAgdmFyIGlzSW5zdGFudCA9IGluc3RhbnQgfHwgZHVyYXRpb24gPD0gMDtcclxuICAgICAgICB2YXIgY3VycmVudFN0eWxlcztcclxuXHJcbiAgICAgICAgLy8gTm8gdGFyZ2V0IHN0eWxlcz8gTGV0J3MgcXVpdCBlYXJseS5cclxuICAgICAgICBpZiAoIXRhcmdldFN0eWxlcykge1xyXG4gICAgICAgICAgICBvbkZpbmlzaCAmJiBvbkZpbmlzaCgpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDYW5jZWwgcXVldWVkIHZpc2liaWxpdHkgdGljay5cclxuICAgICAgICBjYW5jZWxWaXNpYmlsaXR5VGljayhpdGVtLl9pZCk7XHJcblxyXG4gICAgICAgIC8vIElmIHdlIG5lZWQgdG8gYXBwbHkgdGhlIHN0eWxlcyBpbnN0YW50bHkgd2l0aG91dCBhbmltYXRpb24uXHJcbiAgICAgICAgaWYgKGlzSW5zdGFudCkge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5fYW5pbWF0ZUNoaWxkLmlzQW5pbWF0aW5nKCkpIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uX2FuaW1hdGVDaGlsZC5zdG9wKHRhcmdldFN0eWxlcyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZXRTdHlsZXMoaXRlbS5fY2hpbGQsIHRhcmdldFN0eWxlcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb25GaW5pc2ggJiYgb25GaW5pc2goKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU3RhcnQgdGhlIGFuaW1hdGlvbiBpbiB0aGUgbmV4dCB0aWNrICh0byBhdm9pZCBsYXlvdXQgdGhyYXNoaW5nKS5cclxuICAgICAgICBhZGRWaXNpYmlsaXR5VGljayhcclxuICAgICAgICAgICAgaXRlbS5faWQsXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRTdHlsZXMgPSBnZXRDdXJyZW50U3R5bGVzKGl0ZW0uX2NoaWxkLCB0YXJnZXRTdHlsZXMpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpdGVtLl9hbmltYXRlQ2hpbGQuc3RhcnQoY3VycmVudFN0eWxlcywgdGFyZ2V0U3R5bGVzLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIGVhc2luZzogZWFzaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoOiBvbkZpbmlzaFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0b3AgdmlzaWJpbGl0eSBhbmltYXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtVmlzaWJpbGl0eS5wcm90b3R5cGVcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbdGFyZ2V0U3R5bGVzXVxyXG4gICAgICovXHJcbiAgICBJdGVtVmlzaWJpbGl0eS5wcm90b3R5cGUuX3N0b3BBbmltYXRpb24gPSBmdW5jdGlvbiAodGFyZ2V0U3R5bGVzKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSByZXR1cm47XHJcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLl9pdGVtO1xyXG4gICAgICAgIGNhbmNlbFZpc2liaWxpdHlUaWNrKGl0ZW0uX2lkKTtcclxuICAgICAgICBpdGVtLl9hbmltYXRlQ2hpbGQuc3RvcCh0YXJnZXRTdHlsZXMpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmlzaCBzaG93IHByb2NlZHVyZS5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQG1lbWJlcm9mIEl0ZW1WaXNpYmlsaXR5LnByb3RvdHlwZVxyXG4gICAgICovXHJcbiAgICBJdGVtVmlzaWJpbGl0eS5wcm90b3R5cGUuX2ZpbmlzaFNob3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzSGlkZGVuKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5faXNTaG93aW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fcXVldWUuZmx1c2goZmFsc2UsIHRoaXMuX2l0ZW0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmlzaCBoaWRlIHByb2NlZHVyZS5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQG1lbWJlcm9mIEl0ZW1WaXNpYmlsaXR5LnByb3RvdHlwZVxyXG4gICAgICovXHJcbiAgICB2YXIgZmluaXNoU3R5bGVzID0ge307XHJcbiAgICBJdGVtVmlzaWJpbGl0eS5wcm90b3R5cGUuX2ZpbmlzaEhpZGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc0hpZGRlbikgcmV0dXJuO1xyXG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5faXRlbTtcclxuICAgICAgICB0aGlzLl9pc0hpZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIGZpbmlzaFN0eWxlcy50cmFuc2Zvcm0gPSBnZXRUcmFuc2xhdGVTdHJpbmcoMCwgMCk7XHJcbiAgICAgICAgaXRlbS5fbGF5b3V0LnN0b3AodHJ1ZSwgZmluaXNoU3R5bGVzKTtcclxuICAgICAgICBpdGVtLl9lbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5fcXVldWUuZmx1c2goZmFsc2UsIGl0ZW0pO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgaWQgPSAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHVuaXF1ZSBudW1lcmljIGlkIChpbmNyZW1lbnRzIGEgYmFzZSB2YWx1ZSBvbiBldmVyeSBjYWxsKS5cclxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVVpZCgpIHtcclxuICAgICAgICByZXR1cm4gKytpZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgSXRlbSBpbnN0YW5jZSBmb3IgYSBHcmlkIGluc3RhbmNlLlxyXG4gICAgICpcclxuICAgICAqIEBjbGFzc1xyXG4gICAgICogQHBhcmFtIHtHcmlkfSBncmlkXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtpc0FjdGl2ZV1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gSXRlbShncmlkLCBlbGVtZW50LCBpc0FjdGl2ZSkge1xyXG4gICAgICAgIHZhciBzZXR0aW5ncyA9IGdyaWQuX3NldHRpbmdzO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgaW5zdGFuY2UgaWQuXHJcbiAgICAgICAgdGhpcy5faWQgPSBjcmVhdGVVaWQoKTtcclxuXHJcbiAgICAgICAgLy8gUmVmZXJlbmNlIHRvIGNvbm5lY3RlZCBHcmlkIGluc3RhbmNlJ3MgaWQuXHJcbiAgICAgICAgdGhpcy5fZ3JpZElkID0gZ3JpZC5faWQ7XHJcblxyXG4gICAgICAgIC8vIERlc3Ryb3llZCBmbGFnLlxyXG4gICAgICAgIHRoaXMuX2lzRGVzdHJveWVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIFNldCB1cCBpbml0aWFsIHBvc2l0aW9ucy5cclxuICAgICAgICB0aGlzLl9sZWZ0ID0gMDtcclxuICAgICAgICB0aGlzLl90b3AgPSAwO1xyXG5cclxuICAgICAgICAvLyBUaGUgZWxlbWVudHMuXHJcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5fY2hpbGQgPSBlbGVtZW50LmNoaWxkcmVuWzBdO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgcHJvdmlkZWQgaXRlbSBlbGVtZW50IGlzIG5vdCBhIGRpcmVjdCBjaGlsZCBvZiB0aGUgZ3JpZCBjb250YWluZXJcclxuICAgICAgICAvLyBlbGVtZW50LCBhcHBlbmQgaXQgdG8gdGhlIGdyaWQgY29udGFpbmVyLlxyXG4gICAgICAgIGlmIChlbGVtZW50LnBhcmVudE5vZGUgIT09IGdyaWQuX2VsZW1lbnQpIHtcclxuICAgICAgICAgICAgZ3JpZC5fZWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNldCBpdGVtIGNsYXNzLlxyXG4gICAgICAgIGFkZENsYXNzKGVsZW1lbnQsIHNldHRpbmdzLml0ZW1DbGFzcyk7XHJcblxyXG4gICAgICAgIC8vIElmIGlzQWN0aXZlIGlzIG5vdCBkZWZpbmVkLCBsZXQncyB0cnkgdG8gYXV0by1kZXRlY3QgaXQuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBpc0FjdGl2ZSAhPT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgICAgIGlzQWN0aXZlID0gZ2V0U3R5bGUoZWxlbWVudCwgJ2Rpc3BsYXknKSAhPT0gJ25vbmUnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2V0IHVwIGFjdGl2ZSBzdGF0ZSAoZGVmaW5lcyBpZiB0aGUgaXRlbSBpcyBjb25zaWRlcmVkIHBhcnQgb2YgdGhlIGxheW91dFxyXG4gICAgICAgIC8vIG9yIG5vdCkuXHJcbiAgICAgICAgdGhpcy5faXNBY3RpdmUgPSBpc0FjdGl2ZTtcclxuXHJcbiAgICAgICAgLy8gU2V0IGVsZW1lbnQncyBpbml0aWFsIHBvc2l0aW9uIHN0eWxlcy5cclxuICAgICAgICBlbGVtZW50LnN0eWxlLmxlZnQgPSAnMCc7XHJcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSAnMCc7XHJcbiAgICAgICAgZWxlbWVudC5zdHlsZVt0cmFuc2Zvcm1Qcm9wXSA9IGdldFRyYW5zbGF0ZVN0cmluZygwLCAwKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhdGUgaXRlbSdzIGFuaW1hdGlvbiBjb250cm9sbGVycy5cclxuICAgICAgICB0aGlzLl9hbmltYXRlID0gbmV3IEl0ZW1BbmltYXRlKGVsZW1lbnQpO1xyXG4gICAgICAgIHRoaXMuX2FuaW1hdGVDaGlsZCA9IG5ldyBJdGVtQW5pbWF0ZSh0aGlzLl9jaGlsZCk7XHJcblxyXG4gICAgICAgIC8vIFNldHVwIHZpc2liaWxpdHkgaGFuZGxlci5cclxuICAgICAgICB0aGlzLl92aXNpYmlsaXR5ID0gbmV3IEl0ZW1WaXNpYmlsaXR5KHRoaXMpO1xyXG5cclxuICAgICAgICAvLyBTZXQgdXAgbGF5b3V0IGhhbmRsZXIuXHJcbiAgICAgICAgdGhpcy5fbGF5b3V0ID0gbmV3IEl0ZW1MYXlvdXQodGhpcyk7XHJcblxyXG4gICAgICAgIC8vIFNldCB1cCBtaWdyYXRpb24gaGFuZGxlciBkYXRhLlxyXG4gICAgICAgIHRoaXMuX21pZ3JhdGUgPSBuZXcgSXRlbU1pZ3JhdGUodGhpcyk7XHJcblxyXG4gICAgICAgIC8vIFNldCB1cCByZWxlYXNlIGhhbmRsZXJcclxuICAgICAgICB0aGlzLl9yZWxlYXNlID0gbmV3IEl0ZW1SZWxlYXNlKHRoaXMpO1xyXG5cclxuICAgICAgICAvLyBTZXQgdXAgZHJhZyBoYW5kbGVyLlxyXG4gICAgICAgIHRoaXMuX2RyYWcgPSBzZXR0aW5ncy5kcmFnRW5hYmxlZCA/IG5ldyBJdGVtRHJhZyh0aGlzKSA6IG51bGw7XHJcblxyXG4gICAgICAgIC8vIFNldCB1cCB0aGUgaW5pdGlhbCBkaW1lbnNpb25zIGFuZCBzb3J0IGRhdGEuXHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaERpbWVuc2lvbnMoKTtcclxuICAgICAgICB0aGlzLl9yZWZyZXNoU29ydERhdGEoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFB1YmxpYyBwcm90b3R5cGUgbWV0aG9kc1xyXG4gICAgICogKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgaW5zdGFuY2UgZ3JpZCByZWZlcmVuY2UuXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEl0ZW0ucHJvdG90eXBlXHJcbiAgICAgKiBAcmV0dXJucyB7R3JpZH1cclxuICAgICAqL1xyXG4gICAgSXRlbS5wcm90b3R5cGUuZ2V0R3JpZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gZ3JpZEluc3RhbmNlc1t0aGlzLl9ncmlkSWRdO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgaW5zdGFuY2UgZWxlbWVudC5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbS5wcm90b3R5cGVcclxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cclxuICAgICAqL1xyXG4gICAgSXRlbS5wcm90b3R5cGUuZ2V0RWxlbWVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZWxlbWVudDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgaW5zdGFuY2UgZWxlbWVudCdzIGNhY2hlZCB3aWR0aC5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbS5wcm90b3R5cGVcclxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIEl0ZW0ucHJvdG90eXBlLmdldFdpZHRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl93aWR0aDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgaW5zdGFuY2UgZWxlbWVudCdzIGNhY2hlZCBoZWlnaHQuXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEl0ZW0ucHJvdG90eXBlXHJcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBJdGVtLnByb3RvdHlwZS5nZXRIZWlnaHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hlaWdodDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgaW5zdGFuY2UgZWxlbWVudCdzIGNhY2hlZCBtYXJnaW5zLlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtLnByb3RvdHlwZVxyXG4gICAgICogQHJldHVybnMge09iamVjdH1cclxuICAgICAqICAgLSBUaGUgcmV0dXJuZWQgb2JqZWN0IGNvbnRhaW5zIGxlZnQsIHJpZ2h0LCB0b3AgYW5kIGJvdHRvbSBwcm9wZXJ0aWVzXHJcbiAgICAgKiAgICAgd2hpY2ggaW5kaWNhdGUgdGhlIGl0ZW0gZWxlbWVudCdzIGNhY2hlZCBtYXJnaW5zLlxyXG4gICAgICovXHJcbiAgICBJdGVtLnByb3RvdHlwZS5nZXRNYXJnaW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbGVmdDogdGhpcy5fbWFyZ2luTGVmdCxcclxuICAgICAgICAgICAgcmlnaHQ6IHRoaXMuX21hcmdpblJpZ2h0LFxyXG4gICAgICAgICAgICB0b3A6IHRoaXMuX21hcmdpblRvcCxcclxuICAgICAgICAgICAgYm90dG9tOiB0aGlzLl9tYXJnaW5Cb3R0b21cclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBpbnN0YW5jZSBlbGVtZW50J3MgY2FjaGVkIHBvc2l0aW9uLlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtLnByb3RvdHlwZVxyXG4gICAgICogQHJldHVybnMge09iamVjdH1cclxuICAgICAqICAgLSBUaGUgcmV0dXJuZWQgb2JqZWN0IGNvbnRhaW5zIGxlZnQgYW5kIHRvcCBwcm9wZXJ0aWVzIHdoaWNoIGluZGljYXRlIHRoZVxyXG4gICAgICogICAgIGl0ZW0gZWxlbWVudCdzIGNhY2hlZCBwb3NpdGlvbiBpbiB0aGUgZ3JpZC5cclxuICAgICAqL1xyXG4gICAgSXRlbS5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbGVmdDogdGhpcy5fbGVmdCxcclxuICAgICAgICAgICAgdG9wOiB0aGlzLl90b3BcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIElzIHRoZSBpdGVtIGFjdGl2ZT9cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbS5wcm90b3R5cGVcclxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBJdGVtLnByb3RvdHlwZS5pc0FjdGl2ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNBY3RpdmU7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSXMgdGhlIGl0ZW0gdmlzaWJsZT9cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbS5wcm90b3R5cGVcclxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBJdGVtLnByb3RvdHlwZS5pc1Zpc2libGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fdmlzaWJpbGl0eSAmJiAhdGhpcy5fdmlzaWJpbGl0eS5faXNIaWRkZW47XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSXMgdGhlIGl0ZW0gYmVpbmcgYW5pbWF0ZWQgdG8gdmlzaWJsZT9cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgSXRlbS5wcm90b3R5cGVcclxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBJdGVtLnByb3RvdHlwZS5pc1Nob3dpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuX3Zpc2liaWxpdHkgJiYgdGhpcy5fdmlzaWJpbGl0eS5faXNTaG93aW5nKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJcyB0aGUgaXRlbSBiZWluZyBhbmltYXRlZCB0byBoaWRkZW4/XHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEl0ZW0ucHJvdG90eXBlXHJcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgSXRlbS5wcm90b3R5cGUuaXNIaWRpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuX3Zpc2liaWxpdHkgJiYgdGhpcy5fdmlzaWJpbGl0eS5faXNIaWRpbmcpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIElzIHRoZSBpdGVtIHBvc2l0aW9uaW5nP1xyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtLnByb3RvdHlwZVxyXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIEl0ZW0ucHJvdG90eXBlLmlzUG9zaXRpb25pbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuX2xheW91dCAmJiB0aGlzLl9sYXlvdXQuX2lzQWN0aXZlKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJcyB0aGUgaXRlbSBiZWluZyBkcmFnZ2VkP1xyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtLnByb3RvdHlwZVxyXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIEl0ZW0ucHJvdG90eXBlLmlzRHJhZ2dpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuX2RyYWcgJiYgdGhpcy5fZHJhZy5faXNBY3RpdmUpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIElzIHRoZSBpdGVtIGJlaW5nIHJlbGVhc2VkP1xyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtLnByb3RvdHlwZVxyXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIEl0ZW0ucHJvdG90eXBlLmlzUmVsZWFzaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAhISh0aGlzLl9yZWxlYXNlICYmIHRoaXMuX3JlbGVhc2UuX2lzQWN0aXZlKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJcyB0aGUgaXRlbSBkZXN0cm95ZWQ/XHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEl0ZW0ucHJvdG90eXBlXHJcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgSXRlbS5wcm90b3R5cGUuaXNEZXN0cm95ZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzRGVzdHJveWVkO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFByaXZhdGUgcHJvdG90eXBlIG1ldGhvZHNcclxuICAgICAqICoqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVjYWxjdWxhdGUgaXRlbSdzIGRpbWVuc2lvbnMuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtLnByb3RvdHlwZVxyXG4gICAgICovXHJcbiAgICBJdGVtLnByb3RvdHlwZS5fcmVmcmVzaERpbWVuc2lvbnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkIHx8IHRoaXMuX3Zpc2liaWxpdHkuX2lzSGlkZGVuKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5fZWxlbWVudDtcclxuICAgICAgICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0ZSB3aWR0aCBhbmQgaGVpZ2h0LlxyXG4gICAgICAgIHRoaXMuX3dpZHRoID0gcmVjdC53aWR0aDtcclxuICAgICAgICB0aGlzLl9oZWlnaHQgPSByZWN0LmhlaWdodDtcclxuXHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIG1hcmdpbnMgKGlnbm9yZSBuZWdhdGl2ZSBtYXJnaW5zKS5cclxuICAgICAgICB0aGlzLl9tYXJnaW5MZWZ0ID0gTWF0aC5tYXgoMCwgZ2V0U3R5bGVBc0Zsb2F0KGVsZW1lbnQsICdtYXJnaW4tbGVmdCcpKTtcclxuICAgICAgICB0aGlzLl9tYXJnaW5SaWdodCA9IE1hdGgubWF4KDAsIGdldFN0eWxlQXNGbG9hdChlbGVtZW50LCAnbWFyZ2luLXJpZ2h0JykpO1xyXG4gICAgICAgIHRoaXMuX21hcmdpblRvcCA9IE1hdGgubWF4KDAsIGdldFN0eWxlQXNGbG9hdChlbGVtZW50LCAnbWFyZ2luLXRvcCcpKTtcclxuICAgICAgICB0aGlzLl9tYXJnaW5Cb3R0b20gPSBNYXRoLm1heCgwLCBnZXRTdHlsZUFzRmxvYXQoZWxlbWVudCwgJ21hcmdpbi1ib3R0b20nKSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmV0Y2ggYW5kIHN0b3JlIGl0ZW0ncyBzb3J0IGRhdGEuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBJdGVtLnByb3RvdHlwZVxyXG4gICAgICovXHJcbiAgICBJdGVtLnByb3RvdHlwZS5fcmVmcmVzaFNvcnREYXRhID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgZGF0YSA9ICh0aGlzLl9zb3J0RGF0YSA9IHt9KTtcclxuICAgICAgICB2YXIgZ2V0dGVycyA9IHRoaXMuZ2V0R3JpZCgpLl9zZXR0aW5ncy5zb3J0RGF0YTtcclxuICAgICAgICB2YXIgcHJvcDtcclxuXHJcbiAgICAgICAgZm9yIChwcm9wIGluIGdldHRlcnMpIHtcclxuICAgICAgICAgICAgZGF0YVtwcm9wXSA9IGdldHRlcnNbcHJvcF0odGhpcywgdGhpcy5fZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERlc3Ryb3kgaXRlbSBpbnN0YW5jZS5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQG1lbWJlcm9mIEl0ZW0ucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtyZW1vdmVFbGVtZW50PWZhbHNlXVxyXG4gICAgICovXHJcbiAgICBJdGVtLnByb3RvdHlwZS5fZGVzdHJveSA9IGZ1bmN0aW9uIChyZW1vdmVFbGVtZW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5fZWxlbWVudDtcclxuICAgICAgICB2YXIgZ3JpZCA9IHRoaXMuZ2V0R3JpZCgpO1xyXG4gICAgICAgIHZhciBzZXR0aW5ncyA9IGdyaWQuX3NldHRpbmdzO1xyXG4gICAgICAgIHZhciBpbmRleCA9IGdyaWQuX2l0ZW1zLmluZGV4T2YodGhpcyk7XHJcblxyXG4gICAgICAgIC8vIERlc3Ryb3kgaGFuZGxlcnMuXHJcbiAgICAgICAgdGhpcy5fcmVsZWFzZS5kZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy5fbWlncmF0ZS5kZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy5fbGF5b3V0LmRlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLl92aXNpYmlsaXR5LmRlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLl9hbmltYXRlLmRlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLl9hbmltYXRlQ2hpbGQuZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMuX2RyYWcgJiYgdGhpcy5fZHJhZy5kZXN0cm95KCk7XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBhbGwgaW5saW5lIHN0eWxlcy5cclxuICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcclxuICAgICAgICB0aGlzLl9jaGlsZC5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBpdGVtIGNsYXNzLlxyXG4gICAgICAgIHJlbW92ZUNsYXNzKGVsZW1lbnQsIHNldHRpbmdzLml0ZW1DbGFzcyk7XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBpdGVtIGZyb20gR3JpZCBpbnN0YW5jZSBpZiBpdCBzdGlsbCBleGlzdHMgdGhlcmUuXHJcbiAgICAgICAgaW5kZXggPiAtMSAmJiBncmlkLl9pdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgZWxlbWVudCBmcm9tIERPTS5cclxuICAgICAgICByZW1vdmVFbGVtZW50ICYmIGVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbGVtZW50KTtcclxuXHJcbiAgICAgICAgLy8gUmVzZXQgc3RhdGUuXHJcbiAgICAgICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9pc0Rlc3Ryb3llZCA9IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBpcyB0aGUgZGVmYXVsdCBsYXlvdXQgYWxnb3JpdGhtIGZvciBNdXVyaS4gQmFzZWQgb24gTUFYUkVDVFMgYXBwcm9hY2hcclxuICAgICAqIGFzIGRlc2NyaWJlZCBieSBKdWtrYSBKeWzDpG5raSBpbiBoaXMgc3VydmV5OiBcIkEgVGhvdXNhbmQgV2F5cyB0byBQYWNrIHRoZVxyXG4gICAgICogQmluIC0gQSBQcmFjdGljYWwgQXBwcm9hY2ggdG8gVHdvLURpbWVuc2lvbmFsIFJlY3RhbmdsZSBCaW4gUGFja2luZy5cIi5cclxuICAgICAqXHJcbiAgICAgKiBAY2xhc3NcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gUGFja2VyKCkge1xyXG4gICAgICAgIHRoaXMuX3Nsb3RzID0gW107XHJcbiAgICAgICAgdGhpcy5fc2xvdFNpemVzID0gW107XHJcbiAgICAgICAgdGhpcy5fZnJlZVNsb3RzID0gW107XHJcbiAgICAgICAgdGhpcy5fbmV3U2xvdHMgPSBbXTtcclxuICAgICAgICB0aGlzLl9yZWN0SXRlbSA9IHt9O1xyXG4gICAgICAgIHRoaXMuX3JlY3RTdG9yZSA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3JlY3RJZCA9IDA7XHJcblxyXG4gICAgICAgIC8vIFRoZSBsYXlvdXQgcmV0dXJuIGRhdGEsIHdoaWNoIHdpbGwgYmUgcG9wdWxhdGVkIGluIGdldExheW91dC5cclxuICAgICAgICB0aGlzLl9sYXlvdXQgPSB7XHJcbiAgICAgICAgICAgIHNsb3RzOiBudWxsLFxyXG4gICAgICAgICAgICBzZXRXaWR0aDogZmFsc2UsXHJcbiAgICAgICAgICAgIHNldEhlaWdodDogZmFsc2UsXHJcbiAgICAgICAgICAgIHdpZHRoOiBmYWxzZSxcclxuICAgICAgICAgICAgaGVpZ2h0OiBmYWxzZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEJpbmQgc29ydCBoYW5kbGVycy5cclxuICAgICAgICB0aGlzLl9zb3J0UmVjdHNMZWZ0VG9wID0gdGhpcy5fc29ydFJlY3RzTGVmdFRvcC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3NvcnRSZWN0c1RvcExlZnQgPSB0aGlzLl9zb3J0UmVjdHNUb3BMZWZ0LmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgUGFja2VyLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtJdGVtW119IGl0ZW1zXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBoZWlnaHRcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyW119IFtzbG90c11cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuZmlsbEdhcHM9ZmFsc2VdXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmhvcml6b250YWw9ZmFsc2VdXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmFsaWduUmlnaHQ9ZmFsc2VdXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmFsaWduQm90dG9tPWZhbHNlXVxyXG4gICAgICogQHJldHVybnMge0xheW91dERhdGF9XHJcbiAgICAgKi9cclxuICAgIFBhY2tlci5wcm90b3R5cGUuZ2V0TGF5b3V0ID0gZnVuY3Rpb24gKGl0ZW1zLCB3aWR0aCwgaGVpZ2h0LCBzbG90cywgb3B0aW9ucykge1xyXG4gICAgICAgIHZhciBsYXlvdXQgPSB0aGlzLl9sYXlvdXQ7XHJcbiAgICAgICAgdmFyIGZpbGxHYXBzID0gISEob3B0aW9ucyAmJiBvcHRpb25zLmZpbGxHYXBzKTtcclxuICAgICAgICB2YXIgaXNIb3Jpem9udGFsID0gISEob3B0aW9ucyAmJiBvcHRpb25zLmhvcml6b250YWwpO1xyXG4gICAgICAgIHZhciBhbGlnblJpZ2h0ID0gISEob3B0aW9ucyAmJiBvcHRpb25zLmFsaWduUmlnaHQpO1xyXG4gICAgICAgIHZhciBhbGlnbkJvdHRvbSA9ICEhKG9wdGlvbnMgJiYgb3B0aW9ucy5hbGlnbkJvdHRvbSk7XHJcbiAgICAgICAgdmFyIHJvdW5kaW5nID0gISEob3B0aW9ucyAmJiBvcHRpb25zLnJvdW5kaW5nKTtcclxuICAgICAgICB2YXIgc2xvdFNpemVzID0gdGhpcy5fc2xvdFNpemVzO1xyXG4gICAgICAgIHZhciBpO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBsYXlvdXQgZGF0YS5cclxuICAgICAgICBsYXlvdXQuc2xvdHMgPSBzbG90cyA/IHNsb3RzIDogdGhpcy5fc2xvdHM7XHJcbiAgICAgICAgbGF5b3V0LndpZHRoID0gaXNIb3Jpem9udGFsID8gMCA6IHJvdW5kaW5nID8gTWF0aC5yb3VuZCh3aWR0aCkgOiB3aWR0aDtcclxuICAgICAgICBsYXlvdXQuaGVpZ2h0ID0gIWlzSG9yaXpvbnRhbCA/IDAgOiByb3VuZGluZyA/IE1hdGgucm91bmQoaGVpZ2h0KSA6IGhlaWdodDtcclxuICAgICAgICBsYXlvdXQuc2V0V2lkdGggPSBpc0hvcml6b250YWw7XHJcbiAgICAgICAgbGF5b3V0LnNldEhlaWdodCA9ICFpc0hvcml6b250YWw7XHJcblxyXG4gICAgICAgIC8vIE1ha2Ugc3VyZSBzbG90cyBhbmQgc2xvdCBzaXplIGFycmF5cyBhcmUgcmVzZXQuXHJcbiAgICAgICAgbGF5b3V0LnNsb3RzLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgc2xvdFNpemVzLmxlbmd0aCA9IDA7XHJcblxyXG4gICAgICAgIC8vIE5vIG5lZWQgdG8gZ28gZnVydGhlciBpZiBpdGVtcyBkbyBub3QgZXhpc3QuXHJcbiAgICAgICAgaWYgKCFpdGVtcy5sZW5ndGgpIHJldHVybiBsYXlvdXQ7XHJcblxyXG4gICAgICAgIC8vIEZpbmQgc2xvdHMgZm9yIGl0ZW1zLlxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRTbG90KGl0ZW1zW2ldLCBpc0hvcml6b250YWwsIGZpbGxHYXBzLCByb3VuZGluZywgYWxpZ25SaWdodCB8fCBhbGlnbkJvdHRvbSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiB0aGUgYWxpZ25tZW50IGlzIHNldCB0byByaWdodCB3ZSBuZWVkIHRvIGFkanVzdCB0aGUgcmVzdWx0cy5cclxuICAgICAgICBpZiAoYWxpZ25SaWdodCkge1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGF5b3V0LnNsb3RzLmxlbmd0aDsgaSA9IGkgKyAyKSB7XHJcbiAgICAgICAgICAgICAgICBsYXlvdXQuc2xvdHNbaV0gPSBsYXlvdXQud2lkdGggLSAobGF5b3V0LnNsb3RzW2ldICsgc2xvdFNpemVzW2ldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIGFsaWdubWVudCBpcyBzZXQgdG8gYm90dG9tIHdlIG5lZWQgdG8gYWRqdXN0IHRoZSByZXN1bHRzLlxyXG4gICAgICAgIGlmIChhbGlnbkJvdHRvbSkge1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGF5b3V0LnNsb3RzLmxlbmd0aDsgaSA9IGkgKyAyKSB7XHJcbiAgICAgICAgICAgICAgICBsYXlvdXQuc2xvdHNbaV0gPSBsYXlvdXQuaGVpZ2h0IC0gKGxheW91dC5zbG90c1tpXSArIHNsb3RTaXplc1tpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHNsb3RzIGFycmF5cyBhbmQgcmVjdCBpZC5cclxuICAgICAgICBzbG90U2l6ZXMubGVuZ3RoID0gMDtcclxuICAgICAgICB0aGlzLl9mcmVlU2xvdHMubGVuZ3RoID0gMDtcclxuICAgICAgICB0aGlzLl9uZXdTbG90cy5sZW5ndGggPSAwO1xyXG4gICAgICAgIHRoaXMuX3JlY3RJZCA9IDA7XHJcblxyXG4gICAgICAgIHJldHVybiBsYXlvdXQ7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIHBvc2l0aW9uIGZvciB0aGUgbGF5b3V0IGl0ZW0uIFJldHVybnMgdGhlIGxlZnQgYW5kIHRvcCBwb3NpdGlvblxyXG4gICAgICogb2YgdGhlIGl0ZW0gaW4gcGl4ZWxzLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAbWVtYmVyb2YgUGFja2VyLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtJdGVtfSBpdGVtXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzSG9yaXpvbnRhbFxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBmaWxsR2Fwc1xyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSByb3VuZGluZ1xyXG4gICAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAgICovXHJcbiAgICBQYWNrZXIucHJvdG90eXBlLl9hZGRTbG90ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbGVld2F5ID0gMC4wMDE7XHJcbiAgICAgICAgdmFyIGl0ZW1TbG90ID0ge307XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChpdGVtLCBpc0hvcml6b250YWwsIGZpbGxHYXBzLCByb3VuZGluZywgdHJhY2tTaXplKSB7XHJcbiAgICAgICAgICAgIHZhciBsYXlvdXQgPSB0aGlzLl9sYXlvdXQ7XHJcbiAgICAgICAgICAgIHZhciBmcmVlU2xvdHMgPSB0aGlzLl9mcmVlU2xvdHM7XHJcbiAgICAgICAgICAgIHZhciBuZXdTbG90cyA9IHRoaXMuX25ld1Nsb3RzO1xyXG4gICAgICAgICAgICB2YXIgcmVjdDtcclxuICAgICAgICAgICAgdmFyIHJlY3RJZDtcclxuICAgICAgICAgICAgdmFyIHBvdGVudGlhbFNsb3RzO1xyXG4gICAgICAgICAgICB2YXIgaWdub3JlQ3VycmVudFNsb3RzO1xyXG4gICAgICAgICAgICB2YXIgaTtcclxuICAgICAgICAgICAgdmFyIGlpO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVzZXQgbmV3IHNsb3RzLlxyXG4gICAgICAgICAgICBuZXdTbG90cy5sZW5ndGggPSAwO1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IGl0ZW0gc2xvdCBpbml0aWFsIGRhdGEuXHJcbiAgICAgICAgICAgIGl0ZW1TbG90LmxlZnQgPSBudWxsO1xyXG4gICAgICAgICAgICBpdGVtU2xvdC50b3AgPSBudWxsO1xyXG4gICAgICAgICAgICBpdGVtU2xvdC53aWR0aCA9IGl0ZW0uX3dpZHRoICsgaXRlbS5fbWFyZ2luTGVmdCArIGl0ZW0uX21hcmdpblJpZ2h0O1xyXG4gICAgICAgICAgICBpdGVtU2xvdC5oZWlnaHQgPSBpdGVtLl9oZWlnaHQgKyBpdGVtLl9tYXJnaW5Ub3AgKyBpdGVtLl9tYXJnaW5Cb3R0b207XHJcblxyXG4gICAgICAgICAgICAvLyBSb3VuZCBpdGVtIHNsb3Qgd2lkdGggYW5kIGhlaWdodCBpZiBuZWVkZWQuXHJcbiAgICAgICAgICAgIGlmIChyb3VuZGluZykge1xyXG4gICAgICAgICAgICAgICAgaXRlbVNsb3Qud2lkdGggPSBNYXRoLnJvdW5kKGl0ZW1TbG90LndpZHRoKTtcclxuICAgICAgICAgICAgICAgIGl0ZW1TbG90LmhlaWdodCA9IE1hdGgucm91bmQoaXRlbVNsb3QuaGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVHJ5IHRvIGZpbmQgYSBzbG90IGZvciB0aGUgaXRlbS5cclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGZyZWVTbG90cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgcmVjdElkID0gZnJlZVNsb3RzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFyZWN0SWQpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgcmVjdCA9IHRoaXMuX2dldFJlY3QocmVjdElkKTtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtU2xvdC53aWR0aCA8PSByZWN0LndpZHRoICsgbGVld2F5ICYmIGl0ZW1TbG90LmhlaWdodCA8PSByZWN0LmhlaWdodCArIGxlZXdheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1TbG90LmxlZnQgPSByZWN0LmxlZnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbVNsb3QudG9wID0gcmVjdC50b3A7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIElmIG5vIHNsb3Qgd2FzIGZvdW5kIGZvciB0aGUgaXRlbS5cclxuICAgICAgICAgICAgaWYgKGl0ZW1TbG90LmxlZnQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIFBvc2l0aW9uIHRoZSBpdGVtIGluIHRvIHRoZSBib3R0b20gbGVmdCAodmVydGljYWwgbW9kZSkgb3IgdG9wIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICAvLyAoaG9yaXpvbnRhbCBtb2RlKSBvZiB0aGUgZ3JpZC5cclxuICAgICAgICAgICAgICAgIGl0ZW1TbG90LmxlZnQgPSAhaXNIb3Jpem9udGFsID8gMCA6IGxheW91dC53aWR0aDtcclxuICAgICAgICAgICAgICAgIGl0ZW1TbG90LnRvcCA9ICFpc0hvcml6b250YWwgPyBsYXlvdXQuaGVpZ2h0IDogMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBnYXBzIGRvbid0IG5lZWRzIGZpbGxpbmcgZG8gbm90IGFkZCBhbnkgY3VycmVudCBzbG90cyB0byB0aGUgbmV3XHJcbiAgICAgICAgICAgICAgICAvLyBzbG90cyBhcnJheS5cclxuICAgICAgICAgICAgICAgIGlmICghZmlsbEdhcHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZ25vcmVDdXJyZW50U2xvdHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJbiB2ZXJ0aWNhbCBtb2RlLCBpZiB0aGUgaXRlbSdzIGJvdHRvbSBvdmVybGFwcyB0aGUgZ3JpZCdzIGJvdHRvbS5cclxuICAgICAgICAgICAgaWYgKCFpc0hvcml6b250YWwgJiYgaXRlbVNsb3QudG9wICsgaXRlbVNsb3QuaGVpZ2h0ID4gbGF5b3V0LmhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgaXRlbSBpcyBub3QgYWxpZ25lZCB0byB0aGUgbGVmdCBlZGdlLCBjcmVhdGUgYSBuZXcgc2xvdC5cclxuICAgICAgICAgICAgICAgIGlmIChpdGVtU2xvdC5sZWZ0ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld1Nsb3RzLnB1c2godGhpcy5fYWRkUmVjdCgwLCBsYXlvdXQuaGVpZ2h0LCBpdGVtU2xvdC5sZWZ0LCBJbmZpbml0eSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIElmIGl0ZW0gaXMgbm90IGFsaWduZWQgdG8gdGhlIHJpZ2h0IGVkZ2UsIGNyZWF0ZSBhIG5ldyBzbG90LlxyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1TbG90LmxlZnQgKyBpdGVtU2xvdC53aWR0aCA8IGxheW91dC53aWR0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld1Nsb3RzLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFJlY3QoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtU2xvdC5sZWZ0ICsgaXRlbVNsb3Qud2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQuaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0LndpZHRoIC0gaXRlbVNsb3QubGVmdCAtIGl0ZW1TbG90LndpZHRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSW5maW5pdHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGdyaWQgaGVpZ2h0LlxyXG4gICAgICAgICAgICAgICAgbGF5b3V0LmhlaWdodCA9IGl0ZW1TbG90LnRvcCArIGl0ZW1TbG90LmhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSW4gaG9yaXpvbnRhbCBtb2RlLCBpZiB0aGUgaXRlbSdzIHJpZ2h0IG92ZXJsYXBzIHRoZSBncmlkJ3MgcmlnaHQgZWRnZS5cclxuICAgICAgICAgICAgaWYgKGlzSG9yaXpvbnRhbCAmJiBpdGVtU2xvdC5sZWZ0ICsgaXRlbVNsb3Qud2lkdGggPiBsYXlvdXQud2lkdGgpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIGl0ZW0gaXMgbm90IGFsaWduZWQgdG8gdGhlIHRvcCwgY3JlYXRlIGEgbmV3IHNsb3QuXHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbVNsb3QudG9wID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld1Nsb3RzLnB1c2godGhpcy5fYWRkUmVjdChsYXlvdXQud2lkdGgsIDAsIEluZmluaXR5LCBpdGVtU2xvdC50b3ApKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBpdGVtIGlzIG5vdCBhbGlnbmVkIHRvIHRoZSBib3R0b20sIGNyZWF0ZSBhIG5ldyBzbG90LlxyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1TbG90LnRvcCArIGl0ZW1TbG90LmhlaWdodCA8IGxheW91dC5oZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXdTbG90cy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRSZWN0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0LndpZHRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbVNsb3QudG9wICsgaXRlbVNsb3QuaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSW5maW5pdHksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXQuaGVpZ2h0IC0gaXRlbVNsb3QudG9wIC0gaXRlbVNsb3QuaGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBncmlkIHdpZHRoLlxyXG4gICAgICAgICAgICAgICAgbGF5b3V0LndpZHRoID0gaXRlbVNsb3QubGVmdCArIGl0ZW1TbG90LndpZHRoO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgY3VycmVudCBzbG90cyBtYWtpbmcgc3VyZSB0aGVyZSBhcmUgbm8gb2xkIHNsb3RzIHRoYXRcclxuICAgICAgICAgICAgLy8gb3ZlcmxhcCB3aXRoIHRoZSBpdGVtLiBJZiBhbiBvbGQgc2xvdCBvdmVybGFwcyB3aXRoIHRoZSBpdGVtLCBzcGxpdCBpdFxyXG4gICAgICAgICAgICAvLyBpbnRvIHNtYWxsZXIgc2xvdHMgaWYgbmVjZXNzYXJ5LlxyXG4gICAgICAgICAgICBmb3IgKGkgPSBmaWxsR2FwcyA/IDAgOiBpZ25vcmVDdXJyZW50U2xvdHMgPyBmcmVlU2xvdHMubGVuZ3RoIDogaTsgaSA8IGZyZWVTbG90cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgcmVjdElkID0gZnJlZVNsb3RzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFyZWN0SWQpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgcmVjdCA9IHRoaXMuX2dldFJlY3QocmVjdElkKTtcclxuICAgICAgICAgICAgICAgIHBvdGVudGlhbFNsb3RzID0gdGhpcy5fc3BsaXRSZWN0KHJlY3QsIGl0ZW1TbG90KTtcclxuICAgICAgICAgICAgICAgIGZvciAoaWkgPSAwOyBpaSA8IHBvdGVudGlhbFNsb3RzLmxlbmd0aDsgaWkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlY3RJZCA9IHBvdGVudGlhbFNsb3RzW2lpXTtcclxuICAgICAgICAgICAgICAgICAgICByZWN0ID0gdGhpcy5fZ2V0UmVjdChyZWN0SWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIExldCdzIG1ha2Ugc3VyZSBoZXJlIHRoYXQgd2UgaGF2ZSBhIGJpZyBlbm91Z2ggc2xvdFxyXG4gICAgICAgICAgICAgICAgICAgIC8vICh3aWR0aC9oZWlnaHQgPiAwLjQ5cHgpIGFuZCBhbHNvIGxldCdzIG1ha2Ugc3VyZSB0aGF0IHRoZSBzbG90IGlzXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gd2l0aGluIHRoZSBib3VuZGFyaWVzIG9mIHRoZSBncmlkLlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVjdC53aWR0aCA+IDAuNDkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVjdC5oZWlnaHQgPiAwLjQ5ICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgoIWlzSG9yaXpvbnRhbCAmJiByZWN0LnRvcCA8IGxheW91dC5oZWlnaHQpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaXNIb3Jpem9udGFsICYmIHJlY3QubGVmdCA8IGxheW91dC53aWR0aCkpXHJcbiAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1Nsb3RzLnB1c2gocmVjdElkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFNhbml0aXplIG5ldyBzbG90cy5cclxuICAgICAgICAgICAgaWYgKG5ld1Nsb3RzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHVyZ2VSZWN0cyhuZXdTbG90cykuc29ydChcclxuICAgICAgICAgICAgICAgICAgICBpc0hvcml6b250YWwgPyB0aGlzLl9zb3J0UmVjdHNMZWZ0VG9wIDogdGhpcy5fc29ydFJlY3RzVG9wTGVmdFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIGxheW91dCB3aWR0aC9oZWlnaHQuXHJcbiAgICAgICAgICAgIGlmIChpc0hvcml6b250YWwpIHtcclxuICAgICAgICAgICAgICAgIGxheW91dC53aWR0aCA9IE1hdGgubWF4KGxheW91dC53aWR0aCwgaXRlbVNsb3QubGVmdCArIGl0ZW1TbG90LndpZHRoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxheW91dC5oZWlnaHQgPSBNYXRoLm1heChsYXlvdXQuaGVpZ2h0LCBpdGVtU2xvdC50b3AgKyBpdGVtU2xvdC5oZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgaXRlbSBzbG90IGRhdGEgdG8gbGF5b3V0IHNsb3RzIChhbmQgc3RvcmUgdGhlIHNsb3Qgc2l6ZSBmb3IgbGF0ZXJcclxuICAgICAgICAgICAgLy8gdXNhZ2UgdG9vIGlmIG5lY2Vzc2FyeSkuXHJcbiAgICAgICAgICAgIGxheW91dC5zbG90cy5wdXNoKGl0ZW1TbG90LmxlZnQsIGl0ZW1TbG90LnRvcCk7XHJcbiAgICAgICAgICAgIGlmICh0cmFja1NpemUpIHRoaXMuX3Nsb3RTaXplcy5wdXNoKGl0ZW1TbG90LndpZHRoLCBpdGVtU2xvdC5oZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgLy8gRnJlZS9uZXcgc2xvdHMgc3dpdGNoZXJvbyFcclxuICAgICAgICAgICAgdGhpcy5fZnJlZVNsb3RzID0gbmV3U2xvdHM7XHJcbiAgICAgICAgICAgIHRoaXMuX25ld1Nsb3RzID0gZnJlZVNsb3RzO1xyXG4gICAgICAgIH07XHJcbiAgICB9KSgpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgbmV3IHJlY3RhbmdsZSB0byB0aGUgcmVjdGFuZ2xlIHN0b3JlLiBSZXR1cm5zIHRoZSBpZCBvZiB0aGUgbmV3XHJcbiAgICAgKiByZWN0YW5nbGUuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBQYWNrZXIucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gbGVmdFxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHRvcFxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHdpZHRoXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaGVpZ2h0XHJcbiAgICAgKiBAcmV0dXJucyB7UmVjdElkfVxyXG4gICAgICovXHJcbiAgICBQYWNrZXIucHJvdG90eXBlLl9hZGRSZWN0ID0gZnVuY3Rpb24gKGxlZnQsIHRvcCwgd2lkdGgsIGhlaWdodCkge1xyXG4gICAgICAgIHZhciByZWN0SWQgPSArK3RoaXMuX3JlY3RJZDtcclxuICAgICAgICB2YXIgcmVjdFN0b3JlID0gdGhpcy5fcmVjdFN0b3JlO1xyXG5cclxuICAgICAgICByZWN0U3RvcmVbcmVjdElkXSA9IGxlZnQgfHwgMDtcclxuICAgICAgICByZWN0U3RvcmVbKyt0aGlzLl9yZWN0SWRdID0gdG9wIHx8IDA7XHJcbiAgICAgICAgcmVjdFN0b3JlWysrdGhpcy5fcmVjdElkXSA9IHdpZHRoIHx8IDA7XHJcbiAgICAgICAgcmVjdFN0b3JlWysrdGhpcy5fcmVjdElkXSA9IGhlaWdodCB8fCAwO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVjdElkO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCByZWN0YW5nbGUgZGF0YSBmcm9tIHRoZSByZWN0YW5nbGUgc3RvcmUgYnkgaWQuIE9wdGlvbmFsbHkgeW91IGNhblxyXG4gICAgICogcHJvdmlkZSBhIHRhcmdldCBvYmplY3Qgd2hlcmUgdGhlIHJlY3RhbmdsZSBkYXRhIHdpbGwgYmUgd3JpdHRlbiBpbi4gQnlcclxuICAgICAqIGRlZmF1bHQgYW4gaW50ZXJuYWwgb2JqZWN0IGlzIHJldXNlZCBhcyBhIHRhcmdldCBvYmplY3QuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBQYWNrZXIucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge1JlY3RJZH0gaWRcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbdGFyZ2V0XVxyXG4gICAgICogQHJldHVybnMge09iamVjdH1cclxuICAgICAqL1xyXG4gICAgUGFja2VyLnByb3RvdHlwZS5fZ2V0UmVjdCA9IGZ1bmN0aW9uIChpZCwgdGFyZ2V0KSB7XHJcbiAgICAgICAgdmFyIHJlY3RJdGVtID0gdGFyZ2V0ID8gdGFyZ2V0IDogdGhpcy5fcmVjdEl0ZW07XHJcbiAgICAgICAgdmFyIHJlY3RTdG9yZSA9IHRoaXMuX3JlY3RTdG9yZTtcclxuXHJcbiAgICAgICAgcmVjdEl0ZW0ubGVmdCA9IHJlY3RTdG9yZVtpZF0gfHwgMDtcclxuICAgICAgICByZWN0SXRlbS50b3AgPSByZWN0U3RvcmVbKytpZF0gfHwgMDtcclxuICAgICAgICByZWN0SXRlbS53aWR0aCA9IHJlY3RTdG9yZVsrK2lkXSB8fCAwO1xyXG4gICAgICAgIHJlY3RJdGVtLmhlaWdodCA9IHJlY3RTdG9yZVsrK2lkXSB8fCAwO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVjdEl0ZW07XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHVuY2ggYSBob2xlIGludG8gYSByZWN0YW5nbGUgYW5kIHNwbGl0IHRoZSByZW1haW5pbmcgYXJlYSBpbnRvIHNtYWxsZXJcclxuICAgICAqIHJlY3RhbmdsZXMgKDQgYXQgbWF4KS5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQG1lbWJlcm9mIFBhY2tlci5wcm90b3R5cGVcclxuICAgICAqIEBwYXJhbSB7UmVjdGFuZ2xlfSByZWN0XHJcbiAgICAgKiBAcGFyYW0ge1JlY3RhbmdsZX0gaG9sZVxyXG4gICAgICogQHJldHVybnMge1JlY3RJZFtdfVxyXG4gICAgICovXHJcbiAgICBQYWNrZXIucHJvdG90eXBlLl9zcGxpdFJlY3QgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciByZXN1bHRzID0gW107XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChyZWN0LCBob2xlKSB7XHJcbiAgICAgICAgICAgIC8vIFJlc2V0IG9sZCByZXN1bHRzLlxyXG4gICAgICAgICAgICByZXN1bHRzLmxlbmd0aCA9IDA7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiB0aGUgcmVjdCBkb2VzIG5vdCBvdmVybGFwIHdpdGggdGhlIGhvbGUgYWRkIHJlY3QgdG8gdGhlIHJldHVybiBkYXRhXHJcbiAgICAgICAgICAgIC8vIGFzIGlzLlxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2RvUmVjdHNPdmVybGFwKHJlY3QsIGhvbGUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5fYWRkUmVjdChyZWN0LmxlZnQsIHJlY3QudG9wLCByZWN0LndpZHRoLCByZWN0LmhlaWdodCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIExlZnQgc3BsaXQuXHJcbiAgICAgICAgICAgIGlmIChyZWN0LmxlZnQgPCBob2xlLmxlZnQpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLl9hZGRSZWN0KHJlY3QubGVmdCwgcmVjdC50b3AsIGhvbGUubGVmdCAtIHJlY3QubGVmdCwgcmVjdC5oZWlnaHQpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmlnaHQgc3BsaXQuXHJcbiAgICAgICAgICAgIGlmIChyZWN0LmxlZnQgKyByZWN0LndpZHRoID4gaG9sZS5sZWZ0ICsgaG9sZS53aWR0aCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZFJlY3QoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvbGUubGVmdCArIGhvbGUud2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY3QudG9wLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWN0LmxlZnQgKyByZWN0LndpZHRoIC0gKGhvbGUubGVmdCArIGhvbGUud2lkdGgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWN0LmhlaWdodFxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFRvcCBzcGxpdC5cclxuICAgICAgICAgICAgaWYgKHJlY3QudG9wIDwgaG9sZS50b3ApIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLl9hZGRSZWN0KHJlY3QubGVmdCwgcmVjdC50b3AsIHJlY3Qud2lkdGgsIGhvbGUudG9wIC0gcmVjdC50b3ApKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQm90dG9tIHNwbGl0LlxyXG4gICAgICAgICAgICBpZiAocmVjdC50b3AgKyByZWN0LmhlaWdodCA+IGhvbGUudG9wICsgaG9sZS5oZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRSZWN0KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWN0LmxlZnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvbGUudG9wICsgaG9sZS5oZWlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY3Qud2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY3QudG9wICsgcmVjdC5oZWlnaHQgLSAoaG9sZS50b3AgKyBob2xlLmhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgICAgICB9O1xyXG4gICAgfSkoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGlmIHR3byByZWN0YW5nbGVzIG92ZXJsYXAuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBQYWNrZXIucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge1JlY3RhbmdsZX0gYVxyXG4gICAgICogQHBhcmFtIHtSZWN0YW5nbGV9IGJcclxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBQYWNrZXIucHJvdG90eXBlLl9kb1JlY3RzT3ZlcmxhcCA9IGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgcmV0dXJuICEoXHJcbiAgICAgICAgICAgIGEubGVmdCArIGEud2lkdGggPD0gYi5sZWZ0IHx8XHJcbiAgICAgICAgICAgIGIubGVmdCArIGIud2lkdGggPD0gYS5sZWZ0IHx8XHJcbiAgICAgICAgICAgIGEudG9wICsgYS5oZWlnaHQgPD0gYi50b3AgfHxcclxuICAgICAgICAgICAgYi50b3AgKyBiLmhlaWdodCA8PSBhLnRvcFxyXG4gICAgICAgICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2sgaWYgYSByZWN0YW5nbGUgaXMgZnVsbHkgd2l0aGluIGFub3RoZXIgcmVjdGFuZ2xlLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAbWVtYmVyb2YgUGFja2VyLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtSZWN0YW5nbGV9IGFcclxuICAgICAqIEBwYXJhbSB7UmVjdGFuZ2xlfSBiXHJcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgUGFja2VyLnByb3RvdHlwZS5faXNSZWN0V2l0aGluUmVjdCA9IGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgYS5sZWZ0ID49IGIubGVmdCAmJlxyXG4gICAgICAgICAgICBhLnRvcCA+PSBiLnRvcCAmJlxyXG4gICAgICAgICAgICBhLmxlZnQgKyBhLndpZHRoIDw9IGIubGVmdCArIGIud2lkdGggJiZcclxuICAgICAgICAgICAgYS50b3AgKyBhLmhlaWdodCA8PSBiLnRvcCArIGIuaGVpZ2h0XHJcbiAgICAgICAgKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMb29wcyB0aHJvdWdoIGFuIGFycmF5IG9mIHJlY3RhbmdsZSBpZHMgYW5kIHJlc2V0cyBhbGwgdGhhdCBhcmUgZnVsbHlcclxuICAgICAqIHdpdGhpbiBhbm90aGVyIHJlY3RhbmdsZSBpbiB0aGUgYXJyYXkuIFJlc2V0dGluZyBpbiB0aGlzIGNhc2UgbWVhbnMgdGhhdFxyXG4gICAgICogdGhlIHJlY3RhbmdsZSBpZCB2YWx1ZSBpcyByZXBsYWNlZCB3aXRoIHplcm8uXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBQYWNrZXIucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge1JlY3RJZFtdfSByZWN0SWRzXHJcbiAgICAgKiBAcmV0dXJucyB7UmVjdElkW119XHJcbiAgICAgKi9cclxuICAgIFBhY2tlci5wcm90b3R5cGUuX3B1cmdlUmVjdHMgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciByZWN0QSA9IHt9O1xyXG4gICAgICAgIHZhciByZWN0QiA9IHt9O1xyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocmVjdElkcykge1xyXG4gICAgICAgICAgICB2YXIgaSA9IHJlY3RJZHMubGVuZ3RoO1xyXG4gICAgICAgICAgICB2YXIgaWk7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBpaSA9IHJlY3RJZHMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFyZWN0SWRzW2ldKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2dldFJlY3QocmVjdElkc1tpXSwgcmVjdEEpO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGlpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlY3RJZHNbaWldIHx8IGkgPT09IGlpKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faXNSZWN0V2l0aGluUmVjdChyZWN0QSwgdGhpcy5fZ2V0UmVjdChyZWN0SWRzW2lpXSwgcmVjdEIpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWN0SWRzW2ldID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVjdElkcztcclxuICAgICAgICB9O1xyXG4gICAgfSkoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNvcnQgcmVjdGFuZ2xlcyB3aXRoIHRvcC1sZWZ0IGdyYXZpdHkuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBQYWNrZXIucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge1JlY3RJZH0gYUlkXHJcbiAgICAgKiBAcGFyYW0ge1JlY3RJZH0gYklkXHJcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBQYWNrZXIucHJvdG90eXBlLl9zb3J0UmVjdHNUb3BMZWZ0ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcmVjdEEgPSB7fTtcclxuICAgICAgICB2YXIgcmVjdEIgPSB7fTtcclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGFJZCwgYklkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2dldFJlY3QoYUlkLCByZWN0QSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2dldFJlY3QoYklkLCByZWN0Qik7XHJcbiAgICAgICAgICAgIC8vIHByZXR0aWVyLWlnbm9yZVxyXG4gICAgICAgICAgICByZXR1cm4gcmVjdEEudG9wIDwgcmVjdEIudG9wID8gLTEgOlxyXG4gICAgICAgICAgICAgICAgcmVjdEEudG9wID4gcmVjdEIudG9wID8gMSA6XHJcbiAgICAgICAgICAgICAgICAgICAgcmVjdEEubGVmdCA8IHJlY3RCLmxlZnQgPyAtMSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY3RBLmxlZnQgPiByZWN0Qi5sZWZ0ID8gMSA6IDA7XHJcbiAgICAgICAgfTtcclxuICAgIH0pKCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTb3J0IHJlY3RhbmdsZXMgd2l0aCBsZWZ0LXRvcCBncmF2aXR5LlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAbWVtYmVyb2YgUGFja2VyLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtSZWN0SWR9IGFJZFxyXG4gICAgICogQHBhcmFtIHtSZWN0SWR9IGJJZFxyXG4gICAgICogQHJldHVybnMge051bWJlcn1cclxuICAgICAqL1xyXG4gICAgUGFja2VyLnByb3RvdHlwZS5fc29ydFJlY3RzTGVmdFRvcCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHJlY3RBID0ge307XHJcbiAgICAgICAgdmFyIHJlY3RCID0ge307XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhSWQsIGJJZCkge1xyXG4gICAgICAgICAgICB0aGlzLl9nZXRSZWN0KGFJZCwgcmVjdEEpO1xyXG4gICAgICAgICAgICB0aGlzLl9nZXRSZWN0KGJJZCwgcmVjdEIpO1xyXG4gICAgICAgICAgICAvLyBwcmV0dGllci1pZ25vcmVcclxuICAgICAgICAgICAgcmV0dXJuIHJlY3RBLmxlZnQgPCByZWN0Qi5sZWZ0ID8gLTEgOlxyXG4gICAgICAgICAgICAgICAgcmVjdEEubGVmdCA+IHJlY3RCLmxlZnQgPyAxIDpcclxuICAgICAgICAgICAgICAgICAgICByZWN0QS50b3AgPCByZWN0Qi50b3AgPyAtMSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY3RBLnRvcCA+IHJlY3RCLnRvcCA/IDEgOiAwO1xyXG4gICAgICAgIH07XHJcbiAgICB9KSgpO1xyXG5cclxuICAgIHZhciBodG1sQ29sbGVjdGlvblR5cGUgPSAnW29iamVjdCBIVE1MQ29sbGVjdGlvbl0nO1xyXG4gICAgdmFyIG5vZGVMaXN0VHlwZSA9ICdbb2JqZWN0IE5vZGVMaXN0XSc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVjayBpZiBhIHZhbHVlIGlzIGEgbm9kZSBsaXN0XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHsqfSB2YWxcclxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpc05vZGVMaXN0KHZhbCkge1xyXG4gICAgICAgIHZhciB0eXBlID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCk7XHJcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09IGh0bWxDb2xsZWN0aW9uVHlwZSB8fCB0eXBlID09PSBub2RlTGlzdFR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0cyBhIHZhbHVlIHRvIGFuIGFycmF5IG9yIGNsb25lcyBhbiBhcnJheS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0geyp9IHRhcmdldFxyXG4gICAgICogQHJldHVybnMge0FycmF5fVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB0b0FycmF5KHRhcmdldCkge1xyXG4gICAgICAgIHJldHVybiBpc05vZGVMaXN0KHRhcmdldCkgPyBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0YXJnZXQpIDogQXJyYXkucHJvdG90eXBlLmNvbmNhdCh0YXJnZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBwYWNrZXIgPSBuZXcgUGFja2VyKCk7XHJcbiAgICB2YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHsgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgR3JpZCBpbnN0YW5jZS5cclxuICAgICAqXHJcbiAgICAgKiBAY2xhc3NcclxuICAgICAqIEBwYXJhbSB7KEhUTUxFbGVtZW50fFN0cmluZyl9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7KD9IVE1MRWxlbWVudFtdfE5vZGVMaXN0fFN0cmluZyl9IFtvcHRpb25zLml0ZW1zXVxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnNob3dEdXJhdGlvbj0zMDBdXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuc2hvd0Vhc2luZz1cImVhc2VcIl1cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy52aXNpYmxlU3R5bGVzXVxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmhpZGVEdXJhdGlvbj0zMDBdXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuaGlkZUVhc2luZz1cImVhc2VcIl1cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy5oaWRkZW5TdHlsZXNdXHJcbiAgICAgKiBAcGFyYW0geyhGdW5jdGlvbnxPYmplY3QpfSBbb3B0aW9ucy5sYXlvdXRdXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmxheW91dC5maWxsR2Fwcz1mYWxzZV1cclxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMubGF5b3V0Lmhvcml6b250YWw9ZmFsc2VdXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmxheW91dC5hbGlnblJpZ2h0PWZhbHNlXVxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5sYXlvdXQuYWxpZ25Cb3R0b209ZmFsc2VdXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmxheW91dC5yb3VuZGluZz10cnVlXVxyXG4gICAgICogQHBhcmFtIHsoQm9vbGVhbnxOdW1iZXIpfSBbb3B0aW9ucy5sYXlvdXRPblJlc2l6ZT0xMDBdXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmxheW91dE9uSW5pdD10cnVlXVxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmxheW91dER1cmF0aW9uPTMwMF1cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5sYXlvdXRFYXNpbmc9XCJlYXNlXCJdXHJcbiAgICAgKiBAcGFyYW0gez9PYmplY3R9IFtvcHRpb25zLnNvcnREYXRhPW51bGxdXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmRyYWdFbmFibGVkPWZhbHNlXVxyXG4gICAgICogQHBhcmFtIHs/SHRtbEVsZW1lbnR9IFtvcHRpb25zLmRyYWdDb250YWluZXI9bnVsbF1cclxuICAgICAqIEBwYXJhbSB7P0Z1bmN0aW9ufSBbb3B0aW9ucy5kcmFnU3RhcnRQcmVkaWNhdGVdXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuZHJhZ1N0YXJ0UHJlZGljYXRlLmRpc3RhbmNlPTBdXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuZHJhZ1N0YXJ0UHJlZGljYXRlLmRlbGF5PTBdXHJcbiAgICAgKiBAcGFyYW0geyhCb29sZWFufFN0cmluZyl9IFtvcHRpb25zLmRyYWdTdGFydFByZWRpY2F0ZS5oYW5kbGU9ZmFsc2VdXHJcbiAgICAgKiBAcGFyYW0gez9TdHJpbmd9IFtvcHRpb25zLmRyYWdBeGlzXVxyXG4gICAgICogQHBhcmFtIHsoQm9vbGVhbnxGdW5jdGlvbil9IFtvcHRpb25zLmRyYWdTb3J0PXRydWVdXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuZHJhZ1NvcnRJbnRlcnZhbD0xMDBdXHJcbiAgICAgKiBAcGFyYW0geyhGdW5jdGlvbnxPYmplY3QpfSBbb3B0aW9ucy5kcmFnU29ydFByZWRpY2F0ZV1cclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5kcmFnU29ydFByZWRpY2F0ZS50aHJlc2hvbGQ9NTBdXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuZHJhZ1NvcnRQcmVkaWNhdGUuYWN0aW9uPVwibW92ZVwiXVxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmRyYWdSZWxlYXNlRHVyYXRpb249MzAwXVxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmRyYWdSZWxlYXNlRWFzaW5nPVwiZWFzZVwiXVxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zLmRyYWdIYW1tZXJTZXR0aW5ncz17dG91Y2hBY3Rpb246IFwibm9uZVwifV1cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5jb250YWluZXJDbGFzcz1cIm11dXJpXCJdXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuaXRlbUNsYXNzPVwibXV1cmktaXRlbVwiXVxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLml0ZW1WaXNpYmxlQ2xhc3M9XCJtdXVyaS1pdGVtLXZpc2libGVcIl1cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5pdGVtSGlkZGVuQ2xhc3M9XCJtdXVyaS1pdGVtLWhpZGRlblwiXVxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLml0ZW1Qb3NpdGlvbmluZ0NsYXNzPVwibXV1cmktaXRlbS1wb3NpdGlvbmluZ1wiXVxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLml0ZW1EcmFnZ2luZ0NsYXNzPVwibXV1cmktaXRlbS1kcmFnZ2luZ1wiXVxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLml0ZW1SZWxlYXNpbmdDbGFzcz1cIm11dXJpLWl0ZW0tcmVsZWFzaW5nXCJdXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIEdyaWQoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgICAgIHZhciBpbnN0ID0gdGhpcztcclxuICAgICAgICB2YXIgc2V0dGluZ3M7XHJcbiAgICAgICAgdmFyIGl0ZW1zO1xyXG4gICAgICAgIHZhciBsYXlvdXRPblJlc2l6ZTtcclxuXHJcbiAgICAgICAgLy8gQWxsb3cgcGFzc2luZyBlbGVtZW50IGFzIHNlbGVjdG9yIHN0cmluZy4gU3RvcmUgZWxlbWVudCBmb3IgaW5zdGFuY2UuXHJcbiAgICAgICAgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnQgPSB0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpIDogZWxlbWVudDtcclxuXHJcbiAgICAgICAgLy8gVGhyb3cgYW4gZXJyb3IgaWYgdGhlIGNvbnRhaW5lciBlbGVtZW50IGlzIG5vdCBib2R5IGVsZW1lbnQgb3IgZG9lcyBub3RcclxuICAgICAgICAvLyBleGlzdCB3aXRoaW4gdGhlIGJvZHkgZWxlbWVudC5cclxuICAgICAgICBpZiAoIWRvY3VtZW50LmJvZHkuY29udGFpbnMoZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb250YWluZXIgZWxlbWVudCBtdXN0IGJlIGFuIGV4aXN0aW5nIERPTSBlbGVtZW50Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDcmVhdGUgaW5zdGFuY2Ugc2V0dGluZ3MgYnkgbWVyZ2luZyB0aGUgb3B0aW9ucyB3aXRoIGRlZmF1bHQgb3B0aW9ucy5cclxuICAgICAgICBzZXR0aW5ncyA9IHRoaXMuX3NldHRpbmdzID0gbWVyZ2VTZXR0aW5ncyhHcmlkLmRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgLy8gU2FuaXRpemUgZHJhZ1NvcnQgc2V0dGluZy5cclxuICAgICAgICBpZiAodHlwZW9mIHNldHRpbmdzLmRyYWdTb3J0ICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIHNldHRpbmdzLmRyYWdTb3J0ID0gISFzZXR0aW5ncy5kcmFnU29ydDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBpbnN0YW5jZSBpZCBhbmQgc3RvcmUgaXQgdG8gdGhlIGdyaWQgaW5zdGFuY2VzIGNvbGxlY3Rpb24uXHJcbiAgICAgICAgdGhpcy5faWQgPSBjcmVhdGVVaWQoKTtcclxuICAgICAgICBncmlkSW5zdGFuY2VzW3RoaXMuX2lkXSA9IGluc3Q7XHJcblxyXG4gICAgICAgIC8vIERlc3Ryb3llZCBmbGFnLlxyXG4gICAgICAgIHRoaXMuX2lzRGVzdHJveWVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIFRoZSBsYXlvdXQgb2JqZWN0IChtdXRhdGVkIG9uIGV2ZXJ5IGxheW91dCkuXHJcbiAgICAgICAgdGhpcy5fbGF5b3V0ID0ge1xyXG4gICAgICAgICAgICBpZDogMCxcclxuICAgICAgICAgICAgaXRlbXM6IFtdLFxyXG4gICAgICAgICAgICBzbG90czogW10sXHJcbiAgICAgICAgICAgIHNldFdpZHRoOiBmYWxzZSxcclxuICAgICAgICAgICAgc2V0SGVpZ2h0OiBmYWxzZSxcclxuICAgICAgICAgICAgd2lkdGg6IDAsXHJcbiAgICAgICAgICAgIGhlaWdodDogMFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBwcml2YXRlIEVtaXR0ZXIgaW5zdGFuY2UuXHJcbiAgICAgICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBjb250YWluZXIgZWxlbWVudCdzIGNsYXNzIG5hbWUuXHJcbiAgICAgICAgYWRkQ2xhc3MoZWxlbWVudCwgc2V0dGluZ3MuY29udGFpbmVyQ2xhc3MpO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgaW5pdGlhbCBpdGVtcy5cclxuICAgICAgICB0aGlzLl9pdGVtcyA9IFtdO1xyXG4gICAgICAgIGl0ZW1zID0gc2V0dGluZ3MuaXRlbXM7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtcyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdG9BcnJheShlbGVtZW50LmNoaWxkcmVuKS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtRWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1zID09PSAnKicgfHwgZWxlbWVudE1hdGNoZXMoaXRlbUVsZW1lbnQsIGl0ZW1zKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3QuX2l0ZW1zLnB1c2gobmV3IEl0ZW0oaW5zdCwgaXRlbUVsZW1lbnQpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGl0ZW1zKSB8fCBpc05vZGVMaXN0KGl0ZW1zKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9pdGVtcyA9IHRvQXJyYXkoaXRlbXMpLm1hcChmdW5jdGlvbiAoaXRlbUVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgSXRlbShpbnN0LCBpdGVtRWxlbWVudCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgbGF5b3V0T25SZXNpemUgb3B0aW9uIGlzIGEgdmFsaWQgbnVtYmVyIHNhbml0aXplIGl0IGFuZCBiaW5kIHRoZSByZXNpemVcclxuICAgICAgICAvLyBoYW5kbGVyLlxyXG4gICAgICAgIGxheW91dE9uUmVzaXplID0gc2V0dGluZ3MubGF5b3V0T25SZXNpemU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBsYXlvdXRPblJlc2l6ZSAhPT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgbGF5b3V0T25SZXNpemUgPSBsYXlvdXRPblJlc2l6ZSA9PT0gdHJ1ZSA/IDAgOiAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGxheW91dE9uUmVzaXplID49IDApIHtcclxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXHJcbiAgICAgICAgICAgICAgICAncmVzaXplJyxcclxuICAgICAgICAgICAgICAgIChpbnN0Ll9yZXNpemVIYW5kbGVyID0gZGVib3VuY2UoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc3QucmVmcmVzaEl0ZW1zKCkubGF5b3V0KCk7XHJcbiAgICAgICAgICAgICAgICB9LCBsYXlvdXRPblJlc2l6ZSkpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBMYXlvdXQgb24gaW5pdCBpZiBuZWNlc3NhcnkuXHJcbiAgICAgICAgaWYgKHNldHRpbmdzLmxheW91dE9uSW5pdCkge1xyXG4gICAgICAgICAgICB0aGlzLmxheW91dCh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQdWJsaWMgcHJvcGVydGllc1xyXG4gICAgICogKioqKioqKioqKioqKioqKipcclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHNlZSBJdGVtXHJcbiAgICAgKi9cclxuICAgIEdyaWQuSXRlbSA9IEl0ZW07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAc2VlIEl0ZW1MYXlvdXRcclxuICAgICAqL1xyXG4gICAgR3JpZC5JdGVtTGF5b3V0ID0gSXRlbUxheW91dDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBzZWUgSXRlbVZpc2liaWxpdHlcclxuICAgICAqL1xyXG4gICAgR3JpZC5JdGVtVmlzaWJpbGl0eSA9IEl0ZW1WaXNpYmlsaXR5O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHNlZSBJdGVtUmVsZWFzZVxyXG4gICAgICovXHJcbiAgICBHcmlkLkl0ZW1SZWxlYXNlID0gSXRlbVJlbGVhc2U7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAc2VlIEl0ZW1NaWdyYXRlXHJcbiAgICAgKi9cclxuICAgIEdyaWQuSXRlbU1pZ3JhdGUgPSBJdGVtTWlncmF0ZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBzZWUgSXRlbUFuaW1hdGVcclxuICAgICAqL1xyXG4gICAgR3JpZC5JdGVtQW5pbWF0ZSA9IEl0ZW1BbmltYXRlO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHNlZSBJdGVtRHJhZ1xyXG4gICAgICovXHJcbiAgICBHcmlkLkl0ZW1EcmFnID0gSXRlbURyYWc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAc2VlIEVtaXR0ZXJcclxuICAgICAqL1xyXG4gICAgR3JpZC5FbWl0dGVyID0gRW1pdHRlcjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERlZmF1bHQgb3B0aW9ucyBmb3IgR3JpZCBpbnN0YW5jZS5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgR3JpZFxyXG4gICAgICovXHJcbiAgICBHcmlkLmRlZmF1bHRPcHRpb25zID0ge1xyXG4gICAgICAgIC8vIEl0ZW0gZWxlbWVudHNcclxuICAgICAgICBpdGVtczogJyonLFxyXG5cclxuICAgICAgICAvLyBEZWZhdWx0IHNob3cgYW5pbWF0aW9uXHJcbiAgICAgICAgc2hvd0R1cmF0aW9uOiAzMDAsXHJcbiAgICAgICAgc2hvd0Vhc2luZzogJ2Vhc2UnLFxyXG5cclxuICAgICAgICAvLyBEZWZhdWx0IGhpZGUgYW5pbWF0aW9uXHJcbiAgICAgICAgaGlkZUR1cmF0aW9uOiAzMDAsXHJcbiAgICAgICAgaGlkZUVhc2luZzogJ2Vhc2UnLFxyXG5cclxuICAgICAgICAvLyBJdGVtJ3MgdmlzaWJsZS9oaWRkZW4gc3RhdGUgc3R5bGVzXHJcbiAgICAgICAgdmlzaWJsZVN0eWxlczoge1xyXG4gICAgICAgICAgICBvcGFjaXR5OiAnMScsXHJcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3NjYWxlKDEpJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaGlkZGVuU3R5bGVzOiB7XHJcbiAgICAgICAgICAgIG9wYWNpdHk6ICcwJyxcclxuICAgICAgICAgICAgdHJhbnNmb3JtOiAnc2NhbGUoMC41KSdcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvLyBMYXlvdXRcclxuICAgICAgICBsYXlvdXQ6IHtcclxuICAgICAgICAgICAgZmlsbEdhcHM6IGZhbHNlLFxyXG4gICAgICAgICAgICBob3Jpem9udGFsOiBmYWxzZSxcclxuICAgICAgICAgICAgYWxpZ25SaWdodDogZmFsc2UsXHJcbiAgICAgICAgICAgIGFsaWduQm90dG9tOiBmYWxzZSxcclxuICAgICAgICAgICAgcm91bmRpbmc6IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxheW91dE9uUmVzaXplOiAxMDAsXHJcbiAgICAgICAgbGF5b3V0T25Jbml0OiB0cnVlLFxyXG4gICAgICAgIGxheW91dER1cmF0aW9uOiAzMDAsXHJcbiAgICAgICAgbGF5b3V0RWFzaW5nOiAnZWFzZScsXHJcblxyXG4gICAgICAgIC8vIFNvcnRpbmdcclxuICAgICAgICBzb3J0RGF0YTogbnVsbCxcclxuXHJcbiAgICAgICAgLy8gRHJhZyAmIERyb3BcclxuICAgICAgICBkcmFnRW5hYmxlZDogZmFsc2UsXHJcbiAgICAgICAgZHJhZ0NvbnRhaW5lcjogbnVsbCxcclxuICAgICAgICBkcmFnU3RhcnRQcmVkaWNhdGU6IHtcclxuICAgICAgICAgICAgZGlzdGFuY2U6IDAsXHJcbiAgICAgICAgICAgIGRlbGF5OiAwLFxyXG4gICAgICAgICAgICBoYW5kbGU6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkcmFnQXhpczogbnVsbCxcclxuICAgICAgICBkcmFnU29ydDogdHJ1ZSxcclxuICAgICAgICBkcmFnU29ydEludGVydmFsOiAxMDAsXHJcbiAgICAgICAgZHJhZ1NvcnRQcmVkaWNhdGU6IHtcclxuICAgICAgICAgICAgdGhyZXNob2xkOiA1MCxcclxuICAgICAgICAgICAgYWN0aW9uOiAnbW92ZSdcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRyYWdSZWxlYXNlRHVyYXRpb246IDMwMCxcclxuICAgICAgICBkcmFnUmVsZWFzZUVhc2luZzogJ2Vhc2UnLFxyXG4gICAgICAgIGRyYWdIYW1tZXJTZXR0aW5nczoge1xyXG4gICAgICAgICAgICB0b3VjaEFjdGlvbjogJ25vbmUnXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLy8gQ2xhc3NuYW1lc1xyXG4gICAgICAgIGNvbnRhaW5lckNsYXNzOiAnbXV1cmknLFxyXG4gICAgICAgIGl0ZW1DbGFzczogJ211dXJpLWl0ZW0nLFxyXG4gICAgICAgIGl0ZW1WaXNpYmxlQ2xhc3M6ICdtdXVyaS1pdGVtLXNob3duJyxcclxuICAgICAgICBpdGVtSGlkZGVuQ2xhc3M6ICdtdXVyaS1pdGVtLWhpZGRlbicsXHJcbiAgICAgICAgaXRlbVBvc2l0aW9uaW5nQ2xhc3M6ICdtdXVyaS1pdGVtLXBvc2l0aW9uaW5nJyxcclxuICAgICAgICBpdGVtRHJhZ2dpbmdDbGFzczogJ211dXJpLWl0ZW0tZHJhZ2dpbmcnLFxyXG4gICAgICAgIGl0ZW1SZWxlYXNpbmdDbGFzczogJ211dXJpLWl0ZW0tcmVsZWFzaW5nJ1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFB1YmxpYyBwcm90b3R5cGUgbWV0aG9kc1xyXG4gICAgICogKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIEJpbmQgYW4gZXZlbnQgbGlzdGVuZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEdyaWQucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXHJcbiAgICAgKiBAcmV0dXJucyB7R3JpZH1cclxuICAgICAqL1xyXG4gICAgR3JpZC5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnQsIGxpc3RlbmVyKSB7XHJcbiAgICAgICAgdGhpcy5fZW1pdHRlci5vbihldmVudCwgbGlzdGVuZXIpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEJpbmQgYW4gZXZlbnQgbGlzdGVuZXIgdGhhdCBpcyB0cmlnZ2VyZWQgb25seSBvbmNlLlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBHcmlkLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxyXG4gICAgICogQHJldHVybnMge0dyaWR9XHJcbiAgICAgKi9cclxuICAgIEdyaWQucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiAoZXZlbnQsIGxpc3RlbmVyKSB7XHJcbiAgICAgICAgdGhpcy5fZW1pdHRlci5vbmNlKGV2ZW50LCBsaXN0ZW5lcik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5iaW5kIGFuIGV2ZW50IGxpc3RlbmVyLlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBHcmlkLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxyXG4gICAgICogQHJldHVybnMge0dyaWR9XHJcbiAgICAgKi9cclxuICAgIEdyaWQucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChldmVudCwgbGlzdGVuZXIpIHtcclxuICAgICAgICB0aGlzLl9lbWl0dGVyLm9mZihldmVudCwgbGlzdGVuZXIpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgY29udGFpbmVyIGVsZW1lbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEdyaWQucHJvdG90eXBlXHJcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XHJcbiAgICAgKi9cclxuICAgIEdyaWQucHJvdG90eXBlLmdldEVsZW1lbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQ7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGFsbCBpdGVtcy4gT3B0aW9uYWxseSB5b3UgY2FuIHByb3ZpZGUgc3BlY2lmaWMgdGFyZ2V0cyAoZWxlbWVudHMgYW5kXHJcbiAgICAgKiBpbmRpY2VzKS4gTm90ZSB0aGF0IHRoZSByZXR1cm5lZCBhcnJheSBpcyBub3QgdGhlIHNhbWUgb2JqZWN0IHVzZWQgYnkgdGhlXHJcbiAgICAgKiBpbnN0YW5jZSBzbyBtb2RpZnlpbmcgaXQgd2lsbCBub3QgYWZmZWN0IGluc3RhbmNlJ3MgaXRlbXMuIEFsbCBpdGVtcyB0aGF0XHJcbiAgICAgKiBhcmUgbm90IGZvdW5kIGFyZSBvbWl0dGVkIGZyb20gdGhlIHJldHVybmVkIGFycmF5LlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBHcmlkLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtHcmlkTXVsdGlJdGVtUXVlcnl9IFt0YXJnZXRzXVxyXG4gICAgICogQHJldHVybnMge0l0ZW1bXX1cclxuICAgICAqL1xyXG4gICAgR3JpZC5wcm90b3R5cGUuZ2V0SXRlbXMgPSBmdW5jdGlvbiAodGFyZ2V0cykge1xyXG4gICAgICAgIC8vIFJldHVybiBhbGwgaXRlbXMgaW1tZWRpYXRlbHkgaWYgbm8gdGFyZ2V0cyB3ZXJlIHByb3ZpZGVkIG9yIGlmIHRoZVxyXG4gICAgICAgIC8vIGluc3RhbmNlIGlzIGRlc3Ryb3llZC5cclxuICAgICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQgfHwgKCF0YXJnZXRzICYmIHRhcmdldHMgIT09IDApKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pdGVtcy5zbGljZSgwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciByZXQgPSBbXTtcclxuICAgICAgICB2YXIgdGFyZ2V0SXRlbXMgPSB0b0FycmF5KHRhcmdldHMpO1xyXG4gICAgICAgIHZhciBpdGVtO1xyXG4gICAgICAgIHZhciBpO1xyXG5cclxuICAgICAgICAvLyBJZiB0YXJnZXQgaXRlbXMgYXJlIGRlZmluZWQgcmV0dXJuIGZpbHRlcmVkIHJlc3VsdHMuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRhcmdldEl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW0gPSB0aGlzLl9nZXRJdGVtKHRhcmdldEl0ZW1zW2ldKTtcclxuICAgICAgICAgICAgaXRlbSAmJiByZXQucHVzaChpdGVtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIHRoZSBjYWNoZWQgZGltZW5zaW9ucyBvZiB0aGUgaW5zdGFuY2UncyBpdGVtcy5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgR3JpZC5wcm90b3R5cGVcclxuICAgICAqIEBwYXJhbSB7R3JpZE11bHRpSXRlbVF1ZXJ5fSBbaXRlbXNdXHJcbiAgICAgKiBAcmV0dXJucyB7R3JpZH1cclxuICAgICAqL1xyXG4gICAgR3JpZC5wcm90b3R5cGUucmVmcmVzaEl0ZW1zID0gZnVuY3Rpb24gKGl0ZW1zKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSByZXR1cm4gdGhpcztcclxuXHJcbiAgICAgICAgdmFyIHRhcmdldHMgPSB0aGlzLmdldEl0ZW1zKGl0ZW1zKTtcclxuICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRhcmdldHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGFyZ2V0c1tpXS5fcmVmcmVzaERpbWVuc2lvbnMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZSB0aGUgc29ydCBkYXRhIG9mIHRoZSBpbnN0YW5jZSdzIGl0ZW1zLlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBHcmlkLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtHcmlkTXVsdGlJdGVtUXVlcnl9IFtpdGVtc11cclxuICAgICAqIEByZXR1cm5zIHtHcmlkfVxyXG4gICAgICovXHJcbiAgICBHcmlkLnByb3RvdHlwZS5yZWZyZXNoU29ydERhdGEgPSBmdW5jdGlvbiAoaXRlbXMpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQpIHJldHVybiB0aGlzO1xyXG5cclxuICAgICAgICB2YXIgdGFyZ2V0SXRlbXMgPSB0aGlzLmdldEl0ZW1zKGl0ZW1zKTtcclxuICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRhcmdldEl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRhcmdldEl0ZW1zW2ldLl9yZWZyZXNoU29ydERhdGEoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN5bmNocm9uaXplIHRoZSBpdGVtIGVsZW1lbnRzIHRvIG1hdGNoIHRoZSBvcmRlciBvZiB0aGUgaXRlbXMgaW4gdGhlIERPTS5cclxuICAgICAqIFRoaXMgY29tZXMgaGFuZHkgaWYgeW91IG5lZWQgdG8ga2VlcCB0aGUgRE9NIHN0cnVjdHVyZSBtYXRjaGVkIHdpdGggdGhlXHJcbiAgICAgKiBvcmRlciBvZiB0aGUgaXRlbXMuIE5vdGUgdGhhdCBpZiBhbiBpdGVtJ3MgZWxlbWVudCBpcyBub3QgY3VycmVudGx5IGEgY2hpbGRcclxuICAgICAqIG9mIHRoZSBjb250YWluZXIgZWxlbWVudCAoaWYgaXQgaXMgZHJhZ2dlZCBmb3IgZXhhbXBsZSkgaXQgaXMgaWdub3JlZCBhbmRcclxuICAgICAqIGxlZnQgdW50b3VjaGVkLlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBHcmlkLnByb3RvdHlwZVxyXG4gICAgICogQHJldHVybnMge0dyaWR9XHJcbiAgICAgKi9cclxuICAgIEdyaWQucHJvdG90eXBlLnN5bmNocm9uaXplID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLl9lbGVtZW50O1xyXG4gICAgICAgIHZhciBpdGVtcyA9IHRoaXMuX2l0ZW1zO1xyXG4gICAgICAgIHZhciBmcmFnbWVudDtcclxuICAgICAgICB2YXIgZWxlbWVudDtcclxuICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgLy8gQXBwZW5kIGFsbCBlbGVtZW50cyBpbiBvcmRlciB0byB0aGUgY29udGFpbmVyIGVsZW1lbnQuXHJcbiAgICAgICAgaWYgKGl0ZW1zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBpdGVtc1tpXS5fZWxlbWVudDtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnBhcmVudE5vZGUgPT09IGNvbnRhaW5lcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50ID0gZnJhZ21lbnQgfHwgZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZnJhZ21lbnQpIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmcmFnbWVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFbWl0IHN5bmNocm9uaXplIGV2ZW50LlxyXG4gICAgICAgIHRoaXMuX2VtaXQoZXZlbnRTeW5jaHJvbml6ZSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSBhbmQgYXBwbHkgaXRlbSBwb3NpdGlvbnMuXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEdyaWQucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtpbnN0YW50PWZhbHNlXVxyXG4gICAgICogQHBhcmFtIHtMYXlvdXRDYWxsYmFja30gW29uRmluaXNoXVxyXG4gICAgICogQHJldHVybnMge0dyaWR9XHJcbiAgICAgKi9cclxuICAgIEdyaWQucHJvdG90eXBlLmxheW91dCA9IGZ1bmN0aW9uIChpbnN0YW50LCBvbkZpbmlzaCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgICAgIHZhciBpbnN0ID0gdGhpcztcclxuICAgICAgICB2YXIgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnQ7XHJcbiAgICAgICAgdmFyIGxheW91dCA9IHRoaXMuX3VwZGF0ZUxheW91dCgpO1xyXG4gICAgICAgIHZhciBsYXlvdXRJZCA9IGxheW91dC5pZDtcclxuICAgICAgICB2YXIgaXRlbXNMZW5ndGggPSBsYXlvdXQuaXRlbXMubGVuZ3RoO1xyXG4gICAgICAgIHZhciBjb3VudGVyID0gaXRlbXNMZW5ndGg7XHJcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gdHlwZW9mIGluc3RhbnQgPT09ICdmdW5jdGlvbicgPyBpbnN0YW50IDogb25GaW5pc2g7XHJcbiAgICAgICAgdmFyIGlzQ2FsbGJhY2tGdW5jdGlvbiA9IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJztcclxuICAgICAgICB2YXIgY2FsbGJhY2tJdGVtcyA9IGlzQ2FsbGJhY2tGdW5jdGlvbiA/IGxheW91dC5pdGVtcy5zbGljZSgwKSA6IG51bGw7XHJcbiAgICAgICAgdmFyIGlzQm9yZGVyQm94O1xyXG4gICAgICAgIHZhciBpdGVtO1xyXG4gICAgICAgIHZhciBpO1xyXG5cclxuICAgICAgICAvLyBUaGUgZmluaXNoIGZ1bmN0aW9uLCB3aGljaCB3aWxsIGJlIHVzZWQgZm9yIGNoZWNraW5nIGlmIGFsbCB0aGUgaXRlbXNcclxuICAgICAgICAvLyBoYXZlIGxhaWQgb3V0IHlldC4gQWZ0ZXIgYWxsIGl0ZW1zIGhhdmUgZmluaXNoZWQgdGhlaXIgYW5pbWF0aW9ucyBjYWxsXHJcbiAgICAgICAgLy8gY2FsbGJhY2sgYW5kIGVtaXQgbGF5b3V0RW5kIGV2ZW50LiBPbmx5IGVtaXQgbGF5b3V0RW5kIGV2ZW50IGlmIHRoZXJlXHJcbiAgICAgICAgLy8gaGFzbid0IGJlZW4gYSBuZXcgbGF5b3V0IGNhbGwgZHVyaW5nIHRoaXMgbGF5b3V0LlxyXG4gICAgICAgIGZ1bmN0aW9uIHRyeUZpbmlzaCgpIHtcclxuICAgICAgICAgICAgaWYgKC0tY291bnRlciA+IDApIHJldHVybjtcclxuICAgICAgICAgICAgdmFyIGhhc0xheW91dENoYW5nZWQgPSBpbnN0Ll9sYXlvdXQuaWQgIT09IGxheW91dElkO1xyXG4gICAgICAgICAgICBpc0NhbGxiYWNrRnVuY3Rpb24gJiYgY2FsbGJhY2soaGFzTGF5b3V0Q2hhbmdlZCwgY2FsbGJhY2tJdGVtcyk7XHJcbiAgICAgICAgICAgIGlmICghaGFzTGF5b3V0Q2hhbmdlZCAmJiBpbnN0Ll9oYXNMaXN0ZW5lcnMoZXZlbnRMYXlvdXRFbmQpKSB7XHJcbiAgICAgICAgICAgICAgICBpbnN0Ll9lbWl0KGV2ZW50TGF5b3V0RW5kLCBsYXlvdXQuaXRlbXMuc2xpY2UoMCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBncmlkJ3Mgd2lkdGggb3IgaGVpZ2h0IHdhcyBtb2RpZmllZCwgd2UgbmVlZCB0byB1cGRhdGUgaXQncyBjYWNoZWRcclxuICAgICAgICAvLyBkaW1lbnNpb25zLiBBbHNvIGtlZXAgaW4gbWluZCB0aGF0IGdyaWQncyBjYWNoZWQgd2lkdGgvaGVpZ2h0IHNob3VsZFxyXG4gICAgICAgIC8vIGFsd2F5cyBlcXVhbCB0byB3aGF0IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkgd291bGQgcmV0dXJuLCBzb1xyXG4gICAgICAgIC8vIHRoZXJlZm9yZSB3ZSBuZWVkIHRvIGFkZCB0aGUgZ3JpZCBlbGVtZW50J3MgYm9yZGVycyB0byB0aGUgZGltZW5zaW9ucyBpZlxyXG4gICAgICAgIC8vIGl0J3MgYm94LXNpemluZyBpcyBib3JkZXItYm94LlxyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgKGxheW91dC5zZXRIZWlnaHQgJiYgdHlwZW9mIGxheW91dC5oZWlnaHQgPT09ICdudW1iZXInKSB8fFxyXG4gICAgICAgICAgICAobGF5b3V0LnNldFdpZHRoICYmIHR5cGVvZiBsYXlvdXQud2lkdGggPT09ICdudW1iZXInKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBpc0JvcmRlckJveCA9IGdldFN0eWxlKGVsZW1lbnQsICdib3gtc2l6aW5nJykgPT09ICdib3JkZXItYm94JztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGxheW91dC5zZXRIZWlnaHQpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBsYXlvdXQuaGVpZ2h0ID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5oZWlnaHQgPVxyXG4gICAgICAgICAgICAgICAgICAgIChpc0JvcmRlckJveCA/IGxheW91dC5oZWlnaHQgKyB0aGlzLl9ib3JkZXJUb3AgKyB0aGlzLl9ib3JkZXJCb3R0b20gOiBsYXlvdXQuaGVpZ2h0KSArICdweCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlLmhlaWdodCA9IGxheW91dC5oZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGxheW91dC5zZXRXaWR0aCkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGxheW91dC53aWR0aCA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUud2lkdGggPVxyXG4gICAgICAgICAgICAgICAgICAgIChpc0JvcmRlckJveCA/IGxheW91dC53aWR0aCArIHRoaXMuX2JvcmRlckxlZnQgKyB0aGlzLl9ib3JkZXJSaWdodCA6IGxheW91dC53aWR0aCkgKyAncHgnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5zdHlsZS53aWR0aCA9IGxheW91dC53aWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRW1pdCBsYXlvdXRTdGFydCBldmVudC4gTm90ZSB0aGF0IHRoaXMgaXMgaW50ZW50aW9uYWxseSBlbWl0dGVkIGFmdGVyIHRoZVxyXG4gICAgICAgIC8vIGNvbnRhaW5lciBlbGVtZW50J3MgZGltZW5zaW9ucyBhcmUgc2V0LCBiZWNhdXNlIG90aGVyd2lzZSB0aGVyZSB3b3VsZCBiZVxyXG4gICAgICAgIC8vIG5vIGhvb2sgZm9yIHJlYWN0aW5nIHRvIGNvbnRhaW5lciBkaW1lbnNpb24gY2hhbmdlcy5cclxuICAgICAgICBpZiAodGhpcy5faGFzTGlzdGVuZXJzKGV2ZW50TGF5b3V0U3RhcnQpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2VtaXQoZXZlbnRMYXlvdXRTdGFydCwgbGF5b3V0Lml0ZW1zLnNsaWNlKDApKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBpdGVtcyBsZXQncyBmaW5pc2ggcXVpY2tseS5cclxuICAgICAgICBpZiAoIWl0ZW1zTGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRyeUZpbmlzaCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBpdGVtcyBsZXQncyBwb3NpdGlvbiB0aGVtLlxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtc0xlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW0gPSBsYXlvdXQuaXRlbXNbaV07XHJcbiAgICAgICAgICAgIGlmICghaXRlbSkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgaXRlbSdzIHBvc2l0aW9uLlxyXG4gICAgICAgICAgICBpdGVtLl9sZWZ0ID0gbGF5b3V0LnNsb3RzW2kgKiAyXTtcclxuICAgICAgICAgICAgaXRlbS5fdG9wID0gbGF5b3V0LnNsb3RzW2kgKiAyICsgMV07XHJcblxyXG4gICAgICAgICAgICAvLyBMYXlvdXQgaXRlbSBpZiBpdCBpcyBub3QgZHJhZ2dlZC5cclxuICAgICAgICAgICAgaXRlbS5pc0RyYWdnaW5nKCkgPyB0cnlGaW5pc2goKSA6IGl0ZW0uX2xheW91dC5zdGFydChpbnN0YW50ID09PSB0cnVlLCB0cnlGaW5pc2gpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIG5ldyBpdGVtcyBieSBwcm92aWRpbmcgdGhlIGVsZW1lbnRzIHlvdSB3aXNoIHRvIGFkZCB0byB0aGUgaW5zdGFuY2UgYW5kXHJcbiAgICAgKiBvcHRpb25hbGx5IHByb3ZpZGUgdGhlIGluZGV4IHdoZXJlIHlvdSB3YW50IHRoZSBpdGVtcyB0byBiZSBpbnNlcnRlZCBpbnRvLlxyXG4gICAgICogQWxsIGVsZW1lbnRzIHRoYXQgYXJlIG5vdCBhbHJlYWR5IGNoaWxkcmVuIG9mIHRoZSBjb250YWluZXIgZWxlbWVudCB3aWxsIGJlXHJcbiAgICAgKiBhdXRvbWF0aWNhbGx5IGFwcGVuZGVkIHRvIHRoZSBjb250YWluZXIgZWxlbWVudC4gSWYgYW4gZWxlbWVudCBoYXMgaXQncyBDU1NcclxuICAgICAqIGRpc3BsYXkgcHJvcGVydHkgc2V0IHRvIFwibm9uZVwiIGl0IHdpbGwgYmUgbWFya2VkIGFzIGluYWN0aXZlIGR1cmluZyB0aGVcclxuICAgICAqIGluaXRpYXRpb24gcHJvY2Vzcy4gQXMgbG9uZyBhcyB0aGUgaXRlbSBpcyBpbmFjdGl2ZSBpdCB3aWxsIG5vdCBiZSBwYXJ0IG9mXHJcbiAgICAgKiB0aGUgbGF5b3V0LCBidXQgaXQgd2lsbCByZXRhaW4gaXQncyBpbmRleC4gWW91IGNhbiBhY3RpdmF0ZSBpdGVtcyBhdCBhbnlcclxuICAgICAqIHBvaW50IHdpdGggZ3JpZC5zaG93KCkgbWV0aG9kLiBUaGlzIG1ldGhvZCB3aWxsIGF1dG9tYXRpY2FsbHkgY2FsbFxyXG4gICAgICogZ3JpZC5sYXlvdXQoKSBpZiBvbmUgb3IgbW9yZSBvZiB0aGUgYWRkZWQgZWxlbWVudHMgYXJlIHZpc2libGUuIElmIG9ubHlcclxuICAgICAqIGhpZGRlbiBpdGVtcyBhcmUgYWRkZWQgbm8gbGF5b3V0IHdpbGwgYmUgY2FsbGVkLiBBbGwgdGhlIG5ldyB2aXNpYmxlIGl0ZW1zXHJcbiAgICAgKiBhcmUgcG9zaXRpb25lZCB3aXRob3V0IGFuaW1hdGlvbiBkdXJpbmcgdGhlaXIgZmlyc3QgbGF5b3V0LlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBHcmlkLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHsoSFRNTEVsZW1lbnR8SFRNTEVsZW1lbnRbXSl9IGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuaW5kZXg9LTFdXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmlzQWN0aXZlXVxyXG4gICAgICogQHBhcmFtIHsoQm9vbGVhbnxMYXlvdXRDYWxsYmFja3xTdHJpbmcpfSBbb3B0aW9ucy5sYXlvdXQ9dHJ1ZV1cclxuICAgICAqIEByZXR1cm5zIHtJdGVtW119XHJcbiAgICAgKi9cclxuICAgIEdyaWQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChlbGVtZW50cywgb3B0aW9ucykge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCB8fCAhZWxlbWVudHMpIHJldHVybiBbXTtcclxuXHJcbiAgICAgICAgdmFyIG5ld0l0ZW1zID0gdG9BcnJheShlbGVtZW50cyk7XHJcbiAgICAgICAgaWYgKCFuZXdJdGVtcy5sZW5ndGgpIHJldHVybiBuZXdJdGVtcztcclxuXHJcbiAgICAgICAgdmFyIG9wdHMgPSBvcHRpb25zIHx8IDA7XHJcbiAgICAgICAgdmFyIGxheW91dCA9IG9wdHMubGF5b3V0ID8gb3B0cy5sYXlvdXQgOiBvcHRzLmxheW91dCA9PT0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHZhciBpdGVtcyA9IHRoaXMuX2l0ZW1zO1xyXG4gICAgICAgIHZhciBuZWVkc0xheW91dCA9IGZhbHNlO1xyXG4gICAgICAgIHZhciBpdGVtO1xyXG4gICAgICAgIHZhciBpO1xyXG5cclxuICAgICAgICAvLyBNYXAgcHJvdmlkZWQgZWxlbWVudHMgaW50byBuZXcgZ3JpZCBpdGVtcy5cclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbmV3SXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaXRlbSA9IG5ldyBJdGVtKHRoaXMsIG5ld0l0ZW1zW2ldLCBvcHRzLmlzQWN0aXZlKTtcclxuICAgICAgICAgICAgbmV3SXRlbXNbaV0gPSBpdGVtO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgdGhlIGl0ZW0gdG8gYmUgYWRkZWQgaXMgYWN0aXZlLCB3ZSBuZWVkIHRvIGRvIGEgbGF5b3V0LiBBbHNvLCB3ZVxyXG4gICAgICAgICAgICAvLyBuZWVkIHRvIG1hcmsgdGhlIGl0ZW0gd2l0aCB0aGUgc2tpcE5leHRBbmltYXRpb24gZmxhZyB0byBtYWtlIGl0XHJcbiAgICAgICAgICAgIC8vIHBvc2l0aW9uIGluc3RhbnRseSAod2l0aG91dCBhbmltYXRpb24pIGR1cmluZyB0aGUgbmV4dCBsYXlvdXQuIFdpdGhvdXRcclxuICAgICAgICAgICAgLy8gdGhlIGhhY2sgdGhlIGl0ZW0gd291bGQgYW5pbWF0ZSB0byBpdCdzIG5ldyBwb3NpdGlvbiBmcm9tIHRoZSBub3J0aHdlc3RcclxuICAgICAgICAgICAgLy8gY29ybmVyIG9mIHRoZSBncmlkLCB3aGljaCBmZWVscyBhIGJpdCBidWdneSAoaW1obykuXHJcbiAgICAgICAgICAgIGlmIChpdGVtLl9pc0FjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgbmVlZHNMYXlvdXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaXRlbS5fbGF5b3V0Ll9za2lwTmV4dEFuaW1hdGlvbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFkZCB0aGUgbmV3IGl0ZW1zIHRvIHRoZSBpdGVtcyBjb2xsZWN0aW9uIHRvIGNvcnJlY3QgaW5kZXguXHJcbiAgICAgICAgYXJyYXlJbnNlcnQoaXRlbXMsIG5ld0l0ZW1zLCBvcHRzLmluZGV4KTtcclxuXHJcbiAgICAgICAgLy8gRW1pdCBhZGQgZXZlbnQuXHJcbiAgICAgICAgaWYgKHRoaXMuX2hhc0xpc3RlbmVycyhldmVudEFkZCkpIHtcclxuICAgICAgICAgICAgdGhpcy5fZW1pdChldmVudEFkZCwgbmV3SXRlbXMuc2xpY2UoMCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgbGF5b3V0IGlzIG5lZWRlZC5cclxuICAgICAgICBpZiAobmVlZHNMYXlvdXQgJiYgbGF5b3V0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubGF5b3V0KGxheW91dCA9PT0gJ2luc3RhbnQnLCB0eXBlb2YgbGF5b3V0ID09PSAnZnVuY3Rpb24nID8gbGF5b3V0IDogdW5kZWZpbmVkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBuZXdJdGVtcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgaXRlbXMgZnJvbSB0aGUgaW5zdGFuY2UuXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEdyaWQucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge0dyaWRNdWx0aUl0ZW1RdWVyeX0gaXRlbXNcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMucmVtb3ZlRWxlbWVudHM9ZmFsc2VdXHJcbiAgICAgKiBAcGFyYW0geyhCb29sZWFufExheW91dENhbGxiYWNrfFN0cmluZyl9IFtvcHRpb25zLmxheW91dD10cnVlXVxyXG4gICAgICogQHJldHVybnMge0l0ZW1bXX1cclxuICAgICAqL1xyXG4gICAgR3JpZC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGl0ZW1zLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSByZXR1cm4gdGhpcztcclxuXHJcbiAgICAgICAgdmFyIG9wdHMgPSBvcHRpb25zIHx8IDA7XHJcbiAgICAgICAgdmFyIGxheW91dCA9IG9wdHMubGF5b3V0ID8gb3B0cy5sYXlvdXQgOiBvcHRzLmxheW91dCA9PT0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHZhciBuZWVkc0xheW91dCA9IGZhbHNlO1xyXG4gICAgICAgIHZhciBhbGxJdGVtcyA9IHRoaXMuZ2V0SXRlbXMoKTtcclxuICAgICAgICB2YXIgdGFyZ2V0SXRlbXMgPSB0aGlzLmdldEl0ZW1zKGl0ZW1zKTtcclxuICAgICAgICB2YXIgaW5kaWNlcyA9IFtdO1xyXG4gICAgICAgIHZhciBpdGVtO1xyXG4gICAgICAgIHZhciBpO1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdGhlIGluZGl2aWR1YWwgaXRlbXMuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRhcmdldEl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW0gPSB0YXJnZXRJdGVtc1tpXTtcclxuICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGFsbEl0ZW1zLmluZGV4T2YoaXRlbSkpO1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5faXNBY3RpdmUpIG5lZWRzTGF5b3V0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgaXRlbS5fZGVzdHJveShvcHRzLnJlbW92ZUVsZW1lbnRzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEVtaXQgcmVtb3ZlIGV2ZW50LlxyXG4gICAgICAgIGlmICh0aGlzLl9oYXNMaXN0ZW5lcnMoZXZlbnRSZW1vdmUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2VtaXQoZXZlbnRSZW1vdmUsIHRhcmdldEl0ZW1zLnNsaWNlKDApLCBpbmRpY2VzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIGxheW91dCBpcyBuZWVkZWQuXHJcbiAgICAgICAgaWYgKG5lZWRzTGF5b3V0ICYmIGxheW91dCkge1xyXG4gICAgICAgICAgICB0aGlzLmxheW91dChsYXlvdXQgPT09ICdpbnN0YW50JywgdHlwZW9mIGxheW91dCA9PT0gJ2Z1bmN0aW9uJyA/IGxheW91dCA6IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGFyZ2V0SXRlbXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvdyBpbnN0YW5jZSBpdGVtcy5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgR3JpZC5wcm90b3R5cGVcclxuICAgICAqIEBwYXJhbSB7R3JpZE11bHRpSXRlbVF1ZXJ5fSBpdGVtc1xyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5pbnN0YW50PWZhbHNlXVxyXG4gICAgICogQHBhcmFtIHtTaG93Q2FsbGJhY2t9IFtvcHRpb25zLm9uRmluaXNoXVxyXG4gICAgICogQHBhcmFtIHsoQm9vbGVhbnxMYXlvdXRDYWxsYmFja3xTdHJpbmcpfSBbb3B0aW9ucy5sYXlvdXQ9dHJ1ZV1cclxuICAgICAqIEByZXR1cm5zIHtHcmlkfVxyXG4gICAgICovXHJcbiAgICBHcmlkLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKGl0ZW1zLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSByZXR1cm4gdGhpcztcclxuICAgICAgICB0aGlzLl9zZXRJdGVtc1Zpc2liaWxpdHkoaXRlbXMsIHRydWUsIG9wdGlvbnMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhpZGUgaW5zdGFuY2UgaXRlbXMuXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEdyaWQucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge0dyaWRNdWx0aUl0ZW1RdWVyeX0gaXRlbXNcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuaW5zdGFudD1mYWxzZV1cclxuICAgICAqIEBwYXJhbSB7SGlkZUNhbGxiYWNrfSBbb3B0aW9ucy5vbkZpbmlzaF1cclxuICAgICAqIEBwYXJhbSB7KEJvb2xlYW58TGF5b3V0Q2FsbGJhY2t8U3RyaW5nKX0gW29wdGlvbnMubGF5b3V0PXRydWVdXHJcbiAgICAgKiBAcmV0dXJucyB7R3JpZH1cclxuICAgICAqL1xyXG4gICAgR3JpZC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uIChpdGVtcywgb3B0aW9ucykge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgdGhpcy5fc2V0SXRlbXNWaXNpYmlsaXR5KGl0ZW1zLCBmYWxzZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlsdGVyIGl0ZW1zLiBFeHBlY3RzIGF0IGxlYXN0IG9uZSBhcmd1bWVudCwgYSBwcmVkaWNhdGUsIHdoaWNoIHNob3VsZCBiZVxyXG4gICAgICogZWl0aGVyIGEgZnVuY3Rpb24gb3IgYSBzdHJpbmcuIFRoZSBwcmVkaWNhdGUgY2FsbGJhY2sgaXMgZXhlY3V0ZWQgZm9yIGV2ZXJ5XHJcbiAgICAgKiBpdGVtIGluIHRoZSBpbnN0YW5jZS4gSWYgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgcHJlZGljYXRlIGlzIHRydXRoeSB0aGVcclxuICAgICAqIGl0ZW0gaW4gcXVlc3Rpb24gd2lsbCBiZSBzaG93biBhbmQgb3RoZXJ3aXNlIGhpZGRlbi4gVGhlIHByZWRpY2F0ZSBjYWxsYmFja1xyXG4gICAgICogcmVjZWl2ZXMgdGhlIGl0ZW0gaW5zdGFuY2UgYXMgaXQncyBhcmd1bWVudC4gSWYgdGhlIHByZWRpY2F0ZSBpcyBhIHN0cmluZ1xyXG4gICAgICogaXQgaXMgY29uc2lkZXJlZCB0byBiZSBhIHNlbGVjdG9yIGFuZCBpdCBpcyBjaGVja2VkIGFnYWluc3QgZXZlcnkgaXRlbVxyXG4gICAgICogZWxlbWVudCBpbiB0aGUgaW5zdGFuY2Ugd2l0aCB0aGUgbmF0aXZlIGVsZW1lbnQubWF0Y2hlcygpIG1ldGhvZC4gQWxsIHRoZVxyXG4gICAgICogbWF0Y2hpbmcgaXRlbXMgd2lsbCBiZSBzaG93biBhbmQgb3RoZXJzIGhpZGRlbi5cclxuICAgICAqXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAbWVtYmVyb2YgR3JpZC5wcm90b3R5cGVcclxuICAgICAqIEBwYXJhbSB7KEZ1bmN0aW9ufFN0cmluZyl9IHByZWRpY2F0ZVxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5pbnN0YW50PWZhbHNlXVxyXG4gICAgICogQHBhcmFtIHtGaWx0ZXJDYWxsYmFja30gW29wdGlvbnMub25GaW5pc2hdXHJcbiAgICAgKiBAcGFyYW0geyhCb29sZWFufExheW91dENhbGxiYWNrfFN0cmluZyl9IFtvcHRpb25zLmxheW91dD10cnVlXVxyXG4gICAgICogQHJldHVybnMge0dyaWR9XHJcbiAgICAgKi9cclxuICAgIEdyaWQucHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uIChwcmVkaWNhdGUsIG9wdGlvbnMpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQgfHwgIXRoaXMuX2l0ZW1zLmxlbmd0aCkgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgICAgIHZhciBpdGVtc1RvU2hvdyA9IFtdO1xyXG4gICAgICAgIHZhciBpdGVtc1RvSGlkZSA9IFtdO1xyXG4gICAgICAgIHZhciBpc1ByZWRpY2F0ZVN0cmluZyA9IHR5cGVvZiBwcmVkaWNhdGUgPT09ICdzdHJpbmcnO1xyXG4gICAgICAgIHZhciBpc1ByZWRpY2F0ZUZuID0gdHlwZW9mIHByZWRpY2F0ZSA9PT0gJ2Z1bmN0aW9uJztcclxuICAgICAgICB2YXIgb3B0cyA9IG9wdGlvbnMgfHwgMDtcclxuICAgICAgICB2YXIgaXNJbnN0YW50ID0gb3B0cy5pbnN0YW50ID09PSB0cnVlO1xyXG4gICAgICAgIHZhciBsYXlvdXQgPSBvcHRzLmxheW91dCA/IG9wdHMubGF5b3V0IDogb3B0cy5sYXlvdXQgPT09IHVuZGVmaW5lZDtcclxuICAgICAgICB2YXIgb25GaW5pc2ggPSB0eXBlb2Ygb3B0cy5vbkZpbmlzaCA9PT0gJ2Z1bmN0aW9uJyA/IG9wdHMub25GaW5pc2ggOiBudWxsO1xyXG4gICAgICAgIHZhciB0cnlGaW5pc2hDb3VudGVyID0gLTE7XHJcbiAgICAgICAgdmFyIHRyeUZpbmlzaCA9IG5vb3A7XHJcbiAgICAgICAgdmFyIGl0ZW07XHJcbiAgICAgICAgdmFyIGk7XHJcblxyXG4gICAgICAgIC8vIElmIHdlIGhhdmUgb25GaW5pc2ggY2FsbGJhY2ssIGxldCdzIGNyZWF0ZSBwcm9wZXIgdHJ5RmluaXNoIGNhbGxiYWNrLlxyXG4gICAgICAgIGlmIChvbkZpbmlzaCkge1xyXG4gICAgICAgICAgICB0cnlGaW5pc2ggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICArK3RyeUZpbmlzaENvdW50ZXIgJiYgb25GaW5pc2goaXRlbXNUb1Nob3cuc2xpY2UoMCksIGl0ZW1zVG9IaWRlLnNsaWNlKDApKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENoZWNrIHdoaWNoIGl0ZW1zIG5lZWQgdG8gYmUgc2hvd24gYW5kIHdoaWNoIGhpZGRlbi5cclxuICAgICAgICBpZiAoaXNQcmVkaWNhdGVGbiB8fCBpc1ByZWRpY2F0ZVN0cmluZykge1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5faXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0gPSB0aGlzLl9pdGVtc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChpc1ByZWRpY2F0ZUZuID8gcHJlZGljYXRlKGl0ZW0pIDogZWxlbWVudE1hdGNoZXMoaXRlbS5fZWxlbWVudCwgcHJlZGljYXRlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zVG9TaG93LnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zVG9IaWRlLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNob3cgaXRlbXMgdGhhdCBuZWVkIHRvIGJlIHNob3duLlxyXG4gICAgICAgIGlmIChpdGVtc1RvU2hvdy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93KGl0ZW1zVG9TaG93LCB7XHJcbiAgICAgICAgICAgICAgICBpbnN0YW50OiBpc0luc3RhbnQsXHJcbiAgICAgICAgICAgICAgICBvbkZpbmlzaDogdHJ5RmluaXNoLFxyXG4gICAgICAgICAgICAgICAgbGF5b3V0OiBmYWxzZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0cnlGaW5pc2goKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEhpZGUgaXRlbXMgdGhhdCBuZWVkIHRvIGJlIGhpZGRlbi5cclxuICAgICAgICBpZiAoaXRlbXNUb0hpZGUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZShpdGVtc1RvSGlkZSwge1xyXG4gICAgICAgICAgICAgICAgaW5zdGFudDogaXNJbnN0YW50LFxyXG4gICAgICAgICAgICAgICAgb25GaW5pc2g6IHRyeUZpbmlzaCxcclxuICAgICAgICAgICAgICAgIGxheW91dDogZmFsc2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdHJ5RmluaXNoKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgYW55IGl0ZW1zIHRvIGZpbHRlci5cclxuICAgICAgICBpZiAoaXRlbXNUb1Nob3cubGVuZ3RoIHx8IGl0ZW1zVG9IaWRlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAvLyBFbWl0IGZpbHRlciBldmVudC5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX2hhc0xpc3RlbmVycyhldmVudEZpbHRlcikpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2VtaXQoZXZlbnRGaWx0ZXIsIGl0ZW1zVG9TaG93LnNsaWNlKDApLCBpdGVtc1RvSGlkZS5zbGljZSgwKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIElmIGxheW91dCBpcyBuZWVkZWQuXHJcbiAgICAgICAgICAgIGlmIChsYXlvdXQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGF5b3V0KGxheW91dCA9PT0gJ2luc3RhbnQnLCB0eXBlb2YgbGF5b3V0ID09PSAnZnVuY3Rpb24nID8gbGF5b3V0IDogdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU29ydCBpdGVtcy4gVGhlcmUgYXJlIHRocmVlIHdheXMgdG8gc29ydCB0aGUgaXRlbXMuIFRoZSBmaXJzdCBpcyBzaW1wbHkgYnlcclxuICAgICAqIHByb3ZpZGluZyBhIGZ1bmN0aW9uIGFzIHRoZSBjb21wYXJlciB3aGljaCB3b3JrcyBpZGVudGljYWxseSB0byBuYXRpdmVcclxuICAgICAqIGFycmF5IHNvcnQuIEFsdGVybmF0aXZlbHkgeW91IGNhbiBzb3J0IGJ5IHRoZSBzb3J0IGRhdGEgeW91IGhhdmUgcHJvdmlkZWRcclxuICAgICAqIGluIHRoZSBpbnN0YW5jZSdzIG9wdGlvbnMuIEp1c3QgcHJvdmlkZSB0aGUgc29ydCBkYXRhIGtleShzKSBhcyBhIHN0cmluZ1xyXG4gICAgICogKHNlcGFyYXRlZCBieSBzcGFjZSkgYW5kIHRoZSBpdGVtcyB3aWxsIGJlIHNvcnRlZCBiYXNlZCBvbiB0aGUgcHJvdmlkZWRcclxuICAgICAqIHNvcnQgZGF0YSBrZXlzLiBMYXN0bHkgeW91IGhhdmUgdGhlIG9wcG9ydHVuaXR5IHRvIHByb3ZpZGUgYSBwcmVzb3J0ZWRcclxuICAgICAqIGFycmF5IG9mIGl0ZW1zIHdoaWNoIHdpbGwgYmUgdXNlZCB0byBzeW5jIHRoZSBpbnRlcm5hbCBpdGVtcyBhcnJheSBpbiB0aGVcclxuICAgICAqIHNhbWUgb3JkZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQG1lbWJlcm9mIEdyaWQucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0geyhGdW5jdGlvbnxJdGVtW118U3RyaW5nfFN0cmluZ1tdKX0gY29tcGFyZXJcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuZGVzY2VuZGluZz1mYWxzZV1cclxuICAgICAqIEBwYXJhbSB7KEJvb2xlYW58TGF5b3V0Q2FsbGJhY2t8U3RyaW5nKX0gW29wdGlvbnMubGF5b3V0PXRydWVdXHJcbiAgICAgKiBAcmV0dXJucyB7R3JpZH1cclxuICAgICAqL1xyXG4gICAgR3JpZC5wcm90b3R5cGUuc29ydCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNvcnRDb21wYXJlcjtcclxuICAgICAgICB2YXIgaXNEZXNjZW5kaW5nO1xyXG4gICAgICAgIHZhciBvcmlnSXRlbXM7XHJcbiAgICAgICAgdmFyIGluZGV4TWFwO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBwYXJzZUNyaXRlcmlhKGRhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGFcclxuICAgICAgICAgICAgICAgIC50cmltKClcclxuICAgICAgICAgICAgICAgIC5zcGxpdCgnICcpXHJcbiAgICAgICAgICAgICAgICAubWFwKGZ1bmN0aW9uICh2YWwpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsLnNwbGl0KCc6Jyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldEluZGV4TWFwKGl0ZW1zKSB7XHJcbiAgICAgICAgICAgIHZhciByZXQgPSB7fTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgcmV0W2l0ZW1zW2ldLl9pZF0gPSBpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjb21wYXJlSW5kaWNlcyhpdGVtQSwgaXRlbUIpIHtcclxuICAgICAgICAgICAgdmFyIGluZGV4QSA9IGluZGV4TWFwW2l0ZW1BLl9pZF07XHJcbiAgICAgICAgICAgIHZhciBpbmRleEIgPSBpbmRleE1hcFtpdGVtQi5faWRdO1xyXG4gICAgICAgICAgICByZXR1cm4gaXNEZXNjZW5kaW5nID8gaW5kZXhCIC0gaW5kZXhBIDogaW5kZXhBIC0gaW5kZXhCO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZGVmYXVsdENvbXBhcmVyKGEsIGIpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IDA7XHJcbiAgICAgICAgICAgIHZhciBjcml0ZXJpYU5hbWU7XHJcbiAgICAgICAgICAgIHZhciBjcml0ZXJpYU9yZGVyO1xyXG4gICAgICAgICAgICB2YXIgdmFsQTtcclxuICAgICAgICAgICAgdmFyIHZhbEI7XHJcblxyXG4gICAgICAgICAgICAvLyBMb29wIHRocm91Z2ggdGhlIGxpc3Qgb2Ygc29ydCBjcml0ZXJpYS5cclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3J0Q29tcGFyZXIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgY3JpdGVyaWEgbmFtZSwgd2hpY2ggc2hvdWxkIG1hdGNoIGFuIGl0ZW0ncyBzb3J0IGRhdGEga2V5LlxyXG4gICAgICAgICAgICAgICAgY3JpdGVyaWFOYW1lID0gc29ydENvbXBhcmVyW2ldWzBdO1xyXG4gICAgICAgICAgICAgICAgY3JpdGVyaWFPcmRlciA9IHNvcnRDb21wYXJlcltpXVsxXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBHZXQgaXRlbXMnIGNhY2hlZCBzb3J0IHZhbHVlcyBmb3IgdGhlIGNyaXRlcmlhLiBJZiB0aGUgaXRlbSBoYXMgbm8gc29ydFxyXG4gICAgICAgICAgICAgICAgLy8gZGF0YSBsZXQncyB1cGRhdGUgdGhlIGl0ZW1zIHNvcnQgZGF0YSAodGhpcyBpcyBhIGxhenkgbG9hZCBtZWNoYW5pc20pLlxyXG4gICAgICAgICAgICAgICAgdmFsQSA9IChhLl9zb3J0RGF0YSA/IGEgOiBhLl9yZWZyZXNoU29ydERhdGEoKSkuX3NvcnREYXRhW2NyaXRlcmlhTmFtZV07XHJcbiAgICAgICAgICAgICAgICB2YWxCID0gKGIuX3NvcnREYXRhID8gYiA6IGIuX3JlZnJlc2hTb3J0RGF0YSgpKS5fc29ydERhdGFbY3JpdGVyaWFOYW1lXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTb3J0IHRoZSBpdGVtcyBpbiBkZXNjZW5kaW5nIG9yZGVyIGlmIGRlZmluZWQgc28gZXhwbGljaXRseS4gT3RoZXJ3aXNlXHJcbiAgICAgICAgICAgICAgICAvLyBzb3J0IGl0ZW1zIGluIGFzY2VuZGluZyBvcmRlci5cclxuICAgICAgICAgICAgICAgIGlmIChjcml0ZXJpYU9yZGVyID09PSAnZGVzYycgfHwgKCFjcml0ZXJpYU9yZGVyICYmIGlzRGVzY2VuZGluZykpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB2YWxCIDwgdmFsQSA/IC0xIDogdmFsQiA+IHZhbEEgPyAxIDogMDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdmFsQSA8IHZhbEIgPyAtMSA6IHZhbEEgPiB2YWxCID8gMSA6IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSAtMSBvciAxIGFzIHRoZSByZXR1cm4gdmFsdWUsIGxldCdzIHJldHVybiBpdCBpbW1lZGlhdGVseS5cclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIElmIHZhbHVlcyBhcmUgZXF1YWwgbGV0J3MgY29tcGFyZSB0aGUgaXRlbSBpbmRpY2VzIHRvIG1ha2Ugc3VyZSB3ZVxyXG4gICAgICAgICAgICAvLyBoYXZlIGEgc3RhYmxlIHNvcnQuXHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWluZGV4TWFwKSBpbmRleE1hcCA9IGdldEluZGV4TWFwKG9yaWdJdGVtcyk7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBjb21wYXJlSW5kaWNlcyhhLCBiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3VzdG9tQ29tcGFyZXIoYSwgYikge1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gc29ydENvbXBhcmVyKGEsIGIpO1xyXG4gICAgICAgICAgICAvLyBJZiBkZXNjZW5kaW5nIGxldCdzIGludmVydCB0aGUgcmVzdWx0IHZhbHVlLlxyXG4gICAgICAgICAgICBpZiAoaXNEZXNjZW5kaW5nICYmIHJlc3VsdCkgcmVzdWx0ID0gLXJlc3VsdDtcclxuICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBhIHZhbGlkIHJlc3VsdCAobm90IHplcm8pIGxldCdzIHJldHVybiBpdCByaWdodCBhd2F5LlxyXG4gICAgICAgICAgICBpZiAocmVzdWx0KSByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICAvLyBJZiByZXN1bHQgaXMgemVybyBsZXQncyBjb21wYXJlIHRoZSBpdGVtIGluZGljZXMgdG8gbWFrZSBzdXJlIHdlIGhhdmUgYVxyXG4gICAgICAgICAgICAvLyBzdGFibGUgc29ydC5cclxuICAgICAgICAgICAgaWYgKCFpbmRleE1hcCkgaW5kZXhNYXAgPSBnZXRJbmRleE1hcChvcmlnSXRlbXMpO1xyXG4gICAgICAgICAgICByZXR1cm4gY29tcGFyZUluZGljZXMoYSwgYik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNvbXBhcmVyLCBvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCB8fCB0aGlzLl9pdGVtcy5sZW5ndGggPCAyKSByZXR1cm4gdGhpcztcclxuXHJcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IHRoaXMuX2l0ZW1zO1xyXG4gICAgICAgICAgICB2YXIgb3B0cyA9IG9wdGlvbnMgfHwgMDtcclxuICAgICAgICAgICAgdmFyIGxheW91dCA9IG9wdHMubGF5b3V0ID8gb3B0cy5sYXlvdXQgOiBvcHRzLmxheW91dCA9PT0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNldHVwIHBhcmVudCBzY29wZSBkYXRhLlxyXG4gICAgICAgICAgICBzb3J0Q29tcGFyZXIgPSBjb21wYXJlcjtcclxuICAgICAgICAgICAgaXNEZXNjZW5kaW5nID0gISFvcHRzLmRlc2NlbmRpbmc7XHJcbiAgICAgICAgICAgIG9yaWdJdGVtcyA9IGl0ZW1zLnNsaWNlKDApO1xyXG4gICAgICAgICAgICBpbmRleE1hcCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBmdW5jdGlvbiBpcyBwcm92aWRlZCBkbyBhIG5hdGl2ZSBhcnJheSBzb3J0LlxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNvcnRDb21wYXJlciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgaXRlbXMuc29ydChjdXN0b21Db21wYXJlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIGlmIHdlIGdvdCBhIHN0cmluZywgbGV0J3Mgc29ydCBieSB0aGUgc29ydCBkYXRhIGFzIHByb3ZpZGVkIGluXHJcbiAgICAgICAgICAgIC8vIHRoZSBpbnN0YW5jZSdzIG9wdGlvbnMuXHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBzb3J0Q29tcGFyZXIgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBzb3J0Q29tcGFyZXIgPSBwYXJzZUNyaXRlcmlhKGNvbXBhcmVyKTtcclxuICAgICAgICAgICAgICAgIGl0ZW1zLnNvcnQoZGVmYXVsdENvbXBhcmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBPdGhlcndpc2UgaWYgd2UgZ290IGFuIGFycmF5LCBsZXQncyBhc3N1bWUgaXQncyBhIHByZXNvcnRlZCBhcnJheSBvZiB0aGVcclxuICAgICAgICAgICAgLy8gaXRlbXMgYW5kIG9yZGVyIHRoZSBpdGVtcyBiYXNlZCBvbiBpdC5cclxuICAgICAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShzb3J0Q29tcGFyZXIpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydENvbXBhcmVyLmxlbmd0aCAhPT0gaXRlbXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdbJyArIG5hbWVzcGFjZSArICddIHNvcnQgcmVmZXJlbmNlIGl0ZW1zIGRvIG5vdCBtYXRjaCB3aXRoIGdyaWQgaXRlbXMuJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc29ydENvbXBhcmVyLmluZGV4T2YoaXRlbXNbaV0pIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1snICsgbmFtZXNwYWNlICsgJ10gc29ydCByZWZlcmVuY2UgaXRlbXMgZG8gbm90IG1hdGNoIHdpdGggZ3JpZCBpdGVtcy4nKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbXNbaV0gPSBzb3J0Q29tcGFyZXJbaV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNEZXNjZW5kaW5nKSBpdGVtcy5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIGxldCdzIGp1c3Qgc2tpcCBpdCwgbm90aGluZyB3ZSBjYW4gZG8gaGVyZS5cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvKiogQHRvZG8gTWF5YmUgdGhyb3cgYW4gZXJyb3IgaGVyZT8gKi9cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBFbWl0IHNvcnQgZXZlbnQuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9oYXNMaXN0ZW5lcnMoZXZlbnRTb3J0KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZW1pdChldmVudFNvcnQsIGl0ZW1zLnNsaWNlKDApLCBvcmlnSXRlbXMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBsYXlvdXQgaXMgbmVlZGVkLlxyXG4gICAgICAgICAgICBpZiAobGF5b3V0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxheW91dChsYXlvdXQgPT09ICdpbnN0YW50JywgdHlwZW9mIGxheW91dCA9PT0gJ2Z1bmN0aW9uJyA/IGxheW91dCA6IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH07XHJcbiAgICB9KSgpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTW92ZSBpdGVtIHRvIGFub3RoZXIgaW5kZXggb3IgaW4gcGxhY2Ugb2YgYW5vdGhlciBpdGVtLlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBHcmlkLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtHcmlkU2luZ2xlSXRlbVF1ZXJ5fSBpdGVtXHJcbiAgICAgKiBAcGFyYW0ge0dyaWRTaW5nbGVJdGVtUXVlcnl9IHBvc2l0aW9uXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuYWN0aW9uPVwibW92ZVwiXVxyXG4gICAgICogICAtIEFjY2VwdHMgZWl0aGVyIFwibW92ZVwiIG9yIFwic3dhcFwiLlxyXG4gICAgICogICAtIFwibW92ZVwiIG1vdmVzIHRoZSBpdGVtIGluIHBsYWNlIG9mIHRoZSBvdGhlciBpdGVtLlxyXG4gICAgICogICAtIFwic3dhcFwiIHN3YXBzIHRoZSBwb3NpdGlvbiBvZiB0aGUgaXRlbXMuXHJcbiAgICAgKiBAcGFyYW0geyhCb29sZWFufExheW91dENhbGxiYWNrfFN0cmluZyl9IFtvcHRpb25zLmxheW91dD10cnVlXVxyXG4gICAgICogQHJldHVybnMge0dyaWR9XHJcbiAgICAgKi9cclxuICAgIEdyaWQucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbiAoaXRlbSwgcG9zaXRpb24sIG9wdGlvbnMpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQgfHwgdGhpcy5faXRlbXMubGVuZ3RoIDwgMikgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgICAgIHZhciBpdGVtcyA9IHRoaXMuX2l0ZW1zO1xyXG4gICAgICAgIHZhciBvcHRzID0gb3B0aW9ucyB8fCAwO1xyXG4gICAgICAgIHZhciBsYXlvdXQgPSBvcHRzLmxheW91dCA/IG9wdHMubGF5b3V0IDogb3B0cy5sYXlvdXQgPT09IHVuZGVmaW5lZDtcclxuICAgICAgICB2YXIgaXNTd2FwID0gb3B0cy5hY3Rpb24gPT09ICdzd2FwJztcclxuICAgICAgICB2YXIgYWN0aW9uID0gaXNTd2FwID8gJ3N3YXAnIDogJ21vdmUnO1xyXG4gICAgICAgIHZhciBmcm9tSXRlbSA9IHRoaXMuX2dldEl0ZW0oaXRlbSk7XHJcbiAgICAgICAgdmFyIHRvSXRlbSA9IHRoaXMuX2dldEl0ZW0ocG9zaXRpb24pO1xyXG4gICAgICAgIHZhciBmcm9tSW5kZXg7XHJcbiAgICAgICAgdmFyIHRvSW5kZXg7XHJcblxyXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgaXRlbXMgZXhpc3QgYW5kIGFyZSBub3QgdGhlIHNhbWUuXHJcbiAgICAgICAgaWYgKGZyb21JdGVtICYmIHRvSXRlbSAmJiBmcm9tSXRlbSAhPT0gdG9JdGVtKSB7XHJcbiAgICAgICAgICAgIC8vIEdldCB0aGUgaW5kaWNlcyBvZiB0aGUgaXRlbXMuXHJcbiAgICAgICAgICAgIGZyb21JbmRleCA9IGl0ZW1zLmluZGV4T2YoZnJvbUl0ZW0pO1xyXG4gICAgICAgICAgICB0b0luZGV4ID0gaXRlbXMuaW5kZXhPZih0b0l0ZW0pO1xyXG5cclxuICAgICAgICAgICAgLy8gRG8gdGhlIG1vdmUvc3dhcC5cclxuICAgICAgICAgICAgaWYgKGlzU3dhcCkge1xyXG4gICAgICAgICAgICAgICAgYXJyYXlTd2FwKGl0ZW1zLCBmcm9tSW5kZXgsIHRvSW5kZXgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYXJyYXlNb3ZlKGl0ZW1zLCBmcm9tSW5kZXgsIHRvSW5kZXgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBFbWl0IG1vdmUgZXZlbnQuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9oYXNMaXN0ZW5lcnMoZXZlbnRNb3ZlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZW1pdChldmVudE1vdmUsIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtOiBmcm9tSXRlbSxcclxuICAgICAgICAgICAgICAgICAgICBmcm9tSW5kZXg6IGZyb21JbmRleCxcclxuICAgICAgICAgICAgICAgICAgICB0b0luZGV4OiB0b0luZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgbGF5b3V0IGlzIG5lZWRlZC5cclxuICAgICAgICAgICAgaWYgKGxheW91dCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXlvdXQobGF5b3V0ID09PSAnaW5zdGFudCcsIHR5cGVvZiBsYXlvdXQgPT09ICdmdW5jdGlvbicgPyBsYXlvdXQgOiB1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZW5kIGl0ZW0gdG8gYW5vdGhlciBHcmlkIGluc3RhbmNlLlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBHcmlkLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtHcmlkU2luZ2xlSXRlbVF1ZXJ5fSBpdGVtXHJcbiAgICAgKiBAcGFyYW0ge0dyaWR9IGdyaWRcclxuICAgICAqIEBwYXJhbSB7R3JpZFNpbmdsZUl0ZW1RdWVyeX0gcG9zaXRpb25cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtvcHRpb25zLmFwcGVuZFRvPWRvY3VtZW50LmJvZHldXHJcbiAgICAgKiBAcGFyYW0geyhCb29sZWFufExheW91dENhbGxiYWNrfFN0cmluZyl9IFtvcHRpb25zLmxheW91dFNlbmRlcj10cnVlXVxyXG4gICAgICogQHBhcmFtIHsoQm9vbGVhbnxMYXlvdXRDYWxsYmFja3xTdHJpbmcpfSBbb3B0aW9ucy5sYXlvdXRSZWNlaXZlcj10cnVlXVxyXG4gICAgICogQHJldHVybnMge0dyaWR9XHJcbiAgICAgKi9cclxuICAgIEdyaWQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAoaXRlbSwgZ3JpZCwgcG9zaXRpb24sIG9wdGlvbnMpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQgfHwgZ3JpZC5faXNEZXN0cm95ZWQgfHwgdGhpcyA9PT0gZ3JpZCkgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBoYXZlIGEgdmFsaWQgdGFyZ2V0IGl0ZW0uXHJcbiAgICAgICAgaXRlbSA9IHRoaXMuX2dldEl0ZW0oaXRlbSk7XHJcbiAgICAgICAgaWYgKCFpdGVtKSByZXR1cm4gdGhpcztcclxuXHJcbiAgICAgICAgdmFyIG9wdHMgPSBvcHRpb25zIHx8IDA7XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IG9wdHMuYXBwZW5kVG8gfHwgZG9jdW1lbnQuYm9keTtcclxuICAgICAgICB2YXIgbGF5b3V0U2VuZGVyID0gb3B0cy5sYXlvdXRTZW5kZXIgPyBvcHRzLmxheW91dFNlbmRlciA6IG9wdHMubGF5b3V0U2VuZGVyID09PSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdmFyIGxheW91dFJlY2VpdmVyID0gb3B0cy5sYXlvdXRSZWNlaXZlclxyXG4gICAgICAgICAgICA/IG9wdHMubGF5b3V0UmVjZWl2ZXJcclxuICAgICAgICAgICAgOiBvcHRzLmxheW91dFJlY2VpdmVyID09PSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIC8vIFN0YXJ0IHRoZSBtaWdyYXRpb24gcHJvY2Vzcy5cclxuICAgICAgICBpdGVtLl9taWdyYXRlLnN0YXJ0KGdyaWQsIHBvc2l0aW9uLCBjb250YWluZXIpO1xyXG5cclxuICAgICAgICAvLyBJZiBtaWdyYXRpb24gd2FzIHN0YXJ0ZWQgc3VjY2Vzc2Z1bGx5IGFuZCB0aGUgaXRlbSBpcyBhY3RpdmUsIGxldCdzIGxheW91dFxyXG4gICAgICAgIC8vIHRoZSBncmlkcy5cclxuICAgICAgICBpZiAoaXRlbS5fbWlncmF0ZS5faXNBY3RpdmUgJiYgaXRlbS5faXNBY3RpdmUpIHtcclxuICAgICAgICAgICAgaWYgKGxheW91dFNlbmRlcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXlvdXQoXHJcbiAgICAgICAgICAgICAgICAgICAgbGF5b3V0U2VuZGVyID09PSAnaW5zdGFudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGxheW91dFNlbmRlciA9PT0gJ2Z1bmN0aW9uJyA/IGxheW91dFNlbmRlciA6IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobGF5b3V0UmVjZWl2ZXIpIHtcclxuICAgICAgICAgICAgICAgIGdyaWQubGF5b3V0KFxyXG4gICAgICAgICAgICAgICAgICAgIGxheW91dFJlY2VpdmVyID09PSAnaW5zdGFudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGxheW91dFJlY2VpdmVyID09PSAnZnVuY3Rpb24nID8gbGF5b3V0UmVjZWl2ZXIgOiB1bmRlZmluZWRcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERlc3Ryb3kgdGhlIGluc3RhbmNlLlxyXG4gICAgICpcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBtZW1iZXJvZiBHcmlkLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbcmVtb3ZlRWxlbWVudHM9ZmFsc2VdXHJcbiAgICAgKiBAcmV0dXJucyB7R3JpZH1cclxuICAgICAqL1xyXG4gICAgR3JpZC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uIChyZW1vdmVFbGVtZW50cykge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgICAgIHZhciBjb250YWluZXIgPSB0aGlzLl9lbGVtZW50O1xyXG4gICAgICAgIHZhciBpdGVtcyA9IHRoaXMuX2l0ZW1zLnNsaWNlKDApO1xyXG4gICAgICAgIHZhciBpO1xyXG5cclxuICAgICAgICAvLyBVbmJpbmQgd2luZG93IHJlc2l6ZSBldmVudCBsaXN0ZW5lci5cclxuICAgICAgICBpZiAodGhpcy5fcmVzaXplSGFuZGxlcikge1xyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fcmVzaXplSGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXN0cm95IGl0ZW1zLlxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpdGVtc1tpXS5fZGVzdHJveShyZW1vdmVFbGVtZW50cyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZXN0b3JlIGNvbnRhaW5lci5cclxuICAgICAgICByZW1vdmVDbGFzcyhjb250YWluZXIsIHRoaXMuX3NldHRpbmdzLmNvbnRhaW5lckNsYXNzKTtcclxuICAgICAgICBjb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gJyc7XHJcbiAgICAgICAgY29udGFpbmVyLnN0eWxlLndpZHRoID0gJyc7XHJcblxyXG4gICAgICAgIC8vIEVtaXQgZGVzdHJveSBldmVudCBhbmQgdW5iaW5kIGFsbCBldmVudHMuXHJcbiAgICAgICAgdGhpcy5fZW1pdChldmVudERlc3Ryb3kpO1xyXG4gICAgICAgIHRoaXMuX2VtaXR0ZXIuZGVzdHJveSgpO1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgcmVmZXJlbmNlIGZyb20gdGhlIGdyaWQgaW5zdGFuY2VzIGNvbGxlY3Rpb24uXHJcbiAgICAgICAgZ3JpZEluc3RhbmNlc1t0aGlzLl9pZF0gPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIC8vIEZsYWcgaW5zdGFuY2UgYXMgZGVzdHJveWVkLlxyXG4gICAgICAgIHRoaXMuX2lzRGVzdHJveWVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJpdmF0ZSBwcm90b3R5cGUgbWV0aG9kc1xyXG4gICAgICogKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgaW5zdGFuY2UncyBpdGVtIGJ5IGVsZW1lbnQgb3IgYnkgaW5kZXguIFRhcmdldCBjYW4gYWxzbyBiZSBhbiBJdGVtXHJcbiAgICAgKiBpbnN0YW5jZSBpbiB3aGljaCBjYXNlIHRoZSBmdW5jdGlvbiByZXR1cm5zIHRoZSBpdGVtIGlmIGl0IGV4aXN0cyB3aXRoaW5cclxuICAgICAqIHJlbGF0ZWQgR3JpZCBpbnN0YW5jZS4gSWYgbm90aGluZyBpcyBmb3VuZCB3aXRoIHRoZSBwcm92aWRlZCB0YXJnZXQsIG51bGxcclxuICAgICAqIGlzIHJldHVybmVkLlxyXG4gICAgICpcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAbWVtYmVyb2YgR3JpZC5wcm90b3R5cGVcclxuICAgICAqIEBwYXJhbSB7R3JpZFNpbmdsZUl0ZW1RdWVyeX0gW3RhcmdldF1cclxuICAgICAqIEByZXR1cm5zIHs/SXRlbX1cclxuICAgICAqL1xyXG4gICAgR3JpZC5wcm90b3R5cGUuX2dldEl0ZW0gPSBmdW5jdGlvbiAodGFyZ2V0KSB7XHJcbiAgICAgICAgLy8gSWYgbm8gdGFyZ2V0IGlzIHNwZWNpZmllZCBvciB0aGUgaW5zdGFuY2UgaXMgZGVzdHJveWVkLCByZXR1cm4gbnVsbC5cclxuICAgICAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQgfHwgKCF0YXJnZXQgJiYgdGFyZ2V0ICE9PSAwKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIHRhcmdldCBpcyBudW1iZXIgcmV0dXJuIHRoZSBpdGVtIGluIHRoYXQgaW5kZXguIElmIHRoZSBudW1iZXIgaXMgbG93ZXJcclxuICAgICAgICAvLyB0aGFuIHplcm8gbG9vayBmb3IgdGhlIGl0ZW0gc3RhcnRpbmcgZnJvbSB0aGUgZW5kIG9mIHRoZSBpdGVtcyBhcnJheS4gRm9yXHJcbiAgICAgICAgLy8gZXhhbXBsZSAtMSBmb3IgdGhlIGxhc3QgaXRlbSwgLTIgZm9yIHRoZSBzZWNvbmQgbGFzdCBpdGVtLCBldGMuXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pdGVtc1t0YXJnZXQgPiAtMSA/IHRhcmdldCA6IHRoaXMuX2l0ZW1zLmxlbmd0aCArIHRhcmdldF0gfHwgbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSB0YXJnZXQgaXMgYW4gaW5zdGFuY2Ugb2YgSXRlbSByZXR1cm4gaXQgaWYgaXQgaXMgYXR0YWNoZWQgdG8gdGhpc1xyXG4gICAgICAgIC8vIEdyaWQgaW5zdGFuY2UsIG90aGVyd2lzZSByZXR1cm4gbnVsbC5cclxuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0Ll9ncmlkSWQgPT09IHRoaXMuX2lkID8gdGFyZ2V0IDogbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluIG90aGVyIGNhc2VzIGxldCdzIGFzc3VtZSB0aGF0IHRoZSB0YXJnZXQgaXMgYW4gZWxlbWVudCwgc28gbGV0J3MgdHJ5XHJcbiAgICAgICAgLy8gdG8gZmluZCBhbiBpdGVtIHRoYXQgbWF0Y2hlcyB0aGUgZWxlbWVudCBhbmQgcmV0dXJuIGl0LiBJZiBpdGVtIGlzIG5vdFxyXG4gICAgICAgIC8vIGZvdW5kIHJldHVybiBudWxsLlxyXG4gICAgICAgIC8qKiBAdG9kbyBUaGlzIGNvdWxkIGJlIG1hZGUgYSBsb3QgZmFzdGVyIGJ5IHVzaW5nIE1hcC9XZWFrTWFwIG9mIGVsZW1lbnRzLiAqL1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5faXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2l0ZW1zW2ldLl9lbGVtZW50ID09PSB0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9pdGVtc1tpXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVjYWxjdWxhdGVzIGFuZCB1cGRhdGVzIGluc3RhbmNlJ3MgbGF5b3V0IGRhdGEuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBHcmlkLnByb3RvdHlwZVxyXG4gICAgICogQHJldHVybnMge0xheW91dERhdGF9XHJcbiAgICAgKi9cclxuICAgIEdyaWQucHJvdG90eXBlLl91cGRhdGVMYXlvdXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGxheW91dCA9IHRoaXMuX2xheW91dDtcclxuICAgICAgICB2YXIgc2V0dGluZ3MgPSB0aGlzLl9zZXR0aW5ncy5sYXlvdXQ7XHJcbiAgICAgICAgdmFyIHdpZHRoO1xyXG4gICAgICAgIHZhciBoZWlnaHQ7XHJcbiAgICAgICAgdmFyIG5ld0xheW91dDtcclxuICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgLy8gTGV0J3MgaW5jcmVtZW50IGxheW91dCBpZC5cclxuICAgICAgICArK2xheW91dC5pZDtcclxuXHJcbiAgICAgICAgLy8gTGV0J3MgdXBkYXRlIGxheW91dCBpdGVtc1xyXG4gICAgICAgIGxheW91dC5pdGVtcy5sZW5ndGggPSAwO1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLl9pdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXRlbXNbaV0uX2lzQWN0aXZlKSBsYXlvdXQuaXRlbXMucHVzaCh0aGlzLl9pdGVtc1tpXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBMZXQncyBtYWtlIHN1cmUgd2UgaGF2ZSB0aGUgY29ycmVjdCBjb250YWluZXIgZGltZW5zaW9ucy5cclxuICAgICAgICB0aGlzLl9yZWZyZXNoRGltZW5zaW9ucygpO1xyXG5cclxuICAgICAgICAvLyBDYWxjdWxhdGUgY29udGFpbmVyIHdpZHRoIGFuZCBoZWlnaHQgKHdpdGhvdXQgYm9yZGVycykuXHJcbiAgICAgICAgd2lkdGggPSB0aGlzLl93aWR0aCAtIHRoaXMuX2JvcmRlckxlZnQgLSB0aGlzLl9ib3JkZXJSaWdodDtcclxuICAgICAgICBoZWlnaHQgPSB0aGlzLl9oZWlnaHQgLSB0aGlzLl9ib3JkZXJUb3AgLSB0aGlzLl9ib3JkZXJCb3R0b207XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBuZXcgbGF5b3V0LlxyXG4gICAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgbmV3TGF5b3V0ID0gc2V0dGluZ3MobGF5b3V0Lml0ZW1zLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuZXdMYXlvdXQgPSBwYWNrZXIuZ2V0TGF5b3V0KGxheW91dC5pdGVtcywgd2lkdGgsIGhlaWdodCwgbGF5b3V0LnNsb3RzLCBzZXR0aW5ncyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBMZXQncyB1cGRhdGUgdGhlIGdyaWQncyBsYXlvdXQuXHJcbiAgICAgICAgbGF5b3V0LnNsb3RzID0gbmV3TGF5b3V0LnNsb3RzO1xyXG4gICAgICAgIGxheW91dC5zZXRXaWR0aCA9IEJvb2xlYW4obmV3TGF5b3V0LnNldFdpZHRoKTtcclxuICAgICAgICBsYXlvdXQuc2V0SGVpZ2h0ID0gQm9vbGVhbihuZXdMYXlvdXQuc2V0SGVpZ2h0KTtcclxuICAgICAgICBsYXlvdXQud2lkdGggPSBuZXdMYXlvdXQud2lkdGg7XHJcbiAgICAgICAgbGF5b3V0LmhlaWdodCA9IG5ld0xheW91dC5oZWlnaHQ7XHJcblxyXG4gICAgICAgIHJldHVybiBsYXlvdXQ7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRW1pdCBhIGdyaWQgZXZlbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBHcmlkLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAgICAgKiBAcGFyYW0gey4uLip9IFthcmddXHJcbiAgICAgKi9cclxuICAgIEdyaWQucHJvdG90eXBlLl9lbWl0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdC5hcHBseSh0aGlzLl9lbWl0dGVyLCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrIGlmIHRoZXJlIGFyZSBhbnkgZXZlbnRzIGxpc3RlbmVycyBmb3IgYW4gZXZlbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBHcmlkLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgR3JpZC5wcm90b3R5cGUuX2hhc0xpc3RlbmVycyA9IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9lbWl0dGVyLl9ldmVudHNbZXZlbnRdO1xyXG4gICAgICAgIHJldHVybiAhIShsaXN0ZW5lcnMgJiYgbGlzdGVuZXJzLmxlbmd0aCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIGNvbnRhaW5lcidzIHdpZHRoLCBoZWlnaHQgYW5kIG9mZnNldHMuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBHcmlkLnByb3RvdHlwZVxyXG4gICAgICovXHJcbiAgICBHcmlkLnByb3RvdHlwZS5fdXBkYXRlQm91bmRpbmdSZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5fZWxlbWVudDtcclxuICAgICAgICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgdGhpcy5fd2lkdGggPSByZWN0LndpZHRoO1xyXG4gICAgICAgIHRoaXMuX2hlaWdodCA9IHJlY3QuaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuX2xlZnQgPSByZWN0LmxlZnQ7XHJcbiAgICAgICAgdGhpcy5fdG9wID0gcmVjdC50b3A7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIGNvbnRhaW5lcidzIGJvcmRlciBzaXplcy5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQG1lbWJlcm9mIEdyaWQucHJvdG90eXBlXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGxlZnRcclxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gcmlnaHRcclxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gdG9wXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGJvdHRvbVxyXG4gICAgICovXHJcbiAgICBHcmlkLnByb3RvdHlwZS5fdXBkYXRlQm9yZGVycyA9IGZ1bmN0aW9uIChsZWZ0LCByaWdodCwgdG9wLCBib3R0b20pIHtcclxuICAgICAgICB2YXIgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnQ7XHJcbiAgICAgICAgaWYgKGxlZnQpIHRoaXMuX2JvcmRlckxlZnQgPSBnZXRTdHlsZUFzRmxvYXQoZWxlbWVudCwgJ2JvcmRlci1sZWZ0LXdpZHRoJyk7XHJcbiAgICAgICAgaWYgKHJpZ2h0KSB0aGlzLl9ib3JkZXJSaWdodCA9IGdldFN0eWxlQXNGbG9hdChlbGVtZW50LCAnYm9yZGVyLXJpZ2h0LXdpZHRoJyk7XHJcbiAgICAgICAgaWYgKHRvcCkgdGhpcy5fYm9yZGVyVG9wID0gZ2V0U3R5bGVBc0Zsb2F0KGVsZW1lbnQsICdib3JkZXItdG9wLXdpZHRoJyk7XHJcbiAgICAgICAgaWYgKGJvdHRvbSkgdGhpcy5fYm9yZGVyQm90dG9tID0gZ2V0U3R5bGVBc0Zsb2F0KGVsZW1lbnQsICdib3JkZXItYm90dG9tLXdpZHRoJyk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVmcmVzaCBhbGwgb2YgY29udGFpbmVyJ3MgaW50ZXJuYWwgZGltZW5zaW9ucyBhbmQgb2Zmc2V0cy5cclxuICAgICAqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQG1lbWJlcm9mIEdyaWQucHJvdG90eXBlXHJcbiAgICAgKi9cclxuICAgIEdyaWQucHJvdG90eXBlLl9yZWZyZXNoRGltZW5zaW9ucyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl91cGRhdGVCb3VuZGluZ1JlY3QoKTtcclxuICAgICAgICB0aGlzLl91cGRhdGVCb3JkZXJzKDEsIDEsIDEsIDEpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3cgb3IgaGlkZSBHcmlkIGluc3RhbmNlJ3MgaXRlbXMuXHJcbiAgICAgKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBtZW1iZXJvZiBHcmlkLnByb3RvdHlwZVxyXG4gICAgICogQHBhcmFtIHtHcmlkTXVsdGlJdGVtUXVlcnl9IGl0ZW1zXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IHRvVmlzaWJsZVxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5pbnN0YW50PWZhbHNlXVxyXG4gICAgICogQHBhcmFtIHsoU2hvd0NhbGxiYWNrfEhpZGVDYWxsYmFjayl9IFtvcHRpb25zLm9uRmluaXNoXVxyXG4gICAgICogQHBhcmFtIHsoQm9vbGVhbnxMYXlvdXRDYWxsYmFja3xTdHJpbmcpfSBbb3B0aW9ucy5sYXlvdXQ9dHJ1ZV1cclxuICAgICAqL1xyXG4gICAgR3JpZC5wcm90b3R5cGUuX3NldEl0ZW1zVmlzaWJpbGl0eSA9IGZ1bmN0aW9uIChpdGVtcywgdG9WaXNpYmxlLCBvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIGdyaWQgPSB0aGlzO1xyXG4gICAgICAgIHZhciB0YXJnZXRJdGVtcyA9IHRoaXMuZ2V0SXRlbXMoaXRlbXMpO1xyXG4gICAgICAgIHZhciBvcHRzID0gb3B0aW9ucyB8fCAwO1xyXG4gICAgICAgIHZhciBpc0luc3RhbnQgPSBvcHRzLmluc3RhbnQgPT09IHRydWU7XHJcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gb3B0cy5vbkZpbmlzaDtcclxuICAgICAgICB2YXIgbGF5b3V0ID0gb3B0cy5sYXlvdXQgPyBvcHRzLmxheW91dCA6IG9wdHMubGF5b3V0ID09PSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdmFyIGNvdW50ZXIgPSB0YXJnZXRJdGVtcy5sZW5ndGg7XHJcbiAgICAgICAgdmFyIHN0YXJ0RXZlbnQgPSB0b1Zpc2libGUgPyBldmVudFNob3dTdGFydCA6IGV2ZW50SGlkZVN0YXJ0O1xyXG4gICAgICAgIHZhciBlbmRFdmVudCA9IHRvVmlzaWJsZSA/IGV2ZW50U2hvd0VuZCA6IGV2ZW50SGlkZUVuZDtcclxuICAgICAgICB2YXIgbWV0aG9kID0gdG9WaXNpYmxlID8gJ3Nob3cnIDogJ2hpZGUnO1xyXG4gICAgICAgIHZhciBuZWVkc0xheW91dCA9IGZhbHNlO1xyXG4gICAgICAgIHZhciBjb21wbGV0ZWRJdGVtcyA9IFtdO1xyXG4gICAgICAgIHZhciBoaWRkZW5JdGVtcyA9IFtdO1xyXG4gICAgICAgIHZhciBpdGVtO1xyXG4gICAgICAgIHZhciBpO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gaXRlbXMgY2FsbCB0aGUgY2FsbGJhY2ssIGJ1dCBkb24ndCBlbWl0IGFueSBldmVudHMuXHJcbiAgICAgICAgaWYgKCFjb3VudGVyKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKHRhcmdldEl0ZW1zKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRW1pdCBzaG93U3RhcnQvaGlkZVN0YXJ0IGV2ZW50LlxyXG4gICAgICAgIGlmICh0aGlzLl9oYXNMaXN0ZW5lcnMoc3RhcnRFdmVudCkpIHtcclxuICAgICAgICAgICAgdGhpcy5fZW1pdChzdGFydEV2ZW50LCB0YXJnZXRJdGVtcy5zbGljZSgwKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTaG93L2hpZGUgaXRlbXMuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRhcmdldEl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW0gPSB0YXJnZXRJdGVtc1tpXTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIGluYWN0aXZlIGl0ZW0gaXMgc2hvd24gb3IgYWN0aXZlIGl0ZW0gaXMgaGlkZGVuIHdlIG5lZWQgdG8gZG9cclxuICAgICAgICAgICAgLy8gbGF5b3V0LlxyXG4gICAgICAgICAgICBpZiAoKHRvVmlzaWJsZSAmJiAhaXRlbS5faXNBY3RpdmUpIHx8ICghdG9WaXNpYmxlICYmIGl0ZW0uX2lzQWN0aXZlKSkge1xyXG4gICAgICAgICAgICAgICAgbmVlZHNMYXlvdXQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBpbmFjdGl2ZSBpdGVtIGlzIHNob3duIHdlIGFsc28gbmVlZCB0byBkbyBhIGxpdHRsZSBoYWNrIHRvIG1ha2UgdGhlXHJcbiAgICAgICAgICAgIC8vIGl0ZW0gbm90IGFuaW1hdGUgaXQncyBuZXh0IHBvc2l0aW9uaW5nIChsYXlvdXQpLlxyXG4gICAgICAgICAgICBpZiAodG9WaXNpYmxlICYmICFpdGVtLl9pc0FjdGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5fbGF5b3V0Ll9za2lwTmV4dEFuaW1hdGlvbiA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIElmIGEgaGlkZGVuIGl0ZW0gaXMgYmVpbmcgc2hvd24gd2UgbmVlZCB0byByZWZyZXNoIHRoZSBpdGVtJ3NcclxuICAgICAgICAgICAgLy8gZGltZW5zaW9ucy5cclxuICAgICAgICAgICAgaWYgKHRvVmlzaWJsZSAmJiBpdGVtLl92aXNpYmlsaXR5Ll9pc0hpZGRlbikge1xyXG4gICAgICAgICAgICAgICAgaGlkZGVuSXRlbXMucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gU2hvdy9oaWRlIHRoZSBpdGVtLlxyXG4gICAgICAgICAgICBpdGVtLl92aXNpYmlsaXR5W21ldGhvZF0oaXNJbnN0YW50LCBmdW5jdGlvbiAoaW50ZXJydXB0ZWQsIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBjdXJyZW50IGl0ZW0ncyBhbmltYXRpb24gd2FzIG5vdCBpbnRlcnJ1cHRlZCBhZGQgaXQgdG8gdGhlXHJcbiAgICAgICAgICAgICAgICAvLyBjb21wbGV0ZWRJdGVtcyBhcnJheS5cclxuICAgICAgICAgICAgICAgIGlmICghaW50ZXJydXB0ZWQpIGNvbXBsZXRlZEl0ZW1zLnB1c2goaXRlbSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgYWxsIGl0ZW1zIGhhdmUgZmluaXNoZWQgdGhlaXIgYW5pbWF0aW9ucyBjYWxsIHRoZSBjYWxsYmFja1xyXG4gICAgICAgICAgICAgICAgLy8gYW5kIGVtaXQgc2hvd0VuZC9oaWRlRW5kIGV2ZW50LlxyXG4gICAgICAgICAgICAgICAgaWYgKC0tY291bnRlciA8IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjayhjb21wbGV0ZWRJdGVtcy5zbGljZSgwKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdyaWQuX2hhc0xpc3RlbmVycyhlbmRFdmVudCkpIGdyaWQuX2VtaXQoZW5kRXZlbnQsIGNvbXBsZXRlZEl0ZW1zLnNsaWNlKDApKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZWZyZXNoIGhpZGRlbiBpdGVtcy5cclxuICAgICAgICBpZiAoaGlkZGVuSXRlbXMubGVuZ3RoKSB0aGlzLnJlZnJlc2hJdGVtcyhoaWRkZW5JdGVtcyk7XHJcblxyXG4gICAgICAgIC8vIExheW91dCBpZiBuZWVkZWQuXHJcbiAgICAgICAgaWYgKG5lZWRzTGF5b3V0ICYmIGxheW91dCkge1xyXG4gICAgICAgICAgICB0aGlzLmxheW91dChsYXlvdXQgPT09ICdpbnN0YW50JywgdHlwZW9mIGxheW91dCA9PT0gJ2Z1bmN0aW9uJyA/IGxheW91dCA6IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFByaXZhdGUgaGVscGVyc1xyXG4gICAgICogKioqKioqKioqKioqKioqXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1lcmdlIGRlZmF1bHQgc2V0dGluZ3Mgd2l0aCB1c2VyIHNldHRpbmdzLiBUaGUgcmV0dXJuZWQgb2JqZWN0IGlzIGEgbmV3XHJcbiAgICAgKiBvYmplY3Qgd2l0aCBtZXJnZWQgdmFsdWVzLiBUaGUgbWVyZ2luZyBpcyBhIGRlZXAgbWVyZ2UgbWVhbmluZyB0aGF0IGFsbFxyXG4gICAgICogb2JqZWN0cyBhbmQgYXJyYXlzIHdpdGhpbiB0aGUgcHJvdmlkZWQgc2V0dGluZ3Mgb2JqZWN0cyB3aWxsIGJlIGFsc28gbWVyZ2VkXHJcbiAgICAgKiBzbyB0aGF0IG1vZGlmeWluZyB0aGUgdmFsdWVzIG9mIHRoZSBzZXR0aW5ncyBvYmplY3Qgd2lsbCBoYXZlIG5vIGVmZmVjdCBvblxyXG4gICAgICogdGhlIHJldHVybmVkIG9iamVjdC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdFNldHRpbmdzXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW3VzZXJTZXR0aW5nc11cclxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYSBuZXcgb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBtZXJnZVNldHRpbmdzKGRlZmF1bHRTZXR0aW5ncywgdXNlclNldHRpbmdzKSB7XHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgZnJlc2ggY29weSBvZiBkZWZhdWx0IHNldHRpbmdzLlxyXG4gICAgICAgIHZhciByZXQgPSBtZXJnZU9iamVjdHMoe30sIGRlZmF1bHRTZXR0aW5ncyk7XHJcblxyXG4gICAgICAgIC8vIE1lcmdlIHVzZXIgc2V0dGluZ3MgdG8gZGVmYXVsdCBzZXR0aW5ncy5cclxuICAgICAgICBpZiAodXNlclNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgIHJldCA9IG1lcmdlT2JqZWN0cyhyZXQsIHVzZXJTZXR0aW5ncyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBIYW5kbGUgdmlzaWJsZS9oaWRkZW4gc3R5bGVzIG1hbnVhbGx5IHNvIHRoYXQgdGhlIHdob2xlIG9iamVjdCBpc1xyXG4gICAgICAgIC8vIG92ZXJyaWRkZW4gaW5zdGVhZCBvZiB0aGUgcHJvcHMuXHJcbiAgICAgICAgcmV0LnZpc2libGVTdHlsZXMgPSAodXNlclNldHRpbmdzIHx8IDApLnZpc2libGVTdHlsZXMgfHwgKGRlZmF1bHRTZXR0aW5ncyB8fCAwKS52aXNpYmxlU3R5bGVzO1xyXG4gICAgICAgIHJldC5oaWRkZW5TdHlsZXMgPSAodXNlclNldHRpbmdzIHx8IDApLmhpZGRlblN0eWxlcyB8fCAoZGVmYXVsdFNldHRpbmdzIHx8IDApLmhpZGRlblN0eWxlcztcclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1lcmdlIHR3byBvYmplY3RzIHJlY3Vyc2l2ZWx5IChkZWVwIG1lcmdlKS4gVGhlIHNvdXJjZSBvYmplY3QncyBwcm9wZXJ0aWVzXHJcbiAgICAgKiBhcmUgbWVyZ2VkIHRvIHRoZSB0YXJnZXQgb2JqZWN0LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXRcclxuICAgICAqICAgLSBUaGUgdGFyZ2V0IG9iamVjdC5cclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2VcclxuICAgICAqICAgLSBUaGUgc291cmNlIG9iamVjdC5cclxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIHRhcmdldCBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIG1lcmdlT2JqZWN0cyh0YXJnZXQsIHNvdXJjZSkge1xyXG4gICAgICAgIHZhciBzb3VyY2VLZXlzID0gT2JqZWN0LmtleXMoc291cmNlKTtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gc291cmNlS2V5cy5sZW5ndGg7XHJcbiAgICAgICAgdmFyIGlzU291cmNlT2JqZWN0O1xyXG4gICAgICAgIHZhciBwcm9wTmFtZTtcclxuICAgICAgICB2YXIgaTtcclxuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHByb3BOYW1lID0gc291cmNlS2V5c1tpXTtcclxuICAgICAgICAgICAgaXNTb3VyY2VPYmplY3QgPSBpc1BsYWluT2JqZWN0KHNvdXJjZVtwcm9wTmFtZV0pO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgdGFyZ2V0IGFuZCBzb3VyY2UgdmFsdWVzIGFyZSBib3RoIG9iamVjdHMsIG1lcmdlIHRoZSBvYmplY3RzIGFuZFxyXG4gICAgICAgICAgICAvLyBhc3NpZ24gdGhlIG1lcmdlZCB2YWx1ZSB0byB0aGUgdGFyZ2V0IHByb3BlcnR5LlxyXG4gICAgICAgICAgICBpZiAoaXNQbGFpbk9iamVjdCh0YXJnZXRbcHJvcE5hbWVdKSAmJiBpc1NvdXJjZU9iamVjdCkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BOYW1lXSA9IG1lcmdlT2JqZWN0cyhtZXJnZU9iamVjdHMoe30sIHRhcmdldFtwcm9wTmFtZV0pLCBzb3VyY2VbcHJvcE5hbWVdKTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBzb3VyY2UncyB2YWx1ZSBpcyBvYmplY3QgYW5kIHRhcmdldCdzIGlzIG5vdCBsZXQncyBjbG9uZSB0aGUgb2JqZWN0IGFzXHJcbiAgICAgICAgICAgIC8vIHRoZSB0YXJnZXQncyB2YWx1ZS5cclxuICAgICAgICAgICAgaWYgKGlzU291cmNlT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRbcHJvcE5hbWVdID0gbWVyZ2VPYmplY3RzKHt9LCBzb3VyY2VbcHJvcE5hbWVdKTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBzb3VyY2UncyB2YWx1ZSBpcyBhbiBhcnJheSBsZXQncyBjbG9uZSB0aGUgYXJyYXkgYXMgdGhlIHRhcmdldCdzXHJcbiAgICAgICAgICAgIC8vIHZhbHVlLlxyXG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShzb3VyY2VbcHJvcE5hbWVdKSkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BOYW1lXSA9IHNvdXJjZVtwcm9wTmFtZV0uc2xpY2UoMCk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSW4gYWxsIG90aGVyIGNhc2VzIGxldCdzIGp1c3QgZGlyZWN0bHkgYXNzaWduIHRoZSBzb3VyY2UncyB2YWx1ZSBhcyB0aGVcclxuICAgICAgICAgICAgLy8gdGFyZ2V0J3MgdmFsdWUuXHJcbiAgICAgICAgICAgIHRhcmdldFtwcm9wTmFtZV0gPSBzb3VyY2VbcHJvcE5hbWVdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gR3JpZDtcclxuXHJcbn0pIl19

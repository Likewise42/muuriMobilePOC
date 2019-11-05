"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function (window, document, exportName, undefined) {
  'use strict';

  var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
  var TEST_ELEMENT = document.createElement('div');
  var TYPE_FUNCTION = 'function';
  var round = Math.round;
  var abs = Math.abs;
  var now = Date.now;
  /**
   * set a timeout with a given scope
   * @param {Function} fn
   * @param {Number} timeout
   * @param {Object} context
   * @returns {number}
   */

  function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
  }
  /**
   * if the argument is an array, we want to execute the fn on each entry
   * if it aint an array we don't want to do a thing.
   * this is used by all the methods that accept a single and array argument.
   * @param {*|Array} arg
   * @param {String} fn
   * @param {Object} [context]
   * @returns {Boolean}
   */


  function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
      each(arg, context[fn], context);
      return true;
    }

    return false;
  }
  /**
   * walk objects and arrays
   * @param {Object} obj
   * @param {Function} iterator
   * @param {Object} context
   */


  function each(obj, iterator, context) {
    var i;

    if (!obj) {
      return;
    }

    if (obj.forEach) {
      obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
      i = 0;

      while (i < obj.length) {
        iterator.call(context, obj[i], i, obj);
        i++;
      }
    } else {
      for (i in obj) {
        obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
      }
    }
  }
  /**
   * wrap a method with a deprecation warning and stack trace
   * @param {Function} method
   * @param {String} name
   * @param {String} message
   * @returns {Function} A new function wrapping the supplied method.
   */


  function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function () {
      var e = new Error('get-stack-trace');
      var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '').replace(/^\s+at\s+/gm, '').replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';
      var log = window.console && (window.console.warn || window.console.log);

      if (log) {
        log.call(window.console, deprecationMessage, stack);
      }

      return method.apply(this, arguments);
    };
  }
  /**
   * extend object.
   * means that properties in dest will be overwritten by the ones in src.
   * @param {Object} target
   * @param {...Object} objects_to_assign
   * @returns {Object} target
   */


  var assign;

  if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];

        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }

      return output;
    };
  } else {
    assign = Object.assign;
  }
  /**
   * extend object.
   * means that properties in dest will be overwritten by the ones in src.
   * @param {Object} dest
   * @param {Object} src
   * @param {Boolean} [merge=false]
   * @returns {Object} dest
   */


  var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;

    while (i < keys.length) {
      if (!merge || merge && dest[keys[i]] === undefined) {
        dest[keys[i]] = src[keys[i]];
      }

      i++;
    }

    return dest;
  }, 'extend', 'Use `assign`.');
  /**
   * merge the values from src in the dest.
   * means that properties that exist in dest will not be overwritten by src
   * @param {Object} dest
   * @param {Object} src
   * @returns {Object} dest
   */

  var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
  }, 'merge', 'Use `assign`.');
  /**
   * simple class inheritance
   * @param {Function} child
   * @param {Function} base
   * @param {Object} [properties]
   */

  function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;
    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
      assign(childP, properties);
    }
  }
  /**
   * simple function bind
   * @param {Function} fn
   * @param {Object} context
   * @returns {Function}
   */


  function bindFn(fn, context) {
    return function boundFn() {
      return fn.apply(context, arguments);
    };
  }
  /**
   * let a boolean value also be a function that must return a boolean
   * this first item in args will be used as the context
   * @param {Boolean|Function} val
   * @param {Array} [args]
   * @returns {Boolean}
   */


  function boolOrFn(val, args) {
    if (_typeof(val) == TYPE_FUNCTION) {
      return val.apply(args ? args[0] || undefined : undefined, args);
    }

    return val;
  }
  /**
   * use the val2 when val1 is undefined
   * @param {*} val1
   * @param {*} val2
   * @returns {*}
   */


  function ifUndefined(val1, val2) {
    return val1 === undefined ? val2 : val1;
  }
  /**
   * addEventListener with multiple events at once
   * @param {EventTarget} target
   * @param {String} types
   * @param {Function} handler
   */


  function addEventListeners(target, types, handler) {
    each(splitStr(types), function (type) {
      target.addEventListener(type, handler, false);
    });
  }
  /**
   * removeEventListener with multiple events at once
   * @param {EventTarget} target
   * @param {String} types
   * @param {Function} handler
   */


  function removeEventListeners(target, types, handler) {
    each(splitStr(types), function (type) {
      target.removeEventListener(type, handler, false);
    });
  }
  /**
   * find if a node is in the given parent
   * @method hasParent
   * @param {HTMLElement} node
   * @param {HTMLElement} parent
   * @return {Boolean} found
   */


  function hasParent(node, parent) {
    while (node) {
      if (node == parent) {
        return true;
      }

      node = node.parentNode;
    }

    return false;
  }
  /**
   * small indexOf wrapper
   * @param {String} str
   * @param {String} find
   * @returns {Boolean} found
   */


  function inStr(str, find) {
    return str.indexOf(find) > -1;
  }
  /**
   * split string on whitespace
   * @param {String} str
   * @returns {Array} words
   */


  function splitStr(str) {
    return str.trim().split(/\s+/g);
  }
  /**
   * find if a array contains the object using indexOf or a simple polyFill
   * @param {Array} src
   * @param {String} find
   * @param {String} [findByKey]
   * @return {Boolean|Number} false when not found, or the index
   */


  function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
      return src.indexOf(find);
    } else {
      var i = 0;

      while (i < src.length) {
        if (findByKey && src[i][findByKey] == find || !findByKey && src[i] === find) {
          return i;
        }

        i++;
      }

      return -1;
    }
  }
  /**
   * convert array-like objects to real arrays
   * @param {Object} obj
   * @returns {Array}
   */


  function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
  }
  /**
   * unique array with objects based on a key (like 'id') or just by the array's value
   * @param {Array} src [{id:1},{id:2},{id:1}]
   * @param {String} [key]
   * @param {Boolean} [sort=False]
   * @returns {Array} [{id:1},{id:2}]
   */


  function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
      var val = key ? src[i][key] : src[i];

      if (inArray(values, val) < 0) {
        results.push(src[i]);
      }

      values[i] = val;
      i++;
    }

    if (sort) {
      if (!key) {
        results = results.sort();
      } else {
        results = results.sort(function sortUniqueArray(a, b) {
          return a[key] > b[key];
        });
      }
    }

    return results;
  }
  /**
   * get the prefixed property
   * @param {Object} obj
   * @param {String} property
   * @returns {String|Undefined} prefixed
   */


  function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);
    var i = 0;

    while (i < VENDOR_PREFIXES.length) {
      prefix = VENDOR_PREFIXES[i];
      prop = prefix ? prefix + camelProp : property;

      if (prop in obj) {
        return prop;
      }

      i++;
    }

    return undefined;
  }
  /**
   * get a unique id
   * @returns {number} uniqueId
   */


  var _uniqueId = 1;

  function uniqueId() {
    return _uniqueId++;
  }
  /**
   * get the window object of an element
   * @param {HTMLElement} element
   * @returns {DocumentView|Window}
   */


  function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return doc.defaultView || doc.parentWindow || window;
  }

  var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;
  var SUPPORT_TOUCH = 'ontouchstart' in window;
  var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
  var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);
  var INPUT_TYPE_TOUCH = 'touch';
  var INPUT_TYPE_PEN = 'pen';
  var INPUT_TYPE_MOUSE = 'mouse';
  var INPUT_TYPE_KINECT = 'kinect';
  var COMPUTE_INTERVAL = 25;
  var INPUT_START = 1;
  var INPUT_MOVE = 2;
  var INPUT_END = 4;
  var INPUT_CANCEL = 8;
  var DIRECTION_NONE = 1;
  var DIRECTION_LEFT = 2;
  var DIRECTION_RIGHT = 4;
  var DIRECTION_UP = 8;
  var DIRECTION_DOWN = 16;
  var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
  var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
  var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;
  var PROPS_XY = ['x', 'y'];
  var PROPS_CLIENT_XY = ['clientX', 'clientY'];
  /**
   * create new input type manager
   * @param {Manager} manager
   * @param {Function} callback
   * @returns {Input}
   * @constructor
   */

  function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget; // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.

    this.domHandler = function (ev) {
      if (boolOrFn(manager.options.enable, [manager])) {
        self.handler(ev);
      }
    };

    this.init();
  }

  Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function handler() {},

    /**
     * bind the events
     */
    init: function init() {
      this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
      this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
      this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function destroy() {
      this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
      this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
      this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
  };
  /**
   * create new input type manager
   * called by the Manager constructor
   * @param {Hammer} manager
   * @returns {Input}
   */

  function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
      Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
      Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
      Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
      Type = MouseInput;
    } else {
      Type = TouchMouseInput;
    }

    return new Type(manager, inputHandler);
  }
  /**
   * handle input events
   * @param {Manager} manager
   * @param {String} eventType
   * @param {Object} input
   */


  function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = eventType & INPUT_START && pointersLen - changedPointersLen === 0;
    var isFinal = eventType & (INPUT_END | INPUT_CANCEL) && pointersLen - changedPointersLen === 0;
    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
      manager.session = {};
    } // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'


    input.eventType = eventType; // compute scale, rotation etc

    computeInputData(manager, input); // emit secret event

    manager.emit('hammer.input', input);
    manager.recognize(input);
    manager.session.prevInput = input;
  }
  /**
   * extend the data with some usable properties like scale, rotate, velocity etc
   * @param {Object} manager
   * @param {Object} input
   */


  function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length; // store the first input to calculate the distance and direction

    if (!session.firstInput) {
      session.firstInput = simpleCloneInputData(input);
    } // to compute scale and rotation we need to store the multiple touches


    if (pointersLength > 1 && !session.firstMultiple) {
      session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
      session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;
    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;
    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);
    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);
    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = abs(overallVelocity.x) > abs(overallVelocity.y) ? overallVelocity.x : overallVelocity.y;
    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;
    input.maxPointers = !session.prevInput ? input.pointers.length : input.pointers.length > session.prevInput.maxPointers ? input.pointers.length : session.prevInput.maxPointers;
    computeIntervalInputData(session, input); // find the correct target

    var target = manager.element;

    if (hasParent(input.srcEvent.target, target)) {
      target = input.srcEvent.target;
    }

    input.target = target;
  }

  function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
      prevDelta = session.prevDelta = {
        x: prevInput.deltaX || 0,
        y: prevInput.deltaY || 0
      };
      offset = session.offsetDelta = {
        x: center.x,
        y: center.y
      };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
  }
  /**
   * velocity is calculated every x ms
   * @param {Object} session
   * @param {Object} input
   */


  function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity,
        velocityX,
        velocityY,
        direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
      var deltaX = input.deltaX - last.deltaX;
      var deltaY = input.deltaY - last.deltaY;
      var v = getVelocity(deltaTime, deltaX, deltaY);
      velocityX = v.x;
      velocityY = v.y;
      velocity = abs(v.x) > abs(v.y) ? v.x : v.y;
      direction = getDirection(deltaX, deltaY);
      session.lastInterval = input;
    } else {
      // use latest velocity info if it doesn't overtake a minimum period
      velocity = last.velocity;
      velocityX = last.velocityX;
      velocityY = last.velocityY;
      direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
  }
  /**
   * create a simple clone from the input used for storage of firstInput and firstMultiple
   * @param {Object} input
   * @returns {Object} clonedInputData
   */


  function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;

    while (i < input.pointers.length) {
      pointers[i] = {
        clientX: round(input.pointers[i].clientX),
        clientY: round(input.pointers[i].clientY)
      };
      i++;
    }

    return {
      timeStamp: now(),
      pointers: pointers,
      center: getCenter(pointers),
      deltaX: input.deltaX,
      deltaY: input.deltaY
    };
  }
  /**
   * get the center of all the pointers
   * @param {Array} pointers
   * @return {Object} center contains `x` and `y` properties
   */


  function getCenter(pointers) {
    var pointersLength = pointers.length; // no need to loop when only one touch

    if (pointersLength === 1) {
      return {
        x: round(pointers[0].clientX),
        y: round(pointers[0].clientY)
      };
    }

    var x = 0,
        y = 0,
        i = 0;

    while (i < pointersLength) {
      x += pointers[i].clientX;
      y += pointers[i].clientY;
      i++;
    }

    return {
      x: round(x / pointersLength),
      y: round(y / pointersLength)
    };
  }
  /**
   * calculate the velocity between two points. unit is in px per ms.
   * @param {Number} deltaTime
   * @param {Number} x
   * @param {Number} y
   * @return {Object} velocity `x` and `y`
   */


  function getVelocity(deltaTime, x, y) {
    return {
      x: x / deltaTime || 0,
      y: y / deltaTime || 0
    };
  }
  /**
   * get the direction between two points
   * @param {Number} x
   * @param {Number} y
   * @return {Number} direction
   */


  function getDirection(x, y) {
    if (x === y) {
      return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
      return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }

    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
  }
  /**
   * calculate the absolute distance between two points
   * @param {Object} p1 {x, y}
   * @param {Object} p2 {x, y}
   * @param {Array} [props] containing x and y keys
   * @return {Number} distance
   */


  function getDistance(p1, p2, props) {
    if (!props) {
      props = PROPS_XY;
    }

    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.sqrt(x * x + y * y);
  }
  /**
   * calculate the angle between two coordinates
   * @param {Object} p1
   * @param {Object} p2
   * @param {Array} [props] containing x and y keys
   * @return {Number} angle
   */


  function getAngle(p1, p2, props) {
    if (!props) {
      props = PROPS_XY;
    }

    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
  }
  /**
   * calculate the rotation degrees between two pointersets
   * @param {Array} start array of pointers
   * @param {Array} end array of pointers
   * @return {Number} rotation
   */


  function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
  }
  /**
   * calculate the scale factor between two pointersets
   * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
   * @param {Array} start array of pointers
   * @param {Array} end array of pointers
   * @return {Number} scale
   */


  function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
  }

  var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
  };
  var MOUSE_ELEMENT_EVENTS = 'mousedown';
  var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';
  /**
   * Mouse events input
   * @constructor
   * @extends Input
   */

  function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;
    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
  }

  inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
      var eventType = MOUSE_INPUT_MAP[ev.type]; // on start we want to have the left mouse button down

      if (eventType & INPUT_START && ev.button === 0) {
        this.pressed = true;
      }

      if (eventType & INPUT_MOVE && ev.which !== 1) {
        eventType = INPUT_END;
      } // mouse must be down


      if (!this.pressed) {
        return;
      }

      if (eventType & INPUT_END) {
        this.pressed = false;
      }

      this.callback(this.manager, eventType, {
        pointers: [ev],
        changedPointers: [ev],
        pointerType: INPUT_TYPE_MOUSE,
        srcEvent: ev
      });
    }
  });
  var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
  }; // in IE10 the pointer types is defined as an enum

  var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816

  };
  var POINTER_ELEMENT_EVENTS = 'pointerdown';
  var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel'; // IE10 has prefixed support, and case-sensitive

  if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
  }
  /**
   * Pointer events input
   * @constructor
   * @extends Input
   */


  function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;
    Input.apply(this, arguments);
    this.store = this.manager.session.pointerEvents = [];
  }

  inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
      var store = this.store;
      var removePointer = false;
      var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
      var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
      var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;
      var isTouch = pointerType == INPUT_TYPE_TOUCH; // get index of the event in the store

      var storeIndex = inArray(store, ev.pointerId, 'pointerId'); // start and mouse must be down

      if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
        if (storeIndex < 0) {
          store.push(ev);
          storeIndex = store.length - 1;
        }
      } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        removePointer = true;
      } // it not found, so the pointer hasn't been down (so it's probably a hover)


      if (storeIndex < 0) {
        return;
      } // update the event in the store


      store[storeIndex] = ev;
      this.callback(this.manager, eventType, {
        pointers: store,
        changedPointers: [ev],
        pointerType: pointerType,
        srcEvent: ev
      });

      if (removePointer) {
        // remove from the store
        store.splice(storeIndex, 1);
      }
    }
  });
  var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
  };
  var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
  var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';
  /**
   * Touch events input
   * @constructor
   * @extends Input
   */

  function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;
    Input.apply(this, arguments);
  }

  inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
      var type = SINGLE_TOUCH_INPUT_MAP[ev.type]; // should we handle the touch events?

      if (type === INPUT_START) {
        this.started = true;
      }

      if (!this.started) {
        return;
      }

      var touches = normalizeSingleTouches.call(this, ev, type); // when done, reset the started state

      if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
        this.started = false;
      }

      this.callback(this.manager, type, {
        pointers: touches[0],
        changedPointers: touches[1],
        pointerType: INPUT_TYPE_TOUCH,
        srcEvent: ev
      });
    }
  });
  /**
   * @this {TouchInput}
   * @param {Object} ev
   * @param {Number} type flag
   * @returns {undefined|Array} [all, changed]
   */

  function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
      all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
  }

  var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
  };
  var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';
  /**
   * Multi-user touch events input
   * @constructor
   * @extends Input
   */

  function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};
    Input.apply(this, arguments);
  }

  inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
      var type = TOUCH_INPUT_MAP[ev.type];
      var touches = getTouches.call(this, ev, type);

      if (!touches) {
        return;
      }

      this.callback(this.manager, type, {
        pointers: touches[0],
        changedPointers: touches[1],
        pointerType: INPUT_TYPE_TOUCH,
        srcEvent: ev
      });
    }
  });
  /**
   * @this {TouchInput}
   * @param {Object} ev
   * @param {Number} type flag
   * @returns {undefined|Array} [all, changed]
   */

  function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds; // when there is only one touch, the process can be simplified

    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
      targetIds[allTouches[0].identifier] = true;
      return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target; // get target touches from touches

    targetTouches = allTouches.filter(function (touch) {
      return hasParent(touch.target, target);
    }); // collect touches

    if (type === INPUT_START) {
      i = 0;

      while (i < targetTouches.length) {
        targetIds[targetTouches[i].identifier] = true;
        i++;
      }
    } // filter changed touches to only contain touches that exist in the collected target ids


    i = 0;

    while (i < changedTouches.length) {
      if (targetIds[changedTouches[i].identifier]) {
        changedTargetTouches.push(changedTouches[i]);
      } // cleanup removed touches


      if (type & (INPUT_END | INPUT_CANCEL)) {
        delete targetIds[changedTouches[i].identifier];
      }

      i++;
    }

    if (!changedTargetTouches.length) {
      return;
    }

    return [// merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
    uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true), changedTargetTouches];
  }
  /**
   * Combined touch and mouse input
   *
   * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
   * This because touch devices also emit mouse events while doing a touch.
   *
   * @constructor
   * @extends Input
   */


  var DEDUP_TIMEOUT = 2500;
  var DEDUP_DISTANCE = 25;

  function TouchMouseInput() {
    Input.apply(this, arguments);
    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);
    this.primaryTouch = null;
    this.lastTouches = [];
  }

  inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
      var isTouch = inputData.pointerType == INPUT_TYPE_TOUCH,
          isMouse = inputData.pointerType == INPUT_TYPE_MOUSE;

      if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
        return;
      } // when we're in a touch event, record touches to  de-dupe synthetic mouse event


      if (isTouch) {
        recordTouches.call(this, inputEvent, inputData);
      } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
        return;
      }

      this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
      this.touch.destroy();
      this.mouse.destroy();
    }
  });

  function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
      this.primaryTouch = eventData.changedPointers[0].identifier;
      setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
      setLastTouch.call(this, eventData);
    }
  }

  function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
      var lastTouch = {
        x: touch.clientX,
        y: touch.clientY
      };
      this.lastTouches.push(lastTouch);
      var lts = this.lastTouches;

      var removeLastTouch = function removeLastTouch() {
        var i = lts.indexOf(lastTouch);

        if (i > -1) {
          lts.splice(i, 1);
        }
      };

      setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
  }

  function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX,
        y = eventData.srcEvent.clientY;

    for (var i = 0; i < this.lastTouches.length; i++) {
      var t = this.lastTouches[i];
      var dx = Math.abs(x - t.x),
          dy = Math.abs(y - t.y);

      if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
        return true;
      }
    }

    return false;
  }

  var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
  var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined; // magical touchAction value

  var TOUCH_ACTION_COMPUTE = 'compute';
  var TOUCH_ACTION_AUTO = 'auto';
  var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented

  var TOUCH_ACTION_NONE = 'none';
  var TOUCH_ACTION_PAN_X = 'pan-x';
  var TOUCH_ACTION_PAN_Y = 'pan-y';
  var TOUCH_ACTION_MAP = getTouchActionProps();
  /**
   * Touch Action
   * sets the touchAction property or uses the js alternative
   * @param {Manager} manager
   * @param {String} value
   * @constructor
   */

  function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
  }

  TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function set(value) {
      // find out the touch-action by the event handlers
      if (value == TOUCH_ACTION_COMPUTE) {
        value = this.compute();
      }

      if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
        this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
      }

      this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function update() {
      this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function compute() {
      var actions = [];
      each(this.manager.recognizers, function (recognizer) {
        if (boolOrFn(recognizer.options.enable, [recognizer])) {
          actions = actions.concat(recognizer.getTouchAction());
        }
      });
      return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function preventDefaults(input) {
      var srcEvent = input.srcEvent;
      var direction = input.offsetDirection; // if the touch action did prevented once this session

      if (this.manager.session.prevented) {
        srcEvent.preventDefault();
        return;
      }

      var actions = this.actions;
      var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
      var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
      var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

      if (hasNone) {
        //do not prevent defaults if this is a tap gesture
        var isTapPointer = input.pointers.length === 1;
        var isTapMovement = input.distance < 2;
        var isTapTouchTime = input.deltaTime < 250;

        if (isTapPointer && isTapMovement && isTapTouchTime) {
          return;
        }
      }

      if (hasPanX && hasPanY) {
        // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
        return;
      }

      if (hasNone || hasPanY && direction & DIRECTION_HORIZONTAL || hasPanX && direction & DIRECTION_VERTICAL) {
        return this.preventSrc(srcEvent);
      }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function preventSrc(srcEvent) {
      this.manager.session.prevented = true;
      srcEvent.preventDefault();
    }
  };
  /**
   * when the touchActions are collected they are not a valid value, so we need to clean things up. *
   * @param {String} actions
   * @returns {*}
   */

  function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
      return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y); // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning

    if (hasPanX && hasPanY) {
      return TOUCH_ACTION_NONE;
    } // pan-x OR pan-y


    if (hasPanX || hasPanY) {
      return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    } // manipulation


    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
      return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
  }

  function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
      return false;
    }

    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function (val) {
      // If css.supports is not supported but there is native touch-action assume it supports
      // all values. This is the case for IE 10 and 11.
      touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
  }
  /**
   * Recognizer flow explained; *
   * All recognizers have the initial state of POSSIBLE when a input session starts.
   * The definition of a input session is from the first input until the last input, with all it's movement in it. *
   * Example session for mouse-input: mousedown -> mousemove -> mouseup
   *
   * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
   * which determines with state it should be.
   *
   * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
   * POSSIBLE to give it another change on the next cycle.
   *
   *               Possible
   *                  |
   *            +-----+---------------+
   *            |                     |
   *      +-----+-----+               |
   *      |           |               |
   *   Failed      Cancelled          |
   *                          +-------+------+
   *                          |              |
   *                      Recognized       Began
   *                                         |
   *                                      Changed
   *                                         |
   *                                  Ended/Recognized
   */


  var STATE_POSSIBLE = 1;
  var STATE_BEGAN = 2;
  var STATE_CHANGED = 4;
  var STATE_ENDED = 8;
  var STATE_RECOGNIZED = STATE_ENDED;
  var STATE_CANCELLED = 16;
  var STATE_FAILED = 32;
  /**
   * Recognizer
   * Every recognizer needs to extend from this class.
   * @constructor
   * @param {Object} options
   */

  function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});
    this.id = uniqueId();
    this.manager = null; // default is enable true

    this.options.enable = ifUndefined(this.options.enable, true);
    this.state = STATE_POSSIBLE;
    this.simultaneous = {};
    this.requireFail = [];
  }

  Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function set(options) {
      assign(this.options, options); // also update the touchAction, in case something changed about the directions/enabled state

      this.manager && this.manager.touchAction.update();
      return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function recognizeWith(otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
        return this;
      }

      var simultaneous = this.simultaneous;
      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);

      if (!simultaneous[otherRecognizer.id]) {
        simultaneous[otherRecognizer.id] = otherRecognizer;
        otherRecognizer.recognizeWith(this);
      }

      return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function dropRecognizeWith(otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
        return this;
      }

      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      delete this.simultaneous[otherRecognizer.id];
      return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function requireFailure(otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
        return this;
      }

      var requireFail = this.requireFail;
      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);

      if (inArray(requireFail, otherRecognizer) === -1) {
        requireFail.push(otherRecognizer);
        otherRecognizer.requireFailure(this);
      }

      return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function dropRequireFailure(otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
        return this;
      }

      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      var index = inArray(this.requireFail, otherRecognizer);

      if (index > -1) {
        this.requireFail.splice(index, 1);
      }

      return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function hasRequireFailures() {
      return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function canRecognizeWith(otherRecognizer) {
      return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function emit(input) {
      var self = this;
      var state = this.state;

      function emit(event) {
        self.manager.emit(event, input);
      } // 'panstart' and 'panmove'


      if (state < STATE_ENDED) {
        emit(self.options.event + stateStr(state));
      }

      emit(self.options.event); // simple 'eventName' events

      if (input.additionalEvent) {
        // additional event(panleft, panright, pinchin, pinchout...)
        emit(input.additionalEvent);
      } // panend and pancancel


      if (state >= STATE_ENDED) {
        emit(self.options.event + stateStr(state));
      }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function tryEmit(input) {
      if (this.canEmit()) {
        return this.emit(input);
      } // it's failing anyway


      this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function canEmit() {
      var i = 0;

      while (i < this.requireFail.length) {
        if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
          return false;
        }

        i++;
      }

      return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function recognize(inputData) {
      // make a new copy of the inputData
      // so we can change the inputData without messing up the other recognizers
      var inputDataClone = assign({}, inputData); // is is enabled and allow recognizing?

      if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
        this.reset();
        this.state = STATE_FAILED;
        return;
      } // reset when we've reached the end


      if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
        this.state = STATE_POSSIBLE;
      }

      this.state = this.process(inputDataClone); // the recognizer has recognized a gesture
      // so trigger an event

      if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
        this.tryEmit(inputDataClone);
      }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function process(inputData) {},
    // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function getTouchAction() {},

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function reset() {}
  };
  /**
   * get a usable string, used as event postfix
   * @param {Const} state
   * @returns {String} state
   */

  function stateStr(state) {
    if (state & STATE_CANCELLED) {
      return 'cancel';
    } else if (state & STATE_ENDED) {
      return 'end';
    } else if (state & STATE_CHANGED) {
      return 'move';
    } else if (state & STATE_BEGAN) {
      return 'start';
    }

    return '';
  }
  /**
   * direction cons to string
   * @param {Const} direction
   * @returns {String}
   */


  function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
      return 'down';
    } else if (direction == DIRECTION_UP) {
      return 'up';
    } else if (direction == DIRECTION_LEFT) {
      return 'left';
    } else if (direction == DIRECTION_RIGHT) {
      return 'right';
    }

    return '';
  }
  /**
   * get a recognizer by name if it is bound to a manager
   * @param {Recognizer|String} otherRecognizer
   * @param {Recognizer} recognizer
   * @returns {Recognizer}
   */


  function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;

    if (manager) {
      return manager.get(otherRecognizer);
    }

    return otherRecognizer;
  }
  /**
   * This recognizer is just used as a base for the simple attribute recognizers.
   * @constructor
   * @extends Recognizer
   */


  function AttrRecognizer() {
    Recognizer.apply(this, arguments);
  }

  inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
      /**
       * @type {Number}
       * @default 1
       */
      pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function attrTest(input) {
      var optionPointers = this.options.pointers;
      return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function process(input) {
      var state = this.state;
      var eventType = input.eventType;
      var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
      var isValid = this.attrTest(input); // on cancel input and we've recognized before, return STATE_CANCELLED

      if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
        return state | STATE_CANCELLED;
      } else if (isRecognized || isValid) {
        if (eventType & INPUT_END) {
          return state | STATE_ENDED;
        } else if (!(state & STATE_BEGAN)) {
          return STATE_BEGAN;
        }

        return state | STATE_CHANGED;
      }

      return STATE_FAILED;
    }
  });
  /**
   * Pan
   * Recognized when the pointer is down and moved in the allowed direction.
   * @constructor
   * @extends AttrRecognizer
   */

  function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);
    this.pX = null;
    this.pY = null;
  }

  inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
      event: 'pan',
      threshold: 10,
      pointers: 1,
      direction: DIRECTION_ALL
    },
    getTouchAction: function getTouchAction() {
      var direction = this.options.direction;
      var actions = [];

      if (direction & DIRECTION_HORIZONTAL) {
        actions.push(TOUCH_ACTION_PAN_Y);
      }

      if (direction & DIRECTION_VERTICAL) {
        actions.push(TOUCH_ACTION_PAN_X);
      }

      return actions;
    },
    directionTest: function directionTest(input) {
      var options = this.options;
      var hasMoved = true;
      var distance = input.distance;
      var direction = input.direction;
      var x = input.deltaX;
      var y = input.deltaY; // lock to axis?

      if (!(direction & options.direction)) {
        if (options.direction & DIRECTION_HORIZONTAL) {
          direction = x === 0 ? DIRECTION_NONE : x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
          hasMoved = x != this.pX;
          distance = Math.abs(input.deltaX);
        } else {
          direction = y === 0 ? DIRECTION_NONE : y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
          hasMoved = y != this.pY;
          distance = Math.abs(input.deltaY);
        }
      }

      input.direction = direction;
      return hasMoved && distance > options.threshold && direction & options.direction;
    },
    attrTest: function attrTest(input) {
      return AttrRecognizer.prototype.attrTest.call(this, input) && (this.state & STATE_BEGAN || !(this.state & STATE_BEGAN) && this.directionTest(input));
    },
    emit: function emit(input) {
      this.pX = input.deltaX;
      this.pY = input.deltaY;
      var direction = directionStr(input.direction);

      if (direction) {
        input.additionalEvent = this.options.event + direction;
      }

      this._super.emit.call(this, input);
    }
  });
  /**
   * Pinch
   * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
   * @constructor
   * @extends AttrRecognizer
   */

  function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
  }

  inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
      event: 'pinch',
      threshold: 0,
      pointers: 2
    },
    getTouchAction: function getTouchAction() {
      return [TOUCH_ACTION_NONE];
    },
    attrTest: function attrTest(input) {
      return this._super.attrTest.call(this, input) && (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },
    emit: function emit(input) {
      if (input.scale !== 1) {
        var inOut = input.scale < 1 ? 'in' : 'out';
        input.additionalEvent = this.options.event + inOut;
      }

      this._super.emit.call(this, input);
    }
  });
  /**
   * Press
   * Recognized when the pointer is down for x ms without any movement.
   * @constructor
   * @extends Recognizer
   */

  function PressRecognizer() {
    Recognizer.apply(this, arguments);
    this._timer = null;
    this._input = null;
  }

  inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
      event: 'press',
      pointers: 1,
      time: 251,
      // minimal time of the pointer to be pressed
      threshold: 9 // a minimal movement is ok, but keep it low

    },
    getTouchAction: function getTouchAction() {
      return [TOUCH_ACTION_AUTO];
    },
    process: function process(input) {
      var options = this.options;
      var validPointers = input.pointers.length === options.pointers;
      var validMovement = input.distance < options.threshold;
      var validTime = input.deltaTime > options.time;
      this._input = input; // we only allow little movement
      // and we've reached an end event, so a tap is possible

      if (!validMovement || !validPointers || input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime) {
        this.reset();
      } else if (input.eventType & INPUT_START) {
        this.reset();
        this._timer = setTimeoutContext(function () {
          this.state = STATE_RECOGNIZED;
          this.tryEmit();
        }, options.time, this);
      } else if (input.eventType & INPUT_END) {
        return STATE_RECOGNIZED;
      }

      return STATE_FAILED;
    },
    reset: function reset() {
      clearTimeout(this._timer);
    },
    emit: function emit(input) {
      if (this.state !== STATE_RECOGNIZED) {
        return;
      }

      if (input && input.eventType & INPUT_END) {
        this.manager.emit(this.options.event + 'up', input);
      } else {
        this._input.timeStamp = now();
        this.manager.emit(this.options.event, this._input);
      }
    }
  });
  /**
   * Rotate
   * Recognized when two or more pointer are moving in a circular motion.
   * @constructor
   * @extends AttrRecognizer
   */

  function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
  }

  inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
      event: 'rotate',
      threshold: 0,
      pointers: 2
    },
    getTouchAction: function getTouchAction() {
      return [TOUCH_ACTION_NONE];
    },
    attrTest: function attrTest(input) {
      return this._super.attrTest.call(this, input) && (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
  });
  /**
   * Swipe
   * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
   * @constructor
   * @extends AttrRecognizer
   */

  function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
  }

  inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
      event: 'swipe',
      threshold: 10,
      velocity: 0.3,
      direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
      pointers: 1
    },
    getTouchAction: function getTouchAction() {
      return PanRecognizer.prototype.getTouchAction.call(this);
    },
    attrTest: function attrTest(input) {
      var direction = this.options.direction;
      var velocity;

      if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
        velocity = input.overallVelocity;
      } else if (direction & DIRECTION_HORIZONTAL) {
        velocity = input.overallVelocityX;
      } else if (direction & DIRECTION_VERTICAL) {
        velocity = input.overallVelocityY;
      }

      return this._super.attrTest.call(this, input) && direction & input.offsetDirection && input.distance > this.options.threshold && input.maxPointers == this.options.pointers && abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },
    emit: function emit(input) {
      var direction = directionStr(input.offsetDirection);

      if (direction) {
        this.manager.emit(this.options.event + direction, input);
      }

      this.manager.emit(this.options.event, input);
    }
  });
  /**
   * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
   * between the given interval and position. The delay option can be used to recognize multi-taps without firing
   * a single tap.
   *
   * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
   * multi-taps being recognized.
   * @constructor
   * @extends Recognizer
   */

  function TapRecognizer() {
    Recognizer.apply(this, arguments); // previous time and center,
    // used for tap counting

    this.pTime = false;
    this.pCenter = false;
    this._timer = null;
    this._input = null;
    this.count = 0;
  }

  inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
      event: 'tap',
      pointers: 1,
      taps: 1,
      interval: 300,
      // max time between the multi-tap taps
      time: 250,
      // max time of the pointer to be down (like finger on the screen)
      threshold: 9,
      // a minimal movement is ok, but keep it low
      posThreshold: 10 // a multi-tap can be a bit off the initial position

    },
    getTouchAction: function getTouchAction() {
      return [TOUCH_ACTION_MANIPULATION];
    },
    process: function process(input) {
      var options = this.options;
      var validPointers = input.pointers.length === options.pointers;
      var validMovement = input.distance < options.threshold;
      var validTouchTime = input.deltaTime < options.time;
      this.reset();

      if (input.eventType & INPUT_START && this.count === 0) {
        return this.failTimeout();
      } // we only allow little movement
      // and we've reached an end event, so a tap is possible


      if (validMovement && validTouchTime && validPointers) {
        if (input.eventType != INPUT_END) {
          return this.failTimeout();
        }

        var validInterval = this.pTime ? input.timeStamp - this.pTime < options.interval : true;
        var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;
        this.pTime = input.timeStamp;
        this.pCenter = input.center;

        if (!validMultiTap || !validInterval) {
          this.count = 1;
        } else {
          this.count += 1;
        }

        this._input = input; // if tap count matches we have recognized it,
        // else it has began recognizing...

        var tapCount = this.count % options.taps;

        if (tapCount === 0) {
          // no failing requirements, immediately trigger the tap event
          // or wait as long as the multitap interval to trigger
          if (!this.hasRequireFailures()) {
            return STATE_RECOGNIZED;
          } else {
            this._timer = setTimeoutContext(function () {
              this.state = STATE_RECOGNIZED;
              this.tryEmit();
            }, options.interval, this);
            return STATE_BEGAN;
          }
        }
      }

      return STATE_FAILED;
    },
    failTimeout: function failTimeout() {
      this._timer = setTimeoutContext(function () {
        this.state = STATE_FAILED;
      }, this.options.interval, this);
      return STATE_FAILED;
    },
    reset: function reset() {
      clearTimeout(this._timer);
    },
    emit: function emit() {
      if (this.state == STATE_RECOGNIZED) {
        this._input.tapCount = this.count;
        this.manager.emit(this.options.event, this._input);
      }
    }
  });
  /**
   * Simple way to create a manager with a default set of recognizers.
   * @param {HTMLElement} element
   * @param {Object} [options]
   * @constructor
   */

  function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
  }
  /**
   * @const {string}
   */


  Hammer.VERSION = '2.0.7';
  /**
   * default settings
   * @namespace
   */

  Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [// RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
    [RotateRecognizer, {
      enable: false
    }], [PinchRecognizer, {
      enable: false
    }, ['rotate']], [SwipeRecognizer, {
      direction: DIRECTION_HORIZONTAL
    }], [PanRecognizer, {
      direction: DIRECTION_HORIZONTAL
    }, ['swipe']], [TapRecognizer], [TapRecognizer, {
      event: 'doubletap',
      taps: 2
    }, ['tap']], [PressRecognizer]],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
      /**
       * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
       * @type {String}
       * @default 'none'
       */
      userSelect: 'none',

      /**
       * Disable the Windows Phone grippers when pressing an element.
       * @type {String}
       * @default 'none'
       */
      touchSelect: 'none',

      /**
       * Disables the default callout shown when you touch and hold a touch target.
       * On iOS, when you touch and hold a touch target such as a link, Safari displays
       * a callout containing information about the link. This property allows you to disable that callout.
       * @type {String}
       * @default 'none'
       */
      touchCallout: 'none',

      /**
       * Specifies whether zooming is enabled. Used by IE10>
       * @type {String}
       * @default 'none'
       */
      contentZooming: 'none',

      /**
       * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
       * @type {String}
       * @default 'none'
       */
      userDrag: 'none',

      /**
       * Overrides the highlight color shown when the user taps a link or a JavaScript
       * clickable element in iOS. This property obeys the alpha value, if specified.
       * @type {String}
       * @default 'rgba(0,0,0,0)'
       */
      tapHighlightColor: 'rgba(0,0,0,0)'
    }
  };
  var STOP = 1;
  var FORCED_STOP = 2;
  /**
   * Manager
   * @param {HTMLElement} element
   * @param {Object} [options]
   * @constructor
   */

  function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});
    this.options.inputTarget = this.options.inputTarget || element;
    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};
    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);
    toggleCssProps(this, true);
    each(this.options.recognizers, function (item) {
      var recognizer = this.add(new item[0](item[1]));
      item[2] && recognizer.recognizeWith(item[2]);
      item[3] && recognizer.requireFailure(item[3]);
    }, this);
  }

  Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function set(options) {
      assign(this.options, options); // Options that need a little more setup

      if (options.touchAction) {
        this.touchAction.update();
      }

      if (options.inputTarget) {
        // Clean up existing event listeners and reinitialize
        this.input.destroy();
        this.input.target = options.inputTarget;
        this.input.init();
      }

      return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function stop(force) {
      this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function recognize(inputData) {
      var session = this.session;

      if (session.stopped) {
        return;
      } // run the touch-action polyfill


      this.touchAction.preventDefaults(inputData);
      var recognizer;
      var recognizers = this.recognizers; // this holds the recognizer that is being recognized.
      // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
      // if no recognizer is detecting a thing, it is set to `null`

      var curRecognizer = session.curRecognizer; // reset when the last recognizer is recognized
      // or when we're in a new session

      if (!curRecognizer || curRecognizer && curRecognizer.state & STATE_RECOGNIZED) {
        curRecognizer = session.curRecognizer = null;
      }

      var i = 0;

      while (i < recognizers.length) {
        recognizer = recognizers[i]; // find out if we are allowed try to recognize the input for this one.
        // 1.   allow if the session is NOT forced stopped (see the .stop() method)
        // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
        //      that is being recognized.
        // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
        //      this can be setup with the `recognizeWith()` method on the recognizer.

        if (session.stopped !== FORCED_STOP && ( // 1
        !curRecognizer || recognizer == curRecognizer || // 2
        recognizer.canRecognizeWith(curRecognizer))) {
          // 3
          recognizer.recognize(inputData);
        } else {
          recognizer.reset();
        } // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
        // current active recognizer. but only if we don't already have an active recognizer


        if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
          curRecognizer = session.curRecognizer = recognizer;
        }

        i++;
      }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function get(recognizer) {
      if (recognizer instanceof Recognizer) {
        return recognizer;
      }

      var recognizers = this.recognizers;

      for (var i = 0; i < recognizers.length; i++) {
        if (recognizers[i].options.event == recognizer) {
          return recognizers[i];
        }
      }

      return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function add(recognizer) {
      if (invokeArrayArg(recognizer, 'add', this)) {
        return this;
      } // remove existing


      var existing = this.get(recognizer.options.event);

      if (existing) {
        this.remove(existing);
      }

      this.recognizers.push(recognizer);
      recognizer.manager = this;
      this.touchAction.update();
      return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function remove(recognizer) {
      if (invokeArrayArg(recognizer, 'remove', this)) {
        return this;
      }

      recognizer = this.get(recognizer); // let's make sure this recognizer exists

      if (recognizer) {
        var recognizers = this.recognizers;
        var index = inArray(recognizers, recognizer);

        if (index !== -1) {
          recognizers.splice(index, 1);
          this.touchAction.update();
        }
      }

      return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function on(events, handler) {
      if (events === undefined) {
        return;
      }

      if (handler === undefined) {
        return;
      }

      var handlers = this.handlers;
      each(splitStr(events), function (event) {
        handlers[event] = handlers[event] || [];
        handlers[event].push(handler);
      });
      return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function off(events, handler) {
      if (events === undefined) {
        return;
      }

      var handlers = this.handlers;
      each(splitStr(events), function (event) {
        if (!handler) {
          delete handlers[event];
        } else {
          handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
        }
      });
      return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function emit(event, data) {
      // we also want to trigger dom events
      if (this.options.domEvents) {
        triggerDomEvent(event, data);
      } // no handlers, so skip it all


      var handlers = this.handlers[event] && this.handlers[event].slice();

      if (!handlers || !handlers.length) {
        return;
      }

      data.type = event;

      data.preventDefault = function () {
        data.srcEvent.preventDefault();
      };

      var i = 0;

      while (i < handlers.length) {
        handlers[i](data);
        i++;
      }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function destroy() {
      this.element && toggleCssProps(this, false);
      this.handlers = {};
      this.session = {};
      this.input.destroy();
      this.element = null;
    }
  };
  /**
   * add/remove the css properties as defined in manager.options.cssProps
   * @param {Manager} manager
   * @param {Boolean} add
   */

  function toggleCssProps(manager, add) {
    var element = manager.element;

    if (!element.style) {
      return;
    }

    var prop;
    each(manager.options.cssProps, function (value, name) {
      prop = prefixed(element.style, name);

      if (add) {
        manager.oldCssProps[prop] = element.style[prop];
        element.style[prop] = value;
      } else {
        element.style[prop] = manager.oldCssProps[prop] || '';
      }
    });

    if (!add) {
      manager.oldCssProps = {};
    }
  }
  /**
   * trigger dom event
   * @param {String} event
   * @param {Object} data
   */


  function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
  }

  assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,
    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,
    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,
    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,
    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,
    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,
    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
  }); // this prevents errors when Hammer is loaded in the presence of an AMD
  //  style loader but by script tag, not by the loader.

  var freeGlobal = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}; // jshint ignore:line

  freeGlobal.Hammer = Hammer;

  if (typeof define === 'function' && define.amd) {
    define(function () {
      return Hammer;
    });
  } else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
  } else {
    window[exportName] = Hammer;
  }
})(window, document, 'Hammer');
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2h0bWwvanMvYXBwL2hhbW1lci5qcyJdLCJuYW1lcyI6WyJ3aW5kb3ciLCJkb2N1bWVudCIsImV4cG9ydE5hbWUiLCJ1bmRlZmluZWQiLCJWRU5ET1JfUFJFRklYRVMiLCJURVNUX0VMRU1FTlQiLCJjcmVhdGVFbGVtZW50IiwiVFlQRV9GVU5DVElPTiIsInJvdW5kIiwiTWF0aCIsImFicyIsIm5vdyIsIkRhdGUiLCJzZXRUaW1lb3V0Q29udGV4dCIsImZuIiwidGltZW91dCIsImNvbnRleHQiLCJzZXRUaW1lb3V0IiwiYmluZEZuIiwiaW52b2tlQXJyYXlBcmciLCJhcmciLCJBcnJheSIsImlzQXJyYXkiLCJlYWNoIiwib2JqIiwiaXRlcmF0b3IiLCJpIiwiZm9yRWFjaCIsImxlbmd0aCIsImNhbGwiLCJoYXNPd25Qcm9wZXJ0eSIsImRlcHJlY2F0ZSIsIm1ldGhvZCIsIm5hbWUiLCJtZXNzYWdlIiwiZGVwcmVjYXRpb25NZXNzYWdlIiwiZSIsIkVycm9yIiwic3RhY2siLCJyZXBsYWNlIiwibG9nIiwiY29uc29sZSIsIndhcm4iLCJhcHBseSIsImFyZ3VtZW50cyIsImFzc2lnbiIsIk9iamVjdCIsInRhcmdldCIsIlR5cGVFcnJvciIsIm91dHB1dCIsImluZGV4Iiwic291cmNlIiwibmV4dEtleSIsImV4dGVuZCIsImRlc3QiLCJzcmMiLCJtZXJnZSIsImtleXMiLCJpbmhlcml0IiwiY2hpbGQiLCJiYXNlIiwicHJvcGVydGllcyIsImJhc2VQIiwicHJvdG90eXBlIiwiY2hpbGRQIiwiY3JlYXRlIiwiY29uc3RydWN0b3IiLCJfc3VwZXIiLCJib3VuZEZuIiwiYm9vbE9yRm4iLCJ2YWwiLCJhcmdzIiwiaWZVbmRlZmluZWQiLCJ2YWwxIiwidmFsMiIsImFkZEV2ZW50TGlzdGVuZXJzIiwidHlwZXMiLCJoYW5kbGVyIiwic3BsaXRTdHIiLCJ0eXBlIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZUV2ZW50TGlzdGVuZXJzIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImhhc1BhcmVudCIsIm5vZGUiLCJwYXJlbnQiLCJwYXJlbnROb2RlIiwiaW5TdHIiLCJzdHIiLCJmaW5kIiwiaW5kZXhPZiIsInRyaW0iLCJzcGxpdCIsImluQXJyYXkiLCJmaW5kQnlLZXkiLCJ0b0FycmF5Iiwic2xpY2UiLCJ1bmlxdWVBcnJheSIsImtleSIsInNvcnQiLCJyZXN1bHRzIiwidmFsdWVzIiwicHVzaCIsInNvcnRVbmlxdWVBcnJheSIsImEiLCJiIiwicHJlZml4ZWQiLCJwcm9wZXJ0eSIsInByZWZpeCIsInByb3AiLCJjYW1lbFByb3AiLCJ0b1VwcGVyQ2FzZSIsIl91bmlxdWVJZCIsInVuaXF1ZUlkIiwiZ2V0V2luZG93Rm9yRWxlbWVudCIsImVsZW1lbnQiLCJkb2MiLCJvd25lckRvY3VtZW50IiwiZGVmYXVsdFZpZXciLCJwYXJlbnRXaW5kb3ciLCJNT0JJTEVfUkVHRVgiLCJTVVBQT1JUX1RPVUNIIiwiU1VQUE9SVF9QT0lOVEVSX0VWRU5UUyIsIlNVUFBPUlRfT05MWV9UT1VDSCIsInRlc3QiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJJTlBVVF9UWVBFX1RPVUNIIiwiSU5QVVRfVFlQRV9QRU4iLCJJTlBVVF9UWVBFX01PVVNFIiwiSU5QVVRfVFlQRV9LSU5FQ1QiLCJDT01QVVRFX0lOVEVSVkFMIiwiSU5QVVRfU1RBUlQiLCJJTlBVVF9NT1ZFIiwiSU5QVVRfRU5EIiwiSU5QVVRfQ0FOQ0VMIiwiRElSRUNUSU9OX05PTkUiLCJESVJFQ1RJT05fTEVGVCIsIkRJUkVDVElPTl9SSUdIVCIsIkRJUkVDVElPTl9VUCIsIkRJUkVDVElPTl9ET1dOIiwiRElSRUNUSU9OX0hPUklaT05UQUwiLCJESVJFQ1RJT05fVkVSVElDQUwiLCJESVJFQ1RJT05fQUxMIiwiUFJPUFNfWFkiLCJQUk9QU19DTElFTlRfWFkiLCJJbnB1dCIsIm1hbmFnZXIiLCJjYWxsYmFjayIsInNlbGYiLCJvcHRpb25zIiwiaW5wdXRUYXJnZXQiLCJkb21IYW5kbGVyIiwiZXYiLCJlbmFibGUiLCJpbml0IiwiZXZFbCIsImV2VGFyZ2V0IiwiZXZXaW4iLCJkZXN0cm95IiwiY3JlYXRlSW5wdXRJbnN0YW5jZSIsIlR5cGUiLCJpbnB1dENsYXNzIiwiUG9pbnRlckV2ZW50SW5wdXQiLCJUb3VjaElucHV0IiwiTW91c2VJbnB1dCIsIlRvdWNoTW91c2VJbnB1dCIsImlucHV0SGFuZGxlciIsImV2ZW50VHlwZSIsImlucHV0IiwicG9pbnRlcnNMZW4iLCJwb2ludGVycyIsImNoYW5nZWRQb2ludGVyc0xlbiIsImNoYW5nZWRQb2ludGVycyIsImlzRmlyc3QiLCJpc0ZpbmFsIiwic2Vzc2lvbiIsImNvbXB1dGVJbnB1dERhdGEiLCJlbWl0IiwicmVjb2duaXplIiwicHJldklucHV0IiwicG9pbnRlcnNMZW5ndGgiLCJmaXJzdElucHV0Iiwic2ltcGxlQ2xvbmVJbnB1dERhdGEiLCJmaXJzdE11bHRpcGxlIiwib2Zmc2V0Q2VudGVyIiwiY2VudGVyIiwiZ2V0Q2VudGVyIiwidGltZVN0YW1wIiwiZGVsdGFUaW1lIiwiYW5nbGUiLCJnZXRBbmdsZSIsImRpc3RhbmNlIiwiZ2V0RGlzdGFuY2UiLCJjb21wdXRlRGVsdGFYWSIsIm9mZnNldERpcmVjdGlvbiIsImdldERpcmVjdGlvbiIsImRlbHRhWCIsImRlbHRhWSIsIm92ZXJhbGxWZWxvY2l0eSIsImdldFZlbG9jaXR5Iiwib3ZlcmFsbFZlbG9jaXR5WCIsIngiLCJvdmVyYWxsVmVsb2NpdHlZIiwieSIsInNjYWxlIiwiZ2V0U2NhbGUiLCJyb3RhdGlvbiIsImdldFJvdGF0aW9uIiwibWF4UG9pbnRlcnMiLCJjb21wdXRlSW50ZXJ2YWxJbnB1dERhdGEiLCJzcmNFdmVudCIsIm9mZnNldCIsIm9mZnNldERlbHRhIiwicHJldkRlbHRhIiwibGFzdCIsImxhc3RJbnRlcnZhbCIsInZlbG9jaXR5IiwidmVsb2NpdHlYIiwidmVsb2NpdHlZIiwiZGlyZWN0aW9uIiwidiIsImNsaWVudFgiLCJjbGllbnRZIiwicDEiLCJwMiIsInByb3BzIiwic3FydCIsImF0YW4yIiwiUEkiLCJzdGFydCIsImVuZCIsIk1PVVNFX0lOUFVUX01BUCIsIm1vdXNlZG93biIsIm1vdXNlbW92ZSIsIm1vdXNldXAiLCJNT1VTRV9FTEVNRU5UX0VWRU5UUyIsIk1PVVNFX1dJTkRPV19FVkVOVFMiLCJwcmVzc2VkIiwiTUVoYW5kbGVyIiwiYnV0dG9uIiwid2hpY2giLCJwb2ludGVyVHlwZSIsIlBPSU5URVJfSU5QVVRfTUFQIiwicG9pbnRlcmRvd24iLCJwb2ludGVybW92ZSIsInBvaW50ZXJ1cCIsInBvaW50ZXJjYW5jZWwiLCJwb2ludGVyb3V0IiwiSUUxMF9QT0lOVEVSX1RZUEVfRU5VTSIsIlBPSU5URVJfRUxFTUVOVF9FVkVOVFMiLCJQT0lOVEVSX1dJTkRPV19FVkVOVFMiLCJNU1BvaW50ZXJFdmVudCIsIlBvaW50ZXJFdmVudCIsInN0b3JlIiwicG9pbnRlckV2ZW50cyIsIlBFaGFuZGxlciIsInJlbW92ZVBvaW50ZXIiLCJldmVudFR5cGVOb3JtYWxpemVkIiwidG9Mb3dlckNhc2UiLCJpc1RvdWNoIiwic3RvcmVJbmRleCIsInBvaW50ZXJJZCIsInNwbGljZSIsIlNJTkdMRV9UT1VDSF9JTlBVVF9NQVAiLCJ0b3VjaHN0YXJ0IiwidG91Y2htb3ZlIiwidG91Y2hlbmQiLCJ0b3VjaGNhbmNlbCIsIlNJTkdMRV9UT1VDSF9UQVJHRVRfRVZFTlRTIiwiU0lOR0xFX1RPVUNIX1dJTkRPV19FVkVOVFMiLCJTaW5nbGVUb3VjaElucHV0Iiwic3RhcnRlZCIsIlRFaGFuZGxlciIsInRvdWNoZXMiLCJub3JtYWxpemVTaW5nbGVUb3VjaGVzIiwiYWxsIiwiY2hhbmdlZCIsImNoYW5nZWRUb3VjaGVzIiwiY29uY2F0IiwiVE9VQ0hfSU5QVVRfTUFQIiwiVE9VQ0hfVEFSR0VUX0VWRU5UUyIsInRhcmdldElkcyIsIk1URWhhbmRsZXIiLCJnZXRUb3VjaGVzIiwiYWxsVG91Y2hlcyIsImlkZW50aWZpZXIiLCJ0YXJnZXRUb3VjaGVzIiwiY2hhbmdlZFRhcmdldFRvdWNoZXMiLCJmaWx0ZXIiLCJ0b3VjaCIsIkRFRFVQX1RJTUVPVVQiLCJERURVUF9ESVNUQU5DRSIsIm1vdXNlIiwicHJpbWFyeVRvdWNoIiwibGFzdFRvdWNoZXMiLCJUTUVoYW5kbGVyIiwiaW5wdXRFdmVudCIsImlucHV0RGF0YSIsImlzTW91c2UiLCJzb3VyY2VDYXBhYmlsaXRpZXMiLCJmaXJlc1RvdWNoRXZlbnRzIiwicmVjb3JkVG91Y2hlcyIsImlzU3ludGhldGljRXZlbnQiLCJldmVudERhdGEiLCJzZXRMYXN0VG91Y2giLCJsYXN0VG91Y2giLCJsdHMiLCJyZW1vdmVMYXN0VG91Y2giLCJ0IiwiZHgiLCJkeSIsIlBSRUZJWEVEX1RPVUNIX0FDVElPTiIsInN0eWxlIiwiTkFUSVZFX1RPVUNIX0FDVElPTiIsIlRPVUNIX0FDVElPTl9DT01QVVRFIiwiVE9VQ0hfQUNUSU9OX0FVVE8iLCJUT1VDSF9BQ1RJT05fTUFOSVBVTEFUSU9OIiwiVE9VQ0hfQUNUSU9OX05PTkUiLCJUT1VDSF9BQ1RJT05fUEFOX1giLCJUT1VDSF9BQ1RJT05fUEFOX1kiLCJUT1VDSF9BQ1RJT05fTUFQIiwiZ2V0VG91Y2hBY3Rpb25Qcm9wcyIsIlRvdWNoQWN0aW9uIiwidmFsdWUiLCJzZXQiLCJjb21wdXRlIiwiYWN0aW9ucyIsInVwZGF0ZSIsInRvdWNoQWN0aW9uIiwicmVjb2duaXplcnMiLCJyZWNvZ25pemVyIiwiZ2V0VG91Y2hBY3Rpb24iLCJjbGVhblRvdWNoQWN0aW9ucyIsImpvaW4iLCJwcmV2ZW50RGVmYXVsdHMiLCJwcmV2ZW50ZWQiLCJwcmV2ZW50RGVmYXVsdCIsImhhc05vbmUiLCJoYXNQYW5ZIiwiaGFzUGFuWCIsImlzVGFwUG9pbnRlciIsImlzVGFwTW92ZW1lbnQiLCJpc1RhcFRvdWNoVGltZSIsInByZXZlbnRTcmMiLCJ0b3VjaE1hcCIsImNzc1N1cHBvcnRzIiwiQ1NTIiwic3VwcG9ydHMiLCJTVEFURV9QT1NTSUJMRSIsIlNUQVRFX0JFR0FOIiwiU1RBVEVfQ0hBTkdFRCIsIlNUQVRFX0VOREVEIiwiU1RBVEVfUkVDT0dOSVpFRCIsIlNUQVRFX0NBTkNFTExFRCIsIlNUQVRFX0ZBSUxFRCIsIlJlY29nbml6ZXIiLCJkZWZhdWx0cyIsImlkIiwic3RhdGUiLCJzaW11bHRhbmVvdXMiLCJyZXF1aXJlRmFpbCIsInJlY29nbml6ZVdpdGgiLCJvdGhlclJlY29nbml6ZXIiLCJnZXRSZWNvZ25pemVyQnlOYW1lSWZNYW5hZ2VyIiwiZHJvcFJlY29nbml6ZVdpdGgiLCJyZXF1aXJlRmFpbHVyZSIsImRyb3BSZXF1aXJlRmFpbHVyZSIsImhhc1JlcXVpcmVGYWlsdXJlcyIsImNhblJlY29nbml6ZVdpdGgiLCJldmVudCIsInN0YXRlU3RyIiwiYWRkaXRpb25hbEV2ZW50IiwidHJ5RW1pdCIsImNhbkVtaXQiLCJpbnB1dERhdGFDbG9uZSIsInJlc2V0IiwicHJvY2VzcyIsImRpcmVjdGlvblN0ciIsImdldCIsIkF0dHJSZWNvZ25pemVyIiwiYXR0clRlc3QiLCJvcHRpb25Qb2ludGVycyIsImlzUmVjb2duaXplZCIsImlzVmFsaWQiLCJQYW5SZWNvZ25pemVyIiwicFgiLCJwWSIsInRocmVzaG9sZCIsImRpcmVjdGlvblRlc3QiLCJoYXNNb3ZlZCIsIlBpbmNoUmVjb2duaXplciIsImluT3V0IiwiUHJlc3NSZWNvZ25pemVyIiwiX3RpbWVyIiwiX2lucHV0IiwidGltZSIsInZhbGlkUG9pbnRlcnMiLCJ2YWxpZE1vdmVtZW50IiwidmFsaWRUaW1lIiwiY2xlYXJUaW1lb3V0IiwiUm90YXRlUmVjb2duaXplciIsIlN3aXBlUmVjb2duaXplciIsIlRhcFJlY29nbml6ZXIiLCJwVGltZSIsInBDZW50ZXIiLCJjb3VudCIsInRhcHMiLCJpbnRlcnZhbCIsInBvc1RocmVzaG9sZCIsInZhbGlkVG91Y2hUaW1lIiwiZmFpbFRpbWVvdXQiLCJ2YWxpZEludGVydmFsIiwidmFsaWRNdWx0aVRhcCIsInRhcENvdW50IiwiSGFtbWVyIiwicHJlc2V0IiwiTWFuYWdlciIsIlZFUlNJT04iLCJkb21FdmVudHMiLCJjc3NQcm9wcyIsInVzZXJTZWxlY3QiLCJ0b3VjaFNlbGVjdCIsInRvdWNoQ2FsbG91dCIsImNvbnRlbnRab29taW5nIiwidXNlckRyYWciLCJ0YXBIaWdobGlnaHRDb2xvciIsIlNUT1AiLCJGT1JDRURfU1RPUCIsImhhbmRsZXJzIiwib2xkQ3NzUHJvcHMiLCJ0b2dnbGVDc3NQcm9wcyIsIml0ZW0iLCJhZGQiLCJzdG9wIiwiZm9yY2UiLCJzdG9wcGVkIiwiY3VyUmVjb2duaXplciIsImV4aXN0aW5nIiwicmVtb3ZlIiwib24iLCJldmVudHMiLCJvZmYiLCJkYXRhIiwidHJpZ2dlckRvbUV2ZW50IiwiZ2VzdHVyZUV2ZW50IiwiY3JlYXRlRXZlbnQiLCJpbml0RXZlbnQiLCJnZXN0dXJlIiwiZGlzcGF0Y2hFdmVudCIsIlRhcCIsIlBhbiIsIlN3aXBlIiwiUGluY2giLCJSb3RhdGUiLCJQcmVzcyIsImZyZWVHbG9iYWwiLCJkZWZpbmUiLCJhbWQiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7O0FBS0EsQ0FBQyxVQUFTQSxNQUFULEVBQWlCQyxRQUFqQixFQUEyQkMsVUFBM0IsRUFBdUNDLFNBQXZDLEVBQWtEO0FBQy9DOztBQUVGLE1BQUlDLGVBQWUsR0FBRyxDQUFDLEVBQUQsRUFBSyxRQUFMLEVBQWUsS0FBZixFQUFzQixJQUF0QixFQUE0QixJQUE1QixFQUFrQyxHQUFsQyxDQUF0QjtBQUNBLE1BQUlDLFlBQVksR0FBR0osUUFBUSxDQUFDSyxhQUFULENBQXVCLEtBQXZCLENBQW5CO0FBRUEsTUFBSUMsYUFBYSxHQUFHLFVBQXBCO0FBRUEsTUFBSUMsS0FBSyxHQUFHQyxJQUFJLENBQUNELEtBQWpCO0FBQ0EsTUFBSUUsR0FBRyxHQUFHRCxJQUFJLENBQUNDLEdBQWY7QUFDQSxNQUFJQyxHQUFHLEdBQUdDLElBQUksQ0FBQ0QsR0FBZjtBQUVBOzs7Ozs7OztBQU9BLFdBQVNFLGlCQUFULENBQTJCQyxFQUEzQixFQUErQkMsT0FBL0IsRUFBd0NDLE9BQXhDLEVBQWlEO0FBQzdDLFdBQU9DLFVBQVUsQ0FBQ0MsTUFBTSxDQUFDSixFQUFELEVBQUtFLE9BQUwsQ0FBUCxFQUFzQkQsT0FBdEIsQ0FBakI7QUFDSDtBQUVEOzs7Ozs7Ozs7OztBQVNBLFdBQVNJLGNBQVQsQ0FBd0JDLEdBQXhCLEVBQTZCTixFQUE3QixFQUFpQ0UsT0FBakMsRUFBMEM7QUFDdEMsUUFBSUssS0FBSyxDQUFDQyxPQUFOLENBQWNGLEdBQWQsQ0FBSixFQUF3QjtBQUNwQkcsTUFBQUEsSUFBSSxDQUFDSCxHQUFELEVBQU1KLE9BQU8sQ0FBQ0YsRUFBRCxDQUFiLEVBQW1CRSxPQUFuQixDQUFKO0FBQ0EsYUFBTyxJQUFQO0FBQ0g7O0FBQ0QsV0FBTyxLQUFQO0FBQ0g7QUFFRDs7Ozs7Ozs7QUFNQSxXQUFTTyxJQUFULENBQWNDLEdBQWQsRUFBbUJDLFFBQW5CLEVBQTZCVCxPQUE3QixFQUFzQztBQUNsQyxRQUFJVSxDQUFKOztBQUVBLFFBQUksQ0FBQ0YsR0FBTCxFQUFVO0FBQ047QUFDSDs7QUFFRCxRQUFJQSxHQUFHLENBQUNHLE9BQVIsRUFBaUI7QUFDYkgsTUFBQUEsR0FBRyxDQUFDRyxPQUFKLENBQVlGLFFBQVosRUFBc0JULE9BQXRCO0FBQ0gsS0FGRCxNQUVPLElBQUlRLEdBQUcsQ0FBQ0ksTUFBSixLQUFlekIsU0FBbkIsRUFBOEI7QUFDakN1QixNQUFBQSxDQUFDLEdBQUcsQ0FBSjs7QUFDQSxhQUFPQSxDQUFDLEdBQUdGLEdBQUcsQ0FBQ0ksTUFBZixFQUF1QjtBQUNuQkgsUUFBQUEsUUFBUSxDQUFDSSxJQUFULENBQWNiLE9BQWQsRUFBdUJRLEdBQUcsQ0FBQ0UsQ0FBRCxDQUExQixFQUErQkEsQ0FBL0IsRUFBa0NGLEdBQWxDO0FBQ0FFLFFBQUFBLENBQUM7QUFDSjtBQUNKLEtBTk0sTUFNQTtBQUNILFdBQUtBLENBQUwsSUFBVUYsR0FBVixFQUFlO0FBQ1hBLFFBQUFBLEdBQUcsQ0FBQ00sY0FBSixDQUFtQkosQ0FBbkIsS0FBeUJELFFBQVEsQ0FBQ0ksSUFBVCxDQUFjYixPQUFkLEVBQXVCUSxHQUFHLENBQUNFLENBQUQsQ0FBMUIsRUFBK0JBLENBQS9CLEVBQWtDRixHQUFsQyxDQUF6QjtBQUNIO0FBQ0o7QUFDSjtBQUVEOzs7Ozs7Ozs7QUFPQSxXQUFTTyxTQUFULENBQW1CQyxNQUFuQixFQUEyQkMsSUFBM0IsRUFBaUNDLE9BQWpDLEVBQTBDO0FBQ3RDLFFBQUlDLGtCQUFrQixHQUFHLHdCQUF3QkYsSUFBeEIsR0FBK0IsSUFBL0IsR0FBc0NDLE9BQXRDLEdBQWdELFFBQXpFO0FBQ0EsV0FBTyxZQUFXO0FBQ2QsVUFBSUUsQ0FBQyxHQUFHLElBQUlDLEtBQUosQ0FBVSxpQkFBVixDQUFSO0FBQ0EsVUFBSUMsS0FBSyxHQUFHRixDQUFDLElBQUlBLENBQUMsQ0FBQ0UsS0FBUCxHQUFlRixDQUFDLENBQUNFLEtBQUYsQ0FBUUMsT0FBUixDQUFnQixpQkFBaEIsRUFBbUMsRUFBbkMsRUFDdEJBLE9BRHNCLENBQ2QsYUFEYyxFQUNDLEVBREQsRUFFdEJBLE9BRnNCLENBRWQsNEJBRmMsRUFFZ0IsZ0JBRmhCLENBQWYsR0FFbUQscUJBRi9EO0FBSUEsVUFBSUMsR0FBRyxHQUFHeEMsTUFBTSxDQUFDeUMsT0FBUCxLQUFtQnpDLE1BQU0sQ0FBQ3lDLE9BQVAsQ0FBZUMsSUFBZixJQUF1QjFDLE1BQU0sQ0FBQ3lDLE9BQVAsQ0FBZUQsR0FBekQsQ0FBVjs7QUFDQSxVQUFJQSxHQUFKLEVBQVM7QUFDTEEsUUFBQUEsR0FBRyxDQUFDWCxJQUFKLENBQVM3QixNQUFNLENBQUN5QyxPQUFoQixFQUF5Qk4sa0JBQXpCLEVBQTZDRyxLQUE3QztBQUNIOztBQUNELGFBQU9OLE1BQU0sQ0FBQ1csS0FBUCxDQUFhLElBQWIsRUFBbUJDLFNBQW5CLENBQVA7QUFDSCxLQVhEO0FBWUg7QUFFRDs7Ozs7Ozs7O0FBT0EsTUFBSUMsTUFBSjs7QUFDQSxNQUFJLE9BQU9DLE1BQU0sQ0FBQ0QsTUFBZCxLQUF5QixVQUE3QixFQUF5QztBQUNyQ0EsSUFBQUEsTUFBTSxHQUFHLFNBQVNBLE1BQVQsQ0FBZ0JFLE1BQWhCLEVBQXdCO0FBQzdCLFVBQUlBLE1BQU0sS0FBSzVDLFNBQVgsSUFBd0I0QyxNQUFNLEtBQUssSUFBdkMsRUFBNkM7QUFDekMsY0FBTSxJQUFJQyxTQUFKLENBQWMsNENBQWQsQ0FBTjtBQUNIOztBQUVELFVBQUlDLE1BQU0sR0FBR0gsTUFBTSxDQUFDQyxNQUFELENBQW5COztBQUNBLFdBQUssSUFBSUcsS0FBSyxHQUFHLENBQWpCLEVBQW9CQSxLQUFLLEdBQUdOLFNBQVMsQ0FBQ2hCLE1BQXRDLEVBQThDc0IsS0FBSyxFQUFuRCxFQUF1RDtBQUNuRCxZQUFJQyxNQUFNLEdBQUdQLFNBQVMsQ0FBQ00sS0FBRCxDQUF0Qjs7QUFDQSxZQUFJQyxNQUFNLEtBQUtoRCxTQUFYLElBQXdCZ0QsTUFBTSxLQUFLLElBQXZDLEVBQTZDO0FBQ3pDLGVBQUssSUFBSUMsT0FBVCxJQUFvQkQsTUFBcEIsRUFBNEI7QUFDeEIsZ0JBQUlBLE1BQU0sQ0FBQ3JCLGNBQVAsQ0FBc0JzQixPQUF0QixDQUFKLEVBQW9DO0FBQ2hDSCxjQUFBQSxNQUFNLENBQUNHLE9BQUQsQ0FBTixHQUFrQkQsTUFBTSxDQUFDQyxPQUFELENBQXhCO0FBQ0g7QUFDSjtBQUNKO0FBQ0o7O0FBQ0QsYUFBT0gsTUFBUDtBQUNILEtBakJEO0FBa0JILEdBbkJELE1BbUJPO0FBQ0hKLElBQUFBLE1BQU0sR0FBR0MsTUFBTSxDQUFDRCxNQUFoQjtBQUNIO0FBRUQ7Ozs7Ozs7Ozs7QUFRQSxNQUFJUSxNQUFNLEdBQUd0QixTQUFTLENBQUMsU0FBU3NCLE1BQVQsQ0FBZ0JDLElBQWhCLEVBQXNCQyxHQUF0QixFQUEyQkMsS0FBM0IsRUFBa0M7QUFDckQsUUFBSUMsSUFBSSxHQUFHWCxNQUFNLENBQUNXLElBQVAsQ0FBWUYsR0FBWixDQUFYO0FBQ0EsUUFBSTdCLENBQUMsR0FBRyxDQUFSOztBQUNBLFdBQU9BLENBQUMsR0FBRytCLElBQUksQ0FBQzdCLE1BQWhCLEVBQXdCO0FBQ3BCLFVBQUksQ0FBQzRCLEtBQUQsSUFBV0EsS0FBSyxJQUFJRixJQUFJLENBQUNHLElBQUksQ0FBQy9CLENBQUQsQ0FBTCxDQUFKLEtBQWtCdkIsU0FBMUMsRUFBc0Q7QUFDbERtRCxRQUFBQSxJQUFJLENBQUNHLElBQUksQ0FBQy9CLENBQUQsQ0FBTCxDQUFKLEdBQWdCNkIsR0FBRyxDQUFDRSxJQUFJLENBQUMvQixDQUFELENBQUwsQ0FBbkI7QUFDSDs7QUFDREEsTUFBQUEsQ0FBQztBQUNKOztBQUNELFdBQU80QixJQUFQO0FBQ0gsR0FWcUIsRUFVbkIsUUFWbUIsRUFVVCxlQVZTLENBQXRCO0FBWUE7Ozs7Ozs7O0FBT0EsTUFBSUUsS0FBSyxHQUFHekIsU0FBUyxDQUFDLFNBQVN5QixLQUFULENBQWVGLElBQWYsRUFBcUJDLEdBQXJCLEVBQTBCO0FBQzVDLFdBQU9GLE1BQU0sQ0FBQ0MsSUFBRCxFQUFPQyxHQUFQLEVBQVksSUFBWixDQUFiO0FBQ0gsR0FGb0IsRUFFbEIsT0FGa0IsRUFFVCxlQUZTLENBQXJCO0FBSUE7Ozs7Ozs7QUFNQSxXQUFTRyxPQUFULENBQWlCQyxLQUFqQixFQUF3QkMsSUFBeEIsRUFBOEJDLFVBQTlCLEVBQTBDO0FBQ3RDLFFBQUlDLEtBQUssR0FBR0YsSUFBSSxDQUFDRyxTQUFqQjtBQUFBLFFBQ0lDLE1BREo7QUFHQUEsSUFBQUEsTUFBTSxHQUFHTCxLQUFLLENBQUNJLFNBQU4sR0FBa0JqQixNQUFNLENBQUNtQixNQUFQLENBQWNILEtBQWQsQ0FBM0I7QUFDQUUsSUFBQUEsTUFBTSxDQUFDRSxXQUFQLEdBQXFCUCxLQUFyQjtBQUNBSyxJQUFBQSxNQUFNLENBQUNHLE1BQVAsR0FBZ0JMLEtBQWhCOztBQUVBLFFBQUlELFVBQUosRUFBZ0I7QUFDWmhCLE1BQUFBLE1BQU0sQ0FBQ21CLE1BQUQsRUFBU0gsVUFBVCxDQUFOO0FBQ0g7QUFDSjtBQUVEOzs7Ozs7OztBQU1BLFdBQVMzQyxNQUFULENBQWdCSixFQUFoQixFQUFvQkUsT0FBcEIsRUFBNkI7QUFDekIsV0FBTyxTQUFTb0QsT0FBVCxHQUFtQjtBQUN0QixhQUFPdEQsRUFBRSxDQUFDNkIsS0FBSCxDQUFTM0IsT0FBVCxFQUFrQjRCLFNBQWxCLENBQVA7QUFDSCxLQUZEO0FBR0g7QUFFRDs7Ozs7Ozs7O0FBT0EsV0FBU3lCLFFBQVQsQ0FBa0JDLEdBQWxCLEVBQXVCQyxJQUF2QixFQUE2QjtBQUN6QixRQUFJLFFBQU9ELEdBQVAsS0FBYy9ELGFBQWxCLEVBQWlDO0FBQzdCLGFBQU8rRCxHQUFHLENBQUMzQixLQUFKLENBQVU0QixJQUFJLEdBQUdBLElBQUksQ0FBQyxDQUFELENBQUosSUFBV3BFLFNBQWQsR0FBMEJBLFNBQXhDLEVBQW1Eb0UsSUFBbkQsQ0FBUDtBQUNIOztBQUNELFdBQU9ELEdBQVA7QUFDSDtBQUVEOzs7Ozs7OztBQU1BLFdBQVNFLFdBQVQsQ0FBcUJDLElBQXJCLEVBQTJCQyxJQUEzQixFQUFpQztBQUM3QixXQUFRRCxJQUFJLEtBQUt0RSxTQUFWLEdBQXVCdUUsSUFBdkIsR0FBOEJELElBQXJDO0FBQ0g7QUFFRDs7Ozs7Ozs7QUFNQSxXQUFTRSxpQkFBVCxDQUEyQjVCLE1BQTNCLEVBQW1DNkIsS0FBbkMsRUFBMENDLE9BQTFDLEVBQW1EO0FBQy9DdEQsSUFBQUEsSUFBSSxDQUFDdUQsUUFBUSxDQUFDRixLQUFELENBQVQsRUFBa0IsVUFBU0csSUFBVCxFQUFlO0FBQ2pDaEMsTUFBQUEsTUFBTSxDQUFDaUMsZ0JBQVAsQ0FBd0JELElBQXhCLEVBQThCRixPQUE5QixFQUF1QyxLQUF2QztBQUNILEtBRkcsQ0FBSjtBQUdIO0FBRUQ7Ozs7Ozs7O0FBTUEsV0FBU0ksb0JBQVQsQ0FBOEJsQyxNQUE5QixFQUFzQzZCLEtBQXRDLEVBQTZDQyxPQUE3QyxFQUFzRDtBQUNsRHRELElBQUFBLElBQUksQ0FBQ3VELFFBQVEsQ0FBQ0YsS0FBRCxDQUFULEVBQWtCLFVBQVNHLElBQVQsRUFBZTtBQUNqQ2hDLE1BQUFBLE1BQU0sQ0FBQ21DLG1CQUFQLENBQTJCSCxJQUEzQixFQUFpQ0YsT0FBakMsRUFBMEMsS0FBMUM7QUFDSCxLQUZHLENBQUo7QUFHSDtBQUVEOzs7Ozs7Ozs7QUFPQSxXQUFTTSxTQUFULENBQW1CQyxJQUFuQixFQUF5QkMsTUFBekIsRUFBaUM7QUFDN0IsV0FBT0QsSUFBUCxFQUFhO0FBQ1QsVUFBSUEsSUFBSSxJQUFJQyxNQUFaLEVBQW9CO0FBQ2hCLGVBQU8sSUFBUDtBQUNIOztBQUNERCxNQUFBQSxJQUFJLEdBQUdBLElBQUksQ0FBQ0UsVUFBWjtBQUNIOztBQUNELFdBQU8sS0FBUDtBQUNIO0FBRUQ7Ozs7Ozs7O0FBTUEsV0FBU0MsS0FBVCxDQUFlQyxHQUFmLEVBQW9CQyxJQUFwQixFQUEwQjtBQUN0QixXQUFPRCxHQUFHLENBQUNFLE9BQUosQ0FBWUQsSUFBWixJQUFvQixDQUFDLENBQTVCO0FBQ0g7QUFFRDs7Ozs7OztBQUtBLFdBQVNYLFFBQVQsQ0FBa0JVLEdBQWxCLEVBQXVCO0FBQ25CLFdBQU9BLEdBQUcsQ0FBQ0csSUFBSixHQUFXQyxLQUFYLENBQWlCLE1BQWpCLENBQVA7QUFDSDtBQUVEOzs7Ozs7Ozs7QUFPQSxXQUFTQyxPQUFULENBQWlCdEMsR0FBakIsRUFBc0JrQyxJQUF0QixFQUE0QkssU0FBNUIsRUFBdUM7QUFDbkMsUUFBSXZDLEdBQUcsQ0FBQ21DLE9BQUosSUFBZSxDQUFDSSxTQUFwQixFQUErQjtBQUMzQixhQUFPdkMsR0FBRyxDQUFDbUMsT0FBSixDQUFZRCxJQUFaLENBQVA7QUFDSCxLQUZELE1BRU87QUFDSCxVQUFJL0QsQ0FBQyxHQUFHLENBQVI7O0FBQ0EsYUFBT0EsQ0FBQyxHQUFHNkIsR0FBRyxDQUFDM0IsTUFBZixFQUF1QjtBQUNuQixZQUFLa0UsU0FBUyxJQUFJdkMsR0FBRyxDQUFDN0IsQ0FBRCxDQUFILENBQU9vRSxTQUFQLEtBQXFCTCxJQUFuQyxJQUE2QyxDQUFDSyxTQUFELElBQWN2QyxHQUFHLENBQUM3QixDQUFELENBQUgsS0FBVytELElBQTFFLEVBQWlGO0FBQzdFLGlCQUFPL0QsQ0FBUDtBQUNIOztBQUNEQSxRQUFBQSxDQUFDO0FBQ0o7O0FBQ0QsYUFBTyxDQUFDLENBQVI7QUFDSDtBQUNKO0FBRUQ7Ozs7Ozs7QUFLQSxXQUFTcUUsT0FBVCxDQUFpQnZFLEdBQWpCLEVBQXNCO0FBQ2xCLFdBQU9ILEtBQUssQ0FBQzBDLFNBQU4sQ0FBZ0JpQyxLQUFoQixDQUFzQm5FLElBQXRCLENBQTJCTCxHQUEzQixFQUFnQyxDQUFoQyxDQUFQO0FBQ0g7QUFFRDs7Ozs7Ozs7O0FBT0EsV0FBU3lFLFdBQVQsQ0FBcUIxQyxHQUFyQixFQUEwQjJDLEdBQTFCLEVBQStCQyxJQUEvQixFQUFxQztBQUNqQyxRQUFJQyxPQUFPLEdBQUcsRUFBZDtBQUNBLFFBQUlDLE1BQU0sR0FBRyxFQUFiO0FBQ0EsUUFBSTNFLENBQUMsR0FBRyxDQUFSOztBQUVBLFdBQU9BLENBQUMsR0FBRzZCLEdBQUcsQ0FBQzNCLE1BQWYsRUFBdUI7QUFDbkIsVUFBSTBDLEdBQUcsR0FBRzRCLEdBQUcsR0FBRzNDLEdBQUcsQ0FBQzdCLENBQUQsQ0FBSCxDQUFPd0UsR0FBUCxDQUFILEdBQWlCM0MsR0FBRyxDQUFDN0IsQ0FBRCxDQUFqQzs7QUFDQSxVQUFJbUUsT0FBTyxDQUFDUSxNQUFELEVBQVMvQixHQUFULENBQVAsR0FBdUIsQ0FBM0IsRUFBOEI7QUFDMUI4QixRQUFBQSxPQUFPLENBQUNFLElBQVIsQ0FBYS9DLEdBQUcsQ0FBQzdCLENBQUQsQ0FBaEI7QUFDSDs7QUFDRDJFLE1BQUFBLE1BQU0sQ0FBQzNFLENBQUQsQ0FBTixHQUFZNEMsR0FBWjtBQUNBNUMsTUFBQUEsQ0FBQztBQUNKOztBQUVELFFBQUl5RSxJQUFKLEVBQVU7QUFDTixVQUFJLENBQUNELEdBQUwsRUFBVTtBQUNORSxRQUFBQSxPQUFPLEdBQUdBLE9BQU8sQ0FBQ0QsSUFBUixFQUFWO0FBQ0gsT0FGRCxNQUVPO0FBQ0hDLFFBQUFBLE9BQU8sR0FBR0EsT0FBTyxDQUFDRCxJQUFSLENBQWEsU0FBU0ksZUFBVCxDQUF5QkMsQ0FBekIsRUFBNEJDLENBQTVCLEVBQStCO0FBQ2xELGlCQUFPRCxDQUFDLENBQUNOLEdBQUQsQ0FBRCxHQUFTTyxDQUFDLENBQUNQLEdBQUQsQ0FBakI7QUFDSCxTQUZTLENBQVY7QUFHSDtBQUNKOztBQUVELFdBQU9FLE9BQVA7QUFDSDtBQUVEOzs7Ozs7OztBQU1BLFdBQVNNLFFBQVQsQ0FBa0JsRixHQUFsQixFQUF1Qm1GLFFBQXZCLEVBQWlDO0FBQzdCLFFBQUlDLE1BQUosRUFBWUMsSUFBWjtBQUNBLFFBQUlDLFNBQVMsR0FBR0gsUUFBUSxDQUFDLENBQUQsQ0FBUixDQUFZSSxXQUFaLEtBQTRCSixRQUFRLENBQUNYLEtBQVQsQ0FBZSxDQUFmLENBQTVDO0FBRUEsUUFBSXRFLENBQUMsR0FBRyxDQUFSOztBQUNBLFdBQU9BLENBQUMsR0FBR3RCLGVBQWUsQ0FBQ3dCLE1BQTNCLEVBQW1DO0FBQy9CZ0YsTUFBQUEsTUFBTSxHQUFHeEcsZUFBZSxDQUFDc0IsQ0FBRCxDQUF4QjtBQUNBbUYsTUFBQUEsSUFBSSxHQUFJRCxNQUFELEdBQVdBLE1BQU0sR0FBR0UsU0FBcEIsR0FBZ0NILFFBQXZDOztBQUVBLFVBQUlFLElBQUksSUFBSXJGLEdBQVosRUFBaUI7QUFDYixlQUFPcUYsSUFBUDtBQUNIOztBQUNEbkYsTUFBQUEsQ0FBQztBQUNKOztBQUNELFdBQU92QixTQUFQO0FBQ0g7QUFFRDs7Ozs7O0FBSUEsTUFBSTZHLFNBQVMsR0FBRyxDQUFoQjs7QUFDQSxXQUFTQyxRQUFULEdBQW9CO0FBQ2hCLFdBQU9ELFNBQVMsRUFBaEI7QUFDSDtBQUVEOzs7Ozs7O0FBS0EsV0FBU0UsbUJBQVQsQ0FBNkJDLE9BQTdCLEVBQXNDO0FBQ2xDLFFBQUlDLEdBQUcsR0FBR0QsT0FBTyxDQUFDRSxhQUFSLElBQXlCRixPQUFuQztBQUNBLFdBQVFDLEdBQUcsQ0FBQ0UsV0FBSixJQUFtQkYsR0FBRyxDQUFDRyxZQUF2QixJQUF1Q3ZILE1BQS9DO0FBQ0g7O0FBRUQsTUFBSXdILFlBQVksR0FBRyx1Q0FBbkI7QUFFQSxNQUFJQyxhQUFhLEdBQUksa0JBQWtCekgsTUFBdkM7QUFDQSxNQUFJMEgsc0JBQXNCLEdBQUdoQixRQUFRLENBQUMxRyxNQUFELEVBQVMsY0FBVCxDQUFSLEtBQXFDRyxTQUFsRTtBQUNBLE1BQUl3SCxrQkFBa0IsR0FBR0YsYUFBYSxJQUFJRCxZQUFZLENBQUNJLElBQWIsQ0FBa0JDLFNBQVMsQ0FBQ0MsU0FBNUIsQ0FBMUM7QUFFQSxNQUFJQyxnQkFBZ0IsR0FBRyxPQUF2QjtBQUNBLE1BQUlDLGNBQWMsR0FBRyxLQUFyQjtBQUNBLE1BQUlDLGdCQUFnQixHQUFHLE9BQXZCO0FBQ0EsTUFBSUMsaUJBQWlCLEdBQUcsUUFBeEI7QUFFQSxNQUFJQyxnQkFBZ0IsR0FBRyxFQUF2QjtBQUVBLE1BQUlDLFdBQVcsR0FBRyxDQUFsQjtBQUNBLE1BQUlDLFVBQVUsR0FBRyxDQUFqQjtBQUNBLE1BQUlDLFNBQVMsR0FBRyxDQUFoQjtBQUNBLE1BQUlDLFlBQVksR0FBRyxDQUFuQjtBQUVBLE1BQUlDLGNBQWMsR0FBRyxDQUFyQjtBQUNBLE1BQUlDLGNBQWMsR0FBRyxDQUFyQjtBQUNBLE1BQUlDLGVBQWUsR0FBRyxDQUF0QjtBQUNBLE1BQUlDLFlBQVksR0FBRyxDQUFuQjtBQUNBLE1BQUlDLGNBQWMsR0FBRyxFQUFyQjtBQUVBLE1BQUlDLG9CQUFvQixHQUFHSixjQUFjLEdBQUdDLGVBQTVDO0FBQ0EsTUFBSUksa0JBQWtCLEdBQUdILFlBQVksR0FBR0MsY0FBeEM7QUFDQSxNQUFJRyxhQUFhLEdBQUdGLG9CQUFvQixHQUFHQyxrQkFBM0M7QUFFQSxNQUFJRSxRQUFRLEdBQUcsQ0FBQyxHQUFELEVBQU0sR0FBTixDQUFmO0FBQ0EsTUFBSUMsZUFBZSxHQUFHLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FBdEI7QUFFQTs7Ozs7Ozs7QUFPQSxXQUFTQyxLQUFULENBQWVDLE9BQWYsRUFBd0JDLFFBQXhCLEVBQWtDO0FBQzlCLFFBQUlDLElBQUksR0FBRyxJQUFYO0FBQ0EsU0FBS0YsT0FBTCxHQUFlQSxPQUFmO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxTQUFLakMsT0FBTCxHQUFlZ0MsT0FBTyxDQUFDaEMsT0FBdkI7QUFDQSxTQUFLcEUsTUFBTCxHQUFjb0csT0FBTyxDQUFDRyxPQUFSLENBQWdCQyxXQUE5QixDQUw4QixDQU85QjtBQUNBOztBQUNBLFNBQUtDLFVBQUwsR0FBa0IsVUFBU0MsRUFBVCxFQUFhO0FBQzNCLFVBQUlwRixRQUFRLENBQUM4RSxPQUFPLENBQUNHLE9BQVIsQ0FBZ0JJLE1BQWpCLEVBQXlCLENBQUNQLE9BQUQsQ0FBekIsQ0FBWixFQUFpRDtBQUM3Q0UsUUFBQUEsSUFBSSxDQUFDeEUsT0FBTCxDQUFhNEUsRUFBYjtBQUNIO0FBQ0osS0FKRDs7QUFNQSxTQUFLRSxJQUFMO0FBRUg7O0FBRURULEVBQUFBLEtBQUssQ0FBQ25GLFNBQU4sR0FBa0I7QUFDZDs7OztBQUlBYyxJQUFBQSxPQUFPLEVBQUUsbUJBQVcsQ0FBRyxDQUxUOztBQU9kOzs7QUFHQThFLElBQUFBLElBQUksRUFBRSxnQkFBVztBQUNiLFdBQUtDLElBQUwsSUFBYWpGLGlCQUFpQixDQUFDLEtBQUt3QyxPQUFOLEVBQWUsS0FBS3lDLElBQXBCLEVBQTBCLEtBQUtKLFVBQS9CLENBQTlCO0FBQ0EsV0FBS0ssUUFBTCxJQUFpQmxGLGlCQUFpQixDQUFDLEtBQUs1QixNQUFOLEVBQWMsS0FBSzhHLFFBQW5CLEVBQTZCLEtBQUtMLFVBQWxDLENBQWxDO0FBQ0EsV0FBS00sS0FBTCxJQUFjbkYsaUJBQWlCLENBQUN1QyxtQkFBbUIsQ0FBQyxLQUFLQyxPQUFOLENBQXBCLEVBQW9DLEtBQUsyQyxLQUF6QyxFQUFnRCxLQUFLTixVQUFyRCxDQUEvQjtBQUNILEtBZGE7O0FBZ0JkOzs7QUFHQU8sSUFBQUEsT0FBTyxFQUFFLG1CQUFXO0FBQ2hCLFdBQUtILElBQUwsSUFBYTNFLG9CQUFvQixDQUFDLEtBQUtrQyxPQUFOLEVBQWUsS0FBS3lDLElBQXBCLEVBQTBCLEtBQUtKLFVBQS9CLENBQWpDO0FBQ0EsV0FBS0ssUUFBTCxJQUFpQjVFLG9CQUFvQixDQUFDLEtBQUtsQyxNQUFOLEVBQWMsS0FBSzhHLFFBQW5CLEVBQTZCLEtBQUtMLFVBQWxDLENBQXJDO0FBQ0EsV0FBS00sS0FBTCxJQUFjN0Usb0JBQW9CLENBQUNpQyxtQkFBbUIsQ0FBQyxLQUFLQyxPQUFOLENBQXBCLEVBQW9DLEtBQUsyQyxLQUF6QyxFQUFnRCxLQUFLTixVQUFyRCxDQUFsQztBQUNIO0FBdkJhLEdBQWxCO0FBMEJBOzs7Ozs7O0FBTUEsV0FBU1EsbUJBQVQsQ0FBNkJiLE9BQTdCLEVBQXNDO0FBQ2xDLFFBQUljLElBQUo7QUFDQSxRQUFJQyxVQUFVLEdBQUdmLE9BQU8sQ0FBQ0csT0FBUixDQUFnQlksVUFBakM7O0FBRUEsUUFBSUEsVUFBSixFQUFnQjtBQUNaRCxNQUFBQSxJQUFJLEdBQUdDLFVBQVA7QUFDSCxLQUZELE1BRU8sSUFBSXhDLHNCQUFKLEVBQTRCO0FBQy9CdUMsTUFBQUEsSUFBSSxHQUFHRSxpQkFBUDtBQUNILEtBRk0sTUFFQSxJQUFJeEMsa0JBQUosRUFBd0I7QUFDM0JzQyxNQUFBQSxJQUFJLEdBQUdHLFVBQVA7QUFDSCxLQUZNLE1BRUEsSUFBSSxDQUFDM0MsYUFBTCxFQUFvQjtBQUN2QndDLE1BQUFBLElBQUksR0FBR0ksVUFBUDtBQUNILEtBRk0sTUFFQTtBQUNISixNQUFBQSxJQUFJLEdBQUdLLGVBQVA7QUFDSDs7QUFDRCxXQUFPLElBQUtMLElBQUwsQ0FBV2QsT0FBWCxFQUFvQm9CLFlBQXBCLENBQVA7QUFDSDtBQUVEOzs7Ozs7OztBQU1BLFdBQVNBLFlBQVQsQ0FBc0JwQixPQUF0QixFQUErQnFCLFNBQS9CLEVBQTBDQyxLQUExQyxFQUFpRDtBQUM3QyxRQUFJQyxXQUFXLEdBQUdELEtBQUssQ0FBQ0UsUUFBTixDQUFlL0ksTUFBakM7QUFDQSxRQUFJZ0osa0JBQWtCLEdBQUdILEtBQUssQ0FBQ0ksZUFBTixDQUFzQmpKLE1BQS9DO0FBQ0EsUUFBSWtKLE9BQU8sR0FBSU4sU0FBUyxHQUFHcEMsV0FBWixJQUE0QnNDLFdBQVcsR0FBR0Usa0JBQWQsS0FBcUMsQ0FBaEY7QUFDQSxRQUFJRyxPQUFPLEdBQUlQLFNBQVMsSUFBSWxDLFNBQVMsR0FBR0MsWUFBaEIsQ0FBVCxJQUEyQ21DLFdBQVcsR0FBR0Usa0JBQWQsS0FBcUMsQ0FBL0Y7QUFFQUgsSUFBQUEsS0FBSyxDQUFDSyxPQUFOLEdBQWdCLENBQUMsQ0FBQ0EsT0FBbEI7QUFDQUwsSUFBQUEsS0FBSyxDQUFDTSxPQUFOLEdBQWdCLENBQUMsQ0FBQ0EsT0FBbEI7O0FBRUEsUUFBSUQsT0FBSixFQUFhO0FBQ1QzQixNQUFBQSxPQUFPLENBQUM2QixPQUFSLEdBQWtCLEVBQWxCO0FBQ0gsS0FYNEMsQ0FhN0M7QUFDQTs7O0FBQ0FQLElBQUFBLEtBQUssQ0FBQ0QsU0FBTixHQUFrQkEsU0FBbEIsQ0FmNkMsQ0FpQjdDOztBQUNBUyxJQUFBQSxnQkFBZ0IsQ0FBQzlCLE9BQUQsRUFBVXNCLEtBQVYsQ0FBaEIsQ0FsQjZDLENBb0I3Qzs7QUFDQXRCLElBQUFBLE9BQU8sQ0FBQytCLElBQVIsQ0FBYSxjQUFiLEVBQTZCVCxLQUE3QjtBQUVBdEIsSUFBQUEsT0FBTyxDQUFDZ0MsU0FBUixDQUFrQlYsS0FBbEI7QUFDQXRCLElBQUFBLE9BQU8sQ0FBQzZCLE9BQVIsQ0FBZ0JJLFNBQWhCLEdBQTRCWCxLQUE1QjtBQUNIO0FBRUQ7Ozs7Ozs7QUFLQSxXQUFTUSxnQkFBVCxDQUEwQjlCLE9BQTFCLEVBQW1Dc0IsS0FBbkMsRUFBMEM7QUFDdEMsUUFBSU8sT0FBTyxHQUFHN0IsT0FBTyxDQUFDNkIsT0FBdEI7QUFDQSxRQUFJTCxRQUFRLEdBQUdGLEtBQUssQ0FBQ0UsUUFBckI7QUFDQSxRQUFJVSxjQUFjLEdBQUdWLFFBQVEsQ0FBQy9JLE1BQTlCLENBSHNDLENBS3RDOztBQUNBLFFBQUksQ0FBQ29KLE9BQU8sQ0FBQ00sVUFBYixFQUF5QjtBQUNyQk4sTUFBQUEsT0FBTyxDQUFDTSxVQUFSLEdBQXFCQyxvQkFBb0IsQ0FBQ2QsS0FBRCxDQUF6QztBQUNILEtBUnFDLENBVXRDOzs7QUFDQSxRQUFJWSxjQUFjLEdBQUcsQ0FBakIsSUFBc0IsQ0FBQ0wsT0FBTyxDQUFDUSxhQUFuQyxFQUFrRDtBQUM5Q1IsTUFBQUEsT0FBTyxDQUFDUSxhQUFSLEdBQXdCRCxvQkFBb0IsQ0FBQ2QsS0FBRCxDQUE1QztBQUNILEtBRkQsTUFFTyxJQUFJWSxjQUFjLEtBQUssQ0FBdkIsRUFBMEI7QUFDN0JMLE1BQUFBLE9BQU8sQ0FBQ1EsYUFBUixHQUF3QixLQUF4QjtBQUNIOztBQUVELFFBQUlGLFVBQVUsR0FBR04sT0FBTyxDQUFDTSxVQUF6QjtBQUNBLFFBQUlFLGFBQWEsR0FBR1IsT0FBTyxDQUFDUSxhQUE1QjtBQUNBLFFBQUlDLFlBQVksR0FBR0QsYUFBYSxHQUFHQSxhQUFhLENBQUNFLE1BQWpCLEdBQTBCSixVQUFVLENBQUNJLE1BQXJFO0FBRUEsUUFBSUEsTUFBTSxHQUFHakIsS0FBSyxDQUFDaUIsTUFBTixHQUFlQyxTQUFTLENBQUNoQixRQUFELENBQXJDO0FBQ0FGLElBQUFBLEtBQUssQ0FBQ21CLFNBQU4sR0FBa0JqTCxHQUFHLEVBQXJCO0FBQ0E4SixJQUFBQSxLQUFLLENBQUNvQixTQUFOLEdBQWtCcEIsS0FBSyxDQUFDbUIsU0FBTixHQUFrQk4sVUFBVSxDQUFDTSxTQUEvQztBQUVBbkIsSUFBQUEsS0FBSyxDQUFDcUIsS0FBTixHQUFjQyxRQUFRLENBQUNOLFlBQUQsRUFBZUMsTUFBZixDQUF0QjtBQUNBakIsSUFBQUEsS0FBSyxDQUFDdUIsUUFBTixHQUFpQkMsV0FBVyxDQUFDUixZQUFELEVBQWVDLE1BQWYsQ0FBNUI7QUFFQVEsSUFBQUEsY0FBYyxDQUFDbEIsT0FBRCxFQUFVUCxLQUFWLENBQWQ7QUFDQUEsSUFBQUEsS0FBSyxDQUFDMEIsZUFBTixHQUF3QkMsWUFBWSxDQUFDM0IsS0FBSyxDQUFDNEIsTUFBUCxFQUFlNUIsS0FBSyxDQUFDNkIsTUFBckIsQ0FBcEM7QUFFQSxRQUFJQyxlQUFlLEdBQUdDLFdBQVcsQ0FBQy9CLEtBQUssQ0FBQ29CLFNBQVAsRUFBa0JwQixLQUFLLENBQUM0QixNQUF4QixFQUFnQzVCLEtBQUssQ0FBQzZCLE1BQXRDLENBQWpDO0FBQ0E3QixJQUFBQSxLQUFLLENBQUNnQyxnQkFBTixHQUF5QkYsZUFBZSxDQUFDRyxDQUF6QztBQUNBakMsSUFBQUEsS0FBSyxDQUFDa0MsZ0JBQU4sR0FBeUJKLGVBQWUsQ0FBQ0ssQ0FBekM7QUFDQW5DLElBQUFBLEtBQUssQ0FBQzhCLGVBQU4sR0FBeUI3TCxHQUFHLENBQUM2TCxlQUFlLENBQUNHLENBQWpCLENBQUgsR0FBeUJoTSxHQUFHLENBQUM2TCxlQUFlLENBQUNLLENBQWpCLENBQTdCLEdBQW9ETCxlQUFlLENBQUNHLENBQXBFLEdBQXdFSCxlQUFlLENBQUNLLENBQWhIO0FBRUFuQyxJQUFBQSxLQUFLLENBQUNvQyxLQUFOLEdBQWNyQixhQUFhLEdBQUdzQixRQUFRLENBQUN0QixhQUFhLENBQUNiLFFBQWYsRUFBeUJBLFFBQXpCLENBQVgsR0FBZ0QsQ0FBM0U7QUFDQUYsSUFBQUEsS0FBSyxDQUFDc0MsUUFBTixHQUFpQnZCLGFBQWEsR0FBR3dCLFdBQVcsQ0FBQ3hCLGFBQWEsQ0FBQ2IsUUFBZixFQUF5QkEsUUFBekIsQ0FBZCxHQUFtRCxDQUFqRjtBQUVBRixJQUFBQSxLQUFLLENBQUN3QyxXQUFOLEdBQW9CLENBQUNqQyxPQUFPLENBQUNJLFNBQVQsR0FBcUJYLEtBQUssQ0FBQ0UsUUFBTixDQUFlL0ksTUFBcEMsR0FBK0M2SSxLQUFLLENBQUNFLFFBQU4sQ0FBZS9JLE1BQWYsR0FDL0RvSixPQUFPLENBQUNJLFNBQVIsQ0FBa0I2QixXQUQ0QyxHQUM3QnhDLEtBQUssQ0FBQ0UsUUFBTixDQUFlL0ksTUFEYyxHQUNMb0osT0FBTyxDQUFDSSxTQUFSLENBQWtCNkIsV0FEL0U7QUFHQUMsSUFBQUEsd0JBQXdCLENBQUNsQyxPQUFELEVBQVVQLEtBQVYsQ0FBeEIsQ0ExQ3NDLENBNEN0Qzs7QUFDQSxRQUFJMUgsTUFBTSxHQUFHb0csT0FBTyxDQUFDaEMsT0FBckI7O0FBQ0EsUUFBSWhDLFNBQVMsQ0FBQ3NGLEtBQUssQ0FBQzBDLFFBQU4sQ0FBZXBLLE1BQWhCLEVBQXdCQSxNQUF4QixDQUFiLEVBQThDO0FBQzFDQSxNQUFBQSxNQUFNLEdBQUcwSCxLQUFLLENBQUMwQyxRQUFOLENBQWVwSyxNQUF4QjtBQUNIOztBQUNEMEgsSUFBQUEsS0FBSyxDQUFDMUgsTUFBTixHQUFlQSxNQUFmO0FBQ0g7O0FBRUQsV0FBU21KLGNBQVQsQ0FBd0JsQixPQUF4QixFQUFpQ1AsS0FBakMsRUFBd0M7QUFDcEMsUUFBSWlCLE1BQU0sR0FBR2pCLEtBQUssQ0FBQ2lCLE1BQW5CO0FBQ0EsUUFBSTBCLE1BQU0sR0FBR3BDLE9BQU8sQ0FBQ3FDLFdBQVIsSUFBdUIsRUFBcEM7QUFDQSxRQUFJQyxTQUFTLEdBQUd0QyxPQUFPLENBQUNzQyxTQUFSLElBQXFCLEVBQXJDO0FBQ0EsUUFBSWxDLFNBQVMsR0FBR0osT0FBTyxDQUFDSSxTQUFSLElBQXFCLEVBQXJDOztBQUVBLFFBQUlYLEtBQUssQ0FBQ0QsU0FBTixLQUFvQnBDLFdBQXBCLElBQW1DZ0QsU0FBUyxDQUFDWixTQUFWLEtBQXdCbEMsU0FBL0QsRUFBMEU7QUFDdEVnRixNQUFBQSxTQUFTLEdBQUd0QyxPQUFPLENBQUNzQyxTQUFSLEdBQW9CO0FBQzVCWixRQUFBQSxDQUFDLEVBQUV0QixTQUFTLENBQUNpQixNQUFWLElBQW9CLENBREs7QUFFNUJPLFFBQUFBLENBQUMsRUFBRXhCLFNBQVMsQ0FBQ2tCLE1BQVYsSUFBb0I7QUFGSyxPQUFoQztBQUtBYyxNQUFBQSxNQUFNLEdBQUdwQyxPQUFPLENBQUNxQyxXQUFSLEdBQXNCO0FBQzNCWCxRQUFBQSxDQUFDLEVBQUVoQixNQUFNLENBQUNnQixDQURpQjtBQUUzQkUsUUFBQUEsQ0FBQyxFQUFFbEIsTUFBTSxDQUFDa0I7QUFGaUIsT0FBL0I7QUFJSDs7QUFFRG5DLElBQUFBLEtBQUssQ0FBQzRCLE1BQU4sR0FBZWlCLFNBQVMsQ0FBQ1osQ0FBVixJQUFlaEIsTUFBTSxDQUFDZ0IsQ0FBUCxHQUFXVSxNQUFNLENBQUNWLENBQWpDLENBQWY7QUFDQWpDLElBQUFBLEtBQUssQ0FBQzZCLE1BQU4sR0FBZWdCLFNBQVMsQ0FBQ1YsQ0FBVixJQUFlbEIsTUFBTSxDQUFDa0IsQ0FBUCxHQUFXUSxNQUFNLENBQUNSLENBQWpDLENBQWY7QUFDSDtBQUVEOzs7Ozs7O0FBS0EsV0FBU00sd0JBQVQsQ0FBa0NsQyxPQUFsQyxFQUEyQ1AsS0FBM0MsRUFBa0Q7QUFDOUMsUUFBSThDLElBQUksR0FBR3ZDLE9BQU8sQ0FBQ3dDLFlBQVIsSUFBd0IvQyxLQUFuQztBQUFBLFFBQ0lvQixTQUFTLEdBQUdwQixLQUFLLENBQUNtQixTQUFOLEdBQWtCMkIsSUFBSSxDQUFDM0IsU0FEdkM7QUFBQSxRQUVJNkIsUUFGSjtBQUFBLFFBRWNDLFNBRmQ7QUFBQSxRQUV5QkMsU0FGekI7QUFBQSxRQUVvQ0MsU0FGcEM7O0FBSUEsUUFBSW5ELEtBQUssQ0FBQ0QsU0FBTixJQUFtQmpDLFlBQW5CLEtBQW9Dc0QsU0FBUyxHQUFHMUQsZ0JBQVosSUFBZ0NvRixJQUFJLENBQUNFLFFBQUwsS0FBa0J0TixTQUF0RixDQUFKLEVBQXNHO0FBQ2xHLFVBQUlrTSxNQUFNLEdBQUc1QixLQUFLLENBQUM0QixNQUFOLEdBQWVrQixJQUFJLENBQUNsQixNQUFqQztBQUNBLFVBQUlDLE1BQU0sR0FBRzdCLEtBQUssQ0FBQzZCLE1BQU4sR0FBZWlCLElBQUksQ0FBQ2pCLE1BQWpDO0FBRUEsVUFBSXVCLENBQUMsR0FBR3JCLFdBQVcsQ0FBQ1gsU0FBRCxFQUFZUSxNQUFaLEVBQW9CQyxNQUFwQixDQUFuQjtBQUNBb0IsTUFBQUEsU0FBUyxHQUFHRyxDQUFDLENBQUNuQixDQUFkO0FBQ0FpQixNQUFBQSxTQUFTLEdBQUdFLENBQUMsQ0FBQ2pCLENBQWQ7QUFDQWEsTUFBQUEsUUFBUSxHQUFJL00sR0FBRyxDQUFDbU4sQ0FBQyxDQUFDbkIsQ0FBSCxDQUFILEdBQVdoTSxHQUFHLENBQUNtTixDQUFDLENBQUNqQixDQUFILENBQWYsR0FBd0JpQixDQUFDLENBQUNuQixDQUExQixHQUE4Qm1CLENBQUMsQ0FBQ2pCLENBQTNDO0FBQ0FnQixNQUFBQSxTQUFTLEdBQUd4QixZQUFZLENBQUNDLE1BQUQsRUFBU0MsTUFBVCxDQUF4QjtBQUVBdEIsTUFBQUEsT0FBTyxDQUFDd0MsWUFBUixHQUF1Qi9DLEtBQXZCO0FBQ0gsS0FYRCxNQVdPO0FBQ0g7QUFDQWdELE1BQUFBLFFBQVEsR0FBR0YsSUFBSSxDQUFDRSxRQUFoQjtBQUNBQyxNQUFBQSxTQUFTLEdBQUdILElBQUksQ0FBQ0csU0FBakI7QUFDQUMsTUFBQUEsU0FBUyxHQUFHSixJQUFJLENBQUNJLFNBQWpCO0FBQ0FDLE1BQUFBLFNBQVMsR0FBR0wsSUFBSSxDQUFDSyxTQUFqQjtBQUNIOztBQUVEbkQsSUFBQUEsS0FBSyxDQUFDZ0QsUUFBTixHQUFpQkEsUUFBakI7QUFDQWhELElBQUFBLEtBQUssQ0FBQ2lELFNBQU4sR0FBa0JBLFNBQWxCO0FBQ0FqRCxJQUFBQSxLQUFLLENBQUNrRCxTQUFOLEdBQWtCQSxTQUFsQjtBQUNBbEQsSUFBQUEsS0FBSyxDQUFDbUQsU0FBTixHQUFrQkEsU0FBbEI7QUFDSDtBQUVEOzs7Ozs7O0FBS0EsV0FBU3JDLG9CQUFULENBQThCZCxLQUE5QixFQUFxQztBQUNqQztBQUNBO0FBQ0EsUUFBSUUsUUFBUSxHQUFHLEVBQWY7QUFDQSxRQUFJakosQ0FBQyxHQUFHLENBQVI7O0FBQ0EsV0FBT0EsQ0FBQyxHQUFHK0ksS0FBSyxDQUFDRSxRQUFOLENBQWUvSSxNQUExQixFQUFrQztBQUM5QitJLE1BQUFBLFFBQVEsQ0FBQ2pKLENBQUQsQ0FBUixHQUFjO0FBQ1ZvTSxRQUFBQSxPQUFPLEVBQUV0TixLQUFLLENBQUNpSyxLQUFLLENBQUNFLFFBQU4sQ0FBZWpKLENBQWYsRUFBa0JvTSxPQUFuQixDQURKO0FBRVZDLFFBQUFBLE9BQU8sRUFBRXZOLEtBQUssQ0FBQ2lLLEtBQUssQ0FBQ0UsUUFBTixDQUFlakosQ0FBZixFQUFrQnFNLE9BQW5CO0FBRkosT0FBZDtBQUlBck0sTUFBQUEsQ0FBQztBQUNKOztBQUVELFdBQU87QUFDSGtLLE1BQUFBLFNBQVMsRUFBRWpMLEdBQUcsRUFEWDtBQUVIZ0ssTUFBQUEsUUFBUSxFQUFFQSxRQUZQO0FBR0hlLE1BQUFBLE1BQU0sRUFBRUMsU0FBUyxDQUFDaEIsUUFBRCxDQUhkO0FBSUgwQixNQUFBQSxNQUFNLEVBQUU1QixLQUFLLENBQUM0QixNQUpYO0FBS0hDLE1BQUFBLE1BQU0sRUFBRTdCLEtBQUssQ0FBQzZCO0FBTFgsS0FBUDtBQU9IO0FBRUQ7Ozs7Ozs7QUFLQSxXQUFTWCxTQUFULENBQW1CaEIsUUFBbkIsRUFBNkI7QUFDekIsUUFBSVUsY0FBYyxHQUFHVixRQUFRLENBQUMvSSxNQUE5QixDQUR5QixDQUd6Qjs7QUFDQSxRQUFJeUosY0FBYyxLQUFLLENBQXZCLEVBQTBCO0FBQ3RCLGFBQU87QUFDSHFCLFFBQUFBLENBQUMsRUFBRWxNLEtBQUssQ0FBQ21LLFFBQVEsQ0FBQyxDQUFELENBQVIsQ0FBWW1ELE9BQWIsQ0FETDtBQUVIbEIsUUFBQUEsQ0FBQyxFQUFFcE0sS0FBSyxDQUFDbUssUUFBUSxDQUFDLENBQUQsQ0FBUixDQUFZb0QsT0FBYjtBQUZMLE9BQVA7QUFJSDs7QUFFRCxRQUFJckIsQ0FBQyxHQUFHLENBQVI7QUFBQSxRQUFXRSxDQUFDLEdBQUcsQ0FBZjtBQUFBLFFBQWtCbEwsQ0FBQyxHQUFHLENBQXRCOztBQUNBLFdBQU9BLENBQUMsR0FBRzJKLGNBQVgsRUFBMkI7QUFDdkJxQixNQUFBQSxDQUFDLElBQUkvQixRQUFRLENBQUNqSixDQUFELENBQVIsQ0FBWW9NLE9BQWpCO0FBQ0FsQixNQUFBQSxDQUFDLElBQUlqQyxRQUFRLENBQUNqSixDQUFELENBQVIsQ0FBWXFNLE9BQWpCO0FBQ0FyTSxNQUFBQSxDQUFDO0FBQ0o7O0FBRUQsV0FBTztBQUNIZ0wsTUFBQUEsQ0FBQyxFQUFFbE0sS0FBSyxDQUFDa00sQ0FBQyxHQUFHckIsY0FBTCxDQURMO0FBRUh1QixNQUFBQSxDQUFDLEVBQUVwTSxLQUFLLENBQUNvTSxDQUFDLEdBQUd2QixjQUFMO0FBRkwsS0FBUDtBQUlIO0FBRUQ7Ozs7Ozs7OztBQU9BLFdBQVNtQixXQUFULENBQXFCWCxTQUFyQixFQUFnQ2EsQ0FBaEMsRUFBbUNFLENBQW5DLEVBQXNDO0FBQ2xDLFdBQU87QUFDSEYsTUFBQUEsQ0FBQyxFQUFFQSxDQUFDLEdBQUdiLFNBQUosSUFBaUIsQ0FEakI7QUFFSGUsTUFBQUEsQ0FBQyxFQUFFQSxDQUFDLEdBQUdmLFNBQUosSUFBaUI7QUFGakIsS0FBUDtBQUlIO0FBRUQ7Ozs7Ozs7O0FBTUEsV0FBU08sWUFBVCxDQUFzQk0sQ0FBdEIsRUFBeUJFLENBQXpCLEVBQTRCO0FBQ3hCLFFBQUlGLENBQUMsS0FBS0UsQ0FBVixFQUFhO0FBQ1QsYUFBT3BFLGNBQVA7QUFDSDs7QUFFRCxRQUFJOUgsR0FBRyxDQUFDZ00sQ0FBRCxDQUFILElBQVVoTSxHQUFHLENBQUNrTSxDQUFELENBQWpCLEVBQXNCO0FBQ2xCLGFBQU9GLENBQUMsR0FBRyxDQUFKLEdBQVFqRSxjQUFSLEdBQXlCQyxlQUFoQztBQUNIOztBQUNELFdBQU9rRSxDQUFDLEdBQUcsQ0FBSixHQUFRakUsWUFBUixHQUF1QkMsY0FBOUI7QUFDSDtBQUVEOzs7Ozs7Ozs7QUFPQSxXQUFTcUQsV0FBVCxDQUFxQitCLEVBQXJCLEVBQXlCQyxFQUF6QixFQUE2QkMsS0FBN0IsRUFBb0M7QUFDaEMsUUFBSSxDQUFDQSxLQUFMLEVBQVk7QUFDUkEsTUFBQUEsS0FBSyxHQUFHbEYsUUFBUjtBQUNIOztBQUNELFFBQUkwRCxDQUFDLEdBQUd1QixFQUFFLENBQUNDLEtBQUssQ0FBQyxDQUFELENBQU4sQ0FBRixHQUFlRixFQUFFLENBQUNFLEtBQUssQ0FBQyxDQUFELENBQU4sQ0FBekI7QUFBQSxRQUNJdEIsQ0FBQyxHQUFHcUIsRUFBRSxDQUFDQyxLQUFLLENBQUMsQ0FBRCxDQUFOLENBQUYsR0FBZUYsRUFBRSxDQUFDRSxLQUFLLENBQUMsQ0FBRCxDQUFOLENBRHpCO0FBR0EsV0FBT3pOLElBQUksQ0FBQzBOLElBQUwsQ0FBV3pCLENBQUMsR0FBR0EsQ0FBTCxHQUFXRSxDQUFDLEdBQUdBLENBQXpCLENBQVA7QUFDSDtBQUVEOzs7Ozs7Ozs7QUFPQSxXQUFTYixRQUFULENBQWtCaUMsRUFBbEIsRUFBc0JDLEVBQXRCLEVBQTBCQyxLQUExQixFQUFpQztBQUM3QixRQUFJLENBQUNBLEtBQUwsRUFBWTtBQUNSQSxNQUFBQSxLQUFLLEdBQUdsRixRQUFSO0FBQ0g7O0FBQ0QsUUFBSTBELENBQUMsR0FBR3VCLEVBQUUsQ0FBQ0MsS0FBSyxDQUFDLENBQUQsQ0FBTixDQUFGLEdBQWVGLEVBQUUsQ0FBQ0UsS0FBSyxDQUFDLENBQUQsQ0FBTixDQUF6QjtBQUFBLFFBQ0l0QixDQUFDLEdBQUdxQixFQUFFLENBQUNDLEtBQUssQ0FBQyxDQUFELENBQU4sQ0FBRixHQUFlRixFQUFFLENBQUNFLEtBQUssQ0FBQyxDQUFELENBQU4sQ0FEekI7QUFFQSxXQUFPek4sSUFBSSxDQUFDMk4sS0FBTCxDQUFXeEIsQ0FBWCxFQUFjRixDQUFkLElBQW1CLEdBQW5CLEdBQXlCak0sSUFBSSxDQUFDNE4sRUFBckM7QUFDSDtBQUVEOzs7Ozs7OztBQU1BLFdBQVNyQixXQUFULENBQXFCc0IsS0FBckIsRUFBNEJDLEdBQTVCLEVBQWlDO0FBQzdCLFdBQU94QyxRQUFRLENBQUN3QyxHQUFHLENBQUMsQ0FBRCxDQUFKLEVBQVNBLEdBQUcsQ0FBQyxDQUFELENBQVosRUFBaUJ0RixlQUFqQixDQUFSLEdBQTRDOEMsUUFBUSxDQUFDdUMsS0FBSyxDQUFDLENBQUQsQ0FBTixFQUFXQSxLQUFLLENBQUMsQ0FBRCxDQUFoQixFQUFxQnJGLGVBQXJCLENBQTNEO0FBQ0g7QUFFRDs7Ozs7Ozs7O0FBT0EsV0FBUzZELFFBQVQsQ0FBa0J3QixLQUFsQixFQUF5QkMsR0FBekIsRUFBOEI7QUFDMUIsV0FBT3RDLFdBQVcsQ0FBQ3NDLEdBQUcsQ0FBQyxDQUFELENBQUosRUFBU0EsR0FBRyxDQUFDLENBQUQsQ0FBWixFQUFpQnRGLGVBQWpCLENBQVgsR0FBK0NnRCxXQUFXLENBQUNxQyxLQUFLLENBQUMsQ0FBRCxDQUFOLEVBQVdBLEtBQUssQ0FBQyxDQUFELENBQWhCLEVBQXFCckYsZUFBckIsQ0FBakU7QUFDSDs7QUFFRCxNQUFJdUYsZUFBZSxHQUFHO0FBQ2xCQyxJQUFBQSxTQUFTLEVBQUVyRyxXQURPO0FBRWxCc0csSUFBQUEsU0FBUyxFQUFFckcsVUFGTztBQUdsQnNHLElBQUFBLE9BQU8sRUFBRXJHO0FBSFMsR0FBdEI7QUFNQSxNQUFJc0csb0JBQW9CLEdBQUcsV0FBM0I7QUFDQSxNQUFJQyxtQkFBbUIsR0FBRyxtQkFBMUI7QUFFQTs7Ozs7O0FBS0EsV0FBU3hFLFVBQVQsR0FBc0I7QUFDbEIsU0FBS1QsSUFBTCxHQUFZZ0Ysb0JBQVo7QUFDQSxTQUFLOUUsS0FBTCxHQUFhK0UsbUJBQWI7QUFFQSxTQUFLQyxPQUFMLEdBQWUsS0FBZixDQUprQixDQUlJOztBQUV0QjVGLElBQUFBLEtBQUssQ0FBQ3ZHLEtBQU4sQ0FBWSxJQUFaLEVBQWtCQyxTQUFsQjtBQUNIOztBQUVEYyxFQUFBQSxPQUFPLENBQUMyRyxVQUFELEVBQWFuQixLQUFiLEVBQW9CO0FBQ3ZCOzs7O0FBSUFyRSxJQUFBQSxPQUFPLEVBQUUsU0FBU2tLLFNBQVQsQ0FBbUJ0RixFQUFuQixFQUF1QjtBQUM1QixVQUFJZSxTQUFTLEdBQUdnRSxlQUFlLENBQUMvRSxFQUFFLENBQUMxRSxJQUFKLENBQS9CLENBRDRCLENBRzVCOztBQUNBLFVBQUl5RixTQUFTLEdBQUdwQyxXQUFaLElBQTJCcUIsRUFBRSxDQUFDdUYsTUFBSCxLQUFjLENBQTdDLEVBQWdEO0FBQzVDLGFBQUtGLE9BQUwsR0FBZSxJQUFmO0FBQ0g7O0FBRUQsVUFBSXRFLFNBQVMsR0FBR25DLFVBQVosSUFBMEJvQixFQUFFLENBQUN3RixLQUFILEtBQWEsQ0FBM0MsRUFBOEM7QUFDMUN6RSxRQUFBQSxTQUFTLEdBQUdsQyxTQUFaO0FBQ0gsT0FWMkIsQ0FZNUI7OztBQUNBLFVBQUksQ0FBQyxLQUFLd0csT0FBVixFQUFtQjtBQUNmO0FBQ0g7O0FBRUQsVUFBSXRFLFNBQVMsR0FBR2xDLFNBQWhCLEVBQTJCO0FBQ3ZCLGFBQUt3RyxPQUFMLEdBQWUsS0FBZjtBQUNIOztBQUVELFdBQUsxRixRQUFMLENBQWMsS0FBS0QsT0FBbkIsRUFBNEJxQixTQUE1QixFQUF1QztBQUNuQ0csUUFBQUEsUUFBUSxFQUFFLENBQUNsQixFQUFELENBRHlCO0FBRW5Db0IsUUFBQUEsZUFBZSxFQUFFLENBQUNwQixFQUFELENBRmtCO0FBR25DeUYsUUFBQUEsV0FBVyxFQUFFakgsZ0JBSHNCO0FBSW5Da0YsUUFBQUEsUUFBUSxFQUFFMUQ7QUFKeUIsT0FBdkM7QUFNSDtBQWhDc0IsR0FBcEIsQ0FBUDtBQW1DQSxNQUFJMEYsaUJBQWlCLEdBQUc7QUFDcEJDLElBQUFBLFdBQVcsRUFBRWhILFdBRE87QUFFcEJpSCxJQUFBQSxXQUFXLEVBQUVoSCxVQUZPO0FBR3BCaUgsSUFBQUEsU0FBUyxFQUFFaEgsU0FIUztBQUlwQmlILElBQUFBLGFBQWEsRUFBRWhILFlBSks7QUFLcEJpSCxJQUFBQSxVQUFVLEVBQUVqSDtBQUxRLEdBQXhCLENBNXpCaUQsQ0FvMEJqRDs7QUFDQSxNQUFJa0gsc0JBQXNCLEdBQUc7QUFDekIsT0FBRzFILGdCQURzQjtBQUV6QixPQUFHQyxjQUZzQjtBQUd6QixPQUFHQyxnQkFIc0I7QUFJekIsT0FBR0MsaUJBSnNCLENBSUo7O0FBSkksR0FBN0I7QUFPQSxNQUFJd0gsc0JBQXNCLEdBQUcsYUFBN0I7QUFDQSxNQUFJQyxxQkFBcUIsR0FBRyxxQ0FBNUIsQ0E3MEJpRCxDQSswQmpEOztBQUNBLE1BQUkzUCxNQUFNLENBQUM0UCxjQUFQLElBQXlCLENBQUM1UCxNQUFNLENBQUM2UCxZQUFyQyxFQUFtRDtBQUMvQ0gsSUFBQUEsc0JBQXNCLEdBQUcsZUFBekI7QUFDQUMsSUFBQUEscUJBQXFCLEdBQUcsMkNBQXhCO0FBQ0g7QUFFRDs7Ozs7OztBQUtBLFdBQVN4RixpQkFBVCxHQUE2QjtBQUN6QixTQUFLUCxJQUFMLEdBQVk4RixzQkFBWjtBQUNBLFNBQUs1RixLQUFMLEdBQWE2RixxQkFBYjtBQUVBekcsSUFBQUEsS0FBSyxDQUFDdkcsS0FBTixDQUFZLElBQVosRUFBa0JDLFNBQWxCO0FBRUEsU0FBS2tOLEtBQUwsR0FBYyxLQUFLM0csT0FBTCxDQUFhNkIsT0FBYixDQUFxQitFLGFBQXJCLEdBQXFDLEVBQW5EO0FBQ0g7O0FBRURyTSxFQUFBQSxPQUFPLENBQUN5RyxpQkFBRCxFQUFvQmpCLEtBQXBCLEVBQTJCO0FBQzlCOzs7O0FBSUFyRSxJQUFBQSxPQUFPLEVBQUUsU0FBU21MLFNBQVQsQ0FBbUJ2RyxFQUFuQixFQUF1QjtBQUM1QixVQUFJcUcsS0FBSyxHQUFHLEtBQUtBLEtBQWpCO0FBQ0EsVUFBSUcsYUFBYSxHQUFHLEtBQXBCO0FBRUEsVUFBSUMsbUJBQW1CLEdBQUd6RyxFQUFFLENBQUMxRSxJQUFILENBQVFvTCxXQUFSLEdBQXNCNU4sT0FBdEIsQ0FBOEIsSUFBOUIsRUFBb0MsRUFBcEMsQ0FBMUI7QUFDQSxVQUFJaUksU0FBUyxHQUFHMkUsaUJBQWlCLENBQUNlLG1CQUFELENBQWpDO0FBQ0EsVUFBSWhCLFdBQVcsR0FBR08sc0JBQXNCLENBQUNoRyxFQUFFLENBQUN5RixXQUFKLENBQXRCLElBQTBDekYsRUFBRSxDQUFDeUYsV0FBL0Q7QUFFQSxVQUFJa0IsT0FBTyxHQUFJbEIsV0FBVyxJQUFJbkgsZ0JBQTlCLENBUjRCLENBVTVCOztBQUNBLFVBQUlzSSxVQUFVLEdBQUd4SyxPQUFPLENBQUNpSyxLQUFELEVBQVFyRyxFQUFFLENBQUM2RyxTQUFYLEVBQXNCLFdBQXRCLENBQXhCLENBWDRCLENBYTVCOztBQUNBLFVBQUk5RixTQUFTLEdBQUdwQyxXQUFaLEtBQTRCcUIsRUFBRSxDQUFDdUYsTUFBSCxLQUFjLENBQWQsSUFBbUJvQixPQUEvQyxDQUFKLEVBQTZEO0FBQ3pELFlBQUlDLFVBQVUsR0FBRyxDQUFqQixFQUFvQjtBQUNoQlAsVUFBQUEsS0FBSyxDQUFDeEosSUFBTixDQUFXbUQsRUFBWDtBQUNBNEcsVUFBQUEsVUFBVSxHQUFHUCxLQUFLLENBQUNsTyxNQUFOLEdBQWUsQ0FBNUI7QUFDSDtBQUNKLE9BTEQsTUFLTyxJQUFJNEksU0FBUyxJQUFJbEMsU0FBUyxHQUFHQyxZQUFoQixDQUFiLEVBQTRDO0FBQy9DMEgsUUFBQUEsYUFBYSxHQUFHLElBQWhCO0FBQ0gsT0FyQjJCLENBdUI1Qjs7O0FBQ0EsVUFBSUksVUFBVSxHQUFHLENBQWpCLEVBQW9CO0FBQ2hCO0FBQ0gsT0ExQjJCLENBNEI1Qjs7O0FBQ0FQLE1BQUFBLEtBQUssQ0FBQ08sVUFBRCxDQUFMLEdBQW9CNUcsRUFBcEI7QUFFQSxXQUFLTCxRQUFMLENBQWMsS0FBS0QsT0FBbkIsRUFBNEJxQixTQUE1QixFQUF1QztBQUNuQ0csUUFBQUEsUUFBUSxFQUFFbUYsS0FEeUI7QUFFbkNqRixRQUFBQSxlQUFlLEVBQUUsQ0FBQ3BCLEVBQUQsQ0FGa0I7QUFHbkN5RixRQUFBQSxXQUFXLEVBQUVBLFdBSHNCO0FBSW5DL0IsUUFBQUEsUUFBUSxFQUFFMUQ7QUFKeUIsT0FBdkM7O0FBT0EsVUFBSXdHLGFBQUosRUFBbUI7QUFDZjtBQUNBSCxRQUFBQSxLQUFLLENBQUNTLE1BQU4sQ0FBYUYsVUFBYixFQUF5QixDQUF6QjtBQUNIO0FBQ0o7QUEvQzZCLEdBQTNCLENBQVA7QUFrREEsTUFBSUcsc0JBQXNCLEdBQUc7QUFDekJDLElBQUFBLFVBQVUsRUFBRXJJLFdBRGE7QUFFekJzSSxJQUFBQSxTQUFTLEVBQUVySSxVQUZjO0FBR3pCc0ksSUFBQUEsUUFBUSxFQUFFckksU0FIZTtBQUl6QnNJLElBQUFBLFdBQVcsRUFBRXJJO0FBSlksR0FBN0I7QUFPQSxNQUFJc0ksMEJBQTBCLEdBQUcsWUFBakM7QUFDQSxNQUFJQywwQkFBMEIsR0FBRywyQ0FBakM7QUFFQTs7Ozs7O0FBS0EsV0FBU0MsZ0JBQVQsR0FBNEI7QUFDeEIsU0FBS2xILFFBQUwsR0FBZ0JnSCwwQkFBaEI7QUFDQSxTQUFLL0csS0FBTCxHQUFhZ0gsMEJBQWI7QUFDQSxTQUFLRSxPQUFMLEdBQWUsS0FBZjtBQUVBOUgsSUFBQUEsS0FBSyxDQUFDdkcsS0FBTixDQUFZLElBQVosRUFBa0JDLFNBQWxCO0FBQ0g7O0FBRURjLEVBQUFBLE9BQU8sQ0FBQ3FOLGdCQUFELEVBQW1CN0gsS0FBbkIsRUFBMEI7QUFDN0JyRSxJQUFBQSxPQUFPLEVBQUUsU0FBU29NLFNBQVQsQ0FBbUJ4SCxFQUFuQixFQUF1QjtBQUM1QixVQUFJMUUsSUFBSSxHQUFHeUwsc0JBQXNCLENBQUMvRyxFQUFFLENBQUMxRSxJQUFKLENBQWpDLENBRDRCLENBRzVCOztBQUNBLFVBQUlBLElBQUksS0FBS3FELFdBQWIsRUFBMEI7QUFDdEIsYUFBSzRJLE9BQUwsR0FBZSxJQUFmO0FBQ0g7O0FBRUQsVUFBSSxDQUFDLEtBQUtBLE9BQVYsRUFBbUI7QUFDZjtBQUNIOztBQUVELFVBQUlFLE9BQU8sR0FBR0Msc0JBQXNCLENBQUN0UCxJQUF2QixDQUE0QixJQUE1QixFQUFrQzRILEVBQWxDLEVBQXNDMUUsSUFBdEMsQ0FBZCxDQVo0QixDQWM1Qjs7QUFDQSxVQUFJQSxJQUFJLElBQUl1RCxTQUFTLEdBQUdDLFlBQWhCLENBQUosSUFBcUMySSxPQUFPLENBQUMsQ0FBRCxDQUFQLENBQVd0UCxNQUFYLEdBQW9Cc1AsT0FBTyxDQUFDLENBQUQsQ0FBUCxDQUFXdFAsTUFBL0IsS0FBMEMsQ0FBbkYsRUFBc0Y7QUFDbEYsYUFBS29QLE9BQUwsR0FBZSxLQUFmO0FBQ0g7O0FBRUQsV0FBSzVILFFBQUwsQ0FBYyxLQUFLRCxPQUFuQixFQUE0QnBFLElBQTVCLEVBQWtDO0FBQzlCNEYsUUFBQUEsUUFBUSxFQUFFdUcsT0FBTyxDQUFDLENBQUQsQ0FEYTtBQUU5QnJHLFFBQUFBLGVBQWUsRUFBRXFHLE9BQU8sQ0FBQyxDQUFELENBRk07QUFHOUJoQyxRQUFBQSxXQUFXLEVBQUVuSCxnQkFIaUI7QUFJOUJvRixRQUFBQSxRQUFRLEVBQUUxRDtBQUpvQixPQUFsQztBQU1IO0FBMUI0QixHQUExQixDQUFQO0FBNkJBOzs7Ozs7O0FBTUEsV0FBUzBILHNCQUFULENBQWdDMUgsRUFBaEMsRUFBb0MxRSxJQUFwQyxFQUEwQztBQUN0QyxRQUFJcU0sR0FBRyxHQUFHckwsT0FBTyxDQUFDMEQsRUFBRSxDQUFDeUgsT0FBSixDQUFqQjtBQUNBLFFBQUlHLE9BQU8sR0FBR3RMLE9BQU8sQ0FBQzBELEVBQUUsQ0FBQzZILGNBQUosQ0FBckI7O0FBRUEsUUFBSXZNLElBQUksSUFBSXVELFNBQVMsR0FBR0MsWUFBaEIsQ0FBUixFQUF1QztBQUNuQzZJLE1BQUFBLEdBQUcsR0FBR25MLFdBQVcsQ0FBQ21MLEdBQUcsQ0FBQ0csTUFBSixDQUFXRixPQUFYLENBQUQsRUFBc0IsWUFBdEIsRUFBb0MsSUFBcEMsQ0FBakI7QUFDSDs7QUFFRCxXQUFPLENBQUNELEdBQUQsRUFBTUMsT0FBTixDQUFQO0FBQ0g7O0FBRUQsTUFBSUcsZUFBZSxHQUFHO0FBQ2xCZixJQUFBQSxVQUFVLEVBQUVySSxXQURNO0FBRWxCc0ksSUFBQUEsU0FBUyxFQUFFckksVUFGTztBQUdsQnNJLElBQUFBLFFBQVEsRUFBRXJJLFNBSFE7QUFJbEJzSSxJQUFBQSxXQUFXLEVBQUVySTtBQUpLLEdBQXRCO0FBT0EsTUFBSWtKLG1CQUFtQixHQUFHLDJDQUExQjtBQUVBOzs7Ozs7QUFLQSxXQUFTckgsVUFBVCxHQUFzQjtBQUNsQixTQUFLUCxRQUFMLEdBQWdCNEgsbUJBQWhCO0FBQ0EsU0FBS0MsU0FBTCxHQUFpQixFQUFqQjtBQUVBeEksSUFBQUEsS0FBSyxDQUFDdkcsS0FBTixDQUFZLElBQVosRUFBa0JDLFNBQWxCO0FBQ0g7O0FBRURjLEVBQUFBLE9BQU8sQ0FBQzBHLFVBQUQsRUFBYWxCLEtBQWIsRUFBb0I7QUFDdkJyRSxJQUFBQSxPQUFPLEVBQUUsU0FBUzhNLFVBQVQsQ0FBb0JsSSxFQUFwQixFQUF3QjtBQUM3QixVQUFJMUUsSUFBSSxHQUFHeU0sZUFBZSxDQUFDL0gsRUFBRSxDQUFDMUUsSUFBSixDQUExQjtBQUNBLFVBQUltTSxPQUFPLEdBQUdVLFVBQVUsQ0FBQy9QLElBQVgsQ0FBZ0IsSUFBaEIsRUFBc0I0SCxFQUF0QixFQUEwQjFFLElBQTFCLENBQWQ7O0FBQ0EsVUFBSSxDQUFDbU0sT0FBTCxFQUFjO0FBQ1Y7QUFDSDs7QUFFRCxXQUFLOUgsUUFBTCxDQUFjLEtBQUtELE9BQW5CLEVBQTRCcEUsSUFBNUIsRUFBa0M7QUFDOUI0RixRQUFBQSxRQUFRLEVBQUV1RyxPQUFPLENBQUMsQ0FBRCxDQURhO0FBRTlCckcsUUFBQUEsZUFBZSxFQUFFcUcsT0FBTyxDQUFDLENBQUQsQ0FGTTtBQUc5QmhDLFFBQUFBLFdBQVcsRUFBRW5ILGdCQUhpQjtBQUk5Qm9GLFFBQUFBLFFBQVEsRUFBRTFEO0FBSm9CLE9BQWxDO0FBTUg7QUFkc0IsR0FBcEIsQ0FBUDtBQWlCQTs7Ozs7OztBQU1BLFdBQVNtSSxVQUFULENBQW9CbkksRUFBcEIsRUFBd0IxRSxJQUF4QixFQUE4QjtBQUMxQixRQUFJOE0sVUFBVSxHQUFHOUwsT0FBTyxDQUFDMEQsRUFBRSxDQUFDeUgsT0FBSixDQUF4QjtBQUNBLFFBQUlRLFNBQVMsR0FBRyxLQUFLQSxTQUFyQixDQUYwQixDQUkxQjs7QUFDQSxRQUFJM00sSUFBSSxJQUFJcUQsV0FBVyxHQUFHQyxVQUFsQixDQUFKLElBQXFDd0osVUFBVSxDQUFDalEsTUFBWCxLQUFzQixDQUEvRCxFQUFrRTtBQUM5RDhQLE1BQUFBLFNBQVMsQ0FBQ0csVUFBVSxDQUFDLENBQUQsQ0FBVixDQUFjQyxVQUFmLENBQVQsR0FBc0MsSUFBdEM7QUFDQSxhQUFPLENBQUNELFVBQUQsRUFBYUEsVUFBYixDQUFQO0FBQ0g7O0FBRUQsUUFBSW5RLENBQUo7QUFBQSxRQUNJcVEsYUFESjtBQUFBLFFBRUlULGNBQWMsR0FBR3ZMLE9BQU8sQ0FBQzBELEVBQUUsQ0FBQzZILGNBQUosQ0FGNUI7QUFBQSxRQUdJVSxvQkFBb0IsR0FBRyxFQUgzQjtBQUFBLFFBSUlqUCxNQUFNLEdBQUcsS0FBS0EsTUFKbEIsQ0FWMEIsQ0FnQjFCOztBQUNBZ1AsSUFBQUEsYUFBYSxHQUFHRixVQUFVLENBQUNJLE1BQVgsQ0FBa0IsVUFBU0MsS0FBVCxFQUFnQjtBQUM5QyxhQUFPL00sU0FBUyxDQUFDK00sS0FBSyxDQUFDblAsTUFBUCxFQUFlQSxNQUFmLENBQWhCO0FBQ0gsS0FGZSxDQUFoQixDQWpCMEIsQ0FxQjFCOztBQUNBLFFBQUlnQyxJQUFJLEtBQUtxRCxXQUFiLEVBQTBCO0FBQ3RCMUcsTUFBQUEsQ0FBQyxHQUFHLENBQUo7O0FBQ0EsYUFBT0EsQ0FBQyxHQUFHcVEsYUFBYSxDQUFDblEsTUFBekIsRUFBaUM7QUFDN0I4UCxRQUFBQSxTQUFTLENBQUNLLGFBQWEsQ0FBQ3JRLENBQUQsQ0FBYixDQUFpQm9RLFVBQWxCLENBQVQsR0FBeUMsSUFBekM7QUFDQXBRLFFBQUFBLENBQUM7QUFDSjtBQUNKLEtBNUJ5QixDQThCMUI7OztBQUNBQSxJQUFBQSxDQUFDLEdBQUcsQ0FBSjs7QUFDQSxXQUFPQSxDQUFDLEdBQUc0UCxjQUFjLENBQUMxUCxNQUExQixFQUFrQztBQUM5QixVQUFJOFAsU0FBUyxDQUFDSixjQUFjLENBQUM1UCxDQUFELENBQWQsQ0FBa0JvUSxVQUFuQixDQUFiLEVBQTZDO0FBQ3pDRSxRQUFBQSxvQkFBb0IsQ0FBQzFMLElBQXJCLENBQTBCZ0wsY0FBYyxDQUFDNVAsQ0FBRCxDQUF4QztBQUNILE9BSDZCLENBSzlCOzs7QUFDQSxVQUFJcUQsSUFBSSxJQUFJdUQsU0FBUyxHQUFHQyxZQUFoQixDQUFSLEVBQXVDO0FBQ25DLGVBQU9tSixTQUFTLENBQUNKLGNBQWMsQ0FBQzVQLENBQUQsQ0FBZCxDQUFrQm9RLFVBQW5CLENBQWhCO0FBQ0g7O0FBQ0RwUSxNQUFBQSxDQUFDO0FBQ0o7O0FBRUQsUUFBSSxDQUFDc1Esb0JBQW9CLENBQUNwUSxNQUExQixFQUFrQztBQUM5QjtBQUNIOztBQUVELFdBQU8sQ0FDSDtBQUNBcUUsSUFBQUEsV0FBVyxDQUFDOEwsYUFBYSxDQUFDUixNQUFkLENBQXFCUyxvQkFBckIsQ0FBRCxFQUE2QyxZQUE3QyxFQUEyRCxJQUEzRCxDQUZSLEVBR0hBLG9CQUhHLENBQVA7QUFLSDtBQUVEOzs7Ozs7Ozs7OztBQVVBLE1BQUlHLGFBQWEsR0FBRyxJQUFwQjtBQUNBLE1BQUlDLGNBQWMsR0FBRyxFQUFyQjs7QUFFQSxXQUFTOUgsZUFBVCxHQUEyQjtBQUN2QnBCLElBQUFBLEtBQUssQ0FBQ3ZHLEtBQU4sQ0FBWSxJQUFaLEVBQWtCQyxTQUFsQjtBQUVBLFFBQUlpQyxPQUFPLEdBQUczRCxNQUFNLENBQUMsS0FBSzJELE9BQU4sRUFBZSxJQUFmLENBQXBCO0FBQ0EsU0FBS3FOLEtBQUwsR0FBYSxJQUFJOUgsVUFBSixDQUFlLEtBQUtqQixPQUFwQixFQUE2QnRFLE9BQTdCLENBQWI7QUFDQSxTQUFLd04sS0FBTCxHQUFhLElBQUloSSxVQUFKLENBQWUsS0FBS2xCLE9BQXBCLEVBQTZCdEUsT0FBN0IsQ0FBYjtBQUVBLFNBQUt5TixZQUFMLEdBQW9CLElBQXBCO0FBQ0EsU0FBS0MsV0FBTCxHQUFtQixFQUFuQjtBQUNIOztBQUVEN08sRUFBQUEsT0FBTyxDQUFDNEcsZUFBRCxFQUFrQnBCLEtBQWxCLEVBQXlCO0FBQzVCOzs7Ozs7QUFNQXJFLElBQUFBLE9BQU8sRUFBRSxTQUFTMk4sVUFBVCxDQUFvQnJKLE9BQXBCLEVBQTZCc0osVUFBN0IsRUFBeUNDLFNBQXpDLEVBQW9EO0FBQ3pELFVBQUl0QyxPQUFPLEdBQUlzQyxTQUFTLENBQUN4RCxXQUFWLElBQXlCbkgsZ0JBQXhDO0FBQUEsVUFDSTRLLE9BQU8sR0FBSUQsU0FBUyxDQUFDeEQsV0FBVixJQUF5QmpILGdCQUR4Qzs7QUFHQSxVQUFJMEssT0FBTyxJQUFJRCxTQUFTLENBQUNFLGtCQUFyQixJQUEyQ0YsU0FBUyxDQUFDRSxrQkFBVixDQUE2QkMsZ0JBQTVFLEVBQThGO0FBQzFGO0FBQ0gsT0FOd0QsQ0FRekQ7OztBQUNBLFVBQUl6QyxPQUFKLEVBQWE7QUFDVDBDLFFBQUFBLGFBQWEsQ0FBQ2pSLElBQWQsQ0FBbUIsSUFBbkIsRUFBeUI0USxVQUF6QixFQUFxQ0MsU0FBckM7QUFDSCxPQUZELE1BRU8sSUFBSUMsT0FBTyxJQUFJSSxnQkFBZ0IsQ0FBQ2xSLElBQWpCLENBQXNCLElBQXRCLEVBQTRCNlEsU0FBNUIsQ0FBZixFQUF1RDtBQUMxRDtBQUNIOztBQUVELFdBQUt0SixRQUFMLENBQWNELE9BQWQsRUFBdUJzSixVQUF2QixFQUFtQ0MsU0FBbkM7QUFDSCxLQXZCMkI7O0FBeUI1Qjs7O0FBR0EzSSxJQUFBQSxPQUFPLEVBQUUsU0FBU0EsT0FBVCxHQUFtQjtBQUN4QixXQUFLbUksS0FBTCxDQUFXbkksT0FBWDtBQUNBLFdBQUtzSSxLQUFMLENBQVd0SSxPQUFYO0FBQ0g7QUEvQjJCLEdBQXpCLENBQVA7O0FBa0NBLFdBQVMrSSxhQUFULENBQXVCdEksU0FBdkIsRUFBa0N3SSxTQUFsQyxFQUE2QztBQUN6QyxRQUFJeEksU0FBUyxHQUFHcEMsV0FBaEIsRUFBNkI7QUFDekIsV0FBS2tLLFlBQUwsR0FBb0JVLFNBQVMsQ0FBQ25JLGVBQVYsQ0FBMEIsQ0FBMUIsRUFBNkJpSCxVQUFqRDtBQUNBbUIsTUFBQUEsWUFBWSxDQUFDcFIsSUFBYixDQUFrQixJQUFsQixFQUF3Qm1SLFNBQXhCO0FBQ0gsS0FIRCxNQUdPLElBQUl4SSxTQUFTLElBQUlsQyxTQUFTLEdBQUdDLFlBQWhCLENBQWIsRUFBNEM7QUFDL0MwSyxNQUFBQSxZQUFZLENBQUNwUixJQUFiLENBQWtCLElBQWxCLEVBQXdCbVIsU0FBeEI7QUFDSDtBQUNKOztBQUVELFdBQVNDLFlBQVQsQ0FBc0JELFNBQXRCLEVBQWlDO0FBQzdCLFFBQUlkLEtBQUssR0FBR2MsU0FBUyxDQUFDbkksZUFBVixDQUEwQixDQUExQixDQUFaOztBQUVBLFFBQUlxSCxLQUFLLENBQUNKLFVBQU4sS0FBcUIsS0FBS1EsWUFBOUIsRUFBNEM7QUFDeEMsVUFBSVksU0FBUyxHQUFHO0FBQUN4RyxRQUFBQSxDQUFDLEVBQUV3RixLQUFLLENBQUNwRSxPQUFWO0FBQW1CbEIsUUFBQUEsQ0FBQyxFQUFFc0YsS0FBSyxDQUFDbkU7QUFBNUIsT0FBaEI7QUFDQSxXQUFLd0UsV0FBTCxDQUFpQmpNLElBQWpCLENBQXNCNE0sU0FBdEI7QUFDQSxVQUFJQyxHQUFHLEdBQUcsS0FBS1osV0FBZjs7QUFDQSxVQUFJYSxlQUFlLEdBQUcsU0FBbEJBLGVBQWtCLEdBQVc7QUFDN0IsWUFBSTFSLENBQUMsR0FBR3lSLEdBQUcsQ0FBQ3pOLE9BQUosQ0FBWXdOLFNBQVosQ0FBUjs7QUFDQSxZQUFJeFIsQ0FBQyxHQUFHLENBQUMsQ0FBVCxFQUFZO0FBQ1J5UixVQUFBQSxHQUFHLENBQUM1QyxNQUFKLENBQVc3TyxDQUFYLEVBQWMsQ0FBZDtBQUNIO0FBQ0osT0FMRDs7QUFNQVQsTUFBQUEsVUFBVSxDQUFDbVMsZUFBRCxFQUFrQmpCLGFBQWxCLENBQVY7QUFDSDtBQUNKOztBQUVELFdBQVNZLGdCQUFULENBQTBCQyxTQUExQixFQUFxQztBQUNqQyxRQUFJdEcsQ0FBQyxHQUFHc0csU0FBUyxDQUFDN0YsUUFBVixDQUFtQlcsT0FBM0I7QUFBQSxRQUFvQ2xCLENBQUMsR0FBR29HLFNBQVMsQ0FBQzdGLFFBQVYsQ0FBbUJZLE9BQTNEOztBQUNBLFNBQUssSUFBSXJNLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUcsS0FBSzZRLFdBQUwsQ0FBaUIzUSxNQUFyQyxFQUE2Q0YsQ0FBQyxFQUE5QyxFQUFrRDtBQUM5QyxVQUFJMlIsQ0FBQyxHQUFHLEtBQUtkLFdBQUwsQ0FBaUI3USxDQUFqQixDQUFSO0FBQ0EsVUFBSTRSLEVBQUUsR0FBRzdTLElBQUksQ0FBQ0MsR0FBTCxDQUFTZ00sQ0FBQyxHQUFHMkcsQ0FBQyxDQUFDM0csQ0FBZixDQUFUO0FBQUEsVUFBNEI2RyxFQUFFLEdBQUc5UyxJQUFJLENBQUNDLEdBQUwsQ0FBU2tNLENBQUMsR0FBR3lHLENBQUMsQ0FBQ3pHLENBQWYsQ0FBakM7O0FBQ0EsVUFBSTBHLEVBQUUsSUFBSWxCLGNBQU4sSUFBd0JtQixFQUFFLElBQUluQixjQUFsQyxFQUFrRDtBQUM5QyxlQUFPLElBQVA7QUFDSDtBQUNKOztBQUNELFdBQU8sS0FBUDtBQUNIOztBQUVELE1BQUlvQixxQkFBcUIsR0FBRzlNLFFBQVEsQ0FBQ3JHLFlBQVksQ0FBQ29ULEtBQWQsRUFBcUIsYUFBckIsQ0FBcEM7QUFDQSxNQUFJQyxtQkFBbUIsR0FBR0YscUJBQXFCLEtBQUtyVCxTQUFwRCxDQTlwQ2lELENBZ3FDakQ7O0FBQ0EsTUFBSXdULG9CQUFvQixHQUFHLFNBQTNCO0FBQ0EsTUFBSUMsaUJBQWlCLEdBQUcsTUFBeEI7QUFDQSxNQUFJQyx5QkFBeUIsR0FBRyxjQUFoQyxDQW5xQ2lELENBbXFDRDs7QUFDaEQsTUFBSUMsaUJBQWlCLEdBQUcsTUFBeEI7QUFDQSxNQUFJQyxrQkFBa0IsR0FBRyxPQUF6QjtBQUNBLE1BQUlDLGtCQUFrQixHQUFHLE9BQXpCO0FBQ0EsTUFBSUMsZ0JBQWdCLEdBQUdDLG1CQUFtQixFQUExQztBQUVBOzs7Ozs7OztBQU9BLFdBQVNDLFdBQVQsQ0FBcUJoTCxPQUFyQixFQUE4QmlMLEtBQTlCLEVBQXFDO0FBQ2pDLFNBQUtqTCxPQUFMLEdBQWVBLE9BQWY7QUFDQSxTQUFLa0wsR0FBTCxDQUFTRCxLQUFUO0FBQ0g7O0FBRURELEVBQUFBLFdBQVcsQ0FBQ3BRLFNBQVosR0FBd0I7QUFDcEI7Ozs7QUFJQXNRLElBQUFBLEdBQUcsRUFBRSxhQUFTRCxLQUFULEVBQWdCO0FBQ2pCO0FBQ0EsVUFBSUEsS0FBSyxJQUFJVCxvQkFBYixFQUFtQztBQUMvQlMsUUFBQUEsS0FBSyxHQUFHLEtBQUtFLE9BQUwsRUFBUjtBQUNIOztBQUVELFVBQUlaLG1CQUFtQixJQUFJLEtBQUt2SyxPQUFMLENBQWFoQyxPQUFiLENBQXFCc00sS0FBNUMsSUFBcURRLGdCQUFnQixDQUFDRyxLQUFELENBQXpFLEVBQWtGO0FBQzlFLGFBQUtqTCxPQUFMLENBQWFoQyxPQUFiLENBQXFCc00sS0FBckIsQ0FBMkJELHFCQUEzQixJQUFvRFksS0FBcEQ7QUFDSDs7QUFDRCxXQUFLRyxPQUFMLEdBQWVILEtBQUssQ0FBQ2pFLFdBQU4sR0FBb0J4SyxJQUFwQixFQUFmO0FBQ0gsS0FmbUI7O0FBaUJwQjs7O0FBR0E2TyxJQUFBQSxNQUFNLEVBQUUsa0JBQVc7QUFDZixXQUFLSCxHQUFMLENBQVMsS0FBS2xMLE9BQUwsQ0FBYUcsT0FBYixDQUFxQm1MLFdBQTlCO0FBQ0gsS0F0Qm1COztBQXdCcEI7Ozs7QUFJQUgsSUFBQUEsT0FBTyxFQUFFLG1CQUFXO0FBQ2hCLFVBQUlDLE9BQU8sR0FBRyxFQUFkO0FBQ0FoVCxNQUFBQSxJQUFJLENBQUMsS0FBSzRILE9BQUwsQ0FBYXVMLFdBQWQsRUFBMkIsVUFBU0MsVUFBVCxFQUFxQjtBQUNoRCxZQUFJdFEsUUFBUSxDQUFDc1EsVUFBVSxDQUFDckwsT0FBWCxDQUFtQkksTUFBcEIsRUFBNEIsQ0FBQ2lMLFVBQUQsQ0FBNUIsQ0FBWixFQUF1RDtBQUNuREosVUFBQUEsT0FBTyxHQUFHQSxPQUFPLENBQUNoRCxNQUFSLENBQWVvRCxVQUFVLENBQUNDLGNBQVgsRUFBZixDQUFWO0FBQ0g7QUFDSixPQUpHLENBQUo7QUFLQSxhQUFPQyxpQkFBaUIsQ0FBQ04sT0FBTyxDQUFDTyxJQUFSLENBQWEsR0FBYixDQUFELENBQXhCO0FBQ0gsS0FwQ21COztBQXNDcEI7Ozs7QUFJQUMsSUFBQUEsZUFBZSxFQUFFLHlCQUFTdEssS0FBVCxFQUFnQjtBQUM3QixVQUFJMEMsUUFBUSxHQUFHMUMsS0FBSyxDQUFDMEMsUUFBckI7QUFDQSxVQUFJUyxTQUFTLEdBQUduRCxLQUFLLENBQUMwQixlQUF0QixDQUY2QixDQUk3Qjs7QUFDQSxVQUFJLEtBQUtoRCxPQUFMLENBQWE2QixPQUFiLENBQXFCZ0ssU0FBekIsRUFBb0M7QUFDaEM3SCxRQUFBQSxRQUFRLENBQUM4SCxjQUFUO0FBQ0E7QUFDSDs7QUFFRCxVQUFJVixPQUFPLEdBQUcsS0FBS0EsT0FBbkI7QUFDQSxVQUFJVyxPQUFPLEdBQUczUCxLQUFLLENBQUNnUCxPQUFELEVBQVVULGlCQUFWLENBQUwsSUFBcUMsQ0FBQ0csZ0JBQWdCLENBQUNILGlCQUFELENBQXBFO0FBQ0EsVUFBSXFCLE9BQU8sR0FBRzVQLEtBQUssQ0FBQ2dQLE9BQUQsRUFBVVAsa0JBQVYsQ0FBTCxJQUFzQyxDQUFDQyxnQkFBZ0IsQ0FBQ0Qsa0JBQUQsQ0FBckU7QUFDQSxVQUFJb0IsT0FBTyxHQUFHN1AsS0FBSyxDQUFDZ1AsT0FBRCxFQUFVUixrQkFBVixDQUFMLElBQXNDLENBQUNFLGdCQUFnQixDQUFDRixrQkFBRCxDQUFyRTs7QUFFQSxVQUFJbUIsT0FBSixFQUFhO0FBQ1Q7QUFFQSxZQUFJRyxZQUFZLEdBQUc1SyxLQUFLLENBQUNFLFFBQU4sQ0FBZS9JLE1BQWYsS0FBMEIsQ0FBN0M7QUFDQSxZQUFJMFQsYUFBYSxHQUFHN0ssS0FBSyxDQUFDdUIsUUFBTixHQUFpQixDQUFyQztBQUNBLFlBQUl1SixjQUFjLEdBQUc5SyxLQUFLLENBQUNvQixTQUFOLEdBQWtCLEdBQXZDOztBQUVBLFlBQUl3SixZQUFZLElBQUlDLGFBQWhCLElBQWlDQyxjQUFyQyxFQUFxRDtBQUNqRDtBQUNIO0FBQ0o7O0FBRUQsVUFBSUgsT0FBTyxJQUFJRCxPQUFmLEVBQXdCO0FBQ3BCO0FBQ0E7QUFDSDs7QUFFRCxVQUFJRCxPQUFPLElBQ05DLE9BQU8sSUFBSXZILFNBQVMsR0FBRy9FLG9CQUR4QixJQUVDdU0sT0FBTyxJQUFJeEgsU0FBUyxHQUFHOUUsa0JBRjVCLEVBRWlEO0FBQzdDLGVBQU8sS0FBSzBNLFVBQUwsQ0FBZ0JySSxRQUFoQixDQUFQO0FBQ0g7QUFDSixLQS9FbUI7O0FBaUZwQjs7OztBQUlBcUksSUFBQUEsVUFBVSxFQUFFLG9CQUFTckksUUFBVCxFQUFtQjtBQUMzQixXQUFLaEUsT0FBTCxDQUFhNkIsT0FBYixDQUFxQmdLLFNBQXJCLEdBQWlDLElBQWpDO0FBQ0E3SCxNQUFBQSxRQUFRLENBQUM4SCxjQUFUO0FBQ0g7QUF4Rm1CLEdBQXhCO0FBMkZBOzs7Ozs7QUFLQSxXQUFTSixpQkFBVCxDQUEyQk4sT0FBM0IsRUFBb0M7QUFDaEM7QUFDQSxRQUFJaFAsS0FBSyxDQUFDZ1AsT0FBRCxFQUFVVCxpQkFBVixDQUFULEVBQXVDO0FBQ25DLGFBQU9BLGlCQUFQO0FBQ0g7O0FBRUQsUUFBSXNCLE9BQU8sR0FBRzdQLEtBQUssQ0FBQ2dQLE9BQUQsRUFBVVIsa0JBQVYsQ0FBbkI7QUFDQSxRQUFJb0IsT0FBTyxHQUFHNVAsS0FBSyxDQUFDZ1AsT0FBRCxFQUFVUCxrQkFBVixDQUFuQixDQVBnQyxDQVNoQztBQUNBO0FBQ0E7QUFDQTs7QUFDQSxRQUFJb0IsT0FBTyxJQUFJRCxPQUFmLEVBQXdCO0FBQ3BCLGFBQU9yQixpQkFBUDtBQUNILEtBZitCLENBaUJoQzs7O0FBQ0EsUUFBSXNCLE9BQU8sSUFBSUQsT0FBZixFQUF3QjtBQUNwQixhQUFPQyxPQUFPLEdBQUdyQixrQkFBSCxHQUF3QkMsa0JBQXRDO0FBQ0gsS0FwQitCLENBc0JoQzs7O0FBQ0EsUUFBSXpPLEtBQUssQ0FBQ2dQLE9BQUQsRUFBVVYseUJBQVYsQ0FBVCxFQUErQztBQUMzQyxhQUFPQSx5QkFBUDtBQUNIOztBQUVELFdBQU9ELGlCQUFQO0FBQ0g7O0FBRUQsV0FBU00sbUJBQVQsR0FBK0I7QUFDM0IsUUFBSSxDQUFDUixtQkFBTCxFQUEwQjtBQUN0QixhQUFPLEtBQVA7QUFDSDs7QUFDRCxRQUFJK0IsUUFBUSxHQUFHLEVBQWY7QUFDQSxRQUFJQyxXQUFXLEdBQUcxVixNQUFNLENBQUMyVixHQUFQLElBQWMzVixNQUFNLENBQUMyVixHQUFQLENBQVdDLFFBQTNDO0FBQ0EsS0FBQyxNQUFELEVBQVMsY0FBVCxFQUF5QixPQUF6QixFQUFrQyxPQUFsQyxFQUEyQyxhQUEzQyxFQUEwRCxNQUExRCxFQUFrRWpVLE9BQWxFLENBQTBFLFVBQVMyQyxHQUFULEVBQWM7QUFFcEY7QUFDQTtBQUNBbVIsTUFBQUEsUUFBUSxDQUFDblIsR0FBRCxDQUFSLEdBQWdCb1IsV0FBVyxHQUFHMVYsTUFBTSxDQUFDMlYsR0FBUCxDQUFXQyxRQUFYLENBQW9CLGNBQXBCLEVBQW9DdFIsR0FBcEMsQ0FBSCxHQUE4QyxJQUF6RTtBQUNILEtBTEQ7QUFNQSxXQUFPbVIsUUFBUDtBQUNIO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMkJBLE1BQUlJLGNBQWMsR0FBRyxDQUFyQjtBQUNBLE1BQUlDLFdBQVcsR0FBRyxDQUFsQjtBQUNBLE1BQUlDLGFBQWEsR0FBRyxDQUFwQjtBQUNBLE1BQUlDLFdBQVcsR0FBRyxDQUFsQjtBQUNBLE1BQUlDLGdCQUFnQixHQUFHRCxXQUF2QjtBQUNBLE1BQUlFLGVBQWUsR0FBRyxFQUF0QjtBQUNBLE1BQUlDLFlBQVksR0FBRyxFQUFuQjtBQUVBOzs7Ozs7O0FBTUEsV0FBU0MsVUFBVCxDQUFvQjlNLE9BQXBCLEVBQTZCO0FBQ3pCLFNBQUtBLE9BQUwsR0FBZXpHLE1BQU0sQ0FBQyxFQUFELEVBQUssS0FBS3dULFFBQVYsRUFBb0IvTSxPQUFPLElBQUksRUFBL0IsQ0FBckI7QUFFQSxTQUFLZ04sRUFBTCxHQUFVclAsUUFBUSxFQUFsQjtBQUVBLFNBQUtrQyxPQUFMLEdBQWUsSUFBZixDQUx5QixDQU96Qjs7QUFDQSxTQUFLRyxPQUFMLENBQWFJLE1BQWIsR0FBc0JsRixXQUFXLENBQUMsS0FBSzhFLE9BQUwsQ0FBYUksTUFBZCxFQUFzQixJQUF0QixDQUFqQztBQUVBLFNBQUs2TSxLQUFMLEdBQWFWLGNBQWI7QUFFQSxTQUFLVyxZQUFMLEdBQW9CLEVBQXBCO0FBQ0EsU0FBS0MsV0FBTCxHQUFtQixFQUFuQjtBQUNIOztBQUVETCxFQUFBQSxVQUFVLENBQUNyUyxTQUFYLEdBQXVCO0FBQ25COzs7O0FBSUFzUyxJQUFBQSxRQUFRLEVBQUUsRUFMUzs7QUFPbkI7Ozs7O0FBS0FoQyxJQUFBQSxHQUFHLEVBQUUsYUFBUy9LLE9BQVQsRUFBa0I7QUFDbkJ6RyxNQUFBQSxNQUFNLENBQUMsS0FBS3lHLE9BQU4sRUFBZUEsT0FBZixDQUFOLENBRG1CLENBR25COztBQUNBLFdBQUtILE9BQUwsSUFBZ0IsS0FBS0EsT0FBTCxDQUFhc0wsV0FBYixDQUF5QkQsTUFBekIsRUFBaEI7QUFDQSxhQUFPLElBQVA7QUFDSCxLQWxCa0I7O0FBb0JuQjs7Ozs7QUFLQWtDLElBQUFBLGFBQWEsRUFBRSx1QkFBU0MsZUFBVCxFQUEwQjtBQUNyQyxVQUFJeFYsY0FBYyxDQUFDd1YsZUFBRCxFQUFrQixlQUFsQixFQUFtQyxJQUFuQyxDQUFsQixFQUE0RDtBQUN4RCxlQUFPLElBQVA7QUFDSDs7QUFFRCxVQUFJSCxZQUFZLEdBQUcsS0FBS0EsWUFBeEI7QUFDQUcsTUFBQUEsZUFBZSxHQUFHQyw0QkFBNEIsQ0FBQ0QsZUFBRCxFQUFrQixJQUFsQixDQUE5Qzs7QUFDQSxVQUFJLENBQUNILFlBQVksQ0FBQ0csZUFBZSxDQUFDTCxFQUFqQixDQUFqQixFQUF1QztBQUNuQ0UsUUFBQUEsWUFBWSxDQUFDRyxlQUFlLENBQUNMLEVBQWpCLENBQVosR0FBbUNLLGVBQW5DO0FBQ0FBLFFBQUFBLGVBQWUsQ0FBQ0QsYUFBaEIsQ0FBOEIsSUFBOUI7QUFDSDs7QUFDRCxhQUFPLElBQVA7QUFDSCxLQXJDa0I7O0FBdUNuQjs7Ozs7QUFLQUcsSUFBQUEsaUJBQWlCLEVBQUUsMkJBQVNGLGVBQVQsRUFBMEI7QUFDekMsVUFBSXhWLGNBQWMsQ0FBQ3dWLGVBQUQsRUFBa0IsbUJBQWxCLEVBQXVDLElBQXZDLENBQWxCLEVBQWdFO0FBQzVELGVBQU8sSUFBUDtBQUNIOztBQUVEQSxNQUFBQSxlQUFlLEdBQUdDLDRCQUE0QixDQUFDRCxlQUFELEVBQWtCLElBQWxCLENBQTlDO0FBQ0EsYUFBTyxLQUFLSCxZQUFMLENBQWtCRyxlQUFlLENBQUNMLEVBQWxDLENBQVA7QUFDQSxhQUFPLElBQVA7QUFDSCxLQXBEa0I7O0FBc0RuQjs7Ozs7QUFLQVEsSUFBQUEsY0FBYyxFQUFFLHdCQUFTSCxlQUFULEVBQTBCO0FBQ3RDLFVBQUl4VixjQUFjLENBQUN3VixlQUFELEVBQWtCLGdCQUFsQixFQUFvQyxJQUFwQyxDQUFsQixFQUE2RDtBQUN6RCxlQUFPLElBQVA7QUFDSDs7QUFFRCxVQUFJRixXQUFXLEdBQUcsS0FBS0EsV0FBdkI7QUFDQUUsTUFBQUEsZUFBZSxHQUFHQyw0QkFBNEIsQ0FBQ0QsZUFBRCxFQUFrQixJQUFsQixDQUE5Qzs7QUFDQSxVQUFJOVEsT0FBTyxDQUFDNFEsV0FBRCxFQUFjRSxlQUFkLENBQVAsS0FBMEMsQ0FBQyxDQUEvQyxFQUFrRDtBQUM5Q0YsUUFBQUEsV0FBVyxDQUFDblEsSUFBWixDQUFpQnFRLGVBQWpCO0FBQ0FBLFFBQUFBLGVBQWUsQ0FBQ0csY0FBaEIsQ0FBK0IsSUFBL0I7QUFDSDs7QUFDRCxhQUFPLElBQVA7QUFDSCxLQXZFa0I7O0FBeUVuQjs7Ozs7QUFLQUMsSUFBQUEsa0JBQWtCLEVBQUUsNEJBQVNKLGVBQVQsRUFBMEI7QUFDMUMsVUFBSXhWLGNBQWMsQ0FBQ3dWLGVBQUQsRUFBa0Isb0JBQWxCLEVBQXdDLElBQXhDLENBQWxCLEVBQWlFO0FBQzdELGVBQU8sSUFBUDtBQUNIOztBQUVEQSxNQUFBQSxlQUFlLEdBQUdDLDRCQUE0QixDQUFDRCxlQUFELEVBQWtCLElBQWxCLENBQTlDO0FBQ0EsVUFBSXpULEtBQUssR0FBRzJDLE9BQU8sQ0FBQyxLQUFLNFEsV0FBTixFQUFtQkUsZUFBbkIsQ0FBbkI7O0FBQ0EsVUFBSXpULEtBQUssR0FBRyxDQUFDLENBQWIsRUFBZ0I7QUFDWixhQUFLdVQsV0FBTCxDQUFpQmxHLE1BQWpCLENBQXdCck4sS0FBeEIsRUFBK0IsQ0FBL0I7QUFDSDs7QUFDRCxhQUFPLElBQVA7QUFDSCxLQXpGa0I7O0FBMkZuQjs7OztBQUlBOFQsSUFBQUEsa0JBQWtCLEVBQUUsOEJBQVc7QUFDM0IsYUFBTyxLQUFLUCxXQUFMLENBQWlCN1UsTUFBakIsR0FBMEIsQ0FBakM7QUFDSCxLQWpHa0I7O0FBbUduQjs7Ozs7QUFLQXFWLElBQUFBLGdCQUFnQixFQUFFLDBCQUFTTixlQUFULEVBQTBCO0FBQ3hDLGFBQU8sQ0FBQyxDQUFDLEtBQUtILFlBQUwsQ0FBa0JHLGVBQWUsQ0FBQ0wsRUFBbEMsQ0FBVDtBQUNILEtBMUdrQjs7QUE0R25COzs7OztBQUtBcEwsSUFBQUEsSUFBSSxFQUFFLGNBQVNULEtBQVQsRUFBZ0I7QUFDbEIsVUFBSXBCLElBQUksR0FBRyxJQUFYO0FBQ0EsVUFBSWtOLEtBQUssR0FBRyxLQUFLQSxLQUFqQjs7QUFFQSxlQUFTckwsSUFBVCxDQUFjZ00sS0FBZCxFQUFxQjtBQUNqQjdOLFFBQUFBLElBQUksQ0FBQ0YsT0FBTCxDQUFhK0IsSUFBYixDQUFrQmdNLEtBQWxCLEVBQXlCek0sS0FBekI7QUFDSCxPQU5pQixDQVFsQjs7O0FBQ0EsVUFBSThMLEtBQUssR0FBR1AsV0FBWixFQUF5QjtBQUNyQjlLLFFBQUFBLElBQUksQ0FBQzdCLElBQUksQ0FBQ0MsT0FBTCxDQUFhNE4sS0FBYixHQUFxQkMsUUFBUSxDQUFDWixLQUFELENBQTlCLENBQUo7QUFDSDs7QUFFRHJMLE1BQUFBLElBQUksQ0FBQzdCLElBQUksQ0FBQ0MsT0FBTCxDQUFhNE4sS0FBZCxDQUFKLENBYmtCLENBYVE7O0FBRTFCLFVBQUl6TSxLQUFLLENBQUMyTSxlQUFWLEVBQTJCO0FBQUU7QUFDekJsTSxRQUFBQSxJQUFJLENBQUNULEtBQUssQ0FBQzJNLGVBQVAsQ0FBSjtBQUNILE9BakJpQixDQW1CbEI7OztBQUNBLFVBQUliLEtBQUssSUFBSVAsV0FBYixFQUEwQjtBQUN0QjlLLFFBQUFBLElBQUksQ0FBQzdCLElBQUksQ0FBQ0MsT0FBTCxDQUFhNE4sS0FBYixHQUFxQkMsUUFBUSxDQUFDWixLQUFELENBQTlCLENBQUo7QUFDSDtBQUNKLEtBeElrQjs7QUEwSW5COzs7Ozs7QUFNQWMsSUFBQUEsT0FBTyxFQUFFLGlCQUFTNU0sS0FBVCxFQUFnQjtBQUNyQixVQUFJLEtBQUs2TSxPQUFMLEVBQUosRUFBb0I7QUFDaEIsZUFBTyxLQUFLcE0sSUFBTCxDQUFVVCxLQUFWLENBQVA7QUFDSCxPQUhvQixDQUlyQjs7O0FBQ0EsV0FBSzhMLEtBQUwsR0FBYUosWUFBYjtBQUNILEtBdEprQjs7QUF3Sm5COzs7O0FBSUFtQixJQUFBQSxPQUFPLEVBQUUsbUJBQVc7QUFDaEIsVUFBSTVWLENBQUMsR0FBRyxDQUFSOztBQUNBLGFBQU9BLENBQUMsR0FBRyxLQUFLK1UsV0FBTCxDQUFpQjdVLE1BQTVCLEVBQW9DO0FBQ2hDLFlBQUksRUFBRSxLQUFLNlUsV0FBTCxDQUFpQi9VLENBQWpCLEVBQW9CNlUsS0FBcEIsSUFBNkJKLFlBQVksR0FBR04sY0FBNUMsQ0FBRixDQUFKLEVBQW9FO0FBQ2hFLGlCQUFPLEtBQVA7QUFDSDs7QUFDRG5VLFFBQUFBLENBQUM7QUFDSjs7QUFDRCxhQUFPLElBQVA7QUFDSCxLQXJLa0I7O0FBdUtuQjs7OztBQUlBeUosSUFBQUEsU0FBUyxFQUFFLG1CQUFTdUgsU0FBVCxFQUFvQjtBQUMzQjtBQUNBO0FBQ0EsVUFBSTZFLGNBQWMsR0FBRzFVLE1BQU0sQ0FBQyxFQUFELEVBQUs2UCxTQUFMLENBQTNCLENBSDJCLENBSzNCOztBQUNBLFVBQUksQ0FBQ3JPLFFBQVEsQ0FBQyxLQUFLaUYsT0FBTCxDQUFhSSxNQUFkLEVBQXNCLENBQUMsSUFBRCxFQUFPNk4sY0FBUCxDQUF0QixDQUFiLEVBQTREO0FBQ3hELGFBQUtDLEtBQUw7QUFDQSxhQUFLakIsS0FBTCxHQUFhSixZQUFiO0FBQ0E7QUFDSCxPQVYwQixDQVkzQjs7O0FBQ0EsVUFBSSxLQUFLSSxLQUFMLElBQWNOLGdCQUFnQixHQUFHQyxlQUFuQixHQUFxQ0MsWUFBbkQsQ0FBSixFQUFzRTtBQUNsRSxhQUFLSSxLQUFMLEdBQWFWLGNBQWI7QUFDSDs7QUFFRCxXQUFLVSxLQUFMLEdBQWEsS0FBS2tCLE9BQUwsQ0FBYUYsY0FBYixDQUFiLENBakIyQixDQW1CM0I7QUFDQTs7QUFDQSxVQUFJLEtBQUtoQixLQUFMLElBQWNULFdBQVcsR0FBR0MsYUFBZCxHQUE4QkMsV0FBOUIsR0FBNENFLGVBQTFELENBQUosRUFBZ0Y7QUFDNUUsYUFBS21CLE9BQUwsQ0FBYUUsY0FBYjtBQUNIO0FBQ0osS0FuTWtCOztBQXFNbkI7Ozs7Ozs7QUFPQUUsSUFBQUEsT0FBTyxFQUFFLGlCQUFTL0UsU0FBVCxFQUFvQixDQUFHLENBNU1iO0FBNE1lOztBQUVsQzs7Ozs7QUFLQWtDLElBQUFBLGNBQWMsRUFBRSwwQkFBVyxDQUFHLENBbk5YOztBQXFObkI7Ozs7O0FBS0E0QyxJQUFBQSxLQUFLLEVBQUUsaUJBQVcsQ0FBRztBQTFORixHQUF2QjtBQTZOQTs7Ozs7O0FBS0EsV0FBU0wsUUFBVCxDQUFrQlosS0FBbEIsRUFBeUI7QUFDckIsUUFBSUEsS0FBSyxHQUFHTCxlQUFaLEVBQTZCO0FBQ3pCLGFBQU8sUUFBUDtBQUNILEtBRkQsTUFFTyxJQUFJSyxLQUFLLEdBQUdQLFdBQVosRUFBeUI7QUFDNUIsYUFBTyxLQUFQO0FBQ0gsS0FGTSxNQUVBLElBQUlPLEtBQUssR0FBR1IsYUFBWixFQUEyQjtBQUM5QixhQUFPLE1BQVA7QUFDSCxLQUZNLE1BRUEsSUFBSVEsS0FBSyxHQUFHVCxXQUFaLEVBQXlCO0FBQzVCLGFBQU8sT0FBUDtBQUNIOztBQUNELFdBQU8sRUFBUDtBQUNIO0FBRUQ7Ozs7Ozs7QUFLQSxXQUFTNEIsWUFBVCxDQUFzQjlKLFNBQXRCLEVBQWlDO0FBQzdCLFFBQUlBLFNBQVMsSUFBSWhGLGNBQWpCLEVBQWlDO0FBQzdCLGFBQU8sTUFBUDtBQUNILEtBRkQsTUFFTyxJQUFJZ0YsU0FBUyxJQUFJakYsWUFBakIsRUFBK0I7QUFDbEMsYUFBTyxJQUFQO0FBQ0gsS0FGTSxNQUVBLElBQUlpRixTQUFTLElBQUluRixjQUFqQixFQUFpQztBQUNwQyxhQUFPLE1BQVA7QUFDSCxLQUZNLE1BRUEsSUFBSW1GLFNBQVMsSUFBSWxGLGVBQWpCLEVBQWtDO0FBQ3JDLGFBQU8sT0FBUDtBQUNIOztBQUNELFdBQU8sRUFBUDtBQUNIO0FBRUQ7Ozs7Ozs7O0FBTUEsV0FBU2tPLDRCQUFULENBQXNDRCxlQUF0QyxFQUF1RGhDLFVBQXZELEVBQW1FO0FBQy9ELFFBQUl4TCxPQUFPLEdBQUd3TCxVQUFVLENBQUN4TCxPQUF6Qjs7QUFDQSxRQUFJQSxPQUFKLEVBQWE7QUFDVCxhQUFPQSxPQUFPLENBQUN3TyxHQUFSLENBQVloQixlQUFaLENBQVA7QUFDSDs7QUFDRCxXQUFPQSxlQUFQO0FBQ0g7QUFFRDs7Ozs7OztBQUtBLFdBQVNpQixjQUFULEdBQTBCO0FBQ3RCeEIsSUFBQUEsVUFBVSxDQUFDelQsS0FBWCxDQUFpQixJQUFqQixFQUF1QkMsU0FBdkI7QUFDSDs7QUFFRGMsRUFBQUEsT0FBTyxDQUFDa1UsY0FBRCxFQUFpQnhCLFVBQWpCLEVBQTZCO0FBQ2hDOzs7O0FBSUFDLElBQUFBLFFBQVEsRUFBRTtBQUNOOzs7O0FBSUExTCxNQUFBQSxRQUFRLEVBQUU7QUFMSixLQUxzQjs7QUFhaEM7Ozs7OztBQU1Ba04sSUFBQUEsUUFBUSxFQUFFLGtCQUFTcE4sS0FBVCxFQUFnQjtBQUN0QixVQUFJcU4sY0FBYyxHQUFHLEtBQUt4TyxPQUFMLENBQWFxQixRQUFsQztBQUNBLGFBQU9tTixjQUFjLEtBQUssQ0FBbkIsSUFBd0JyTixLQUFLLENBQUNFLFFBQU4sQ0FBZS9JLE1BQWYsS0FBMEJrVyxjQUF6RDtBQUNILEtBdEIrQjs7QUF3QmhDOzs7Ozs7QUFNQUwsSUFBQUEsT0FBTyxFQUFFLGlCQUFTaE4sS0FBVCxFQUFnQjtBQUNyQixVQUFJOEwsS0FBSyxHQUFHLEtBQUtBLEtBQWpCO0FBQ0EsVUFBSS9MLFNBQVMsR0FBR0MsS0FBSyxDQUFDRCxTQUF0QjtBQUVBLFVBQUl1TixZQUFZLEdBQUd4QixLQUFLLElBQUlULFdBQVcsR0FBR0MsYUFBbEIsQ0FBeEI7QUFDQSxVQUFJaUMsT0FBTyxHQUFHLEtBQUtILFFBQUwsQ0FBY3BOLEtBQWQsQ0FBZCxDQUxxQixDQU9yQjs7QUFDQSxVQUFJc04sWUFBWSxLQUFLdk4sU0FBUyxHQUFHakMsWUFBWixJQUE0QixDQUFDeVAsT0FBbEMsQ0FBaEIsRUFBNEQ7QUFDeEQsZUFBT3pCLEtBQUssR0FBR0wsZUFBZjtBQUNILE9BRkQsTUFFTyxJQUFJNkIsWUFBWSxJQUFJQyxPQUFwQixFQUE2QjtBQUNoQyxZQUFJeE4sU0FBUyxHQUFHbEMsU0FBaEIsRUFBMkI7QUFDdkIsaUJBQU9pTyxLQUFLLEdBQUdQLFdBQWY7QUFDSCxTQUZELE1BRU8sSUFBSSxFQUFFTyxLQUFLLEdBQUdULFdBQVYsQ0FBSixFQUE0QjtBQUMvQixpQkFBT0EsV0FBUDtBQUNIOztBQUNELGVBQU9TLEtBQUssR0FBR1IsYUFBZjtBQUNIOztBQUNELGFBQU9JLFlBQVA7QUFDSDtBQWpEK0IsR0FBN0IsQ0FBUDtBQW9EQTs7Ozs7OztBQU1BLFdBQVM4QixhQUFULEdBQXlCO0FBQ3JCTCxJQUFBQSxjQUFjLENBQUNqVixLQUFmLENBQXFCLElBQXJCLEVBQTJCQyxTQUEzQjtBQUVBLFNBQUtzVixFQUFMLEdBQVUsSUFBVjtBQUNBLFNBQUtDLEVBQUwsR0FBVSxJQUFWO0FBQ0g7O0FBRUR6VSxFQUFBQSxPQUFPLENBQUN1VSxhQUFELEVBQWdCTCxjQUFoQixFQUFnQztBQUNuQzs7OztBQUlBdkIsSUFBQUEsUUFBUSxFQUFFO0FBQ05hLE1BQUFBLEtBQUssRUFBRSxLQUREO0FBRU5rQixNQUFBQSxTQUFTLEVBQUUsRUFGTDtBQUdOek4sTUFBQUEsUUFBUSxFQUFFLENBSEo7QUFJTmlELE1BQUFBLFNBQVMsRUFBRTdFO0FBSkwsS0FMeUI7QUFZbkM2TCxJQUFBQSxjQUFjLEVBQUUsMEJBQVc7QUFDdkIsVUFBSWhILFNBQVMsR0FBRyxLQUFLdEUsT0FBTCxDQUFhc0UsU0FBN0I7QUFDQSxVQUFJMkcsT0FBTyxHQUFHLEVBQWQ7O0FBQ0EsVUFBSTNHLFNBQVMsR0FBRy9FLG9CQUFoQixFQUFzQztBQUNsQzBMLFFBQUFBLE9BQU8sQ0FBQ2pPLElBQVIsQ0FBYTBOLGtCQUFiO0FBQ0g7O0FBQ0QsVUFBSXBHLFNBQVMsR0FBRzlFLGtCQUFoQixFQUFvQztBQUNoQ3lMLFFBQUFBLE9BQU8sQ0FBQ2pPLElBQVIsQ0FBYXlOLGtCQUFiO0FBQ0g7O0FBQ0QsYUFBT1EsT0FBUDtBQUNILEtBdEJrQztBQXdCbkM4RCxJQUFBQSxhQUFhLEVBQUUsdUJBQVM1TixLQUFULEVBQWdCO0FBQzNCLFVBQUluQixPQUFPLEdBQUcsS0FBS0EsT0FBbkI7QUFDQSxVQUFJZ1AsUUFBUSxHQUFHLElBQWY7QUFDQSxVQUFJdE0sUUFBUSxHQUFHdkIsS0FBSyxDQUFDdUIsUUFBckI7QUFDQSxVQUFJNEIsU0FBUyxHQUFHbkQsS0FBSyxDQUFDbUQsU0FBdEI7QUFDQSxVQUFJbEIsQ0FBQyxHQUFHakMsS0FBSyxDQUFDNEIsTUFBZDtBQUNBLFVBQUlPLENBQUMsR0FBR25DLEtBQUssQ0FBQzZCLE1BQWQsQ0FOMkIsQ0FRM0I7O0FBQ0EsVUFBSSxFQUFFc0IsU0FBUyxHQUFHdEUsT0FBTyxDQUFDc0UsU0FBdEIsQ0FBSixFQUFzQztBQUNsQyxZQUFJdEUsT0FBTyxDQUFDc0UsU0FBUixHQUFvQi9FLG9CQUF4QixFQUE4QztBQUMxQytFLFVBQUFBLFNBQVMsR0FBSWxCLENBQUMsS0FBSyxDQUFQLEdBQVlsRSxjQUFaLEdBQThCa0UsQ0FBQyxHQUFHLENBQUwsR0FBVWpFLGNBQVYsR0FBMkJDLGVBQXBFO0FBQ0E0UCxVQUFBQSxRQUFRLEdBQUc1TCxDQUFDLElBQUksS0FBS3dMLEVBQXJCO0FBQ0FsTSxVQUFBQSxRQUFRLEdBQUd2TCxJQUFJLENBQUNDLEdBQUwsQ0FBUytKLEtBQUssQ0FBQzRCLE1BQWYsQ0FBWDtBQUNILFNBSkQsTUFJTztBQUNIdUIsVUFBQUEsU0FBUyxHQUFJaEIsQ0FBQyxLQUFLLENBQVAsR0FBWXBFLGNBQVosR0FBOEJvRSxDQUFDLEdBQUcsQ0FBTCxHQUFVakUsWUFBVixHQUF5QkMsY0FBbEU7QUFDQTBQLFVBQUFBLFFBQVEsR0FBRzFMLENBQUMsSUFBSSxLQUFLdUwsRUFBckI7QUFDQW5NLFVBQUFBLFFBQVEsR0FBR3ZMLElBQUksQ0FBQ0MsR0FBTCxDQUFTK0osS0FBSyxDQUFDNkIsTUFBZixDQUFYO0FBQ0g7QUFDSjs7QUFDRDdCLE1BQUFBLEtBQUssQ0FBQ21ELFNBQU4sR0FBa0JBLFNBQWxCO0FBQ0EsYUFBTzBLLFFBQVEsSUFBSXRNLFFBQVEsR0FBRzFDLE9BQU8sQ0FBQzhPLFNBQS9CLElBQTRDeEssU0FBUyxHQUFHdEUsT0FBTyxDQUFDc0UsU0FBdkU7QUFDSCxLQTlDa0M7QUFnRG5DaUssSUFBQUEsUUFBUSxFQUFFLGtCQUFTcE4sS0FBVCxFQUFnQjtBQUN0QixhQUFPbU4sY0FBYyxDQUFDN1QsU0FBZixDQUF5QjhULFFBQXpCLENBQWtDaFcsSUFBbEMsQ0FBdUMsSUFBdkMsRUFBNkM0SSxLQUE3QyxNQUNGLEtBQUs4TCxLQUFMLEdBQWFULFdBQWIsSUFBNkIsRUFBRSxLQUFLUyxLQUFMLEdBQWFULFdBQWYsS0FBK0IsS0FBS3VDLGFBQUwsQ0FBbUI1TixLQUFuQixDQUQxRCxDQUFQO0FBRUgsS0FuRGtDO0FBcURuQ1MsSUFBQUEsSUFBSSxFQUFFLGNBQVNULEtBQVQsRUFBZ0I7QUFFbEIsV0FBS3lOLEVBQUwsR0FBVXpOLEtBQUssQ0FBQzRCLE1BQWhCO0FBQ0EsV0FBSzhMLEVBQUwsR0FBVTFOLEtBQUssQ0FBQzZCLE1BQWhCO0FBRUEsVUFBSXNCLFNBQVMsR0FBRzhKLFlBQVksQ0FBQ2pOLEtBQUssQ0FBQ21ELFNBQVAsQ0FBNUI7O0FBRUEsVUFBSUEsU0FBSixFQUFlO0FBQ1huRCxRQUFBQSxLQUFLLENBQUMyTSxlQUFOLEdBQXdCLEtBQUs5TixPQUFMLENBQWE0TixLQUFiLEdBQXFCdEosU0FBN0M7QUFDSDs7QUFDRCxXQUFLekosTUFBTCxDQUFZK0csSUFBWixDQUFpQnJKLElBQWpCLENBQXNCLElBQXRCLEVBQTRCNEksS0FBNUI7QUFDSDtBQWhFa0MsR0FBaEMsQ0FBUDtBQW1FQTs7Ozs7OztBQU1BLFdBQVM4TixlQUFULEdBQTJCO0FBQ3ZCWCxJQUFBQSxjQUFjLENBQUNqVixLQUFmLENBQXFCLElBQXJCLEVBQTJCQyxTQUEzQjtBQUNIOztBQUVEYyxFQUFBQSxPQUFPLENBQUM2VSxlQUFELEVBQWtCWCxjQUFsQixFQUFrQztBQUNyQzs7OztBQUlBdkIsSUFBQUEsUUFBUSxFQUFFO0FBQ05hLE1BQUFBLEtBQUssRUFBRSxPQUREO0FBRU5rQixNQUFBQSxTQUFTLEVBQUUsQ0FGTDtBQUdOek4sTUFBQUEsUUFBUSxFQUFFO0FBSEosS0FMMkI7QUFXckNpSyxJQUFBQSxjQUFjLEVBQUUsMEJBQVc7QUFDdkIsYUFBTyxDQUFDZCxpQkFBRCxDQUFQO0FBQ0gsS0Fib0M7QUFlckMrRCxJQUFBQSxRQUFRLEVBQUUsa0JBQVNwTixLQUFULEVBQWdCO0FBQ3RCLGFBQU8sS0FBS3RHLE1BQUwsQ0FBWTBULFFBQVosQ0FBcUJoVyxJQUFyQixDQUEwQixJQUExQixFQUFnQzRJLEtBQWhDLE1BQ0ZoSyxJQUFJLENBQUNDLEdBQUwsQ0FBUytKLEtBQUssQ0FBQ29DLEtBQU4sR0FBYyxDQUF2QixJQUE0QixLQUFLdkQsT0FBTCxDQUFhOE8sU0FBekMsSUFBc0QsS0FBSzdCLEtBQUwsR0FBYVQsV0FEakUsQ0FBUDtBQUVILEtBbEJvQztBQW9CckM1SyxJQUFBQSxJQUFJLEVBQUUsY0FBU1QsS0FBVCxFQUFnQjtBQUNsQixVQUFJQSxLQUFLLENBQUNvQyxLQUFOLEtBQWdCLENBQXBCLEVBQXVCO0FBQ25CLFlBQUkyTCxLQUFLLEdBQUcvTixLQUFLLENBQUNvQyxLQUFOLEdBQWMsQ0FBZCxHQUFrQixJQUFsQixHQUF5QixLQUFyQztBQUNBcEMsUUFBQUEsS0FBSyxDQUFDMk0sZUFBTixHQUF3QixLQUFLOU4sT0FBTCxDQUFhNE4sS0FBYixHQUFxQnNCLEtBQTdDO0FBQ0g7O0FBQ0QsV0FBS3JVLE1BQUwsQ0FBWStHLElBQVosQ0FBaUJySixJQUFqQixDQUFzQixJQUF0QixFQUE0QjRJLEtBQTVCO0FBQ0g7QUExQm9DLEdBQWxDLENBQVA7QUE2QkE7Ozs7Ozs7QUFNQSxXQUFTZ08sZUFBVCxHQUEyQjtBQUN2QnJDLElBQUFBLFVBQVUsQ0FBQ3pULEtBQVgsQ0FBaUIsSUFBakIsRUFBdUJDLFNBQXZCO0FBRUEsU0FBSzhWLE1BQUwsR0FBYyxJQUFkO0FBQ0EsU0FBS0MsTUFBTCxHQUFjLElBQWQ7QUFDSDs7QUFFRGpWLEVBQUFBLE9BQU8sQ0FBQytVLGVBQUQsRUFBa0JyQyxVQUFsQixFQUE4QjtBQUNqQzs7OztBQUlBQyxJQUFBQSxRQUFRLEVBQUU7QUFDTmEsTUFBQUEsS0FBSyxFQUFFLE9BREQ7QUFFTnZNLE1BQUFBLFFBQVEsRUFBRSxDQUZKO0FBR05pTyxNQUFBQSxJQUFJLEVBQUUsR0FIQTtBQUdLO0FBQ1hSLE1BQUFBLFNBQVMsRUFBRSxDQUpMLENBSU87O0FBSlAsS0FMdUI7QUFZakN4RCxJQUFBQSxjQUFjLEVBQUUsMEJBQVc7QUFDdkIsYUFBTyxDQUFDaEIsaUJBQUQsQ0FBUDtBQUNILEtBZGdDO0FBZ0JqQzZELElBQUFBLE9BQU8sRUFBRSxpQkFBU2hOLEtBQVQsRUFBZ0I7QUFDckIsVUFBSW5CLE9BQU8sR0FBRyxLQUFLQSxPQUFuQjtBQUNBLFVBQUl1UCxhQUFhLEdBQUdwTyxLQUFLLENBQUNFLFFBQU4sQ0FBZS9JLE1BQWYsS0FBMEIwSCxPQUFPLENBQUNxQixRQUF0RDtBQUNBLFVBQUltTyxhQUFhLEdBQUdyTyxLQUFLLENBQUN1QixRQUFOLEdBQWlCMUMsT0FBTyxDQUFDOE8sU0FBN0M7QUFDQSxVQUFJVyxTQUFTLEdBQUd0TyxLQUFLLENBQUNvQixTQUFOLEdBQWtCdkMsT0FBTyxDQUFDc1AsSUFBMUM7QUFFQSxXQUFLRCxNQUFMLEdBQWNsTyxLQUFkLENBTnFCLENBUXJCO0FBQ0E7O0FBQ0EsVUFBSSxDQUFDcU8sYUFBRCxJQUFrQixDQUFDRCxhQUFuQixJQUFxQ3BPLEtBQUssQ0FBQ0QsU0FBTixJQUFtQmxDLFNBQVMsR0FBR0MsWUFBL0IsS0FBZ0QsQ0FBQ3dRLFNBQTFGLEVBQXNHO0FBQ2xHLGFBQUt2QixLQUFMO0FBQ0gsT0FGRCxNQUVPLElBQUkvTSxLQUFLLENBQUNELFNBQU4sR0FBa0JwQyxXQUF0QixFQUFtQztBQUN0QyxhQUFLb1AsS0FBTDtBQUNBLGFBQUtrQixNQUFMLEdBQWM3WCxpQkFBaUIsQ0FBQyxZQUFXO0FBQ3ZDLGVBQUswVixLQUFMLEdBQWFOLGdCQUFiO0FBQ0EsZUFBS29CLE9BQUw7QUFDSCxTQUg4QixFQUc1Qi9OLE9BQU8sQ0FBQ3NQLElBSG9CLEVBR2QsSUFIYyxDQUEvQjtBQUlILE9BTk0sTUFNQSxJQUFJbk8sS0FBSyxDQUFDRCxTQUFOLEdBQWtCbEMsU0FBdEIsRUFBaUM7QUFDcEMsZUFBTzJOLGdCQUFQO0FBQ0g7O0FBQ0QsYUFBT0UsWUFBUDtBQUNILEtBdENnQztBQXdDakNxQixJQUFBQSxLQUFLLEVBQUUsaUJBQVc7QUFDZHdCLE1BQUFBLFlBQVksQ0FBQyxLQUFLTixNQUFOLENBQVo7QUFDSCxLQTFDZ0M7QUE0Q2pDeE4sSUFBQUEsSUFBSSxFQUFFLGNBQVNULEtBQVQsRUFBZ0I7QUFDbEIsVUFBSSxLQUFLOEwsS0FBTCxLQUFlTixnQkFBbkIsRUFBcUM7QUFDakM7QUFDSDs7QUFFRCxVQUFJeEwsS0FBSyxJQUFLQSxLQUFLLENBQUNELFNBQU4sR0FBa0JsQyxTQUFoQyxFQUE0QztBQUN4QyxhQUFLYSxPQUFMLENBQWErQixJQUFiLENBQWtCLEtBQUs1QixPQUFMLENBQWE0TixLQUFiLEdBQXFCLElBQXZDLEVBQTZDek0sS0FBN0M7QUFDSCxPQUZELE1BRU87QUFDSCxhQUFLa08sTUFBTCxDQUFZL00sU0FBWixHQUF3QmpMLEdBQUcsRUFBM0I7QUFDQSxhQUFLd0ksT0FBTCxDQUFhK0IsSUFBYixDQUFrQixLQUFLNUIsT0FBTCxDQUFhNE4sS0FBL0IsRUFBc0MsS0FBS3lCLE1BQTNDO0FBQ0g7QUFDSjtBQXZEZ0MsR0FBOUIsQ0FBUDtBQTBEQTs7Ozs7OztBQU1BLFdBQVNNLGdCQUFULEdBQTRCO0FBQ3hCckIsSUFBQUEsY0FBYyxDQUFDalYsS0FBZixDQUFxQixJQUFyQixFQUEyQkMsU0FBM0I7QUFDSDs7QUFFRGMsRUFBQUEsT0FBTyxDQUFDdVYsZ0JBQUQsRUFBbUJyQixjQUFuQixFQUFtQztBQUN0Qzs7OztBQUlBdkIsSUFBQUEsUUFBUSxFQUFFO0FBQ05hLE1BQUFBLEtBQUssRUFBRSxRQUREO0FBRU5rQixNQUFBQSxTQUFTLEVBQUUsQ0FGTDtBQUdOek4sTUFBQUEsUUFBUSxFQUFFO0FBSEosS0FMNEI7QUFXdENpSyxJQUFBQSxjQUFjLEVBQUUsMEJBQVc7QUFDdkIsYUFBTyxDQUFDZCxpQkFBRCxDQUFQO0FBQ0gsS0FicUM7QUFldEMrRCxJQUFBQSxRQUFRLEVBQUUsa0JBQVNwTixLQUFULEVBQWdCO0FBQ3RCLGFBQU8sS0FBS3RHLE1BQUwsQ0FBWTBULFFBQVosQ0FBcUJoVyxJQUFyQixDQUEwQixJQUExQixFQUFnQzRJLEtBQWhDLE1BQ0ZoSyxJQUFJLENBQUNDLEdBQUwsQ0FBUytKLEtBQUssQ0FBQ3NDLFFBQWYsSUFBMkIsS0FBS3pELE9BQUwsQ0FBYThPLFNBQXhDLElBQXFELEtBQUs3QixLQUFMLEdBQWFULFdBRGhFLENBQVA7QUFFSDtBQWxCcUMsR0FBbkMsQ0FBUDtBQXFCQTs7Ozs7OztBQU1BLFdBQVNvRCxlQUFULEdBQTJCO0FBQ3ZCdEIsSUFBQUEsY0FBYyxDQUFDalYsS0FBZixDQUFxQixJQUFyQixFQUEyQkMsU0FBM0I7QUFDSDs7QUFFRGMsRUFBQUEsT0FBTyxDQUFDd1YsZUFBRCxFQUFrQnRCLGNBQWxCLEVBQWtDO0FBQ3JDOzs7O0FBSUF2QixJQUFBQSxRQUFRLEVBQUU7QUFDTmEsTUFBQUEsS0FBSyxFQUFFLE9BREQ7QUFFTmtCLE1BQUFBLFNBQVMsRUFBRSxFQUZMO0FBR04zSyxNQUFBQSxRQUFRLEVBQUUsR0FISjtBQUlORyxNQUFBQSxTQUFTLEVBQUUvRSxvQkFBb0IsR0FBR0Msa0JBSjVCO0FBS042QixNQUFBQSxRQUFRLEVBQUU7QUFMSixLQUwyQjtBQWFyQ2lLLElBQUFBLGNBQWMsRUFBRSwwQkFBVztBQUN2QixhQUFPcUQsYUFBYSxDQUFDbFUsU0FBZCxDQUF3QjZRLGNBQXhCLENBQXVDL1MsSUFBdkMsQ0FBNEMsSUFBNUMsQ0FBUDtBQUNILEtBZm9DO0FBaUJyQ2dXLElBQUFBLFFBQVEsRUFBRSxrQkFBU3BOLEtBQVQsRUFBZ0I7QUFDdEIsVUFBSW1ELFNBQVMsR0FBRyxLQUFLdEUsT0FBTCxDQUFhc0UsU0FBN0I7QUFDQSxVQUFJSCxRQUFKOztBQUVBLFVBQUlHLFNBQVMsSUFBSS9FLG9CQUFvQixHQUFHQyxrQkFBM0IsQ0FBYixFQUE2RDtBQUN6RDJFLFFBQUFBLFFBQVEsR0FBR2hELEtBQUssQ0FBQzhCLGVBQWpCO0FBQ0gsT0FGRCxNQUVPLElBQUlxQixTQUFTLEdBQUcvRSxvQkFBaEIsRUFBc0M7QUFDekM0RSxRQUFBQSxRQUFRLEdBQUdoRCxLQUFLLENBQUNnQyxnQkFBakI7QUFDSCxPQUZNLE1BRUEsSUFBSW1CLFNBQVMsR0FBRzlFLGtCQUFoQixFQUFvQztBQUN2QzJFLFFBQUFBLFFBQVEsR0FBR2hELEtBQUssQ0FBQ2tDLGdCQUFqQjtBQUNIOztBQUVELGFBQU8sS0FBS3hJLE1BQUwsQ0FBWTBULFFBQVosQ0FBcUJoVyxJQUFyQixDQUEwQixJQUExQixFQUFnQzRJLEtBQWhDLEtBQ0htRCxTQUFTLEdBQUduRCxLQUFLLENBQUMwQixlQURmLElBRUgxQixLQUFLLENBQUN1QixRQUFOLEdBQWlCLEtBQUsxQyxPQUFMLENBQWE4TyxTQUYzQixJQUdIM04sS0FBSyxDQUFDd0MsV0FBTixJQUFxQixLQUFLM0QsT0FBTCxDQUFhcUIsUUFIL0IsSUFJSGpLLEdBQUcsQ0FBQytNLFFBQUQsQ0FBSCxHQUFnQixLQUFLbkUsT0FBTCxDQUFhbUUsUUFKMUIsSUFJc0NoRCxLQUFLLENBQUNELFNBQU4sR0FBa0JsQyxTQUovRDtBQUtILEtBbENvQztBQW9DckM0QyxJQUFBQSxJQUFJLEVBQUUsY0FBU1QsS0FBVCxFQUFnQjtBQUNsQixVQUFJbUQsU0FBUyxHQUFHOEosWUFBWSxDQUFDak4sS0FBSyxDQUFDMEIsZUFBUCxDQUE1Qjs7QUFDQSxVQUFJeUIsU0FBSixFQUFlO0FBQ1gsYUFBS3pFLE9BQUwsQ0FBYStCLElBQWIsQ0FBa0IsS0FBSzVCLE9BQUwsQ0FBYTROLEtBQWIsR0FBcUJ0SixTQUF2QyxFQUFrRG5ELEtBQWxEO0FBQ0g7O0FBRUQsV0FBS3RCLE9BQUwsQ0FBYStCLElBQWIsQ0FBa0IsS0FBSzVCLE9BQUwsQ0FBYTROLEtBQS9CLEVBQXNDek0sS0FBdEM7QUFDSDtBQTNDb0MsR0FBbEMsQ0FBUDtBQThDQTs7Ozs7Ozs7Ozs7QUFVQSxXQUFTME8sYUFBVCxHQUF5QjtBQUNyQi9DLElBQUFBLFVBQVUsQ0FBQ3pULEtBQVgsQ0FBaUIsSUFBakIsRUFBdUJDLFNBQXZCLEVBRHFCLENBR3JCO0FBQ0E7O0FBQ0EsU0FBS3dXLEtBQUwsR0FBYSxLQUFiO0FBQ0EsU0FBS0MsT0FBTCxHQUFlLEtBQWY7QUFFQSxTQUFLWCxNQUFMLEdBQWMsSUFBZDtBQUNBLFNBQUtDLE1BQUwsR0FBYyxJQUFkO0FBQ0EsU0FBS1csS0FBTCxHQUFhLENBQWI7QUFDSDs7QUFFRDVWLEVBQUFBLE9BQU8sQ0FBQ3lWLGFBQUQsRUFBZ0IvQyxVQUFoQixFQUE0QjtBQUMvQjs7OztBQUlBQyxJQUFBQSxRQUFRLEVBQUU7QUFDTmEsTUFBQUEsS0FBSyxFQUFFLEtBREQ7QUFFTnZNLE1BQUFBLFFBQVEsRUFBRSxDQUZKO0FBR040TyxNQUFBQSxJQUFJLEVBQUUsQ0FIQTtBQUlOQyxNQUFBQSxRQUFRLEVBQUUsR0FKSjtBQUlTO0FBQ2ZaLE1BQUFBLElBQUksRUFBRSxHQUxBO0FBS0s7QUFDWFIsTUFBQUEsU0FBUyxFQUFFLENBTkw7QUFNUTtBQUNkcUIsTUFBQUEsWUFBWSxFQUFFLEVBUFIsQ0FPVzs7QUFQWCxLQUxxQjtBQWUvQjdFLElBQUFBLGNBQWMsRUFBRSwwQkFBVztBQUN2QixhQUFPLENBQUNmLHlCQUFELENBQVA7QUFDSCxLQWpCOEI7QUFtQi9CNEQsSUFBQUEsT0FBTyxFQUFFLGlCQUFTaE4sS0FBVCxFQUFnQjtBQUNyQixVQUFJbkIsT0FBTyxHQUFHLEtBQUtBLE9BQW5CO0FBRUEsVUFBSXVQLGFBQWEsR0FBR3BPLEtBQUssQ0FBQ0UsUUFBTixDQUFlL0ksTUFBZixLQUEwQjBILE9BQU8sQ0FBQ3FCLFFBQXREO0FBQ0EsVUFBSW1PLGFBQWEsR0FBR3JPLEtBQUssQ0FBQ3VCLFFBQU4sR0FBaUIxQyxPQUFPLENBQUM4TyxTQUE3QztBQUNBLFVBQUlzQixjQUFjLEdBQUdqUCxLQUFLLENBQUNvQixTQUFOLEdBQWtCdkMsT0FBTyxDQUFDc1AsSUFBL0M7QUFFQSxXQUFLcEIsS0FBTDs7QUFFQSxVQUFLL00sS0FBSyxDQUFDRCxTQUFOLEdBQWtCcEMsV0FBbkIsSUFBb0MsS0FBS2tSLEtBQUwsS0FBZSxDQUF2RCxFQUEyRDtBQUN2RCxlQUFPLEtBQUtLLFdBQUwsRUFBUDtBQUNILE9BWG9CLENBYXJCO0FBQ0E7OztBQUNBLFVBQUliLGFBQWEsSUFBSVksY0FBakIsSUFBbUNiLGFBQXZDLEVBQXNEO0FBQ2xELFlBQUlwTyxLQUFLLENBQUNELFNBQU4sSUFBbUJsQyxTQUF2QixFQUFrQztBQUM5QixpQkFBTyxLQUFLcVIsV0FBTCxFQUFQO0FBQ0g7O0FBRUQsWUFBSUMsYUFBYSxHQUFHLEtBQUtSLEtBQUwsR0FBYzNPLEtBQUssQ0FBQ21CLFNBQU4sR0FBa0IsS0FBS3dOLEtBQXZCLEdBQStCOVAsT0FBTyxDQUFDa1EsUUFBckQsR0FBaUUsSUFBckY7QUFDQSxZQUFJSyxhQUFhLEdBQUcsQ0FBQyxLQUFLUixPQUFOLElBQWlCcE4sV0FBVyxDQUFDLEtBQUtvTixPQUFOLEVBQWU1TyxLQUFLLENBQUNpQixNQUFyQixDQUFYLEdBQTBDcEMsT0FBTyxDQUFDbVEsWUFBdkY7QUFFQSxhQUFLTCxLQUFMLEdBQWEzTyxLQUFLLENBQUNtQixTQUFuQjtBQUNBLGFBQUt5TixPQUFMLEdBQWU1TyxLQUFLLENBQUNpQixNQUFyQjs7QUFFQSxZQUFJLENBQUNtTyxhQUFELElBQWtCLENBQUNELGFBQXZCLEVBQXNDO0FBQ2xDLGVBQUtOLEtBQUwsR0FBYSxDQUFiO0FBQ0gsU0FGRCxNQUVPO0FBQ0gsZUFBS0EsS0FBTCxJQUFjLENBQWQ7QUFDSDs7QUFFRCxhQUFLWCxNQUFMLEdBQWNsTyxLQUFkLENBakJrRCxDQW1CbEQ7QUFDQTs7QUFDQSxZQUFJcVAsUUFBUSxHQUFHLEtBQUtSLEtBQUwsR0FBYWhRLE9BQU8sQ0FBQ2lRLElBQXBDOztBQUNBLFlBQUlPLFFBQVEsS0FBSyxDQUFqQixFQUFvQjtBQUNoQjtBQUNBO0FBQ0EsY0FBSSxDQUFDLEtBQUs5QyxrQkFBTCxFQUFMLEVBQWdDO0FBQzVCLG1CQUFPZixnQkFBUDtBQUNILFdBRkQsTUFFTztBQUNILGlCQUFLeUMsTUFBTCxHQUFjN1gsaUJBQWlCLENBQUMsWUFBVztBQUN2QyxtQkFBSzBWLEtBQUwsR0FBYU4sZ0JBQWI7QUFDQSxtQkFBS29CLE9BQUw7QUFDSCxhQUg4QixFQUc1Qi9OLE9BQU8sQ0FBQ2tRLFFBSG9CLEVBR1YsSUFIVSxDQUEvQjtBQUlBLG1CQUFPMUQsV0FBUDtBQUNIO0FBQ0o7QUFDSjs7QUFDRCxhQUFPSyxZQUFQO0FBQ0gsS0F2RThCO0FBeUUvQndELElBQUFBLFdBQVcsRUFBRSx1QkFBVztBQUNwQixXQUFLakIsTUFBTCxHQUFjN1gsaUJBQWlCLENBQUMsWUFBVztBQUN2QyxhQUFLMFYsS0FBTCxHQUFhSixZQUFiO0FBQ0gsT0FGOEIsRUFFNUIsS0FBSzdNLE9BQUwsQ0FBYWtRLFFBRmUsRUFFTCxJQUZLLENBQS9CO0FBR0EsYUFBT3JELFlBQVA7QUFDSCxLQTlFOEI7QUFnRi9CcUIsSUFBQUEsS0FBSyxFQUFFLGlCQUFXO0FBQ2R3QixNQUFBQSxZQUFZLENBQUMsS0FBS04sTUFBTixDQUFaO0FBQ0gsS0FsRjhCO0FBb0YvQnhOLElBQUFBLElBQUksRUFBRSxnQkFBVztBQUNiLFVBQUksS0FBS3FMLEtBQUwsSUFBY04sZ0JBQWxCLEVBQW9DO0FBQ2hDLGFBQUswQyxNQUFMLENBQVltQixRQUFaLEdBQXVCLEtBQUtSLEtBQTVCO0FBQ0EsYUFBS25RLE9BQUwsQ0FBYStCLElBQWIsQ0FBa0IsS0FBSzVCLE9BQUwsQ0FBYTROLEtBQS9CLEVBQXNDLEtBQUt5QixNQUEzQztBQUNIO0FBQ0o7QUF6RjhCLEdBQTVCLENBQVA7QUE0RkE7Ozs7Ozs7QUFNQSxXQUFTb0IsTUFBVCxDQUFnQjVTLE9BQWhCLEVBQXlCbUMsT0FBekIsRUFBa0M7QUFDOUJBLElBQUFBLE9BQU8sR0FBR0EsT0FBTyxJQUFJLEVBQXJCO0FBQ0FBLElBQUFBLE9BQU8sQ0FBQ29MLFdBQVIsR0FBc0JsUSxXQUFXLENBQUM4RSxPQUFPLENBQUNvTCxXQUFULEVBQXNCcUYsTUFBTSxDQUFDMUQsUUFBUCxDQUFnQjJELE1BQXRDLENBQWpDO0FBQ0EsV0FBTyxJQUFJQyxPQUFKLENBQVk5UyxPQUFaLEVBQXFCbUMsT0FBckIsQ0FBUDtBQUNIO0FBRUQ7Ozs7O0FBR0F5USxFQUFBQSxNQUFNLENBQUNHLE9BQVAsR0FBaUIsT0FBakI7QUFFQTs7Ozs7QUFJQUgsRUFBQUEsTUFBTSxDQUFDMUQsUUFBUCxHQUFrQjtBQUNkOzs7Ozs7QUFNQThELElBQUFBLFNBQVMsRUFBRSxLQVBHOztBQVNkOzs7Ozs7QUFNQTFGLElBQUFBLFdBQVcsRUFBRWQsb0JBZkM7O0FBaUJkOzs7O0FBSUFqSyxJQUFBQSxNQUFNLEVBQUUsSUFyQk07O0FBdUJkOzs7Ozs7O0FBT0FILElBQUFBLFdBQVcsRUFBRSxJQTlCQzs7QUFnQ2Q7Ozs7O0FBS0FXLElBQUFBLFVBQVUsRUFBRSxJQXJDRTs7QUF1Q2Q7Ozs7O0FBS0E4UCxJQUFBQSxNQUFNLEVBQUUsQ0FDSjtBQUNBLEtBQUNmLGdCQUFELEVBQW1CO0FBQUN2UCxNQUFBQSxNQUFNLEVBQUU7QUFBVCxLQUFuQixDQUZJLEVBR0osQ0FBQzZPLGVBQUQsRUFBa0I7QUFBQzdPLE1BQUFBLE1BQU0sRUFBRTtBQUFULEtBQWxCLEVBQW1DLENBQUMsUUFBRCxDQUFuQyxDQUhJLEVBSUosQ0FBQ3dQLGVBQUQsRUFBa0I7QUFBQ3RMLE1BQUFBLFNBQVMsRUFBRS9FO0FBQVosS0FBbEIsQ0FKSSxFQUtKLENBQUNvUCxhQUFELEVBQWdCO0FBQUNySyxNQUFBQSxTQUFTLEVBQUUvRTtBQUFaLEtBQWhCLEVBQW1ELENBQUMsT0FBRCxDQUFuRCxDQUxJLEVBTUosQ0FBQ3NRLGFBQUQsQ0FOSSxFQU9KLENBQUNBLGFBQUQsRUFBZ0I7QUFBQ2pDLE1BQUFBLEtBQUssRUFBRSxXQUFSO0FBQXFCcUMsTUFBQUEsSUFBSSxFQUFFO0FBQTNCLEtBQWhCLEVBQStDLENBQUMsS0FBRCxDQUEvQyxDQVBJLEVBUUosQ0FBQ2QsZUFBRCxDQVJJLENBNUNNOztBQXVEZDs7Ozs7QUFLQTJCLElBQUFBLFFBQVEsRUFBRTtBQUNOOzs7OztBQUtBQyxNQUFBQSxVQUFVLEVBQUUsTUFOTjs7QUFRTjs7Ozs7QUFLQUMsTUFBQUEsV0FBVyxFQUFFLE1BYlA7O0FBZU47Ozs7Ozs7QUFPQUMsTUFBQUEsWUFBWSxFQUFFLE1BdEJSOztBQXdCTjs7Ozs7QUFLQUMsTUFBQUEsY0FBYyxFQUFFLE1BN0JWOztBQStCTjs7Ozs7QUFLQUMsTUFBQUEsUUFBUSxFQUFFLE1BcENKOztBQXNDTjs7Ozs7O0FBTUFDLE1BQUFBLGlCQUFpQixFQUFFO0FBNUNiO0FBNURJLEdBQWxCO0FBNEdBLE1BQUlDLElBQUksR0FBRyxDQUFYO0FBQ0EsTUFBSUMsV0FBVyxHQUFHLENBQWxCO0FBRUE7Ozs7Ozs7QUFNQSxXQUFTWCxPQUFULENBQWlCOVMsT0FBakIsRUFBMEJtQyxPQUExQixFQUFtQztBQUMvQixTQUFLQSxPQUFMLEdBQWV6RyxNQUFNLENBQUMsRUFBRCxFQUFLa1gsTUFBTSxDQUFDMUQsUUFBWixFQUFzQi9NLE9BQU8sSUFBSSxFQUFqQyxDQUFyQjtBQUVBLFNBQUtBLE9BQUwsQ0FBYUMsV0FBYixHQUEyQixLQUFLRCxPQUFMLENBQWFDLFdBQWIsSUFBNEJwQyxPQUF2RDtBQUVBLFNBQUswVCxRQUFMLEdBQWdCLEVBQWhCO0FBQ0EsU0FBSzdQLE9BQUwsR0FBZSxFQUFmO0FBQ0EsU0FBSzBKLFdBQUwsR0FBbUIsRUFBbkI7QUFDQSxTQUFLb0csV0FBTCxHQUFtQixFQUFuQjtBQUVBLFNBQUszVCxPQUFMLEdBQWVBLE9BQWY7QUFDQSxTQUFLc0QsS0FBTCxHQUFhVCxtQkFBbUIsQ0FBQyxJQUFELENBQWhDO0FBQ0EsU0FBS3lLLFdBQUwsR0FBbUIsSUFBSU4sV0FBSixDQUFnQixJQUFoQixFQUFzQixLQUFLN0ssT0FBTCxDQUFhbUwsV0FBbkMsQ0FBbkI7QUFFQXNHLElBQUFBLGNBQWMsQ0FBQyxJQUFELEVBQU8sSUFBUCxDQUFkO0FBRUF4WixJQUFBQSxJQUFJLENBQUMsS0FBSytILE9BQUwsQ0FBYW9MLFdBQWQsRUFBMkIsVUFBU3NHLElBQVQsRUFBZTtBQUMxQyxVQUFJckcsVUFBVSxHQUFHLEtBQUtzRyxHQUFMLENBQVMsSUFBS0QsSUFBSSxDQUFDLENBQUQsQ0FBVCxDQUFjQSxJQUFJLENBQUMsQ0FBRCxDQUFsQixDQUFULENBQWpCO0FBQ0FBLE1BQUFBLElBQUksQ0FBQyxDQUFELENBQUosSUFBV3JHLFVBQVUsQ0FBQytCLGFBQVgsQ0FBeUJzRSxJQUFJLENBQUMsQ0FBRCxDQUE3QixDQUFYO0FBQ0FBLE1BQUFBLElBQUksQ0FBQyxDQUFELENBQUosSUFBV3JHLFVBQVUsQ0FBQ21DLGNBQVgsQ0FBMEJrRSxJQUFJLENBQUMsQ0FBRCxDQUE5QixDQUFYO0FBQ0gsS0FKRyxFQUlELElBSkMsQ0FBSjtBQUtIOztBQUVEZixFQUFBQSxPQUFPLENBQUNsVyxTQUFSLEdBQW9CO0FBQ2hCOzs7OztBQUtBc1EsSUFBQUEsR0FBRyxFQUFFLGFBQVMvSyxPQUFULEVBQWtCO0FBQ25CekcsTUFBQUEsTUFBTSxDQUFDLEtBQUt5RyxPQUFOLEVBQWVBLE9BQWYsQ0FBTixDQURtQixDQUduQjs7QUFDQSxVQUFJQSxPQUFPLENBQUNtTCxXQUFaLEVBQXlCO0FBQ3JCLGFBQUtBLFdBQUwsQ0FBaUJELE1BQWpCO0FBQ0g7O0FBQ0QsVUFBSWxMLE9BQU8sQ0FBQ0MsV0FBWixFQUF5QjtBQUNyQjtBQUNBLGFBQUtrQixLQUFMLENBQVdWLE9BQVg7QUFDQSxhQUFLVSxLQUFMLENBQVcxSCxNQUFYLEdBQW9CdUcsT0FBTyxDQUFDQyxXQUE1QjtBQUNBLGFBQUtrQixLQUFMLENBQVdkLElBQVg7QUFDSDs7QUFDRCxhQUFPLElBQVA7QUFDSCxLQXBCZTs7QUFzQmhCOzs7Ozs7QUFNQXVSLElBQUFBLElBQUksRUFBRSxjQUFTQyxLQUFULEVBQWdCO0FBQ2xCLFdBQUtuUSxPQUFMLENBQWFvUSxPQUFiLEdBQXVCRCxLQUFLLEdBQUdQLFdBQUgsR0FBaUJELElBQTdDO0FBQ0gsS0E5QmU7O0FBZ0NoQjs7Ozs7O0FBTUF4UCxJQUFBQSxTQUFTLEVBQUUsbUJBQVN1SCxTQUFULEVBQW9CO0FBQzNCLFVBQUkxSCxPQUFPLEdBQUcsS0FBS0EsT0FBbkI7O0FBQ0EsVUFBSUEsT0FBTyxDQUFDb1EsT0FBWixFQUFxQjtBQUNqQjtBQUNILE9BSjBCLENBTTNCOzs7QUFDQSxXQUFLM0csV0FBTCxDQUFpQk0sZUFBakIsQ0FBaUNyQyxTQUFqQztBQUVBLFVBQUlpQyxVQUFKO0FBQ0EsVUFBSUQsV0FBVyxHQUFHLEtBQUtBLFdBQXZCLENBVjJCLENBWTNCO0FBQ0E7QUFDQTs7QUFDQSxVQUFJMkcsYUFBYSxHQUFHclEsT0FBTyxDQUFDcVEsYUFBNUIsQ0FmMkIsQ0FpQjNCO0FBQ0E7O0FBQ0EsVUFBSSxDQUFDQSxhQUFELElBQW1CQSxhQUFhLElBQUlBLGFBQWEsQ0FBQzlFLEtBQWQsR0FBc0JOLGdCQUE5RCxFQUFpRjtBQUM3RW9GLFFBQUFBLGFBQWEsR0FBR3JRLE9BQU8sQ0FBQ3FRLGFBQVIsR0FBd0IsSUFBeEM7QUFDSDs7QUFFRCxVQUFJM1osQ0FBQyxHQUFHLENBQVI7O0FBQ0EsYUFBT0EsQ0FBQyxHQUFHZ1QsV0FBVyxDQUFDOVMsTUFBdkIsRUFBK0I7QUFDM0IrUyxRQUFBQSxVQUFVLEdBQUdELFdBQVcsQ0FBQ2hULENBQUQsQ0FBeEIsQ0FEMkIsQ0FHM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLFlBQUlzSixPQUFPLENBQUNvUSxPQUFSLEtBQW9CUixXQUFwQixNQUFxQztBQUNqQyxTQUFDUyxhQUFELElBQWtCMUcsVUFBVSxJQUFJMEcsYUFBaEMsSUFBaUQ7QUFDakQxRyxRQUFBQSxVQUFVLENBQUNzQyxnQkFBWCxDQUE0Qm9FLGFBQTVCLENBRkosQ0FBSixFQUVxRDtBQUFFO0FBQ25EMUcsVUFBQUEsVUFBVSxDQUFDeEosU0FBWCxDQUFxQnVILFNBQXJCO0FBQ0gsU0FKRCxNQUlPO0FBQ0hpQyxVQUFBQSxVQUFVLENBQUM2QyxLQUFYO0FBQ0gsU0FmMEIsQ0FpQjNCO0FBQ0E7OztBQUNBLFlBQUksQ0FBQzZELGFBQUQsSUFBa0IxRyxVQUFVLENBQUM0QixLQUFYLElBQW9CVCxXQUFXLEdBQUdDLGFBQWQsR0FBOEJDLFdBQWxELENBQXRCLEVBQXNGO0FBQ2xGcUYsVUFBQUEsYUFBYSxHQUFHclEsT0FBTyxDQUFDcVEsYUFBUixHQUF3QjFHLFVBQXhDO0FBQ0g7O0FBQ0RqVCxRQUFBQSxDQUFDO0FBQ0o7QUFDSixLQXRGZTs7QUF3RmhCOzs7OztBQUtBaVcsSUFBQUEsR0FBRyxFQUFFLGFBQVNoRCxVQUFULEVBQXFCO0FBQ3RCLFVBQUlBLFVBQVUsWUFBWXlCLFVBQTFCLEVBQXNDO0FBQ2xDLGVBQU96QixVQUFQO0FBQ0g7O0FBRUQsVUFBSUQsV0FBVyxHQUFHLEtBQUtBLFdBQXZCOztBQUNBLFdBQUssSUFBSWhULENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdnVCxXQUFXLENBQUM5UyxNQUFoQyxFQUF3Q0YsQ0FBQyxFQUF6QyxFQUE2QztBQUN6QyxZQUFJZ1QsV0FBVyxDQUFDaFQsQ0FBRCxDQUFYLENBQWU0SCxPQUFmLENBQXVCNE4sS0FBdkIsSUFBZ0N2QyxVQUFwQyxFQUFnRDtBQUM1QyxpQkFBT0QsV0FBVyxDQUFDaFQsQ0FBRCxDQUFsQjtBQUNIO0FBQ0o7O0FBQ0QsYUFBTyxJQUFQO0FBQ0gsS0F6R2U7O0FBMkdoQjs7Ozs7O0FBTUF1WixJQUFBQSxHQUFHLEVBQUUsYUFBU3RHLFVBQVQsRUFBcUI7QUFDdEIsVUFBSXhULGNBQWMsQ0FBQ3dULFVBQUQsRUFBYSxLQUFiLEVBQW9CLElBQXBCLENBQWxCLEVBQTZDO0FBQ3pDLGVBQU8sSUFBUDtBQUNILE9BSHFCLENBS3RCOzs7QUFDQSxVQUFJMkcsUUFBUSxHQUFHLEtBQUszRCxHQUFMLENBQVNoRCxVQUFVLENBQUNyTCxPQUFYLENBQW1CNE4sS0FBNUIsQ0FBZjs7QUFDQSxVQUFJb0UsUUFBSixFQUFjO0FBQ1YsYUFBS0MsTUFBTCxDQUFZRCxRQUFaO0FBQ0g7O0FBRUQsV0FBSzVHLFdBQUwsQ0FBaUJwTyxJQUFqQixDQUFzQnFPLFVBQXRCO0FBQ0FBLE1BQUFBLFVBQVUsQ0FBQ3hMLE9BQVgsR0FBcUIsSUFBckI7QUFFQSxXQUFLc0wsV0FBTCxDQUFpQkQsTUFBakI7QUFDQSxhQUFPRyxVQUFQO0FBQ0gsS0FqSWU7O0FBbUloQjs7Ozs7QUFLQTRHLElBQUFBLE1BQU0sRUFBRSxnQkFBUzVHLFVBQVQsRUFBcUI7QUFDekIsVUFBSXhULGNBQWMsQ0FBQ3dULFVBQUQsRUFBYSxRQUFiLEVBQXVCLElBQXZCLENBQWxCLEVBQWdEO0FBQzVDLGVBQU8sSUFBUDtBQUNIOztBQUVEQSxNQUFBQSxVQUFVLEdBQUcsS0FBS2dELEdBQUwsQ0FBU2hELFVBQVQsQ0FBYixDQUx5QixDQU96Qjs7QUFDQSxVQUFJQSxVQUFKLEVBQWdCO0FBQ1osWUFBSUQsV0FBVyxHQUFHLEtBQUtBLFdBQXZCO0FBQ0EsWUFBSXhSLEtBQUssR0FBRzJDLE9BQU8sQ0FBQzZPLFdBQUQsRUFBY0MsVUFBZCxDQUFuQjs7QUFFQSxZQUFJelIsS0FBSyxLQUFLLENBQUMsQ0FBZixFQUFrQjtBQUNkd1IsVUFBQUEsV0FBVyxDQUFDbkUsTUFBWixDQUFtQnJOLEtBQW5CLEVBQTBCLENBQTFCO0FBQ0EsZUFBS3VSLFdBQUwsQ0FBaUJELE1BQWpCO0FBQ0g7QUFDSjs7QUFFRCxhQUFPLElBQVA7QUFDSCxLQTNKZTs7QUE2SmhCOzs7Ozs7QUFNQWdILElBQUFBLEVBQUUsRUFBRSxZQUFTQyxNQUFULEVBQWlCNVcsT0FBakIsRUFBMEI7QUFDMUIsVUFBSTRXLE1BQU0sS0FBS3RiLFNBQWYsRUFBMEI7QUFDdEI7QUFDSDs7QUFDRCxVQUFJMEUsT0FBTyxLQUFLMUUsU0FBaEIsRUFBMkI7QUFDdkI7QUFDSDs7QUFFRCxVQUFJMGEsUUFBUSxHQUFHLEtBQUtBLFFBQXBCO0FBQ0F0WixNQUFBQSxJQUFJLENBQUN1RCxRQUFRLENBQUMyVyxNQUFELENBQVQsRUFBbUIsVUFBU3ZFLEtBQVQsRUFBZ0I7QUFDbkMyRCxRQUFBQSxRQUFRLENBQUMzRCxLQUFELENBQVIsR0FBa0IyRCxRQUFRLENBQUMzRCxLQUFELENBQVIsSUFBbUIsRUFBckM7QUFDQTJELFFBQUFBLFFBQVEsQ0FBQzNELEtBQUQsQ0FBUixDQUFnQjVRLElBQWhCLENBQXFCekIsT0FBckI7QUFDSCxPQUhHLENBQUo7QUFJQSxhQUFPLElBQVA7QUFDSCxLQWpMZTs7QUFtTGhCOzs7Ozs7QUFNQTZXLElBQUFBLEdBQUcsRUFBRSxhQUFTRCxNQUFULEVBQWlCNVcsT0FBakIsRUFBMEI7QUFDM0IsVUFBSTRXLE1BQU0sS0FBS3RiLFNBQWYsRUFBMEI7QUFDdEI7QUFDSDs7QUFFRCxVQUFJMGEsUUFBUSxHQUFHLEtBQUtBLFFBQXBCO0FBQ0F0WixNQUFBQSxJQUFJLENBQUN1RCxRQUFRLENBQUMyVyxNQUFELENBQVQsRUFBbUIsVUFBU3ZFLEtBQVQsRUFBZ0I7QUFDbkMsWUFBSSxDQUFDclMsT0FBTCxFQUFjO0FBQ1YsaUJBQU9nVyxRQUFRLENBQUMzRCxLQUFELENBQWY7QUFDSCxTQUZELE1BRU87QUFDSDJELFVBQUFBLFFBQVEsQ0FBQzNELEtBQUQsQ0FBUixJQUFtQjJELFFBQVEsQ0FBQzNELEtBQUQsQ0FBUixDQUFnQjNHLE1BQWhCLENBQXVCMUssT0FBTyxDQUFDZ1YsUUFBUSxDQUFDM0QsS0FBRCxDQUFULEVBQWtCclMsT0FBbEIsQ0FBOUIsRUFBMEQsQ0FBMUQsQ0FBbkI7QUFDSDtBQUNKLE9BTkcsQ0FBSjtBQU9BLGFBQU8sSUFBUDtBQUNILEtBdk1lOztBQXlNaEI7Ozs7O0FBS0FxRyxJQUFBQSxJQUFJLEVBQUUsY0FBU2dNLEtBQVQsRUFBZ0J5RSxJQUFoQixFQUFzQjtBQUN4QjtBQUNBLFVBQUksS0FBS3JTLE9BQUwsQ0FBYTZRLFNBQWpCLEVBQTRCO0FBQ3hCeUIsUUFBQUEsZUFBZSxDQUFDMUUsS0FBRCxFQUFReUUsSUFBUixDQUFmO0FBQ0gsT0FKdUIsQ0FNeEI7OztBQUNBLFVBQUlkLFFBQVEsR0FBRyxLQUFLQSxRQUFMLENBQWMzRCxLQUFkLEtBQXdCLEtBQUsyRCxRQUFMLENBQWMzRCxLQUFkLEVBQXFCbFIsS0FBckIsRUFBdkM7O0FBQ0EsVUFBSSxDQUFDNlUsUUFBRCxJQUFhLENBQUNBLFFBQVEsQ0FBQ2paLE1BQTNCLEVBQW1DO0FBQy9CO0FBQ0g7O0FBRUQrWixNQUFBQSxJQUFJLENBQUM1VyxJQUFMLEdBQVltUyxLQUFaOztBQUNBeUUsTUFBQUEsSUFBSSxDQUFDMUcsY0FBTCxHQUFzQixZQUFXO0FBQzdCMEcsUUFBQUEsSUFBSSxDQUFDeE8sUUFBTCxDQUFjOEgsY0FBZDtBQUNILE9BRkQ7O0FBSUEsVUFBSXZULENBQUMsR0FBRyxDQUFSOztBQUNBLGFBQU9BLENBQUMsR0FBR21aLFFBQVEsQ0FBQ2paLE1BQXBCLEVBQTRCO0FBQ3hCaVosUUFBQUEsUUFBUSxDQUFDblosQ0FBRCxDQUFSLENBQVlpYSxJQUFaO0FBQ0FqYSxRQUFBQSxDQUFDO0FBQ0o7QUFDSixLQXBPZTs7QUFzT2hCOzs7O0FBSUFxSSxJQUFBQSxPQUFPLEVBQUUsbUJBQVc7QUFDaEIsV0FBSzVDLE9BQUwsSUFBZ0I0VCxjQUFjLENBQUMsSUFBRCxFQUFPLEtBQVAsQ0FBOUI7QUFFQSxXQUFLRixRQUFMLEdBQWdCLEVBQWhCO0FBQ0EsV0FBSzdQLE9BQUwsR0FBZSxFQUFmO0FBQ0EsV0FBS1AsS0FBTCxDQUFXVixPQUFYO0FBQ0EsV0FBSzVDLE9BQUwsR0FBZSxJQUFmO0FBQ0g7QUFqUGUsR0FBcEI7QUFvUEE7Ozs7OztBQUtBLFdBQVM0VCxjQUFULENBQXdCNVIsT0FBeEIsRUFBaUM4UixHQUFqQyxFQUFzQztBQUNsQyxRQUFJOVQsT0FBTyxHQUFHZ0MsT0FBTyxDQUFDaEMsT0FBdEI7O0FBQ0EsUUFBSSxDQUFDQSxPQUFPLENBQUNzTSxLQUFiLEVBQW9CO0FBQ2hCO0FBQ0g7O0FBQ0QsUUFBSTVNLElBQUo7QUFDQXRGLElBQUFBLElBQUksQ0FBQzRILE9BQU8sQ0FBQ0csT0FBUixDQUFnQjhRLFFBQWpCLEVBQTJCLFVBQVNoRyxLQUFULEVBQWdCblMsSUFBaEIsRUFBc0I7QUFDakQ0RSxNQUFBQSxJQUFJLEdBQUdILFFBQVEsQ0FBQ1MsT0FBTyxDQUFDc00sS0FBVCxFQUFnQnhSLElBQWhCLENBQWY7O0FBQ0EsVUFBSWdaLEdBQUosRUFBUztBQUNMOVIsUUFBQUEsT0FBTyxDQUFDMlIsV0FBUixDQUFvQmpVLElBQXBCLElBQTRCTSxPQUFPLENBQUNzTSxLQUFSLENBQWM1TSxJQUFkLENBQTVCO0FBQ0FNLFFBQUFBLE9BQU8sQ0FBQ3NNLEtBQVIsQ0FBYzVNLElBQWQsSUFBc0J1TixLQUF0QjtBQUNILE9BSEQsTUFHTztBQUNIak4sUUFBQUEsT0FBTyxDQUFDc00sS0FBUixDQUFjNU0sSUFBZCxJQUFzQnNDLE9BQU8sQ0FBQzJSLFdBQVIsQ0FBb0JqVSxJQUFwQixLQUE2QixFQUFuRDtBQUNIO0FBQ0osS0FSRyxDQUFKOztBQVNBLFFBQUksQ0FBQ29VLEdBQUwsRUFBVTtBQUNOOVIsTUFBQUEsT0FBTyxDQUFDMlIsV0FBUixHQUFzQixFQUF0QjtBQUNIO0FBQ0o7QUFFRDs7Ozs7OztBQUtBLFdBQVNjLGVBQVQsQ0FBeUIxRSxLQUF6QixFQUFnQ3lFLElBQWhDLEVBQXNDO0FBQ2xDLFFBQUlFLFlBQVksR0FBRzViLFFBQVEsQ0FBQzZiLFdBQVQsQ0FBcUIsT0FBckIsQ0FBbkI7QUFDQUQsSUFBQUEsWUFBWSxDQUFDRSxTQUFiLENBQXVCN0UsS0FBdkIsRUFBOEIsSUFBOUIsRUFBb0MsSUFBcEM7QUFDQTJFLElBQUFBLFlBQVksQ0FBQ0csT0FBYixHQUF1QkwsSUFBdkI7QUFDQUEsSUFBQUEsSUFBSSxDQUFDNVksTUFBTCxDQUFZa1osYUFBWixDQUEwQkosWUFBMUI7QUFDSDs7QUFFRGhaLEVBQUFBLE1BQU0sQ0FBQ2tYLE1BQUQsRUFBUztBQUNYM1IsSUFBQUEsV0FBVyxFQUFFQSxXQURGO0FBRVhDLElBQUFBLFVBQVUsRUFBRUEsVUFGRDtBQUdYQyxJQUFBQSxTQUFTLEVBQUVBLFNBSEE7QUFJWEMsSUFBQUEsWUFBWSxFQUFFQSxZQUpIO0FBTVhzTixJQUFBQSxjQUFjLEVBQUVBLGNBTkw7QUFPWEMsSUFBQUEsV0FBVyxFQUFFQSxXQVBGO0FBUVhDLElBQUFBLGFBQWEsRUFBRUEsYUFSSjtBQVNYQyxJQUFBQSxXQUFXLEVBQUVBLFdBVEY7QUFVWEMsSUFBQUEsZ0JBQWdCLEVBQUVBLGdCQVZQO0FBV1hDLElBQUFBLGVBQWUsRUFBRUEsZUFYTjtBQVlYQyxJQUFBQSxZQUFZLEVBQUVBLFlBWkg7QUFjWDNOLElBQUFBLGNBQWMsRUFBRUEsY0FkTDtBQWVYQyxJQUFBQSxjQUFjLEVBQUVBLGNBZkw7QUFnQlhDLElBQUFBLGVBQWUsRUFBRUEsZUFoQk47QUFpQlhDLElBQUFBLFlBQVksRUFBRUEsWUFqQkg7QUFrQlhDLElBQUFBLGNBQWMsRUFBRUEsY0FsQkw7QUFtQlhDLElBQUFBLG9CQUFvQixFQUFFQSxvQkFuQlg7QUFvQlhDLElBQUFBLGtCQUFrQixFQUFFQSxrQkFwQlQ7QUFxQlhDLElBQUFBLGFBQWEsRUFBRUEsYUFyQko7QUF1QlhrUixJQUFBQSxPQUFPLEVBQUVBLE9BdkJFO0FBd0JYL1EsSUFBQUEsS0FBSyxFQUFFQSxLQXhCSTtBQXlCWGlMLElBQUFBLFdBQVcsRUFBRUEsV0F6QkY7QUEyQlgvSixJQUFBQSxVQUFVLEVBQUVBLFVBM0JEO0FBNEJYQyxJQUFBQSxVQUFVLEVBQUVBLFVBNUJEO0FBNkJYRixJQUFBQSxpQkFBaUIsRUFBRUEsaUJBN0JSO0FBOEJYRyxJQUFBQSxlQUFlLEVBQUVBLGVBOUJOO0FBK0JYeUcsSUFBQUEsZ0JBQWdCLEVBQUVBLGdCQS9CUDtBQWlDWHFGLElBQUFBLFVBQVUsRUFBRUEsVUFqQ0Q7QUFrQ1h3QixJQUFBQSxjQUFjLEVBQUVBLGNBbENMO0FBbUNYc0UsSUFBQUEsR0FBRyxFQUFFL0MsYUFuQ007QUFvQ1hnRCxJQUFBQSxHQUFHLEVBQUVsRSxhQXBDTTtBQXFDWG1FLElBQUFBLEtBQUssRUFBRWxELGVBckNJO0FBc0NYbUQsSUFBQUEsS0FBSyxFQUFFOUQsZUF0Q0k7QUF1Q1grRCxJQUFBQSxNQUFNLEVBQUVyRCxnQkF2Q0c7QUF3Q1hzRCxJQUFBQSxLQUFLLEVBQUU5RCxlQXhDSTtBQTBDWCtDLElBQUFBLEVBQUUsRUFBRTdXLGlCQTFDTztBQTJDWCtXLElBQUFBLEdBQUcsRUFBRXpXLG9CQTNDTTtBQTRDWDFELElBQUFBLElBQUksRUFBRUEsSUE1Q0s7QUE2Q1hpQyxJQUFBQSxLQUFLLEVBQUVBLEtBN0NJO0FBOENYSCxJQUFBQSxNQUFNLEVBQUVBLE1BOUNHO0FBK0NYUixJQUFBQSxNQUFNLEVBQUVBLE1BL0NHO0FBZ0RYYSxJQUFBQSxPQUFPLEVBQUVBLE9BaERFO0FBaURYeEMsSUFBQUEsTUFBTSxFQUFFQSxNQWpERztBQWtEWHdGLElBQUFBLFFBQVEsRUFBRUE7QUFsREMsR0FBVCxDQUFOLENBemdGaUQsQ0E4akZqRDtBQUNBOztBQUNBLE1BQUk4VixVQUFVLEdBQUksT0FBT3hjLE1BQVAsS0FBa0IsV0FBbEIsR0FBZ0NBLE1BQWhDLEdBQTBDLE9BQU9xSixJQUFQLEtBQWdCLFdBQWhCLEdBQThCQSxJQUE5QixHQUFxQyxFQUFqRyxDQWhrRmlELENBZ2tGc0Q7O0FBQ3ZHbVQsRUFBQUEsVUFBVSxDQUFDekMsTUFBWCxHQUFvQkEsTUFBcEI7O0FBRUEsTUFBSSxPQUFPMEMsTUFBUCxLQUFrQixVQUFsQixJQUFnQ0EsTUFBTSxDQUFDQyxHQUEzQyxFQUFnRDtBQUM1Q0QsSUFBQUEsTUFBTSxDQUFDLFlBQVc7QUFDZCxhQUFPMUMsTUFBUDtBQUNILEtBRkssQ0FBTjtBQUdILEdBSkQsTUFJTyxJQUFJLE9BQU80QyxNQUFQLElBQWlCLFdBQWpCLElBQWdDQSxNQUFNLENBQUNDLE9BQTNDLEVBQW9EO0FBQ3ZERCxJQUFBQSxNQUFNLENBQUNDLE9BQVAsR0FBaUI3QyxNQUFqQjtBQUNILEdBRk0sTUFFQTtBQUNIL1osSUFBQUEsTUFBTSxDQUFDRSxVQUFELENBQU4sR0FBcUI2WixNQUFyQjtBQUNIO0FBRUEsQ0E3a0ZILEVBNmtGSy9aLE1BN2tGTCxFQTZrRmFDLFFBN2tGYixFQTZrRnVCLFFBN2tGdkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgSGFtbWVyLkpTIC0gdjIuMC43IC0gMjAxNi0wNC0yMlxyXG4gKiBodHRwOi8vaGFtbWVyanMuZ2l0aHViLmlvL1xyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTYgSm9yaWsgVGFuZ2VsZGVyO1xyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgKi9cclxuKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIGV4cG9ydE5hbWUsIHVuZGVmaW5lZCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gIFxyXG4gIHZhciBWRU5ET1JfUFJFRklYRVMgPSBbJycsICd3ZWJraXQnLCAnTW96JywgJ01TJywgJ21zJywgJ28nXTtcclxuICB2YXIgVEVTVF9FTEVNRU5UID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgXHJcbiAgdmFyIFRZUEVfRlVOQ1RJT04gPSAnZnVuY3Rpb24nO1xyXG4gIFxyXG4gIHZhciByb3VuZCA9IE1hdGgucm91bmQ7XHJcbiAgdmFyIGFicyA9IE1hdGguYWJzO1xyXG4gIHZhciBub3cgPSBEYXRlLm5vdztcclxuICBcclxuICAvKipcclxuICAgKiBzZXQgYSB0aW1lb3V0IHdpdGggYSBnaXZlbiBzY29wZVxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVvdXRcclxuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gc2V0VGltZW91dENvbnRleHQoZm4sIHRpbWVvdXQsIGNvbnRleHQpIHtcclxuICAgICAgcmV0dXJuIHNldFRpbWVvdXQoYmluZEZuKGZuLCBjb250ZXh0KSwgdGltZW91dCk7XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIGlmIHRoZSBhcmd1bWVudCBpcyBhbiBhcnJheSwgd2Ugd2FudCB0byBleGVjdXRlIHRoZSBmbiBvbiBlYWNoIGVudHJ5XHJcbiAgICogaWYgaXQgYWludCBhbiBhcnJheSB3ZSBkb24ndCB3YW50IHRvIGRvIGEgdGhpbmcuXHJcbiAgICogdGhpcyBpcyB1c2VkIGJ5IGFsbCB0aGUgbWV0aG9kcyB0aGF0IGFjY2VwdCBhIHNpbmdsZSBhbmQgYXJyYXkgYXJndW1lbnQuXHJcbiAgICogQHBhcmFtIHsqfEFycmF5fSBhcmdcclxuICAgKiBAcGFyYW0ge1N0cmluZ30gZm5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW2NvbnRleHRdXHJcbiAgICogQHJldHVybnMge0Jvb2xlYW59XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gaW52b2tlQXJyYXlBcmcoYXJnLCBmbiwgY29udGV4dCkge1xyXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XHJcbiAgICAgICAgICBlYWNoKGFyZywgY29udGV4dFtmbl0sIGNvbnRleHQpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBcclxuICAvKipcclxuICAgKiB3YWxrIG9iamVjdHMgYW5kIGFycmF5c1xyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRvclxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZWFjaChvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XHJcbiAgICAgIHZhciBpO1xyXG4gIFxyXG4gICAgICBpZiAoIW9iaikge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgXHJcbiAgICAgIGlmIChvYmouZm9yRWFjaCkge1xyXG4gICAgICAgICAgb2JqLmZvckVhY2goaXRlcmF0b3IsIGNvbnRleHQpO1xyXG4gICAgICB9IGVsc2UgaWYgKG9iai5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgaSA9IDA7XHJcbiAgICAgICAgICB3aGlsZSAoaSA8IG9iai5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSwgb2JqKTtcclxuICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBmb3IgKGkgaW4gb2JqKSB7XHJcbiAgICAgICAgICAgICAgb2JqLmhhc093blByb3BlcnR5KGkpICYmIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2ldLCBpLCBvYmopO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIHdyYXAgYSBtZXRob2Qgd2l0aCBhIGRlcHJlY2F0aW9uIHdhcm5pbmcgYW5kIHN0YWNrIHRyYWNlXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbWV0aG9kXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcclxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxyXG4gICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBuZXcgZnVuY3Rpb24gd3JhcHBpbmcgdGhlIHN1cHBsaWVkIG1ldGhvZC5cclxuICAgKi9cclxuICBmdW5jdGlvbiBkZXByZWNhdGUobWV0aG9kLCBuYW1lLCBtZXNzYWdlKSB7XHJcbiAgICAgIHZhciBkZXByZWNhdGlvbk1lc3NhZ2UgPSAnREVQUkVDQVRFRCBNRVRIT0Q6ICcgKyBuYW1lICsgJ1xcbicgKyBtZXNzYWdlICsgJyBBVCBcXG4nO1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB2YXIgZSA9IG5ldyBFcnJvcignZ2V0LXN0YWNrLXRyYWNlJyk7XHJcbiAgICAgICAgICB2YXIgc3RhY2sgPSBlICYmIGUuc3RhY2sgPyBlLnN0YWNrLnJlcGxhY2UoL15bXlxcKF0rP1tcXG4kXS9nbSwgJycpXHJcbiAgICAgICAgICAgICAgLnJlcGxhY2UoL15cXHMrYXRcXHMrL2dtLCAnJylcclxuICAgICAgICAgICAgICAucmVwbGFjZSgvXk9iamVjdC48YW5vbnltb3VzPlxccypcXCgvZ20sICd7YW5vbnltb3VzfSgpQCcpIDogJ1Vua25vd24gU3RhY2sgVHJhY2UnO1xyXG4gIFxyXG4gICAgICAgICAgdmFyIGxvZyA9IHdpbmRvdy5jb25zb2xlICYmICh3aW5kb3cuY29uc29sZS53YXJuIHx8IHdpbmRvdy5jb25zb2xlLmxvZyk7XHJcbiAgICAgICAgICBpZiAobG9nKSB7XHJcbiAgICAgICAgICAgICAgbG9nLmNhbGwod2luZG93LmNvbnNvbGUsIGRlcHJlY2F0aW9uTWVzc2FnZSwgc3RhY2spO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgICB9O1xyXG4gIH1cclxuICBcclxuICAvKipcclxuICAgKiBleHRlbmQgb2JqZWN0LlxyXG4gICAqIG1lYW5zIHRoYXQgcHJvcGVydGllcyBpbiBkZXN0IHdpbGwgYmUgb3ZlcndyaXR0ZW4gYnkgdGhlIG9uZXMgaW4gc3JjLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXRcclxuICAgKiBAcGFyYW0gey4uLk9iamVjdH0gb2JqZWN0c190b19hc3NpZ25cclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSB0YXJnZXRcclxuICAgKi9cclxuICB2YXIgYXNzaWduO1xyXG4gIGlmICh0eXBlb2YgT2JqZWN0LmFzc2lnbiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBhc3NpZ24gPSBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0KSB7XHJcbiAgICAgICAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgdW5kZWZpbmVkIG9yIG51bGwgdG8gb2JqZWN0Jyk7XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICB2YXIgb3V0cHV0ID0gT2JqZWN0KHRhcmdldCk7XHJcbiAgICAgICAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgYXJndW1lbnRzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaW5kZXhdO1xyXG4gICAgICAgICAgICAgIGlmIChzb3VyY2UgIT09IHVuZGVmaW5lZCAmJiBzb3VyY2UgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgZm9yICh2YXIgbmV4dEtleSBpbiBzb3VyY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkobmV4dEtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRbbmV4dEtleV0gPSBzb3VyY2VbbmV4dEtleV07XHJcbiAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gb3V0cHV0O1xyXG4gICAgICB9O1xyXG4gIH0gZWxzZSB7XHJcbiAgICAgIGFzc2lnbiA9IE9iamVjdC5hc3NpZ247XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIGV4dGVuZCBvYmplY3QuXHJcbiAgICogbWVhbnMgdGhhdCBwcm9wZXJ0aWVzIGluIGRlc3Qgd2lsbCBiZSBvdmVyd3JpdHRlbiBieSB0aGUgb25lcyBpbiBzcmMuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGRlc3RcclxuICAgKiBAcGFyYW0ge09iamVjdH0gc3JjXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBbbWVyZ2U9ZmFsc2VdXHJcbiAgICogQHJldHVybnMge09iamVjdH0gZGVzdFxyXG4gICAqL1xyXG4gIHZhciBleHRlbmQgPSBkZXByZWNhdGUoZnVuY3Rpb24gZXh0ZW5kKGRlc3QsIHNyYywgbWVyZ2UpIHtcclxuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhzcmMpO1xyXG4gICAgICB2YXIgaSA9IDA7XHJcbiAgICAgIHdoaWxlIChpIDwga2V5cy5sZW5ndGgpIHtcclxuICAgICAgICAgIGlmICghbWVyZ2UgfHwgKG1lcmdlICYmIGRlc3Rba2V5c1tpXV0gPT09IHVuZGVmaW5lZCkpIHtcclxuICAgICAgICAgICAgICBkZXN0W2tleXNbaV1dID0gc3JjW2tleXNbaV1dO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaSsrO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBkZXN0O1xyXG4gIH0sICdleHRlbmQnLCAnVXNlIGBhc3NpZ25gLicpO1xyXG4gIFxyXG4gIC8qKlxyXG4gICAqIG1lcmdlIHRoZSB2YWx1ZXMgZnJvbSBzcmMgaW4gdGhlIGRlc3QuXHJcbiAgICogbWVhbnMgdGhhdCBwcm9wZXJ0aWVzIHRoYXQgZXhpc3QgaW4gZGVzdCB3aWxsIG5vdCBiZSBvdmVyd3JpdHRlbiBieSBzcmNcclxuICAgKiBAcGFyYW0ge09iamVjdH0gZGVzdFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzcmNcclxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBkZXN0XHJcbiAgICovXHJcbiAgdmFyIG1lcmdlID0gZGVwcmVjYXRlKGZ1bmN0aW9uIG1lcmdlKGRlc3QsIHNyYykge1xyXG4gICAgICByZXR1cm4gZXh0ZW5kKGRlc3QsIHNyYywgdHJ1ZSk7XHJcbiAgfSwgJ21lcmdlJywgJ1VzZSBgYXNzaWduYC4nKTtcclxuICBcclxuICAvKipcclxuICAgKiBzaW1wbGUgY2xhc3MgaW5oZXJpdGFuY2VcclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjaGlsZFxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGJhc2VcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXNdXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gaW5oZXJpdChjaGlsZCwgYmFzZSwgcHJvcGVydGllcykge1xyXG4gICAgICB2YXIgYmFzZVAgPSBiYXNlLnByb3RvdHlwZSxcclxuICAgICAgICAgIGNoaWxkUDtcclxuICBcclxuICAgICAgY2hpbGRQID0gY2hpbGQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShiYXNlUCk7XHJcbiAgICAgIGNoaWxkUC5jb25zdHJ1Y3RvciA9IGNoaWxkO1xyXG4gICAgICBjaGlsZFAuX3N1cGVyID0gYmFzZVA7XHJcbiAgXHJcbiAgICAgIGlmIChwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICBhc3NpZ24oY2hpbGRQLCBwcm9wZXJ0aWVzKTtcclxuICAgICAgfVxyXG4gIH1cclxuICBcclxuICAvKipcclxuICAgKiBzaW1wbGUgZnVuY3Rpb24gYmluZFxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcclxuICAgKiBAcmV0dXJucyB7RnVuY3Rpb259XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gYmluZEZuKGZuLCBjb250ZXh0KSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiBib3VuZEZuKCkge1xyXG4gICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XHJcbiAgICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIGxldCBhIGJvb2xlYW4gdmFsdWUgYWxzbyBiZSBhIGZ1bmN0aW9uIHRoYXQgbXVzdCByZXR1cm4gYSBib29sZWFuXHJcbiAgICogdGhpcyBmaXJzdCBpdGVtIGluIGFyZ3Mgd2lsbCBiZSB1c2VkIGFzIHRoZSBjb250ZXh0XHJcbiAgICogQHBhcmFtIHtCb29sZWFufEZ1bmN0aW9ufSB2YWxcclxuICAgKiBAcGFyYW0ge0FycmF5fSBbYXJnc11cclxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cclxuICAgKi9cclxuICBmdW5jdGlvbiBib29sT3JGbih2YWwsIGFyZ3MpIHtcclxuICAgICAgaWYgKHR5cGVvZiB2YWwgPT0gVFlQRV9GVU5DVElPTikge1xyXG4gICAgICAgICAgcmV0dXJuIHZhbC5hcHBseShhcmdzID8gYXJnc1swXSB8fCB1bmRlZmluZWQgOiB1bmRlZmluZWQsIGFyZ3MpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB2YWw7XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIHVzZSB0aGUgdmFsMiB3aGVuIHZhbDEgaXMgdW5kZWZpbmVkXHJcbiAgICogQHBhcmFtIHsqfSB2YWwxXHJcbiAgICogQHBhcmFtIHsqfSB2YWwyXHJcbiAgICogQHJldHVybnMgeyp9XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gaWZVbmRlZmluZWQodmFsMSwgdmFsMikge1xyXG4gICAgICByZXR1cm4gKHZhbDEgPT09IHVuZGVmaW5lZCkgPyB2YWwyIDogdmFsMTtcclxuICB9XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogYWRkRXZlbnRMaXN0ZW5lciB3aXRoIG11bHRpcGxlIGV2ZW50cyBhdCBvbmNlXHJcbiAgICogQHBhcmFtIHtFdmVudFRhcmdldH0gdGFyZ2V0XHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVzXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXJzKHRhcmdldCwgdHlwZXMsIGhhbmRsZXIpIHtcclxuICAgICAgZWFjaChzcGxpdFN0cih0eXBlcyksIGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgICAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIsIGZhbHNlKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIHJlbW92ZUV2ZW50TGlzdGVuZXIgd2l0aCBtdWx0aXBsZSBldmVudHMgYXQgb25jZVxyXG4gICAqIEBwYXJhbSB7RXZlbnRUYXJnZXR9IHRhcmdldFxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlc1xyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcclxuICAgKi9cclxuICBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVycyh0YXJnZXQsIHR5cGVzLCBoYW5kbGVyKSB7XHJcbiAgICAgIGVhY2goc3BsaXRTdHIodHlwZXMpLCBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyLCBmYWxzZSk7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuICBcclxuICAvKipcclxuICAgKiBmaW5kIGlmIGEgbm9kZSBpcyBpbiB0aGUgZ2l2ZW4gcGFyZW50XHJcbiAgICogQG1ldGhvZCBoYXNQYXJlbnRcclxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBub2RlXHJcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyZW50XHJcbiAgICogQHJldHVybiB7Qm9vbGVhbn0gZm91bmRcclxuICAgKi9cclxuICBmdW5jdGlvbiBoYXNQYXJlbnQobm9kZSwgcGFyZW50KSB7XHJcbiAgICAgIHdoaWxlIChub2RlKSB7XHJcbiAgICAgICAgICBpZiAobm9kZSA9PSBwYXJlbnQpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBcclxuICAvKipcclxuICAgKiBzbWFsbCBpbmRleE9mIHdyYXBwZXJcclxuICAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGZpbmRcclxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gZm91bmRcclxuICAgKi9cclxuICBmdW5jdGlvbiBpblN0cihzdHIsIGZpbmQpIHtcclxuICAgICAgcmV0dXJuIHN0ci5pbmRleE9mKGZpbmQpID4gLTE7XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIHNwbGl0IHN0cmluZyBvbiB3aGl0ZXNwYWNlXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IHN0clxyXG4gICAqIEByZXR1cm5zIHtBcnJheX0gd29yZHNcclxuICAgKi9cclxuICBmdW5jdGlvbiBzcGxpdFN0cihzdHIpIHtcclxuICAgICAgcmV0dXJuIHN0ci50cmltKCkuc3BsaXQoL1xccysvZyk7XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIGZpbmQgaWYgYSBhcnJheSBjb250YWlucyB0aGUgb2JqZWN0IHVzaW5nIGluZGV4T2Ygb3IgYSBzaW1wbGUgcG9seUZpbGxcclxuICAgKiBAcGFyYW0ge0FycmF5fSBzcmNcclxuICAgKiBAcGFyYW0ge1N0cmluZ30gZmluZFxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbZmluZEJ5S2V5XVxyXG4gICAqIEByZXR1cm4ge0Jvb2xlYW58TnVtYmVyfSBmYWxzZSB3aGVuIG5vdCBmb3VuZCwgb3IgdGhlIGluZGV4XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gaW5BcnJheShzcmMsIGZpbmQsIGZpbmRCeUtleSkge1xyXG4gICAgICBpZiAoc3JjLmluZGV4T2YgJiYgIWZpbmRCeUtleSkge1xyXG4gICAgICAgICAgcmV0dXJuIHNyYy5pbmRleE9mKGZpbmQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdmFyIGkgPSAwO1xyXG4gICAgICAgICAgd2hpbGUgKGkgPCBzcmMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgaWYgKChmaW5kQnlLZXkgJiYgc3JjW2ldW2ZpbmRCeUtleV0gPT0gZmluZCkgfHwgKCFmaW5kQnlLZXkgJiYgc3JjW2ldID09PSBmaW5kKSkge1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIGNvbnZlcnQgYXJyYXktbGlrZSBvYmplY3RzIHRvIHJlYWwgYXJyYXlzXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IG9ialxyXG4gICAqIEByZXR1cm5zIHtBcnJheX1cclxuICAgKi9cclxuICBmdW5jdGlvbiB0b0FycmF5KG9iaikge1xyXG4gICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwob2JqLCAwKTtcclxuICB9XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogdW5pcXVlIGFycmF5IHdpdGggb2JqZWN0cyBiYXNlZCBvbiBhIGtleSAobGlrZSAnaWQnKSBvciBqdXN0IGJ5IHRoZSBhcnJheSdzIHZhbHVlXHJcbiAgICogQHBhcmFtIHtBcnJheX0gc3JjIFt7aWQ6MX0se2lkOjJ9LHtpZDoxfV1cclxuICAgKiBAcGFyYW0ge1N0cmluZ30gW2tleV1cclxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtzb3J0PUZhbHNlXVxyXG4gICAqIEByZXR1cm5zIHtBcnJheX0gW3tpZDoxfSx7aWQ6Mn1dXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gdW5pcXVlQXJyYXkoc3JjLCBrZXksIHNvcnQpIHtcclxuICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcclxuICAgICAgdmFyIHZhbHVlcyA9IFtdO1xyXG4gICAgICB2YXIgaSA9IDA7XHJcbiAgXHJcbiAgICAgIHdoaWxlIChpIDwgc3JjLmxlbmd0aCkge1xyXG4gICAgICAgICAgdmFyIHZhbCA9IGtleSA/IHNyY1tpXVtrZXldIDogc3JjW2ldO1xyXG4gICAgICAgICAgaWYgKGluQXJyYXkodmFsdWVzLCB2YWwpIDwgMCkge1xyXG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaChzcmNbaV0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdmFsdWVzW2ldID0gdmFsO1xyXG4gICAgICAgICAgaSsrO1xyXG4gICAgICB9XHJcbiAgXHJcbiAgICAgIGlmIChzb3J0KSB7XHJcbiAgICAgICAgICBpZiAoIWtleSkge1xyXG4gICAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLnNvcnQoKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuc29ydChmdW5jdGlvbiBzb3J0VW5pcXVlQXJyYXkoYSwgYikge1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gYVtrZXldID4gYltrZXldO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgXHJcbiAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gIH1cclxuICBcclxuICAvKipcclxuICAgKiBnZXQgdGhlIHByZWZpeGVkIHByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IG9ialxyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxyXG4gICAqIEByZXR1cm5zIHtTdHJpbmd8VW5kZWZpbmVkfSBwcmVmaXhlZFxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHByZWZpeGVkKG9iaiwgcHJvcGVydHkpIHtcclxuICAgICAgdmFyIHByZWZpeCwgcHJvcDtcclxuICAgICAgdmFyIGNhbWVsUHJvcCA9IHByb3BlcnR5WzBdLnRvVXBwZXJDYXNlKCkgKyBwcm9wZXJ0eS5zbGljZSgxKTtcclxuICBcclxuICAgICAgdmFyIGkgPSAwO1xyXG4gICAgICB3aGlsZSAoaSA8IFZFTkRPUl9QUkVGSVhFUy5sZW5ndGgpIHtcclxuICAgICAgICAgIHByZWZpeCA9IFZFTkRPUl9QUkVGSVhFU1tpXTtcclxuICAgICAgICAgIHByb3AgPSAocHJlZml4KSA/IHByZWZpeCArIGNhbWVsUHJvcCA6IHByb3BlcnR5O1xyXG4gIFxyXG4gICAgICAgICAgaWYgKHByb3AgaW4gb2JqKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHByb3A7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpKys7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICB9XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogZ2V0IGEgdW5pcXVlIGlkXHJcbiAgICogQHJldHVybnMge251bWJlcn0gdW5pcXVlSWRcclxuICAgKi9cclxuICB2YXIgX3VuaXF1ZUlkID0gMTtcclxuICBmdW5jdGlvbiB1bmlxdWVJZCgpIHtcclxuICAgICAgcmV0dXJuIF91bmlxdWVJZCsrO1xyXG4gIH1cclxuICBcclxuICAvKipcclxuICAgKiBnZXQgdGhlIHdpbmRvdyBvYmplY3Qgb2YgYW4gZWxlbWVudFxyXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgKiBAcmV0dXJucyB7RG9jdW1lbnRWaWV3fFdpbmRvd31cclxuICAgKi9cclxuICBmdW5jdGlvbiBnZXRXaW5kb3dGb3JFbGVtZW50KGVsZW1lbnQpIHtcclxuICAgICAgdmFyIGRvYyA9IGVsZW1lbnQub3duZXJEb2N1bWVudCB8fCBlbGVtZW50O1xyXG4gICAgICByZXR1cm4gKGRvYy5kZWZhdWx0VmlldyB8fCBkb2MucGFyZW50V2luZG93IHx8IHdpbmRvdyk7XHJcbiAgfVxyXG4gIFxyXG4gIHZhciBNT0JJTEVfUkVHRVggPSAvbW9iaWxlfHRhYmxldHxpcChhZHxob25lfG9kKXxhbmRyb2lkL2k7XHJcbiAgXHJcbiAgdmFyIFNVUFBPUlRfVE9VQ0ggPSAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KTtcclxuICB2YXIgU1VQUE9SVF9QT0lOVEVSX0VWRU5UUyA9IHByZWZpeGVkKHdpbmRvdywgJ1BvaW50ZXJFdmVudCcpICE9PSB1bmRlZmluZWQ7XHJcbiAgdmFyIFNVUFBPUlRfT05MWV9UT1VDSCA9IFNVUFBPUlRfVE9VQ0ggJiYgTU9CSUxFX1JFR0VYLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XHJcbiAgXHJcbiAgdmFyIElOUFVUX1RZUEVfVE9VQ0ggPSAndG91Y2gnO1xyXG4gIHZhciBJTlBVVF9UWVBFX1BFTiA9ICdwZW4nO1xyXG4gIHZhciBJTlBVVF9UWVBFX01PVVNFID0gJ21vdXNlJztcclxuICB2YXIgSU5QVVRfVFlQRV9LSU5FQ1QgPSAna2luZWN0JztcclxuICBcclxuICB2YXIgQ09NUFVURV9JTlRFUlZBTCA9IDI1O1xyXG4gIFxyXG4gIHZhciBJTlBVVF9TVEFSVCA9IDE7XHJcbiAgdmFyIElOUFVUX01PVkUgPSAyO1xyXG4gIHZhciBJTlBVVF9FTkQgPSA0O1xyXG4gIHZhciBJTlBVVF9DQU5DRUwgPSA4O1xyXG4gIFxyXG4gIHZhciBESVJFQ1RJT05fTk9ORSA9IDE7XHJcbiAgdmFyIERJUkVDVElPTl9MRUZUID0gMjtcclxuICB2YXIgRElSRUNUSU9OX1JJR0hUID0gNDtcclxuICB2YXIgRElSRUNUSU9OX1VQID0gODtcclxuICB2YXIgRElSRUNUSU9OX0RPV04gPSAxNjtcclxuICBcclxuICB2YXIgRElSRUNUSU9OX0hPUklaT05UQUwgPSBESVJFQ1RJT05fTEVGVCB8IERJUkVDVElPTl9SSUdIVDtcclxuICB2YXIgRElSRUNUSU9OX1ZFUlRJQ0FMID0gRElSRUNUSU9OX1VQIHwgRElSRUNUSU9OX0RPV047XHJcbiAgdmFyIERJUkVDVElPTl9BTEwgPSBESVJFQ1RJT05fSE9SSVpPTlRBTCB8IERJUkVDVElPTl9WRVJUSUNBTDtcclxuICBcclxuICB2YXIgUFJPUFNfWFkgPSBbJ3gnLCAneSddO1xyXG4gIHZhciBQUk9QU19DTElFTlRfWFkgPSBbJ2NsaWVudFgnLCAnY2xpZW50WSddO1xyXG4gIFxyXG4gIC8qKlxyXG4gICAqIGNyZWF0ZSBuZXcgaW5wdXQgdHlwZSBtYW5hZ2VyXHJcbiAgICogQHBhcmFtIHtNYW5hZ2VyfSBtYW5hZ2VyXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcclxuICAgKiBAcmV0dXJucyB7SW5wdXR9XHJcbiAgICogQGNvbnN0cnVjdG9yXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gSW5wdXQobWFuYWdlciwgY2FsbGJhY2spIHtcclxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICB0aGlzLm1hbmFnZXIgPSBtYW5hZ2VyO1xyXG4gICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgIHRoaXMuZWxlbWVudCA9IG1hbmFnZXIuZWxlbWVudDtcclxuICAgICAgdGhpcy50YXJnZXQgPSBtYW5hZ2VyLm9wdGlvbnMuaW5wdXRUYXJnZXQ7XHJcbiAgXHJcbiAgICAgIC8vIHNtYWxsZXIgd3JhcHBlciBhcm91bmQgdGhlIGhhbmRsZXIsIGZvciB0aGUgc2NvcGUgYW5kIHRoZSBlbmFibGVkIHN0YXRlIG9mIHRoZSBtYW5hZ2VyLFxyXG4gICAgICAvLyBzbyB3aGVuIGRpc2FibGVkIHRoZSBpbnB1dCBldmVudHMgYXJlIGNvbXBsZXRlbHkgYnlwYXNzZWQuXHJcbiAgICAgIHRoaXMuZG9tSGFuZGxlciA9IGZ1bmN0aW9uKGV2KSB7XHJcbiAgICAgICAgICBpZiAoYm9vbE9yRm4obWFuYWdlci5vcHRpb25zLmVuYWJsZSwgW21hbmFnZXJdKSkge1xyXG4gICAgICAgICAgICAgIHNlbGYuaGFuZGxlcihldik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgXHJcbiAgICAgIHRoaXMuaW5pdCgpO1xyXG4gIFxyXG4gIH1cclxuICBcclxuICBJbnB1dC5wcm90b3R5cGUgPSB7XHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBzaG91bGQgaGFuZGxlIHRoZSBpbnB1dEV2ZW50IGRhdGEgYW5kIHRyaWdnZXIgdGhlIGNhbGxiYWNrXHJcbiAgICAgICAqIEB2aXJ0dWFsXHJcbiAgICAgICAqL1xyXG4gICAgICBoYW5kbGVyOiBmdW5jdGlvbigpIHsgfSxcclxuICBcclxuICAgICAgLyoqXHJcbiAgICAgICAqIGJpbmQgdGhlIGV2ZW50c1xyXG4gICAgICAgKi9cclxuICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB0aGlzLmV2RWwgJiYgYWRkRXZlbnRMaXN0ZW5lcnModGhpcy5lbGVtZW50LCB0aGlzLmV2RWwsIHRoaXMuZG9tSGFuZGxlcik7XHJcbiAgICAgICAgICB0aGlzLmV2VGFyZ2V0ICYmIGFkZEV2ZW50TGlzdGVuZXJzKHRoaXMudGFyZ2V0LCB0aGlzLmV2VGFyZ2V0LCB0aGlzLmRvbUhhbmRsZXIpO1xyXG4gICAgICAgICAgdGhpcy5ldldpbiAmJiBhZGRFdmVudExpc3RlbmVycyhnZXRXaW5kb3dGb3JFbGVtZW50KHRoaXMuZWxlbWVudCksIHRoaXMuZXZXaW4sIHRoaXMuZG9tSGFuZGxlcik7XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiB1bmJpbmQgdGhlIGV2ZW50c1xyXG4gICAgICAgKi9cclxuICAgICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB0aGlzLmV2RWwgJiYgcmVtb3ZlRXZlbnRMaXN0ZW5lcnModGhpcy5lbGVtZW50LCB0aGlzLmV2RWwsIHRoaXMuZG9tSGFuZGxlcik7XHJcbiAgICAgICAgICB0aGlzLmV2VGFyZ2V0ICYmIHJlbW92ZUV2ZW50TGlzdGVuZXJzKHRoaXMudGFyZ2V0LCB0aGlzLmV2VGFyZ2V0LCB0aGlzLmRvbUhhbmRsZXIpO1xyXG4gICAgICAgICAgdGhpcy5ldldpbiAmJiByZW1vdmVFdmVudExpc3RlbmVycyhnZXRXaW5kb3dGb3JFbGVtZW50KHRoaXMuZWxlbWVudCksIHRoaXMuZXZXaW4sIHRoaXMuZG9tSGFuZGxlcik7XHJcbiAgICAgIH1cclxuICB9O1xyXG4gIFxyXG4gIC8qKlxyXG4gICAqIGNyZWF0ZSBuZXcgaW5wdXQgdHlwZSBtYW5hZ2VyXHJcbiAgICogY2FsbGVkIGJ5IHRoZSBNYW5hZ2VyIGNvbnN0cnVjdG9yXHJcbiAgICogQHBhcmFtIHtIYW1tZXJ9IG1hbmFnZXJcclxuICAgKiBAcmV0dXJucyB7SW5wdXR9XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gY3JlYXRlSW5wdXRJbnN0YW5jZShtYW5hZ2VyKSB7XHJcbiAgICAgIHZhciBUeXBlO1xyXG4gICAgICB2YXIgaW5wdXRDbGFzcyA9IG1hbmFnZXIub3B0aW9ucy5pbnB1dENsYXNzO1xyXG4gIFxyXG4gICAgICBpZiAoaW5wdXRDbGFzcykge1xyXG4gICAgICAgICAgVHlwZSA9IGlucHV0Q2xhc3M7XHJcbiAgICAgIH0gZWxzZSBpZiAoU1VQUE9SVF9QT0lOVEVSX0VWRU5UUykge1xyXG4gICAgICAgICAgVHlwZSA9IFBvaW50ZXJFdmVudElucHV0O1xyXG4gICAgICB9IGVsc2UgaWYgKFNVUFBPUlRfT05MWV9UT1VDSCkge1xyXG4gICAgICAgICAgVHlwZSA9IFRvdWNoSW5wdXQ7XHJcbiAgICAgIH0gZWxzZSBpZiAoIVNVUFBPUlRfVE9VQ0gpIHtcclxuICAgICAgICAgIFR5cGUgPSBNb3VzZUlucHV0O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgVHlwZSA9IFRvdWNoTW91c2VJbnB1dDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbmV3IChUeXBlKShtYW5hZ2VyLCBpbnB1dEhhbmRsZXIpO1xyXG4gIH1cclxuICBcclxuICAvKipcclxuICAgKiBoYW5kbGUgaW5wdXQgZXZlbnRzXHJcbiAgICogQHBhcmFtIHtNYW5hZ2VyfSBtYW5hZ2VyXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50VHlwZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dFxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGlucHV0SGFuZGxlcihtYW5hZ2VyLCBldmVudFR5cGUsIGlucHV0KSB7XHJcbiAgICAgIHZhciBwb2ludGVyc0xlbiA9IGlucHV0LnBvaW50ZXJzLmxlbmd0aDtcclxuICAgICAgdmFyIGNoYW5nZWRQb2ludGVyc0xlbiA9IGlucHV0LmNoYW5nZWRQb2ludGVycy5sZW5ndGg7XHJcbiAgICAgIHZhciBpc0ZpcnN0ID0gKGV2ZW50VHlwZSAmIElOUFVUX1NUQVJUICYmIChwb2ludGVyc0xlbiAtIGNoYW5nZWRQb2ludGVyc0xlbiA9PT0gMCkpO1xyXG4gICAgICB2YXIgaXNGaW5hbCA9IChldmVudFR5cGUgJiAoSU5QVVRfRU5EIHwgSU5QVVRfQ0FOQ0VMKSAmJiAocG9pbnRlcnNMZW4gLSBjaGFuZ2VkUG9pbnRlcnNMZW4gPT09IDApKTtcclxuICBcclxuICAgICAgaW5wdXQuaXNGaXJzdCA9ICEhaXNGaXJzdDtcclxuICAgICAgaW5wdXQuaXNGaW5hbCA9ICEhaXNGaW5hbDtcclxuICBcclxuICAgICAgaWYgKGlzRmlyc3QpIHtcclxuICAgICAgICAgIG1hbmFnZXIuc2Vzc2lvbiA9IHt9O1xyXG4gICAgICB9XHJcbiAgXHJcbiAgICAgIC8vIHNvdXJjZSBldmVudCBpcyB0aGUgbm9ybWFsaXplZCB2YWx1ZSBvZiB0aGUgZG9tRXZlbnRzXHJcbiAgICAgIC8vIGxpa2UgJ3RvdWNoc3RhcnQsIG1vdXNldXAsIHBvaW50ZXJkb3duJ1xyXG4gICAgICBpbnB1dC5ldmVudFR5cGUgPSBldmVudFR5cGU7XHJcbiAgXHJcbiAgICAgIC8vIGNvbXB1dGUgc2NhbGUsIHJvdGF0aW9uIGV0Y1xyXG4gICAgICBjb21wdXRlSW5wdXREYXRhKG1hbmFnZXIsIGlucHV0KTtcclxuICBcclxuICAgICAgLy8gZW1pdCBzZWNyZXQgZXZlbnRcclxuICAgICAgbWFuYWdlci5lbWl0KCdoYW1tZXIuaW5wdXQnLCBpbnB1dCk7XHJcbiAgXHJcbiAgICAgIG1hbmFnZXIucmVjb2duaXplKGlucHV0KTtcclxuICAgICAgbWFuYWdlci5zZXNzaW9uLnByZXZJbnB1dCA9IGlucHV0O1xyXG4gIH1cclxuICBcclxuICAvKipcclxuICAgKiBleHRlbmQgdGhlIGRhdGEgd2l0aCBzb21lIHVzYWJsZSBwcm9wZXJ0aWVzIGxpa2Ugc2NhbGUsIHJvdGF0ZSwgdmVsb2NpdHkgZXRjXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IG1hbmFnZXJcclxuICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcclxuICAgKi9cclxuICBmdW5jdGlvbiBjb21wdXRlSW5wdXREYXRhKG1hbmFnZXIsIGlucHV0KSB7XHJcbiAgICAgIHZhciBzZXNzaW9uID0gbWFuYWdlci5zZXNzaW9uO1xyXG4gICAgICB2YXIgcG9pbnRlcnMgPSBpbnB1dC5wb2ludGVycztcclxuICAgICAgdmFyIHBvaW50ZXJzTGVuZ3RoID0gcG9pbnRlcnMubGVuZ3RoO1xyXG4gIFxyXG4gICAgICAvLyBzdG9yZSB0aGUgZmlyc3QgaW5wdXQgdG8gY2FsY3VsYXRlIHRoZSBkaXN0YW5jZSBhbmQgZGlyZWN0aW9uXHJcbiAgICAgIGlmICghc2Vzc2lvbi5maXJzdElucHV0KSB7XHJcbiAgICAgICAgICBzZXNzaW9uLmZpcnN0SW5wdXQgPSBzaW1wbGVDbG9uZUlucHV0RGF0YShpbnB1dCk7XHJcbiAgICAgIH1cclxuICBcclxuICAgICAgLy8gdG8gY29tcHV0ZSBzY2FsZSBhbmQgcm90YXRpb24gd2UgbmVlZCB0byBzdG9yZSB0aGUgbXVsdGlwbGUgdG91Y2hlc1xyXG4gICAgICBpZiAocG9pbnRlcnNMZW5ndGggPiAxICYmICFzZXNzaW9uLmZpcnN0TXVsdGlwbGUpIHtcclxuICAgICAgICAgIHNlc3Npb24uZmlyc3RNdWx0aXBsZSA9IHNpbXBsZUNsb25lSW5wdXREYXRhKGlucHV0KTtcclxuICAgICAgfSBlbHNlIGlmIChwb2ludGVyc0xlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgc2Vzc2lvbi5maXJzdE11bHRpcGxlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICBcclxuICAgICAgdmFyIGZpcnN0SW5wdXQgPSBzZXNzaW9uLmZpcnN0SW5wdXQ7XHJcbiAgICAgIHZhciBmaXJzdE11bHRpcGxlID0gc2Vzc2lvbi5maXJzdE11bHRpcGxlO1xyXG4gICAgICB2YXIgb2Zmc2V0Q2VudGVyID0gZmlyc3RNdWx0aXBsZSA/IGZpcnN0TXVsdGlwbGUuY2VudGVyIDogZmlyc3RJbnB1dC5jZW50ZXI7XHJcbiAgXHJcbiAgICAgIHZhciBjZW50ZXIgPSBpbnB1dC5jZW50ZXIgPSBnZXRDZW50ZXIocG9pbnRlcnMpO1xyXG4gICAgICBpbnB1dC50aW1lU3RhbXAgPSBub3coKTtcclxuICAgICAgaW5wdXQuZGVsdGFUaW1lID0gaW5wdXQudGltZVN0YW1wIC0gZmlyc3RJbnB1dC50aW1lU3RhbXA7XHJcbiAgXHJcbiAgICAgIGlucHV0LmFuZ2xlID0gZ2V0QW5nbGUob2Zmc2V0Q2VudGVyLCBjZW50ZXIpO1xyXG4gICAgICBpbnB1dC5kaXN0YW5jZSA9IGdldERpc3RhbmNlKG9mZnNldENlbnRlciwgY2VudGVyKTtcclxuICBcclxuICAgICAgY29tcHV0ZURlbHRhWFkoc2Vzc2lvbiwgaW5wdXQpO1xyXG4gICAgICBpbnB1dC5vZmZzZXREaXJlY3Rpb24gPSBnZXREaXJlY3Rpb24oaW5wdXQuZGVsdGFYLCBpbnB1dC5kZWx0YVkpO1xyXG4gIFxyXG4gICAgICB2YXIgb3ZlcmFsbFZlbG9jaXR5ID0gZ2V0VmVsb2NpdHkoaW5wdXQuZGVsdGFUaW1lLCBpbnB1dC5kZWx0YVgsIGlucHV0LmRlbHRhWSk7XHJcbiAgICAgIGlucHV0Lm92ZXJhbGxWZWxvY2l0eVggPSBvdmVyYWxsVmVsb2NpdHkueDtcclxuICAgICAgaW5wdXQub3ZlcmFsbFZlbG9jaXR5WSA9IG92ZXJhbGxWZWxvY2l0eS55O1xyXG4gICAgICBpbnB1dC5vdmVyYWxsVmVsb2NpdHkgPSAoYWJzKG92ZXJhbGxWZWxvY2l0eS54KSA+IGFicyhvdmVyYWxsVmVsb2NpdHkueSkpID8gb3ZlcmFsbFZlbG9jaXR5LnggOiBvdmVyYWxsVmVsb2NpdHkueTtcclxuICBcclxuICAgICAgaW5wdXQuc2NhbGUgPSBmaXJzdE11bHRpcGxlID8gZ2V0U2NhbGUoZmlyc3RNdWx0aXBsZS5wb2ludGVycywgcG9pbnRlcnMpIDogMTtcclxuICAgICAgaW5wdXQucm90YXRpb24gPSBmaXJzdE11bHRpcGxlID8gZ2V0Um90YXRpb24oZmlyc3RNdWx0aXBsZS5wb2ludGVycywgcG9pbnRlcnMpIDogMDtcclxuICBcclxuICAgICAgaW5wdXQubWF4UG9pbnRlcnMgPSAhc2Vzc2lvbi5wcmV2SW5wdXQgPyBpbnB1dC5wb2ludGVycy5sZW5ndGggOiAoKGlucHV0LnBvaW50ZXJzLmxlbmd0aCA+XHJcbiAgICAgICAgICBzZXNzaW9uLnByZXZJbnB1dC5tYXhQb2ludGVycykgPyBpbnB1dC5wb2ludGVycy5sZW5ndGggOiBzZXNzaW9uLnByZXZJbnB1dC5tYXhQb2ludGVycyk7XHJcbiAgXHJcbiAgICAgIGNvbXB1dGVJbnRlcnZhbElucHV0RGF0YShzZXNzaW9uLCBpbnB1dCk7XHJcbiAgXHJcbiAgICAgIC8vIGZpbmQgdGhlIGNvcnJlY3QgdGFyZ2V0XHJcbiAgICAgIHZhciB0YXJnZXQgPSBtYW5hZ2VyLmVsZW1lbnQ7XHJcbiAgICAgIGlmIChoYXNQYXJlbnQoaW5wdXQuc3JjRXZlbnQudGFyZ2V0LCB0YXJnZXQpKSB7XHJcbiAgICAgICAgICB0YXJnZXQgPSBpbnB1dC5zcmNFdmVudC50YXJnZXQ7XHJcbiAgICAgIH1cclxuICAgICAgaW5wdXQudGFyZ2V0ID0gdGFyZ2V0O1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBjb21wdXRlRGVsdGFYWShzZXNzaW9uLCBpbnB1dCkge1xyXG4gICAgICB2YXIgY2VudGVyID0gaW5wdXQuY2VudGVyO1xyXG4gICAgICB2YXIgb2Zmc2V0ID0gc2Vzc2lvbi5vZmZzZXREZWx0YSB8fCB7fTtcclxuICAgICAgdmFyIHByZXZEZWx0YSA9IHNlc3Npb24ucHJldkRlbHRhIHx8IHt9O1xyXG4gICAgICB2YXIgcHJldklucHV0ID0gc2Vzc2lvbi5wcmV2SW5wdXQgfHwge307XHJcbiAgXHJcbiAgICAgIGlmIChpbnB1dC5ldmVudFR5cGUgPT09IElOUFVUX1NUQVJUIHx8IHByZXZJbnB1dC5ldmVudFR5cGUgPT09IElOUFVUX0VORCkge1xyXG4gICAgICAgICAgcHJldkRlbHRhID0gc2Vzc2lvbi5wcmV2RGVsdGEgPSB7XHJcbiAgICAgICAgICAgICAgeDogcHJldklucHV0LmRlbHRhWCB8fCAwLFxyXG4gICAgICAgICAgICAgIHk6IHByZXZJbnB1dC5kZWx0YVkgfHwgMFxyXG4gICAgICAgICAgfTtcclxuICBcclxuICAgICAgICAgIG9mZnNldCA9IHNlc3Npb24ub2Zmc2V0RGVsdGEgPSB7XHJcbiAgICAgICAgICAgICAgeDogY2VudGVyLngsXHJcbiAgICAgICAgICAgICAgeTogY2VudGVyLnlcclxuICAgICAgICAgIH07XHJcbiAgICAgIH1cclxuICBcclxuICAgICAgaW5wdXQuZGVsdGFYID0gcHJldkRlbHRhLnggKyAoY2VudGVyLnggLSBvZmZzZXQueCk7XHJcbiAgICAgIGlucHV0LmRlbHRhWSA9IHByZXZEZWx0YS55ICsgKGNlbnRlci55IC0gb2Zmc2V0LnkpO1xyXG4gIH1cclxuICBcclxuICAvKipcclxuICAgKiB2ZWxvY2l0eSBpcyBjYWxjdWxhdGVkIGV2ZXJ5IHggbXNcclxuICAgKiBAcGFyYW0ge09iamVjdH0gc2Vzc2lvblxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dFxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGNvbXB1dGVJbnRlcnZhbElucHV0RGF0YShzZXNzaW9uLCBpbnB1dCkge1xyXG4gICAgICB2YXIgbGFzdCA9IHNlc3Npb24ubGFzdEludGVydmFsIHx8IGlucHV0LFxyXG4gICAgICAgICAgZGVsdGFUaW1lID0gaW5wdXQudGltZVN0YW1wIC0gbGFzdC50aW1lU3RhbXAsXHJcbiAgICAgICAgICB2ZWxvY2l0eSwgdmVsb2NpdHlYLCB2ZWxvY2l0eVksIGRpcmVjdGlvbjtcclxuICBcclxuICAgICAgaWYgKGlucHV0LmV2ZW50VHlwZSAhPSBJTlBVVF9DQU5DRUwgJiYgKGRlbHRhVGltZSA+IENPTVBVVEVfSU5URVJWQUwgfHwgbGFzdC52ZWxvY2l0eSA9PT0gdW5kZWZpbmVkKSkge1xyXG4gICAgICAgICAgdmFyIGRlbHRhWCA9IGlucHV0LmRlbHRhWCAtIGxhc3QuZGVsdGFYO1xyXG4gICAgICAgICAgdmFyIGRlbHRhWSA9IGlucHV0LmRlbHRhWSAtIGxhc3QuZGVsdGFZO1xyXG4gIFxyXG4gICAgICAgICAgdmFyIHYgPSBnZXRWZWxvY2l0eShkZWx0YVRpbWUsIGRlbHRhWCwgZGVsdGFZKTtcclxuICAgICAgICAgIHZlbG9jaXR5WCA9IHYueDtcclxuICAgICAgICAgIHZlbG9jaXR5WSA9IHYueTtcclxuICAgICAgICAgIHZlbG9jaXR5ID0gKGFicyh2LngpID4gYWJzKHYueSkpID8gdi54IDogdi55O1xyXG4gICAgICAgICAgZGlyZWN0aW9uID0gZ2V0RGlyZWN0aW9uKGRlbHRhWCwgZGVsdGFZKTtcclxuICBcclxuICAgICAgICAgIHNlc3Npb24ubGFzdEludGVydmFsID0gaW5wdXQ7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyB1c2UgbGF0ZXN0IHZlbG9jaXR5IGluZm8gaWYgaXQgZG9lc24ndCBvdmVydGFrZSBhIG1pbmltdW0gcGVyaW9kXHJcbiAgICAgICAgICB2ZWxvY2l0eSA9IGxhc3QudmVsb2NpdHk7XHJcbiAgICAgICAgICB2ZWxvY2l0eVggPSBsYXN0LnZlbG9jaXR5WDtcclxuICAgICAgICAgIHZlbG9jaXR5WSA9IGxhc3QudmVsb2NpdHlZO1xyXG4gICAgICAgICAgZGlyZWN0aW9uID0gbGFzdC5kaXJlY3Rpb247XHJcbiAgICAgIH1cclxuICBcclxuICAgICAgaW5wdXQudmVsb2NpdHkgPSB2ZWxvY2l0eTtcclxuICAgICAgaW5wdXQudmVsb2NpdHlYID0gdmVsb2NpdHlYO1xyXG4gICAgICBpbnB1dC52ZWxvY2l0eVkgPSB2ZWxvY2l0eVk7XHJcbiAgICAgIGlucHV0LmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICB9XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogY3JlYXRlIGEgc2ltcGxlIGNsb25lIGZyb20gdGhlIGlucHV0IHVzZWQgZm9yIHN0b3JhZ2Ugb2YgZmlyc3RJbnB1dCBhbmQgZmlyc3RNdWx0aXBsZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dFxyXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IGNsb25lZElucHV0RGF0YVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHNpbXBsZUNsb25lSW5wdXREYXRhKGlucHV0KSB7XHJcbiAgICAgIC8vIG1ha2UgYSBzaW1wbGUgY29weSBvZiB0aGUgcG9pbnRlcnMgYmVjYXVzZSB3ZSB3aWxsIGdldCBhIHJlZmVyZW5jZSBpZiB3ZSBkb24ndFxyXG4gICAgICAvLyB3ZSBvbmx5IG5lZWQgY2xpZW50WFkgZm9yIHRoZSBjYWxjdWxhdGlvbnNcclxuICAgICAgdmFyIHBvaW50ZXJzID0gW107XHJcbiAgICAgIHZhciBpID0gMDtcclxuICAgICAgd2hpbGUgKGkgPCBpbnB1dC5wb2ludGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgIHBvaW50ZXJzW2ldID0ge1xyXG4gICAgICAgICAgICAgIGNsaWVudFg6IHJvdW5kKGlucHV0LnBvaW50ZXJzW2ldLmNsaWVudFgpLFxyXG4gICAgICAgICAgICAgIGNsaWVudFk6IHJvdW5kKGlucHV0LnBvaW50ZXJzW2ldLmNsaWVudFkpXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgaSsrO1xyXG4gICAgICB9XHJcbiAgXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0aW1lU3RhbXA6IG5vdygpLFxyXG4gICAgICAgICAgcG9pbnRlcnM6IHBvaW50ZXJzLFxyXG4gICAgICAgICAgY2VudGVyOiBnZXRDZW50ZXIocG9pbnRlcnMpLFxyXG4gICAgICAgICAgZGVsdGFYOiBpbnB1dC5kZWx0YVgsXHJcbiAgICAgICAgICBkZWx0YVk6IGlucHV0LmRlbHRhWVxyXG4gICAgICB9O1xyXG4gIH1cclxuICBcclxuICAvKipcclxuICAgKiBnZXQgdGhlIGNlbnRlciBvZiBhbGwgdGhlIHBvaW50ZXJzXHJcbiAgICogQHBhcmFtIHtBcnJheX0gcG9pbnRlcnNcclxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGNlbnRlciBjb250YWlucyBgeGAgYW5kIGB5YCBwcm9wZXJ0aWVzXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZ2V0Q2VudGVyKHBvaW50ZXJzKSB7XHJcbiAgICAgIHZhciBwb2ludGVyc0xlbmd0aCA9IHBvaW50ZXJzLmxlbmd0aDtcclxuICBcclxuICAgICAgLy8gbm8gbmVlZCB0byBsb29wIHdoZW4gb25seSBvbmUgdG91Y2hcclxuICAgICAgaWYgKHBvaW50ZXJzTGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgIHg6IHJvdW5kKHBvaW50ZXJzWzBdLmNsaWVudFgpLFxyXG4gICAgICAgICAgICAgIHk6IHJvdW5kKHBvaW50ZXJzWzBdLmNsaWVudFkpXHJcbiAgICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgXHJcbiAgICAgIHZhciB4ID0gMCwgeSA9IDAsIGkgPSAwO1xyXG4gICAgICB3aGlsZSAoaSA8IHBvaW50ZXJzTGVuZ3RoKSB7XHJcbiAgICAgICAgICB4ICs9IHBvaW50ZXJzW2ldLmNsaWVudFg7XHJcbiAgICAgICAgICB5ICs9IHBvaW50ZXJzW2ldLmNsaWVudFk7XHJcbiAgICAgICAgICBpKys7XHJcbiAgICAgIH1cclxuICBcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHg6IHJvdW5kKHggLyBwb2ludGVyc0xlbmd0aCksXHJcbiAgICAgICAgICB5OiByb3VuZCh5IC8gcG9pbnRlcnNMZW5ndGgpXHJcbiAgICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIGNhbGN1bGF0ZSB0aGUgdmVsb2NpdHkgYmV0d2VlbiB0d28gcG9pbnRzLiB1bml0IGlzIGluIHB4IHBlciBtcy5cclxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVsdGFUaW1lXHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge051bWJlcn0geVxyXG4gICAqIEByZXR1cm4ge09iamVjdH0gdmVsb2NpdHkgYHhgIGFuZCBgeWBcclxuICAgKi9cclxuICBmdW5jdGlvbiBnZXRWZWxvY2l0eShkZWx0YVRpbWUsIHgsIHkpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHg6IHggLyBkZWx0YVRpbWUgfHwgMCxcclxuICAgICAgICAgIHk6IHkgLyBkZWx0YVRpbWUgfHwgMFxyXG4gICAgICB9O1xyXG4gIH1cclxuICBcclxuICAvKipcclxuICAgKiBnZXQgdGhlIGRpcmVjdGlvbiBiZXR3ZWVuIHR3byBwb2ludHNcclxuICAgKiBAcGFyYW0ge051bWJlcn0geFxyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB5XHJcbiAgICogQHJldHVybiB7TnVtYmVyfSBkaXJlY3Rpb25cclxuICAgKi9cclxuICBmdW5jdGlvbiBnZXREaXJlY3Rpb24oeCwgeSkge1xyXG4gICAgICBpZiAoeCA9PT0geSkge1xyXG4gICAgICAgICAgcmV0dXJuIERJUkVDVElPTl9OT05FO1xyXG4gICAgICB9XHJcbiAgXHJcbiAgICAgIGlmIChhYnMoeCkgPj0gYWJzKHkpKSB7XHJcbiAgICAgICAgICByZXR1cm4geCA8IDAgPyBESVJFQ1RJT05fTEVGVCA6IERJUkVDVElPTl9SSUdIVDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4geSA8IDAgPyBESVJFQ1RJT05fVVAgOiBESVJFQ1RJT05fRE9XTjtcclxuICB9XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogY2FsY3VsYXRlIHRoZSBhYnNvbHV0ZSBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcclxuICAgKiBAcGFyYW0ge09iamVjdH0gcDEge3gsIHl9XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IHAyIHt4LCB5fVxyXG4gICAqIEBwYXJhbSB7QXJyYXl9IFtwcm9wc10gY29udGFpbmluZyB4IGFuZCB5IGtleXNcclxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGRpc3RhbmNlXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZ2V0RGlzdGFuY2UocDEsIHAyLCBwcm9wcykge1xyXG4gICAgICBpZiAoIXByb3BzKSB7XHJcbiAgICAgICAgICBwcm9wcyA9IFBST1BTX1hZO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciB4ID0gcDJbcHJvcHNbMF1dIC0gcDFbcHJvcHNbMF1dLFxyXG4gICAgICAgICAgeSA9IHAyW3Byb3BzWzFdXSAtIHAxW3Byb3BzWzFdXTtcclxuICBcclxuICAgICAgcmV0dXJuIE1hdGguc3FydCgoeCAqIHgpICsgKHkgKiB5KSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIGNhbGN1bGF0ZSB0aGUgYW5nbGUgYmV0d2VlbiB0d28gY29vcmRpbmF0ZXNcclxuICAgKiBAcGFyYW0ge09iamVjdH0gcDFcclxuICAgKiBAcGFyYW0ge09iamVjdH0gcDJcclxuICAgKiBAcGFyYW0ge0FycmF5fSBbcHJvcHNdIGNvbnRhaW5pbmcgeCBhbmQgeSBrZXlzXHJcbiAgICogQHJldHVybiB7TnVtYmVyfSBhbmdsZVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGdldEFuZ2xlKHAxLCBwMiwgcHJvcHMpIHtcclxuICAgICAgaWYgKCFwcm9wcykge1xyXG4gICAgICAgICAgcHJvcHMgPSBQUk9QU19YWTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgeCA9IHAyW3Byb3BzWzBdXSAtIHAxW3Byb3BzWzBdXSxcclxuICAgICAgICAgIHkgPSBwMltwcm9wc1sxXV0gLSBwMVtwcm9wc1sxXV07XHJcbiAgICAgIHJldHVybiBNYXRoLmF0YW4yKHksIHgpICogMTgwIC8gTWF0aC5QSTtcclxuICB9XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogY2FsY3VsYXRlIHRoZSByb3RhdGlvbiBkZWdyZWVzIGJldHdlZW4gdHdvIHBvaW50ZXJzZXRzXHJcbiAgICogQHBhcmFtIHtBcnJheX0gc3RhcnQgYXJyYXkgb2YgcG9pbnRlcnNcclxuICAgKiBAcGFyYW0ge0FycmF5fSBlbmQgYXJyYXkgb2YgcG9pbnRlcnNcclxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHJvdGF0aW9uXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZ2V0Um90YXRpb24oc3RhcnQsIGVuZCkge1xyXG4gICAgICByZXR1cm4gZ2V0QW5nbGUoZW5kWzFdLCBlbmRbMF0sIFBST1BTX0NMSUVOVF9YWSkgKyBnZXRBbmdsZShzdGFydFsxXSwgc3RhcnRbMF0sIFBST1BTX0NMSUVOVF9YWSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIGNhbGN1bGF0ZSB0aGUgc2NhbGUgZmFjdG9yIGJldHdlZW4gdHdvIHBvaW50ZXJzZXRzXHJcbiAgICogbm8gc2NhbGUgaXMgMSwgYW5kIGdvZXMgZG93biB0byAwIHdoZW4gcGluY2hlZCB0b2dldGhlciwgYW5kIGJpZ2dlciB3aGVuIHBpbmNoZWQgb3V0XHJcbiAgICogQHBhcmFtIHtBcnJheX0gc3RhcnQgYXJyYXkgb2YgcG9pbnRlcnNcclxuICAgKiBAcGFyYW0ge0FycmF5fSBlbmQgYXJyYXkgb2YgcG9pbnRlcnNcclxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHNjYWxlXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZ2V0U2NhbGUoc3RhcnQsIGVuZCkge1xyXG4gICAgICByZXR1cm4gZ2V0RGlzdGFuY2UoZW5kWzBdLCBlbmRbMV0sIFBST1BTX0NMSUVOVF9YWSkgLyBnZXREaXN0YW5jZShzdGFydFswXSwgc3RhcnRbMV0sIFBST1BTX0NMSUVOVF9YWSk7XHJcbiAgfVxyXG4gIFxyXG4gIHZhciBNT1VTRV9JTlBVVF9NQVAgPSB7XHJcbiAgICAgIG1vdXNlZG93bjogSU5QVVRfU1RBUlQsXHJcbiAgICAgIG1vdXNlbW92ZTogSU5QVVRfTU9WRSxcclxuICAgICAgbW91c2V1cDogSU5QVVRfRU5EXHJcbiAgfTtcclxuICBcclxuICB2YXIgTU9VU0VfRUxFTUVOVF9FVkVOVFMgPSAnbW91c2Vkb3duJztcclxuICB2YXIgTU9VU0VfV0lORE9XX0VWRU5UUyA9ICdtb3VzZW1vdmUgbW91c2V1cCc7XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogTW91c2UgZXZlbnRzIGlucHV0XHJcbiAgICogQGNvbnN0cnVjdG9yXHJcbiAgICogQGV4dGVuZHMgSW5wdXRcclxuICAgKi9cclxuICBmdW5jdGlvbiBNb3VzZUlucHV0KCkge1xyXG4gICAgICB0aGlzLmV2RWwgPSBNT1VTRV9FTEVNRU5UX0VWRU5UUztcclxuICAgICAgdGhpcy5ldldpbiA9IE1PVVNFX1dJTkRPV19FVkVOVFM7XHJcbiAgXHJcbiAgICAgIHRoaXMucHJlc3NlZCA9IGZhbHNlOyAvLyBtb3VzZWRvd24gc3RhdGVcclxuICBcclxuICAgICAgSW5wdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICB9XHJcbiAgXHJcbiAgaW5oZXJpdChNb3VzZUlucHV0LCBJbnB1dCwge1xyXG4gICAgICAvKipcclxuICAgICAgICogaGFuZGxlIG1vdXNlIGV2ZW50c1xyXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZcclxuICAgICAgICovXHJcbiAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uIE1FaGFuZGxlcihldikge1xyXG4gICAgICAgICAgdmFyIGV2ZW50VHlwZSA9IE1PVVNFX0lOUFVUX01BUFtldi50eXBlXTtcclxuICBcclxuICAgICAgICAgIC8vIG9uIHN0YXJ0IHdlIHdhbnQgdG8gaGF2ZSB0aGUgbGVmdCBtb3VzZSBidXR0b24gZG93blxyXG4gICAgICAgICAgaWYgKGV2ZW50VHlwZSAmIElOUFVUX1NUQVJUICYmIGV2LmJ1dHRvbiA9PT0gMCkge1xyXG4gICAgICAgICAgICAgIHRoaXMucHJlc3NlZCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICBpZiAoZXZlbnRUeXBlICYgSU5QVVRfTU9WRSAmJiBldi53aGljaCAhPT0gMSkge1xyXG4gICAgICAgICAgICAgIGV2ZW50VHlwZSA9IElOUFVUX0VORDtcclxuICAgICAgICAgIH1cclxuICBcclxuICAgICAgICAgIC8vIG1vdXNlIG11c3QgYmUgZG93blxyXG4gICAgICAgICAgaWYgKCF0aGlzLnByZXNzZWQpIHtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICBpZiAoZXZlbnRUeXBlICYgSU5QVVRfRU5EKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5wcmVzc2VkID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMubWFuYWdlciwgZXZlbnRUeXBlLCB7XHJcbiAgICAgICAgICAgICAgcG9pbnRlcnM6IFtldl0sXHJcbiAgICAgICAgICAgICAgY2hhbmdlZFBvaW50ZXJzOiBbZXZdLFxyXG4gICAgICAgICAgICAgIHBvaW50ZXJUeXBlOiBJTlBVVF9UWVBFX01PVVNFLFxyXG4gICAgICAgICAgICAgIHNyY0V2ZW50OiBldlxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICB9KTtcclxuICBcclxuICB2YXIgUE9JTlRFUl9JTlBVVF9NQVAgPSB7XHJcbiAgICAgIHBvaW50ZXJkb3duOiBJTlBVVF9TVEFSVCxcclxuICAgICAgcG9pbnRlcm1vdmU6IElOUFVUX01PVkUsXHJcbiAgICAgIHBvaW50ZXJ1cDogSU5QVVRfRU5ELFxyXG4gICAgICBwb2ludGVyY2FuY2VsOiBJTlBVVF9DQU5DRUwsXHJcbiAgICAgIHBvaW50ZXJvdXQ6IElOUFVUX0NBTkNFTFxyXG4gIH07XHJcbiAgXHJcbiAgLy8gaW4gSUUxMCB0aGUgcG9pbnRlciB0eXBlcyBpcyBkZWZpbmVkIGFzIGFuIGVudW1cclxuICB2YXIgSUUxMF9QT0lOVEVSX1RZUEVfRU5VTSA9IHtcclxuICAgICAgMjogSU5QVVRfVFlQRV9UT1VDSCxcclxuICAgICAgMzogSU5QVVRfVFlQRV9QRU4sXHJcbiAgICAgIDQ6IElOUFVUX1RZUEVfTU9VU0UsXHJcbiAgICAgIDU6IElOUFVUX1RZUEVfS0lORUNUIC8vIHNlZSBodHRwczovL3R3aXR0ZXIuY29tL2phY29icm9zc2kvc3RhdHVzLzQ4MDU5NjQzODQ4OTg5MDgxNlxyXG4gIH07XHJcbiAgXHJcbiAgdmFyIFBPSU5URVJfRUxFTUVOVF9FVkVOVFMgPSAncG9pbnRlcmRvd24nO1xyXG4gIHZhciBQT0lOVEVSX1dJTkRPV19FVkVOVFMgPSAncG9pbnRlcm1vdmUgcG9pbnRlcnVwIHBvaW50ZXJjYW5jZWwnO1xyXG4gIFxyXG4gIC8vIElFMTAgaGFzIHByZWZpeGVkIHN1cHBvcnQsIGFuZCBjYXNlLXNlbnNpdGl2ZVxyXG4gIGlmICh3aW5kb3cuTVNQb2ludGVyRXZlbnQgJiYgIXdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcclxuICAgICAgUE9JTlRFUl9FTEVNRU5UX0VWRU5UUyA9ICdNU1BvaW50ZXJEb3duJztcclxuICAgICAgUE9JTlRFUl9XSU5ET1dfRVZFTlRTID0gJ01TUG9pbnRlck1vdmUgTVNQb2ludGVyVXAgTVNQb2ludGVyQ2FuY2VsJztcclxuICB9XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogUG9pbnRlciBldmVudHMgaW5wdXRcclxuICAgKiBAY29uc3RydWN0b3JcclxuICAgKiBAZXh0ZW5kcyBJbnB1dFxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIFBvaW50ZXJFdmVudElucHV0KCkge1xyXG4gICAgICB0aGlzLmV2RWwgPSBQT0lOVEVSX0VMRU1FTlRfRVZFTlRTO1xyXG4gICAgICB0aGlzLmV2V2luID0gUE9JTlRFUl9XSU5ET1dfRVZFTlRTO1xyXG4gIFxyXG4gICAgICBJbnB1dC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gIFxyXG4gICAgICB0aGlzLnN0b3JlID0gKHRoaXMubWFuYWdlci5zZXNzaW9uLnBvaW50ZXJFdmVudHMgPSBbXSk7XHJcbiAgfVxyXG4gIFxyXG4gIGluaGVyaXQoUG9pbnRlckV2ZW50SW5wdXQsIElucHV0LCB7XHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBoYW5kbGUgbW91c2UgZXZlbnRzXHJcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldlxyXG4gICAgICAgKi9cclxuICAgICAgaGFuZGxlcjogZnVuY3Rpb24gUEVoYW5kbGVyKGV2KSB7XHJcbiAgICAgICAgICB2YXIgc3RvcmUgPSB0aGlzLnN0b3JlO1xyXG4gICAgICAgICAgdmFyIHJlbW92ZVBvaW50ZXIgPSBmYWxzZTtcclxuICBcclxuICAgICAgICAgIHZhciBldmVudFR5cGVOb3JtYWxpemVkID0gZXYudHlwZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoJ21zJywgJycpO1xyXG4gICAgICAgICAgdmFyIGV2ZW50VHlwZSA9IFBPSU5URVJfSU5QVVRfTUFQW2V2ZW50VHlwZU5vcm1hbGl6ZWRdO1xyXG4gICAgICAgICAgdmFyIHBvaW50ZXJUeXBlID0gSUUxMF9QT0lOVEVSX1RZUEVfRU5VTVtldi5wb2ludGVyVHlwZV0gfHwgZXYucG9pbnRlclR5cGU7XHJcbiAgXHJcbiAgICAgICAgICB2YXIgaXNUb3VjaCA9IChwb2ludGVyVHlwZSA9PSBJTlBVVF9UWVBFX1RPVUNIKTtcclxuICBcclxuICAgICAgICAgIC8vIGdldCBpbmRleCBvZiB0aGUgZXZlbnQgaW4gdGhlIHN0b3JlXHJcbiAgICAgICAgICB2YXIgc3RvcmVJbmRleCA9IGluQXJyYXkoc3RvcmUsIGV2LnBvaW50ZXJJZCwgJ3BvaW50ZXJJZCcpO1xyXG4gIFxyXG4gICAgICAgICAgLy8gc3RhcnQgYW5kIG1vdXNlIG11c3QgYmUgZG93blxyXG4gICAgICAgICAgaWYgKGV2ZW50VHlwZSAmIElOUFVUX1NUQVJUICYmIChldi5idXR0b24gPT09IDAgfHwgaXNUb3VjaCkpIHtcclxuICAgICAgICAgICAgICBpZiAoc3RvcmVJbmRleCA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgc3RvcmUucHVzaChldik7XHJcbiAgICAgICAgICAgICAgICAgIHN0b3JlSW5kZXggPSBzdG9yZS5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnRUeXBlICYgKElOUFVUX0VORCB8IElOUFVUX0NBTkNFTCkpIHtcclxuICAgICAgICAgICAgICByZW1vdmVQb2ludGVyID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICBcclxuICAgICAgICAgIC8vIGl0IG5vdCBmb3VuZCwgc28gdGhlIHBvaW50ZXIgaGFzbid0IGJlZW4gZG93biAoc28gaXQncyBwcm9iYWJseSBhIGhvdmVyKVxyXG4gICAgICAgICAgaWYgKHN0b3JlSW5kZXggPCAwKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgICAgLy8gdXBkYXRlIHRoZSBldmVudCBpbiB0aGUgc3RvcmVcclxuICAgICAgICAgIHN0b3JlW3N0b3JlSW5kZXhdID0gZXY7XHJcbiAgXHJcbiAgICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMubWFuYWdlciwgZXZlbnRUeXBlLCB7XHJcbiAgICAgICAgICAgICAgcG9pbnRlcnM6IHN0b3JlLFxyXG4gICAgICAgICAgICAgIGNoYW5nZWRQb2ludGVyczogW2V2XSxcclxuICAgICAgICAgICAgICBwb2ludGVyVHlwZTogcG9pbnRlclR5cGUsXHJcbiAgICAgICAgICAgICAgc3JjRXZlbnQ6IGV2XHJcbiAgICAgICAgICB9KTtcclxuICBcclxuICAgICAgICAgIGlmIChyZW1vdmVQb2ludGVyKSB7XHJcbiAgICAgICAgICAgICAgLy8gcmVtb3ZlIGZyb20gdGhlIHN0b3JlXHJcbiAgICAgICAgICAgICAgc3RvcmUuc3BsaWNlKHN0b3JlSW5kZXgsIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgfSk7XHJcbiAgXHJcbiAgdmFyIFNJTkdMRV9UT1VDSF9JTlBVVF9NQVAgPSB7XHJcbiAgICAgIHRvdWNoc3RhcnQ6IElOUFVUX1NUQVJULFxyXG4gICAgICB0b3VjaG1vdmU6IElOUFVUX01PVkUsXHJcbiAgICAgIHRvdWNoZW5kOiBJTlBVVF9FTkQsXHJcbiAgICAgIHRvdWNoY2FuY2VsOiBJTlBVVF9DQU5DRUxcclxuICB9O1xyXG4gIFxyXG4gIHZhciBTSU5HTEVfVE9VQ0hfVEFSR0VUX0VWRU5UUyA9ICd0b3VjaHN0YXJ0JztcclxuICB2YXIgU0lOR0xFX1RPVUNIX1dJTkRPV19FVkVOVFMgPSAndG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgdG91Y2hjYW5jZWwnO1xyXG4gIFxyXG4gIC8qKlxyXG4gICAqIFRvdWNoIGV2ZW50cyBpbnB1dFxyXG4gICAqIEBjb25zdHJ1Y3RvclxyXG4gICAqIEBleHRlbmRzIElucHV0XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gU2luZ2xlVG91Y2hJbnB1dCgpIHtcclxuICAgICAgdGhpcy5ldlRhcmdldCA9IFNJTkdMRV9UT1VDSF9UQVJHRVRfRVZFTlRTO1xyXG4gICAgICB0aGlzLmV2V2luID0gU0lOR0xFX1RPVUNIX1dJTkRPV19FVkVOVFM7XHJcbiAgICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xyXG4gIFxyXG4gICAgICBJbnB1dC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gIH1cclxuICBcclxuICBpbmhlcml0KFNpbmdsZVRvdWNoSW5wdXQsIElucHV0LCB7XHJcbiAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uIFRFaGFuZGxlcihldikge1xyXG4gICAgICAgICAgdmFyIHR5cGUgPSBTSU5HTEVfVE9VQ0hfSU5QVVRfTUFQW2V2LnR5cGVdO1xyXG4gIFxyXG4gICAgICAgICAgLy8gc2hvdWxkIHdlIGhhbmRsZSB0aGUgdG91Y2ggZXZlbnRzP1xyXG4gICAgICAgICAgaWYgKHR5cGUgPT09IElOUFVUX1NUQVJUKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5zdGFydGVkID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICBcclxuICAgICAgICAgIGlmICghdGhpcy5zdGFydGVkKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgICAgdmFyIHRvdWNoZXMgPSBub3JtYWxpemVTaW5nbGVUb3VjaGVzLmNhbGwodGhpcywgZXYsIHR5cGUpO1xyXG4gIFxyXG4gICAgICAgICAgLy8gd2hlbiBkb25lLCByZXNldCB0aGUgc3RhcnRlZCBzdGF0ZVxyXG4gICAgICAgICAgaWYgKHR5cGUgJiAoSU5QVVRfRU5EIHwgSU5QVVRfQ0FOQ0VMKSAmJiB0b3VjaGVzWzBdLmxlbmd0aCAtIHRvdWNoZXNbMV0ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5zdGFydGVkID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMubWFuYWdlciwgdHlwZSwge1xyXG4gICAgICAgICAgICAgIHBvaW50ZXJzOiB0b3VjaGVzWzBdLFxyXG4gICAgICAgICAgICAgIGNoYW5nZWRQb2ludGVyczogdG91Y2hlc1sxXSxcclxuICAgICAgICAgICAgICBwb2ludGVyVHlwZTogSU5QVVRfVFlQRV9UT1VDSCxcclxuICAgICAgICAgICAgICBzcmNFdmVudDogZXZcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgfSk7XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogQHRoaXMge1RvdWNoSW5wdXR9XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGV2XHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHR5cGUgZmxhZ1xyXG4gICAqIEByZXR1cm5zIHt1bmRlZmluZWR8QXJyYXl9IFthbGwsIGNoYW5nZWRdXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gbm9ybWFsaXplU2luZ2xlVG91Y2hlcyhldiwgdHlwZSkge1xyXG4gICAgICB2YXIgYWxsID0gdG9BcnJheShldi50b3VjaGVzKTtcclxuICAgICAgdmFyIGNoYW5nZWQgPSB0b0FycmF5KGV2LmNoYW5nZWRUb3VjaGVzKTtcclxuICBcclxuICAgICAgaWYgKHR5cGUgJiAoSU5QVVRfRU5EIHwgSU5QVVRfQ0FOQ0VMKSkge1xyXG4gICAgICAgICAgYWxsID0gdW5pcXVlQXJyYXkoYWxsLmNvbmNhdChjaGFuZ2VkKSwgJ2lkZW50aWZpZXInLCB0cnVlKTtcclxuICAgICAgfVxyXG4gIFxyXG4gICAgICByZXR1cm4gW2FsbCwgY2hhbmdlZF07XHJcbiAgfVxyXG4gIFxyXG4gIHZhciBUT1VDSF9JTlBVVF9NQVAgPSB7XHJcbiAgICAgIHRvdWNoc3RhcnQ6IElOUFVUX1NUQVJULFxyXG4gICAgICB0b3VjaG1vdmU6IElOUFVUX01PVkUsXHJcbiAgICAgIHRvdWNoZW5kOiBJTlBVVF9FTkQsXHJcbiAgICAgIHRvdWNoY2FuY2VsOiBJTlBVVF9DQU5DRUxcclxuICB9O1xyXG4gIFxyXG4gIHZhciBUT1VDSF9UQVJHRVRfRVZFTlRTID0gJ3RvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsJztcclxuICBcclxuICAvKipcclxuICAgKiBNdWx0aS11c2VyIHRvdWNoIGV2ZW50cyBpbnB1dFxyXG4gICAqIEBjb25zdHJ1Y3RvclxyXG4gICAqIEBleHRlbmRzIElucHV0XHJcbiAgICovXHJcbiAgZnVuY3Rpb24gVG91Y2hJbnB1dCgpIHtcclxuICAgICAgdGhpcy5ldlRhcmdldCA9IFRPVUNIX1RBUkdFVF9FVkVOVFM7XHJcbiAgICAgIHRoaXMudGFyZ2V0SWRzID0ge307XHJcbiAgXHJcbiAgICAgIElucHV0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgfVxyXG4gIFxyXG4gIGluaGVyaXQoVG91Y2hJbnB1dCwgSW5wdXQsIHtcclxuICAgICAgaGFuZGxlcjogZnVuY3Rpb24gTVRFaGFuZGxlcihldikge1xyXG4gICAgICAgICAgdmFyIHR5cGUgPSBUT1VDSF9JTlBVVF9NQVBbZXYudHlwZV07XHJcbiAgICAgICAgICB2YXIgdG91Y2hlcyA9IGdldFRvdWNoZXMuY2FsbCh0aGlzLCBldiwgdHlwZSk7XHJcbiAgICAgICAgICBpZiAoIXRvdWNoZXMpIHtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMubWFuYWdlciwgdHlwZSwge1xyXG4gICAgICAgICAgICAgIHBvaW50ZXJzOiB0b3VjaGVzWzBdLFxyXG4gICAgICAgICAgICAgIGNoYW5nZWRQb2ludGVyczogdG91Y2hlc1sxXSxcclxuICAgICAgICAgICAgICBwb2ludGVyVHlwZTogSU5QVVRfVFlQRV9UT1VDSCxcclxuICAgICAgICAgICAgICBzcmNFdmVudDogZXZcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgfSk7XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogQHRoaXMge1RvdWNoSW5wdXR9XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGV2XHJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHR5cGUgZmxhZ1xyXG4gICAqIEByZXR1cm5zIHt1bmRlZmluZWR8QXJyYXl9IFthbGwsIGNoYW5nZWRdXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gZ2V0VG91Y2hlcyhldiwgdHlwZSkge1xyXG4gICAgICB2YXIgYWxsVG91Y2hlcyA9IHRvQXJyYXkoZXYudG91Y2hlcyk7XHJcbiAgICAgIHZhciB0YXJnZXRJZHMgPSB0aGlzLnRhcmdldElkcztcclxuICBcclxuICAgICAgLy8gd2hlbiB0aGVyZSBpcyBvbmx5IG9uZSB0b3VjaCwgdGhlIHByb2Nlc3MgY2FuIGJlIHNpbXBsaWZpZWRcclxuICAgICAgaWYgKHR5cGUgJiAoSU5QVVRfU1RBUlQgfCBJTlBVVF9NT1ZFKSAmJiBhbGxUb3VjaGVzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgdGFyZ2V0SWRzW2FsbFRvdWNoZXNbMF0uaWRlbnRpZmllcl0gPSB0cnVlO1xyXG4gICAgICAgICAgcmV0dXJuIFthbGxUb3VjaGVzLCBhbGxUb3VjaGVzXTtcclxuICAgICAgfVxyXG4gIFxyXG4gICAgICB2YXIgaSxcclxuICAgICAgICAgIHRhcmdldFRvdWNoZXMsXHJcbiAgICAgICAgICBjaGFuZ2VkVG91Y2hlcyA9IHRvQXJyYXkoZXYuY2hhbmdlZFRvdWNoZXMpLFxyXG4gICAgICAgICAgY2hhbmdlZFRhcmdldFRvdWNoZXMgPSBbXSxcclxuICAgICAgICAgIHRhcmdldCA9IHRoaXMudGFyZ2V0O1xyXG4gIFxyXG4gICAgICAvLyBnZXQgdGFyZ2V0IHRvdWNoZXMgZnJvbSB0b3VjaGVzXHJcbiAgICAgIHRhcmdldFRvdWNoZXMgPSBhbGxUb3VjaGVzLmZpbHRlcihmdW5jdGlvbih0b3VjaCkge1xyXG4gICAgICAgICAgcmV0dXJuIGhhc1BhcmVudCh0b3VjaC50YXJnZXQsIHRhcmdldCk7XHJcbiAgICAgIH0pO1xyXG4gIFxyXG4gICAgICAvLyBjb2xsZWN0IHRvdWNoZXNcclxuICAgICAgaWYgKHR5cGUgPT09IElOUFVUX1NUQVJUKSB7XHJcbiAgICAgICAgICBpID0gMDtcclxuICAgICAgICAgIHdoaWxlIChpIDwgdGFyZ2V0VG91Y2hlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICB0YXJnZXRJZHNbdGFyZ2V0VG91Y2hlc1tpXS5pZGVudGlmaWVyXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgXHJcbiAgICAgIC8vIGZpbHRlciBjaGFuZ2VkIHRvdWNoZXMgdG8gb25seSBjb250YWluIHRvdWNoZXMgdGhhdCBleGlzdCBpbiB0aGUgY29sbGVjdGVkIHRhcmdldCBpZHNcclxuICAgICAgaSA9IDA7XHJcbiAgICAgIHdoaWxlIChpIDwgY2hhbmdlZFRvdWNoZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBpZiAodGFyZ2V0SWRzW2NoYW5nZWRUb3VjaGVzW2ldLmlkZW50aWZpZXJdKSB7XHJcbiAgICAgICAgICAgICAgY2hhbmdlZFRhcmdldFRvdWNoZXMucHVzaChjaGFuZ2VkVG91Y2hlc1tpXSk7XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICAvLyBjbGVhbnVwIHJlbW92ZWQgdG91Y2hlc1xyXG4gICAgICAgICAgaWYgKHR5cGUgJiAoSU5QVVRfRU5EIHwgSU5QVVRfQ0FOQ0VMKSkge1xyXG4gICAgICAgICAgICAgIGRlbGV0ZSB0YXJnZXRJZHNbY2hhbmdlZFRvdWNoZXNbaV0uaWRlbnRpZmllcl07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpKys7XHJcbiAgICAgIH1cclxuICBcclxuICAgICAgaWYgKCFjaGFuZ2VkVGFyZ2V0VG91Y2hlcy5sZW5ndGgpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gIFxyXG4gICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgLy8gbWVyZ2UgdGFyZ2V0VG91Y2hlcyB3aXRoIGNoYW5nZWRUYXJnZXRUb3VjaGVzIHNvIGl0IGNvbnRhaW5zIEFMTCB0b3VjaGVzLCBpbmNsdWRpbmcgJ2VuZCcgYW5kICdjYW5jZWwnXHJcbiAgICAgICAgICB1bmlxdWVBcnJheSh0YXJnZXRUb3VjaGVzLmNvbmNhdChjaGFuZ2VkVGFyZ2V0VG91Y2hlcyksICdpZGVudGlmaWVyJywgdHJ1ZSksXHJcbiAgICAgICAgICBjaGFuZ2VkVGFyZ2V0VG91Y2hlc1xyXG4gICAgICBdO1xyXG4gIH1cclxuICBcclxuICAvKipcclxuICAgKiBDb21iaW5lZCB0b3VjaCBhbmQgbW91c2UgaW5wdXRcclxuICAgKlxyXG4gICAqIFRvdWNoIGhhcyBhIGhpZ2hlciBwcmlvcml0eSB0aGVuIG1vdXNlLCBhbmQgd2hpbGUgdG91Y2hpbmcgbm8gbW91c2UgZXZlbnRzIGFyZSBhbGxvd2VkLlxyXG4gICAqIFRoaXMgYmVjYXVzZSB0b3VjaCBkZXZpY2VzIGFsc28gZW1pdCBtb3VzZSBldmVudHMgd2hpbGUgZG9pbmcgYSB0b3VjaC5cclxuICAgKlxyXG4gICAqIEBjb25zdHJ1Y3RvclxyXG4gICAqIEBleHRlbmRzIElucHV0XHJcbiAgICovXHJcbiAgXHJcbiAgdmFyIERFRFVQX1RJTUVPVVQgPSAyNTAwO1xyXG4gIHZhciBERURVUF9ESVNUQU5DRSA9IDI1O1xyXG4gIFxyXG4gIGZ1bmN0aW9uIFRvdWNoTW91c2VJbnB1dCgpIHtcclxuICAgICAgSW5wdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICBcclxuICAgICAgdmFyIGhhbmRsZXIgPSBiaW5kRm4odGhpcy5oYW5kbGVyLCB0aGlzKTtcclxuICAgICAgdGhpcy50b3VjaCA9IG5ldyBUb3VjaElucHV0KHRoaXMubWFuYWdlciwgaGFuZGxlcik7XHJcbiAgICAgIHRoaXMubW91c2UgPSBuZXcgTW91c2VJbnB1dCh0aGlzLm1hbmFnZXIsIGhhbmRsZXIpO1xyXG4gIFxyXG4gICAgICB0aGlzLnByaW1hcnlUb3VjaCA9IG51bGw7XHJcbiAgICAgIHRoaXMubGFzdFRvdWNoZXMgPSBbXTtcclxuICB9XHJcbiAgXHJcbiAgaW5oZXJpdChUb3VjaE1vdXNlSW5wdXQsIElucHV0LCB7XHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBoYW5kbGUgbW91c2UgYW5kIHRvdWNoIGV2ZW50c1xyXG4gICAgICAgKiBAcGFyYW0ge0hhbW1lcn0gbWFuYWdlclxyXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXRFdmVudFxyXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXREYXRhXHJcbiAgICAgICAqL1xyXG4gICAgICBoYW5kbGVyOiBmdW5jdGlvbiBUTUVoYW5kbGVyKG1hbmFnZXIsIGlucHV0RXZlbnQsIGlucHV0RGF0YSkge1xyXG4gICAgICAgICAgdmFyIGlzVG91Y2ggPSAoaW5wdXREYXRhLnBvaW50ZXJUeXBlID09IElOUFVUX1RZUEVfVE9VQ0gpLFxyXG4gICAgICAgICAgICAgIGlzTW91c2UgPSAoaW5wdXREYXRhLnBvaW50ZXJUeXBlID09IElOUFVUX1RZUEVfTU9VU0UpO1xyXG4gIFxyXG4gICAgICAgICAgaWYgKGlzTW91c2UgJiYgaW5wdXREYXRhLnNvdXJjZUNhcGFiaWxpdGllcyAmJiBpbnB1dERhdGEuc291cmNlQ2FwYWJpbGl0aWVzLmZpcmVzVG91Y2hFdmVudHMpIHtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICAvLyB3aGVuIHdlJ3JlIGluIGEgdG91Y2ggZXZlbnQsIHJlY29yZCB0b3VjaGVzIHRvICBkZS1kdXBlIHN5bnRoZXRpYyBtb3VzZSBldmVudFxyXG4gICAgICAgICAgaWYgKGlzVG91Y2gpIHtcclxuICAgICAgICAgICAgICByZWNvcmRUb3VjaGVzLmNhbGwodGhpcywgaW5wdXRFdmVudCwgaW5wdXREYXRhKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoaXNNb3VzZSAmJiBpc1N5bnRoZXRpY0V2ZW50LmNhbGwodGhpcywgaW5wdXREYXRhKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICBcclxuICAgICAgICAgIHRoaXMuY2FsbGJhY2sobWFuYWdlciwgaW5wdXRFdmVudCwgaW5wdXREYXRhKTtcclxuICAgICAgfSxcclxuICBcclxuICAgICAgLyoqXHJcbiAgICAgICAqIHJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXJzXHJcbiAgICAgICAqL1xyXG4gICAgICBkZXN0cm95OiBmdW5jdGlvbiBkZXN0cm95KCkge1xyXG4gICAgICAgICAgdGhpcy50b3VjaC5kZXN0cm95KCk7XHJcbiAgICAgICAgICB0aGlzLm1vdXNlLmRlc3Ryb3koKTtcclxuICAgICAgfVxyXG4gIH0pO1xyXG4gIFxyXG4gIGZ1bmN0aW9uIHJlY29yZFRvdWNoZXMoZXZlbnRUeXBlLCBldmVudERhdGEpIHtcclxuICAgICAgaWYgKGV2ZW50VHlwZSAmIElOUFVUX1NUQVJUKSB7XHJcbiAgICAgICAgICB0aGlzLnByaW1hcnlUb3VjaCA9IGV2ZW50RGF0YS5jaGFuZ2VkUG9pbnRlcnNbMF0uaWRlbnRpZmllcjtcclxuICAgICAgICAgIHNldExhc3RUb3VjaC5jYWxsKHRoaXMsIGV2ZW50RGF0YSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZXZlbnRUeXBlICYgKElOUFVUX0VORCB8IElOUFVUX0NBTkNFTCkpIHtcclxuICAgICAgICAgIHNldExhc3RUb3VjaC5jYWxsKHRoaXMsIGV2ZW50RGF0YSk7XHJcbiAgICAgIH1cclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gc2V0TGFzdFRvdWNoKGV2ZW50RGF0YSkge1xyXG4gICAgICB2YXIgdG91Y2ggPSBldmVudERhdGEuY2hhbmdlZFBvaW50ZXJzWzBdO1xyXG4gIFxyXG4gICAgICBpZiAodG91Y2guaWRlbnRpZmllciA9PT0gdGhpcy5wcmltYXJ5VG91Y2gpIHtcclxuICAgICAgICAgIHZhciBsYXN0VG91Y2ggPSB7eDogdG91Y2guY2xpZW50WCwgeTogdG91Y2guY2xpZW50WX07XHJcbiAgICAgICAgICB0aGlzLmxhc3RUb3VjaGVzLnB1c2gobGFzdFRvdWNoKTtcclxuICAgICAgICAgIHZhciBsdHMgPSB0aGlzLmxhc3RUb3VjaGVzO1xyXG4gICAgICAgICAgdmFyIHJlbW92ZUxhc3RUb3VjaCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHZhciBpID0gbHRzLmluZGV4T2YobGFzdFRvdWNoKTtcclxuICAgICAgICAgICAgICBpZiAoaSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgIGx0cy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIHNldFRpbWVvdXQocmVtb3ZlTGFzdFRvdWNoLCBERURVUF9USU1FT1VUKTtcclxuICAgICAgfVxyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBpc1N5bnRoZXRpY0V2ZW50KGV2ZW50RGF0YSkge1xyXG4gICAgICB2YXIgeCA9IGV2ZW50RGF0YS5zcmNFdmVudC5jbGllbnRYLCB5ID0gZXZlbnREYXRhLnNyY0V2ZW50LmNsaWVudFk7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sYXN0VG91Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgdmFyIHQgPSB0aGlzLmxhc3RUb3VjaGVzW2ldO1xyXG4gICAgICAgICAgdmFyIGR4ID0gTWF0aC5hYnMoeCAtIHQueCksIGR5ID0gTWF0aC5hYnMoeSAtIHQueSk7XHJcbiAgICAgICAgICBpZiAoZHggPD0gREVEVVBfRElTVEFOQ0UgJiYgZHkgPD0gREVEVVBfRElTVEFOQ0UpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIFxyXG4gIHZhciBQUkVGSVhFRF9UT1VDSF9BQ1RJT04gPSBwcmVmaXhlZChURVNUX0VMRU1FTlQuc3R5bGUsICd0b3VjaEFjdGlvbicpO1xyXG4gIHZhciBOQVRJVkVfVE9VQ0hfQUNUSU9OID0gUFJFRklYRURfVE9VQ0hfQUNUSU9OICE9PSB1bmRlZmluZWQ7XHJcbiAgXHJcbiAgLy8gbWFnaWNhbCB0b3VjaEFjdGlvbiB2YWx1ZVxyXG4gIHZhciBUT1VDSF9BQ1RJT05fQ09NUFVURSA9ICdjb21wdXRlJztcclxuICB2YXIgVE9VQ0hfQUNUSU9OX0FVVE8gPSAnYXV0byc7XHJcbiAgdmFyIFRPVUNIX0FDVElPTl9NQU5JUFVMQVRJT04gPSAnbWFuaXB1bGF0aW9uJzsgLy8gbm90IGltcGxlbWVudGVkXHJcbiAgdmFyIFRPVUNIX0FDVElPTl9OT05FID0gJ25vbmUnO1xyXG4gIHZhciBUT1VDSF9BQ1RJT05fUEFOX1ggPSAncGFuLXgnO1xyXG4gIHZhciBUT1VDSF9BQ1RJT05fUEFOX1kgPSAncGFuLXknO1xyXG4gIHZhciBUT1VDSF9BQ1RJT05fTUFQID0gZ2V0VG91Y2hBY3Rpb25Qcm9wcygpO1xyXG4gIFxyXG4gIC8qKlxyXG4gICAqIFRvdWNoIEFjdGlvblxyXG4gICAqIHNldHMgdGhlIHRvdWNoQWN0aW9uIHByb3BlcnR5IG9yIHVzZXMgdGhlIGpzIGFsdGVybmF0aXZlXHJcbiAgICogQHBhcmFtIHtNYW5hZ2VyfSBtYW5hZ2VyXHJcbiAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXHJcbiAgICogQGNvbnN0cnVjdG9yXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gVG91Y2hBY3Rpb24obWFuYWdlciwgdmFsdWUpIHtcclxuICAgICAgdGhpcy5tYW5hZ2VyID0gbWFuYWdlcjtcclxuICAgICAgdGhpcy5zZXQodmFsdWUpO1xyXG4gIH1cclxuICBcclxuICBUb3VjaEFjdGlvbi5wcm90b3R5cGUgPSB7XHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBzZXQgdGhlIHRvdWNoQWN0aW9uIHZhbHVlIG9uIHRoZSBlbGVtZW50IG9yIGVuYWJsZSB0aGUgcG9seWZpbGxcclxuICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXHJcbiAgICAgICAqL1xyXG4gICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAvLyBmaW5kIG91dCB0aGUgdG91Y2gtYWN0aW9uIGJ5IHRoZSBldmVudCBoYW5kbGVyc1xyXG4gICAgICAgICAgaWYgKHZhbHVlID09IFRPVUNIX0FDVElPTl9DT01QVVRFKSB7XHJcbiAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmNvbXB1dGUoKTtcclxuICAgICAgICAgIH1cclxuICBcclxuICAgICAgICAgIGlmIChOQVRJVkVfVE9VQ0hfQUNUSU9OICYmIHRoaXMubWFuYWdlci5lbGVtZW50LnN0eWxlICYmIFRPVUNIX0FDVElPTl9NQVBbdmFsdWVdKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5tYW5hZ2VyLmVsZW1lbnQuc3R5bGVbUFJFRklYRURfVE9VQ0hfQUNUSU9OXSA9IHZhbHVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5hY3Rpb25zID0gdmFsdWUudG9Mb3dlckNhc2UoKS50cmltKCk7XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBqdXN0IHJlLXNldCB0aGUgdG91Y2hBY3Rpb24gdmFsdWVcclxuICAgICAgICovXHJcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB0aGlzLnNldCh0aGlzLm1hbmFnZXIub3B0aW9ucy50b3VjaEFjdGlvbik7XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBjb21wdXRlIHRoZSB2YWx1ZSBmb3IgdGhlIHRvdWNoQWN0aW9uIHByb3BlcnR5IGJhc2VkIG9uIHRoZSByZWNvZ25pemVyJ3Mgc2V0dGluZ3NcclxuICAgICAgICogQHJldHVybnMge1N0cmluZ30gdmFsdWVcclxuICAgICAgICovXHJcbiAgICAgIGNvbXB1dGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdmFyIGFjdGlvbnMgPSBbXTtcclxuICAgICAgICAgIGVhY2godGhpcy5tYW5hZ2VyLnJlY29nbml6ZXJzLCBmdW5jdGlvbihyZWNvZ25pemVyKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGJvb2xPckZuKHJlY29nbml6ZXIub3B0aW9ucy5lbmFibGUsIFtyZWNvZ25pemVyXSkpIHtcclxuICAgICAgICAgICAgICAgICAgYWN0aW9ucyA9IGFjdGlvbnMuY29uY2F0KHJlY29nbml6ZXIuZ2V0VG91Y2hBY3Rpb24oKSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICByZXR1cm4gY2xlYW5Ub3VjaEFjdGlvbnMoYWN0aW9ucy5qb2luKCcgJykpO1xyXG4gICAgICB9LFxyXG4gIFxyXG4gICAgICAvKipcclxuICAgICAgICogdGhpcyBtZXRob2QgaXMgY2FsbGVkIG9uIGVhY2ggaW5wdXQgY3ljbGUgYW5kIHByb3ZpZGVzIHRoZSBwcmV2ZW50aW5nIG9mIHRoZSBicm93c2VyIGJlaGF2aW9yXHJcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dFxyXG4gICAgICAgKi9cclxuICAgICAgcHJldmVudERlZmF1bHRzOiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgICAgdmFyIHNyY0V2ZW50ID0gaW5wdXQuc3JjRXZlbnQ7XHJcbiAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gaW5wdXQub2Zmc2V0RGlyZWN0aW9uO1xyXG4gIFxyXG4gICAgICAgICAgLy8gaWYgdGhlIHRvdWNoIGFjdGlvbiBkaWQgcHJldmVudGVkIG9uY2UgdGhpcyBzZXNzaW9uXHJcbiAgICAgICAgICBpZiAodGhpcy5tYW5hZ2VyLnNlc3Npb24ucHJldmVudGVkKSB7XHJcbiAgICAgICAgICAgICAgc3JjRXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICB2YXIgYWN0aW9ucyA9IHRoaXMuYWN0aW9ucztcclxuICAgICAgICAgIHZhciBoYXNOb25lID0gaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX05PTkUpICYmICFUT1VDSF9BQ1RJT05fTUFQW1RPVUNIX0FDVElPTl9OT05FXTtcclxuICAgICAgICAgIHZhciBoYXNQYW5ZID0gaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX1BBTl9ZKSAmJiAhVE9VQ0hfQUNUSU9OX01BUFtUT1VDSF9BQ1RJT05fUEFOX1ldO1xyXG4gICAgICAgICAgdmFyIGhhc1BhblggPSBpblN0cihhY3Rpb25zLCBUT1VDSF9BQ1RJT05fUEFOX1gpICYmICFUT1VDSF9BQ1RJT05fTUFQW1RPVUNIX0FDVElPTl9QQU5fWF07XHJcbiAgXHJcbiAgICAgICAgICBpZiAoaGFzTm9uZSkge1xyXG4gICAgICAgICAgICAgIC8vZG8gbm90IHByZXZlbnQgZGVmYXVsdHMgaWYgdGhpcyBpcyBhIHRhcCBnZXN0dXJlXHJcbiAgXHJcbiAgICAgICAgICAgICAgdmFyIGlzVGFwUG9pbnRlciA9IGlucHV0LnBvaW50ZXJzLmxlbmd0aCA9PT0gMTtcclxuICAgICAgICAgICAgICB2YXIgaXNUYXBNb3ZlbWVudCA9IGlucHV0LmRpc3RhbmNlIDwgMjtcclxuICAgICAgICAgICAgICB2YXIgaXNUYXBUb3VjaFRpbWUgPSBpbnB1dC5kZWx0YVRpbWUgPCAyNTA7XHJcbiAgXHJcbiAgICAgICAgICAgICAgaWYgKGlzVGFwUG9pbnRlciAmJiBpc1RhcE1vdmVtZW50ICYmIGlzVGFwVG91Y2hUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICBpZiAoaGFzUGFuWCAmJiBoYXNQYW5ZKSB7XHJcbiAgICAgICAgICAgICAgLy8gYHBhbi14IHBhbi15YCBtZWFucyBicm93c2VyIGhhbmRsZXMgYWxsIHNjcm9sbGluZy9wYW5uaW5nLCBkbyBub3QgcHJldmVudFxyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICBcclxuICAgICAgICAgIGlmIChoYXNOb25lIHx8XHJcbiAgICAgICAgICAgICAgKGhhc1BhblkgJiYgZGlyZWN0aW9uICYgRElSRUNUSU9OX0hPUklaT05UQUwpIHx8XHJcbiAgICAgICAgICAgICAgKGhhc1BhblggJiYgZGlyZWN0aW9uICYgRElSRUNUSU9OX1ZFUlRJQ0FMKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnByZXZlbnRTcmMoc3JjRXZlbnQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gIFxyXG4gICAgICAvKipcclxuICAgICAgICogY2FsbCBwcmV2ZW50RGVmYXVsdCB0byBwcmV2ZW50IHRoZSBicm93c2VyJ3MgZGVmYXVsdCBiZWhhdmlvciAoc2Nyb2xsaW5nIGluIG1vc3QgY2FzZXMpXHJcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzcmNFdmVudFxyXG4gICAgICAgKi9cclxuICAgICAgcHJldmVudFNyYzogZnVuY3Rpb24oc3JjRXZlbnQpIHtcclxuICAgICAgICAgIHRoaXMubWFuYWdlci5zZXNzaW9uLnByZXZlbnRlZCA9IHRydWU7XHJcbiAgICAgICAgICBzcmNFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB9XHJcbiAgfTtcclxuICBcclxuICAvKipcclxuICAgKiB3aGVuIHRoZSB0b3VjaEFjdGlvbnMgYXJlIGNvbGxlY3RlZCB0aGV5IGFyZSBub3QgYSB2YWxpZCB2YWx1ZSwgc28gd2UgbmVlZCB0byBjbGVhbiB0aGluZ3MgdXAuICpcclxuICAgKiBAcGFyYW0ge1N0cmluZ30gYWN0aW9uc1xyXG4gICAqIEByZXR1cm5zIHsqfVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGNsZWFuVG91Y2hBY3Rpb25zKGFjdGlvbnMpIHtcclxuICAgICAgLy8gbm9uZVxyXG4gICAgICBpZiAoaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX05PTkUpKSB7XHJcbiAgICAgICAgICByZXR1cm4gVE9VQ0hfQUNUSU9OX05PTkU7XHJcbiAgICAgIH1cclxuICBcclxuICAgICAgdmFyIGhhc1BhblggPSBpblN0cihhY3Rpb25zLCBUT1VDSF9BQ1RJT05fUEFOX1gpO1xyXG4gICAgICB2YXIgaGFzUGFuWSA9IGluU3RyKGFjdGlvbnMsIFRPVUNIX0FDVElPTl9QQU5fWSk7XHJcbiAgXHJcbiAgICAgIC8vIGlmIGJvdGggcGFuLXggYW5kIHBhbi15IGFyZSBzZXQgKGRpZmZlcmVudCByZWNvZ25pemVyc1xyXG4gICAgICAvLyBmb3IgZGlmZmVyZW50IGRpcmVjdGlvbnMsIGUuZy4gaG9yaXpvbnRhbCBwYW4gYnV0IHZlcnRpY2FsIHN3aXBlPylcclxuICAgICAgLy8gd2UgbmVlZCBub25lIChhcyBvdGhlcndpc2Ugd2l0aCBwYW4teCBwYW4teSBjb21iaW5lZCBub25lIG9mIHRoZXNlXHJcbiAgICAgIC8vIHJlY29nbml6ZXJzIHdpbGwgd29yaywgc2luY2UgdGhlIGJyb3dzZXIgd291bGQgaGFuZGxlIGFsbCBwYW5uaW5nXHJcbiAgICAgIGlmIChoYXNQYW5YICYmIGhhc1BhblkpIHtcclxuICAgICAgICAgIHJldHVybiBUT1VDSF9BQ1RJT05fTk9ORTtcclxuICAgICAgfVxyXG4gIFxyXG4gICAgICAvLyBwYW4teCBPUiBwYW4teVxyXG4gICAgICBpZiAoaGFzUGFuWCB8fCBoYXNQYW5ZKSB7XHJcbiAgICAgICAgICByZXR1cm4gaGFzUGFuWCA/IFRPVUNIX0FDVElPTl9QQU5fWCA6IFRPVUNIX0FDVElPTl9QQU5fWTtcclxuICAgICAgfVxyXG4gIFxyXG4gICAgICAvLyBtYW5pcHVsYXRpb25cclxuICAgICAgaWYgKGluU3RyKGFjdGlvbnMsIFRPVUNIX0FDVElPTl9NQU5JUFVMQVRJT04pKSB7XHJcbiAgICAgICAgICByZXR1cm4gVE9VQ0hfQUNUSU9OX01BTklQVUxBVElPTjtcclxuICAgICAgfVxyXG4gIFxyXG4gICAgICByZXR1cm4gVE9VQ0hfQUNUSU9OX0FVVE87XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIGdldFRvdWNoQWN0aW9uUHJvcHMoKSB7XHJcbiAgICAgIGlmICghTkFUSVZFX1RPVUNIX0FDVElPTikge1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciB0b3VjaE1hcCA9IHt9O1xyXG4gICAgICB2YXIgY3NzU3VwcG9ydHMgPSB3aW5kb3cuQ1NTICYmIHdpbmRvdy5DU1Muc3VwcG9ydHM7XHJcbiAgICAgIFsnYXV0bycsICdtYW5pcHVsYXRpb24nLCAncGFuLXknLCAncGFuLXgnLCAncGFuLXggcGFuLXknLCAnbm9uZSddLmZvckVhY2goZnVuY3Rpb24odmFsKSB7XHJcbiAgXHJcbiAgICAgICAgICAvLyBJZiBjc3Muc3VwcG9ydHMgaXMgbm90IHN1cHBvcnRlZCBidXQgdGhlcmUgaXMgbmF0aXZlIHRvdWNoLWFjdGlvbiBhc3N1bWUgaXQgc3VwcG9ydHNcclxuICAgICAgICAgIC8vIGFsbCB2YWx1ZXMuIFRoaXMgaXMgdGhlIGNhc2UgZm9yIElFIDEwIGFuZCAxMS5cclxuICAgICAgICAgIHRvdWNoTWFwW3ZhbF0gPSBjc3NTdXBwb3J0cyA/IHdpbmRvdy5DU1Muc3VwcG9ydHMoJ3RvdWNoLWFjdGlvbicsIHZhbCkgOiB0cnVlO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIHRvdWNoTWFwO1xyXG4gIH1cclxuICBcclxuICAvKipcclxuICAgKiBSZWNvZ25pemVyIGZsb3cgZXhwbGFpbmVkOyAqXHJcbiAgICogQWxsIHJlY29nbml6ZXJzIGhhdmUgdGhlIGluaXRpYWwgc3RhdGUgb2YgUE9TU0lCTEUgd2hlbiBhIGlucHV0IHNlc3Npb24gc3RhcnRzLlxyXG4gICAqIFRoZSBkZWZpbml0aW9uIG9mIGEgaW5wdXQgc2Vzc2lvbiBpcyBmcm9tIHRoZSBmaXJzdCBpbnB1dCB1bnRpbCB0aGUgbGFzdCBpbnB1dCwgd2l0aCBhbGwgaXQncyBtb3ZlbWVudCBpbiBpdC4gKlxyXG4gICAqIEV4YW1wbGUgc2Vzc2lvbiBmb3IgbW91c2UtaW5wdXQ6IG1vdXNlZG93biAtPiBtb3VzZW1vdmUgLT4gbW91c2V1cFxyXG4gICAqXHJcbiAgICogT24gZWFjaCByZWNvZ25pemluZyBjeWNsZSAoc2VlIE1hbmFnZXIucmVjb2duaXplKSB0aGUgLnJlY29nbml6ZSgpIG1ldGhvZCBpcyBleGVjdXRlZFxyXG4gICAqIHdoaWNoIGRldGVybWluZXMgd2l0aCBzdGF0ZSBpdCBzaG91bGQgYmUuXHJcbiAgICpcclxuICAgKiBJZiB0aGUgcmVjb2duaXplciBoYXMgdGhlIHN0YXRlIEZBSUxFRCwgQ0FOQ0VMTEVEIG9yIFJFQ09HTklaRUQgKGVxdWFscyBFTkRFRCksIGl0IGlzIHJlc2V0IHRvXHJcbiAgICogUE9TU0lCTEUgdG8gZ2l2ZSBpdCBhbm90aGVyIGNoYW5nZSBvbiB0aGUgbmV4dCBjeWNsZS5cclxuICAgKlxyXG4gICAqICAgICAgICAgICAgICAgUG9zc2libGVcclxuICAgKiAgICAgICAgICAgICAgICAgIHxcclxuICAgKiAgICAgICAgICAgICstLS0tLSstLS0tLS0tLS0tLS0tLS0rXHJcbiAgICogICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgfFxyXG4gICAqICAgICAgKy0tLS0tKy0tLS0tKyAgICAgICAgICAgICAgIHxcclxuICAgKiAgICAgIHwgICAgICAgICAgIHwgICAgICAgICAgICAgICB8XHJcbiAgICogICBGYWlsZWQgICAgICBDYW5jZWxsZWQgICAgICAgICAgfFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICArLS0tLS0tLSstLS0tLS0rXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgIHxcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICBSZWNvZ25pemVkICAgICAgIEJlZ2FuXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2hhbmdlZFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRW5kZWQvUmVjb2duaXplZFxyXG4gICAqL1xyXG4gIHZhciBTVEFURV9QT1NTSUJMRSA9IDE7XHJcbiAgdmFyIFNUQVRFX0JFR0FOID0gMjtcclxuICB2YXIgU1RBVEVfQ0hBTkdFRCA9IDQ7XHJcbiAgdmFyIFNUQVRFX0VOREVEID0gODtcclxuICB2YXIgU1RBVEVfUkVDT0dOSVpFRCA9IFNUQVRFX0VOREVEO1xyXG4gIHZhciBTVEFURV9DQU5DRUxMRUQgPSAxNjtcclxuICB2YXIgU1RBVEVfRkFJTEVEID0gMzI7XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogUmVjb2duaXplclxyXG4gICAqIEV2ZXJ5IHJlY29nbml6ZXIgbmVlZHMgdG8gZXh0ZW5kIGZyb20gdGhpcyBjbGFzcy5cclxuICAgKiBAY29uc3RydWN0b3JcclxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIFJlY29nbml6ZXIob3B0aW9ucykge1xyXG4gICAgICB0aGlzLm9wdGlvbnMgPSBhc3NpZ24oe30sIHRoaXMuZGVmYXVsdHMsIG9wdGlvbnMgfHwge30pO1xyXG4gIFxyXG4gICAgICB0aGlzLmlkID0gdW5pcXVlSWQoKTtcclxuICBcclxuICAgICAgdGhpcy5tYW5hZ2VyID0gbnVsbDtcclxuICBcclxuICAgICAgLy8gZGVmYXVsdCBpcyBlbmFibGUgdHJ1ZVxyXG4gICAgICB0aGlzLm9wdGlvbnMuZW5hYmxlID0gaWZVbmRlZmluZWQodGhpcy5vcHRpb25zLmVuYWJsZSwgdHJ1ZSk7XHJcbiAgXHJcbiAgICAgIHRoaXMuc3RhdGUgPSBTVEFURV9QT1NTSUJMRTtcclxuICBcclxuICAgICAgdGhpcy5zaW11bHRhbmVvdXMgPSB7fTtcclxuICAgICAgdGhpcy5yZXF1aXJlRmFpbCA9IFtdO1xyXG4gIH1cclxuICBcclxuICBSZWNvZ25pemVyLnByb3RvdHlwZSA9IHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIEB2aXJ0dWFsXHJcbiAgICAgICAqIEB0eXBlIHtPYmplY3R9XHJcbiAgICAgICAqL1xyXG4gICAgICBkZWZhdWx0czoge30sXHJcbiAgXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBzZXQgb3B0aW9uc1xyXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xyXG4gICAgICAgKiBAcmV0dXJuIHtSZWNvZ25pemVyfVxyXG4gICAgICAgKi9cclxuICAgICAgc2V0OiBmdW5jdGlvbihvcHRpb25zKSB7XHJcbiAgICAgICAgICBhc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKTtcclxuICBcclxuICAgICAgICAgIC8vIGFsc28gdXBkYXRlIHRoZSB0b3VjaEFjdGlvbiwgaW4gY2FzZSBzb21ldGhpbmcgY2hhbmdlZCBhYm91dCB0aGUgZGlyZWN0aW9ucy9lbmFibGVkIHN0YXRlXHJcbiAgICAgICAgICB0aGlzLm1hbmFnZXIgJiYgdGhpcy5tYW5hZ2VyLnRvdWNoQWN0aW9uLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiByZWNvZ25pemUgc2ltdWx0YW5lb3VzIHdpdGggYW4gb3RoZXIgcmVjb2duaXplci5cclxuICAgICAgICogQHBhcmFtIHtSZWNvZ25pemVyfSBvdGhlclJlY29nbml6ZXJcclxuICAgICAgICogQHJldHVybnMge1JlY29nbml6ZXJ9IHRoaXNcclxuICAgICAgICovXHJcbiAgICAgIHJlY29nbml6ZVdpdGg6IGZ1bmN0aW9uKG90aGVyUmVjb2duaXplcikge1xyXG4gICAgICAgICAgaWYgKGludm9rZUFycmF5QXJnKG90aGVyUmVjb2duaXplciwgJ3JlY29nbml6ZVdpdGgnLCB0aGlzKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgICAgdmFyIHNpbXVsdGFuZW91cyA9IHRoaXMuc2ltdWx0YW5lb3VzO1xyXG4gICAgICAgICAgb3RoZXJSZWNvZ25pemVyID0gZ2V0UmVjb2duaXplckJ5TmFtZUlmTWFuYWdlcihvdGhlclJlY29nbml6ZXIsIHRoaXMpO1xyXG4gICAgICAgICAgaWYgKCFzaW11bHRhbmVvdXNbb3RoZXJSZWNvZ25pemVyLmlkXSkge1xyXG4gICAgICAgICAgICAgIHNpbXVsdGFuZW91c1tvdGhlclJlY29nbml6ZXIuaWRdID0gb3RoZXJSZWNvZ25pemVyO1xyXG4gICAgICAgICAgICAgIG90aGVyUmVjb2duaXplci5yZWNvZ25pemVXaXRoKHRoaXMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBkcm9wIHRoZSBzaW11bHRhbmVvdXMgbGluay4gaXQgZG9lc250IHJlbW92ZSB0aGUgbGluayBvbiB0aGUgb3RoZXIgcmVjb2duaXplci5cclxuICAgICAgICogQHBhcmFtIHtSZWNvZ25pemVyfSBvdGhlclJlY29nbml6ZXJcclxuICAgICAgICogQHJldHVybnMge1JlY29nbml6ZXJ9IHRoaXNcclxuICAgICAgICovXHJcbiAgICAgIGRyb3BSZWNvZ25pemVXaXRoOiBmdW5jdGlvbihvdGhlclJlY29nbml6ZXIpIHtcclxuICAgICAgICAgIGlmIChpbnZva2VBcnJheUFyZyhvdGhlclJlY29nbml6ZXIsICdkcm9wUmVjb2duaXplV2l0aCcsIHRoaXMpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICBvdGhlclJlY29nbml6ZXIgPSBnZXRSZWNvZ25pemVyQnlOYW1lSWZNYW5hZ2VyKG90aGVyUmVjb2duaXplciwgdGhpcyk7XHJcbiAgICAgICAgICBkZWxldGUgdGhpcy5zaW11bHRhbmVvdXNbb3RoZXJSZWNvZ25pemVyLmlkXTtcclxuICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICB9LFxyXG4gIFxyXG4gICAgICAvKipcclxuICAgICAgICogcmVjb2duaXplciBjYW4gb25seSBydW4gd2hlbiBhbiBvdGhlciBpcyBmYWlsaW5nXHJcbiAgICAgICAqIEBwYXJhbSB7UmVjb2duaXplcn0gb3RoZXJSZWNvZ25pemVyXHJcbiAgICAgICAqIEByZXR1cm5zIHtSZWNvZ25pemVyfSB0aGlzXHJcbiAgICAgICAqL1xyXG4gICAgICByZXF1aXJlRmFpbHVyZTogZnVuY3Rpb24ob3RoZXJSZWNvZ25pemVyKSB7XHJcbiAgICAgICAgICBpZiAoaW52b2tlQXJyYXlBcmcob3RoZXJSZWNvZ25pemVyLCAncmVxdWlyZUZhaWx1cmUnLCB0aGlzKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgICAgdmFyIHJlcXVpcmVGYWlsID0gdGhpcy5yZXF1aXJlRmFpbDtcclxuICAgICAgICAgIG90aGVyUmVjb2duaXplciA9IGdldFJlY29nbml6ZXJCeU5hbWVJZk1hbmFnZXIob3RoZXJSZWNvZ25pemVyLCB0aGlzKTtcclxuICAgICAgICAgIGlmIChpbkFycmF5KHJlcXVpcmVGYWlsLCBvdGhlclJlY29nbml6ZXIpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgIHJlcXVpcmVGYWlsLnB1c2gob3RoZXJSZWNvZ25pemVyKTtcclxuICAgICAgICAgICAgICBvdGhlclJlY29nbml6ZXIucmVxdWlyZUZhaWx1cmUodGhpcyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfSxcclxuICBcclxuICAgICAgLyoqXHJcbiAgICAgICAqIGRyb3AgdGhlIHJlcXVpcmVGYWlsdXJlIGxpbmsuIGl0IGRvZXMgbm90IHJlbW92ZSB0aGUgbGluayBvbiB0aGUgb3RoZXIgcmVjb2duaXplci5cclxuICAgICAgICogQHBhcmFtIHtSZWNvZ25pemVyfSBvdGhlclJlY29nbml6ZXJcclxuICAgICAgICogQHJldHVybnMge1JlY29nbml6ZXJ9IHRoaXNcclxuICAgICAgICovXHJcbiAgICAgIGRyb3BSZXF1aXJlRmFpbHVyZTogZnVuY3Rpb24ob3RoZXJSZWNvZ25pemVyKSB7XHJcbiAgICAgICAgICBpZiAoaW52b2tlQXJyYXlBcmcob3RoZXJSZWNvZ25pemVyLCAnZHJvcFJlcXVpcmVGYWlsdXJlJywgdGhpcykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgIH1cclxuICBcclxuICAgICAgICAgIG90aGVyUmVjb2duaXplciA9IGdldFJlY29nbml6ZXJCeU5hbWVJZk1hbmFnZXIob3RoZXJSZWNvZ25pemVyLCB0aGlzKTtcclxuICAgICAgICAgIHZhciBpbmRleCA9IGluQXJyYXkodGhpcy5yZXF1aXJlRmFpbCwgb3RoZXJSZWNvZ25pemVyKTtcclxuICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5yZXF1aXJlRmFpbC5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBoYXMgcmVxdWlyZSBmYWlsdXJlcyBib29sZWFuXHJcbiAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgKi9cclxuICAgICAgaGFzUmVxdWlyZUZhaWx1cmVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLnJlcXVpcmVGYWlsLmxlbmd0aCA+IDA7XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBpZiB0aGUgcmVjb2duaXplciBjYW4gcmVjb2duaXplIHNpbXVsdGFuZW91cyB3aXRoIGFuIG90aGVyIHJlY29nbml6ZXJcclxuICAgICAgICogQHBhcmFtIHtSZWNvZ25pemVyfSBvdGhlclJlY29nbml6ZXJcclxuICAgICAgICogQHJldHVybnMge0Jvb2xlYW59XHJcbiAgICAgICAqL1xyXG4gICAgICBjYW5SZWNvZ25pemVXaXRoOiBmdW5jdGlvbihvdGhlclJlY29nbml6ZXIpIHtcclxuICAgICAgICAgIHJldHVybiAhIXRoaXMuc2ltdWx0YW5lb3VzW290aGVyUmVjb2duaXplci5pZF07XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBZb3Ugc2hvdWxkIHVzZSBgdHJ5RW1pdGAgaW5zdGVhZCBvZiBgZW1pdGAgZGlyZWN0bHkgdG8gY2hlY2tcclxuICAgICAgICogdGhhdCBhbGwgdGhlIG5lZWRlZCByZWNvZ25pemVycyBoYXMgZmFpbGVkIGJlZm9yZSBlbWl0dGluZy5cclxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0XHJcbiAgICAgICAqL1xyXG4gICAgICBlbWl0OiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5zdGF0ZTtcclxuICBcclxuICAgICAgICAgIGZ1bmN0aW9uIGVtaXQoZXZlbnQpIHtcclxuICAgICAgICAgICAgICBzZWxmLm1hbmFnZXIuZW1pdChldmVudCwgaW5wdXQpO1xyXG4gICAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgICAgLy8gJ3BhbnN0YXJ0JyBhbmQgJ3Bhbm1vdmUnXHJcbiAgICAgICAgICBpZiAoc3RhdGUgPCBTVEFURV9FTkRFRCkge1xyXG4gICAgICAgICAgICAgIGVtaXQoc2VsZi5vcHRpb25zLmV2ZW50ICsgc3RhdGVTdHIoc3RhdGUpKTtcclxuICAgICAgICAgIH1cclxuICBcclxuICAgICAgICAgIGVtaXQoc2VsZi5vcHRpb25zLmV2ZW50KTsgLy8gc2ltcGxlICdldmVudE5hbWUnIGV2ZW50c1xyXG4gIFxyXG4gICAgICAgICAgaWYgKGlucHV0LmFkZGl0aW9uYWxFdmVudCkgeyAvLyBhZGRpdGlvbmFsIGV2ZW50KHBhbmxlZnQsIHBhbnJpZ2h0LCBwaW5jaGluLCBwaW5jaG91dC4uLilcclxuICAgICAgICAgICAgICBlbWl0KGlucHV0LmFkZGl0aW9uYWxFdmVudCk7XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICAvLyBwYW5lbmQgYW5kIHBhbmNhbmNlbFxyXG4gICAgICAgICAgaWYgKHN0YXRlID49IFNUQVRFX0VOREVEKSB7XHJcbiAgICAgICAgICAgICAgZW1pdChzZWxmLm9wdGlvbnMuZXZlbnQgKyBzdGF0ZVN0cihzdGF0ZSkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gIFxyXG4gICAgICAvKipcclxuICAgICAgICogQ2hlY2sgdGhhdCBhbGwgdGhlIHJlcXVpcmUgZmFpbHVyZSByZWNvZ25pemVycyBoYXMgZmFpbGVkLFxyXG4gICAgICAgKiBpZiB0cnVlLCBpdCBlbWl0cyBhIGdlc3R1cmUgZXZlbnQsXHJcbiAgICAgICAqIG90aGVyd2lzZSwgc2V0dXAgdGhlIHN0YXRlIHRvIEZBSUxFRC5cclxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0XHJcbiAgICAgICAqL1xyXG4gICAgICB0cnlFbWl0OiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuY2FuRW1pdCgpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW1pdChpbnB1dCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBpdCdzIGZhaWxpbmcgYW55d2F5XHJcbiAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVfRkFJTEVEO1xyXG4gICAgICB9LFxyXG4gIFxyXG4gICAgICAvKipcclxuICAgICAgICogY2FuIHdlIGVtaXQ/XHJcbiAgICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICAgKi9cclxuICAgICAgY2FuRW1pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB2YXIgaSA9IDA7XHJcbiAgICAgICAgICB3aGlsZSAoaSA8IHRoaXMucmVxdWlyZUZhaWwubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgaWYgKCEodGhpcy5yZXF1aXJlRmFpbFtpXS5zdGF0ZSAmIChTVEFURV9GQUlMRUQgfCBTVEFURV9QT1NTSUJMRSkpKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiB1cGRhdGUgdGhlIHJlY29nbml6ZXJcclxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0RGF0YVxyXG4gICAgICAgKi9cclxuICAgICAgcmVjb2duaXplOiBmdW5jdGlvbihpbnB1dERhdGEpIHtcclxuICAgICAgICAgIC8vIG1ha2UgYSBuZXcgY29weSBvZiB0aGUgaW5wdXREYXRhXHJcbiAgICAgICAgICAvLyBzbyB3ZSBjYW4gY2hhbmdlIHRoZSBpbnB1dERhdGEgd2l0aG91dCBtZXNzaW5nIHVwIHRoZSBvdGhlciByZWNvZ25pemVyc1xyXG4gICAgICAgICAgdmFyIGlucHV0RGF0YUNsb25lID0gYXNzaWduKHt9LCBpbnB1dERhdGEpO1xyXG4gIFxyXG4gICAgICAgICAgLy8gaXMgaXMgZW5hYmxlZCBhbmQgYWxsb3cgcmVjb2duaXppbmc/XHJcbiAgICAgICAgICBpZiAoIWJvb2xPckZuKHRoaXMub3B0aW9ucy5lbmFibGUsIFt0aGlzLCBpbnB1dERhdGFDbG9uZV0pKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURV9GQUlMRUQ7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgICAgLy8gcmVzZXQgd2hlbiB3ZSd2ZSByZWFjaGVkIHRoZSBlbmRcclxuICAgICAgICAgIGlmICh0aGlzLnN0YXRlICYgKFNUQVRFX1JFQ09HTklaRUQgfCBTVEFURV9DQU5DRUxMRUQgfCBTVEFURV9GQUlMRUQpKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFX1BPU1NJQkxFO1xyXG4gICAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMucHJvY2VzcyhpbnB1dERhdGFDbG9uZSk7XHJcbiAgXHJcbiAgICAgICAgICAvLyB0aGUgcmVjb2duaXplciBoYXMgcmVjb2duaXplZCBhIGdlc3R1cmVcclxuICAgICAgICAgIC8vIHNvIHRyaWdnZXIgYW4gZXZlbnRcclxuICAgICAgICAgIGlmICh0aGlzLnN0YXRlICYgKFNUQVRFX0JFR0FOIHwgU1RBVEVfQ0hBTkdFRCB8IFNUQVRFX0VOREVEIHwgU1RBVEVfQ0FOQ0VMTEVEKSkge1xyXG4gICAgICAgICAgICAgIHRoaXMudHJ5RW1pdChpbnB1dERhdGFDbG9uZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiByZXR1cm4gdGhlIHN0YXRlIG9mIHRoZSByZWNvZ25pemVyXHJcbiAgICAgICAqIHRoZSBhY3R1YWwgcmVjb2duaXppbmcgaGFwcGVucyBpbiB0aGlzIG1ldGhvZFxyXG4gICAgICAgKiBAdmlydHVhbFxyXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXREYXRhXHJcbiAgICAgICAqIEByZXR1cm5zIHtDb25zdH0gU1RBVEVcclxuICAgICAgICovXHJcbiAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uKGlucHV0RGF0YSkgeyB9LCAvLyBqc2hpbnQgaWdub3JlOmxpbmVcclxuICBcclxuICAgICAgLyoqXHJcbiAgICAgICAqIHJldHVybiB0aGUgcHJlZmVycmVkIHRvdWNoLWFjdGlvblxyXG4gICAgICAgKiBAdmlydHVhbFxyXG4gICAgICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICAgICAqL1xyXG4gICAgICBnZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24oKSB7IH0sXHJcbiAgXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBjYWxsZWQgd2hlbiB0aGUgZ2VzdHVyZSBpc24ndCBhbGxvd2VkIHRvIHJlY29nbml6ZVxyXG4gICAgICAgKiBsaWtlIHdoZW4gYW5vdGhlciBpcyBiZWluZyByZWNvZ25pemVkIG9yIGl0IGlzIGRpc2FibGVkXHJcbiAgICAgICAqIEB2aXJ0dWFsXHJcbiAgICAgICAqL1xyXG4gICAgICByZXNldDogZnVuY3Rpb24oKSB7IH1cclxuICB9O1xyXG4gIFxyXG4gIC8qKlxyXG4gICAqIGdldCBhIHVzYWJsZSBzdHJpbmcsIHVzZWQgYXMgZXZlbnQgcG9zdGZpeFxyXG4gICAqIEBwYXJhbSB7Q29uc3R9IHN0YXRlXHJcbiAgICogQHJldHVybnMge1N0cmluZ30gc3RhdGVcclxuICAgKi9cclxuICBmdW5jdGlvbiBzdGF0ZVN0cihzdGF0ZSkge1xyXG4gICAgICBpZiAoc3RhdGUgJiBTVEFURV9DQU5DRUxMRUQpIHtcclxuICAgICAgICAgIHJldHVybiAnY2FuY2VsJztcclxuICAgICAgfSBlbHNlIGlmIChzdGF0ZSAmIFNUQVRFX0VOREVEKSB7XHJcbiAgICAgICAgICByZXR1cm4gJ2VuZCc7XHJcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgJiBTVEFURV9DSEFOR0VEKSB7XHJcbiAgICAgICAgICByZXR1cm4gJ21vdmUnO1xyXG4gICAgICB9IGVsc2UgaWYgKHN0YXRlICYgU1RBVEVfQkVHQU4pIHtcclxuICAgICAgICAgIHJldHVybiAnc3RhcnQnO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAnJztcclxuICB9XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogZGlyZWN0aW9uIGNvbnMgdG8gc3RyaW5nXHJcbiAgICogQHBhcmFtIHtDb25zdH0gZGlyZWN0aW9uXHJcbiAgICogQHJldHVybnMge1N0cmluZ31cclxuICAgKi9cclxuICBmdW5jdGlvbiBkaXJlY3Rpb25TdHIoZGlyZWN0aW9uKSB7XHJcbiAgICAgIGlmIChkaXJlY3Rpb24gPT0gRElSRUNUSU9OX0RPV04pIHtcclxuICAgICAgICAgIHJldHVybiAnZG93bic7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09IERJUkVDVElPTl9VUCkge1xyXG4gICAgICAgICAgcmV0dXJuICd1cCc7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09IERJUkVDVElPTl9MRUZUKSB7XHJcbiAgICAgICAgICByZXR1cm4gJ2xlZnQnO1xyXG4gICAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PSBESVJFQ1RJT05fUklHSFQpIHtcclxuICAgICAgICAgIHJldHVybiAncmlnaHQnO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAnJztcclxuICB9XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogZ2V0IGEgcmVjb2duaXplciBieSBuYW1lIGlmIGl0IGlzIGJvdW5kIHRvIGEgbWFuYWdlclxyXG4gICAqIEBwYXJhbSB7UmVjb2duaXplcnxTdHJpbmd9IG90aGVyUmVjb2duaXplclxyXG4gICAqIEBwYXJhbSB7UmVjb2duaXplcn0gcmVjb2duaXplclxyXG4gICAqIEByZXR1cm5zIHtSZWNvZ25pemVyfVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGdldFJlY29nbml6ZXJCeU5hbWVJZk1hbmFnZXIob3RoZXJSZWNvZ25pemVyLCByZWNvZ25pemVyKSB7XHJcbiAgICAgIHZhciBtYW5hZ2VyID0gcmVjb2duaXplci5tYW5hZ2VyO1xyXG4gICAgICBpZiAobWFuYWdlcikge1xyXG4gICAgICAgICAgcmV0dXJuIG1hbmFnZXIuZ2V0KG90aGVyUmVjb2duaXplcik7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG90aGVyUmVjb2duaXplcjtcclxuICB9XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogVGhpcyByZWNvZ25pemVyIGlzIGp1c3QgdXNlZCBhcyBhIGJhc2UgZm9yIHRoZSBzaW1wbGUgYXR0cmlidXRlIHJlY29nbml6ZXJzLlxyXG4gICAqIEBjb25zdHJ1Y3RvclxyXG4gICAqIEBleHRlbmRzIFJlY29nbml6ZXJcclxuICAgKi9cclxuICBmdW5jdGlvbiBBdHRyUmVjb2duaXplcigpIHtcclxuICAgICAgUmVjb2duaXplci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gIH1cclxuICBcclxuICBpbmhlcml0KEF0dHJSZWNvZ25pemVyLCBSZWNvZ25pemVyLCB7XHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBAbmFtZXNwYWNlXHJcbiAgICAgICAqIEBtZW1iZXJvZiBBdHRyUmVjb2duaXplclxyXG4gICAgICAgKi9cclxuICAgICAgZGVmYXVsdHM6IHtcclxuICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICogQHR5cGUge051bWJlcn1cclxuICAgICAgICAgICAqIEBkZWZhdWx0IDFcclxuICAgICAgICAgICAqL1xyXG4gICAgICAgICAgcG9pbnRlcnM6IDFcclxuICAgICAgfSxcclxuICBcclxuICAgICAgLyoqXHJcbiAgICAgICAqIFVzZWQgdG8gY2hlY2sgaWYgaXQgdGhlIHJlY29nbml6ZXIgcmVjZWl2ZXMgdmFsaWQgaW5wdXQsIGxpa2UgaW5wdXQuZGlzdGFuY2UgPiAxMC5cclxuICAgICAgICogQG1lbWJlcm9mIEF0dHJSZWNvZ25pemVyXHJcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dFxyXG4gICAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gcmVjb2duaXplZFxyXG4gICAgICAgKi9cclxuICAgICAgYXR0clRlc3Q6IGZ1bmN0aW9uKGlucHV0KSB7XHJcbiAgICAgICAgICB2YXIgb3B0aW9uUG9pbnRlcnMgPSB0aGlzLm9wdGlvbnMucG9pbnRlcnM7XHJcbiAgICAgICAgICByZXR1cm4gb3B0aW9uUG9pbnRlcnMgPT09IDAgfHwgaW5wdXQucG9pbnRlcnMubGVuZ3RoID09PSBvcHRpb25Qb2ludGVycztcclxuICAgICAgfSxcclxuICBcclxuICAgICAgLyoqXHJcbiAgICAgICAqIFByb2Nlc3MgdGhlIGlucHV0IGFuZCByZXR1cm4gdGhlIHN0YXRlIGZvciB0aGUgcmVjb2duaXplclxyXG4gICAgICAgKiBAbWVtYmVyb2YgQXR0clJlY29nbml6ZXJcclxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0XHJcbiAgICAgICAqIEByZXR1cm5zIHsqfSBTdGF0ZVxyXG4gICAgICAgKi9cclxuICAgICAgcHJvY2VzczogZnVuY3Rpb24oaW5wdXQpIHtcclxuICAgICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XHJcbiAgICAgICAgICB2YXIgZXZlbnRUeXBlID0gaW5wdXQuZXZlbnRUeXBlO1xyXG4gIFxyXG4gICAgICAgICAgdmFyIGlzUmVjb2duaXplZCA9IHN0YXRlICYgKFNUQVRFX0JFR0FOIHwgU1RBVEVfQ0hBTkdFRCk7XHJcbiAgICAgICAgICB2YXIgaXNWYWxpZCA9IHRoaXMuYXR0clRlc3QoaW5wdXQpO1xyXG4gIFxyXG4gICAgICAgICAgLy8gb24gY2FuY2VsIGlucHV0IGFuZCB3ZSd2ZSByZWNvZ25pemVkIGJlZm9yZSwgcmV0dXJuIFNUQVRFX0NBTkNFTExFRFxyXG4gICAgICAgICAgaWYgKGlzUmVjb2duaXplZCAmJiAoZXZlbnRUeXBlICYgSU5QVVRfQ0FOQ0VMIHx8ICFpc1ZhbGlkKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBzdGF0ZSB8IFNUQVRFX0NBTkNFTExFRDtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoaXNSZWNvZ25pemVkIHx8IGlzVmFsaWQpIHtcclxuICAgICAgICAgICAgICBpZiAoZXZlbnRUeXBlICYgSU5QVVRfRU5EKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZSB8IFNUQVRFX0VOREVEO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIShzdGF0ZSAmIFNUQVRFX0JFR0FOKSkge1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gU1RBVEVfQkVHQU47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHJldHVybiBzdGF0ZSB8IFNUQVRFX0NIQU5HRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gU1RBVEVfRkFJTEVEO1xyXG4gICAgICB9XHJcbiAgfSk7XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogUGFuXHJcbiAgICogUmVjb2duaXplZCB3aGVuIHRoZSBwb2ludGVyIGlzIGRvd24gYW5kIG1vdmVkIGluIHRoZSBhbGxvd2VkIGRpcmVjdGlvbi5cclxuICAgKiBAY29uc3RydWN0b3JcclxuICAgKiBAZXh0ZW5kcyBBdHRyUmVjb2duaXplclxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIFBhblJlY29nbml6ZXIoKSB7XHJcbiAgICAgIEF0dHJSZWNvZ25pemVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgXHJcbiAgICAgIHRoaXMucFggPSBudWxsO1xyXG4gICAgICB0aGlzLnBZID0gbnVsbDtcclxuICB9XHJcbiAgXHJcbiAgaW5oZXJpdChQYW5SZWNvZ25pemVyLCBBdHRyUmVjb2duaXplciwge1xyXG4gICAgICAvKipcclxuICAgICAgICogQG5hbWVzcGFjZVxyXG4gICAgICAgKiBAbWVtYmVyb2YgUGFuUmVjb2duaXplclxyXG4gICAgICAgKi9cclxuICAgICAgZGVmYXVsdHM6IHtcclxuICAgICAgICAgIGV2ZW50OiAncGFuJyxcclxuICAgICAgICAgIHRocmVzaG9sZDogMTAsXHJcbiAgICAgICAgICBwb2ludGVyczogMSxcclxuICAgICAgICAgIGRpcmVjdGlvbjogRElSRUNUSU9OX0FMTFxyXG4gICAgICB9LFxyXG4gIFxyXG4gICAgICBnZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gdGhpcy5vcHRpb25zLmRpcmVjdGlvbjtcclxuICAgICAgICAgIHZhciBhY3Rpb25zID0gW107XHJcbiAgICAgICAgICBpZiAoZGlyZWN0aW9uICYgRElSRUNUSU9OX0hPUklaT05UQUwpIHtcclxuICAgICAgICAgICAgICBhY3Rpb25zLnB1c2goVE9VQ0hfQUNUSU9OX1BBTl9ZKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChkaXJlY3Rpb24gJiBESVJFQ1RJT05fVkVSVElDQUwpIHtcclxuICAgICAgICAgICAgICBhY3Rpb25zLnB1c2goVE9VQ0hfQUNUSU9OX1BBTl9YKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBhY3Rpb25zO1xyXG4gICAgICB9LFxyXG4gIFxyXG4gICAgICBkaXJlY3Rpb25UZXN0OiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XHJcbiAgICAgICAgICB2YXIgaGFzTW92ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgdmFyIGRpc3RhbmNlID0gaW5wdXQuZGlzdGFuY2U7XHJcbiAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gaW5wdXQuZGlyZWN0aW9uO1xyXG4gICAgICAgICAgdmFyIHggPSBpbnB1dC5kZWx0YVg7XHJcbiAgICAgICAgICB2YXIgeSA9IGlucHV0LmRlbHRhWTtcclxuICBcclxuICAgICAgICAgIC8vIGxvY2sgdG8gYXhpcz9cclxuICAgICAgICAgIGlmICghKGRpcmVjdGlvbiAmIG9wdGlvbnMuZGlyZWN0aW9uKSkge1xyXG4gICAgICAgICAgICAgIGlmIChvcHRpb25zLmRpcmVjdGlvbiAmIERJUkVDVElPTl9IT1JJWk9OVEFMKSB7XHJcbiAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9ICh4ID09PSAwKSA/IERJUkVDVElPTl9OT05FIDogKHggPCAwKSA/IERJUkVDVElPTl9MRUZUIDogRElSRUNUSU9OX1JJR0hUO1xyXG4gICAgICAgICAgICAgICAgICBoYXNNb3ZlZCA9IHggIT0gdGhpcy5wWDtcclxuICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBNYXRoLmFicyhpbnB1dC5kZWx0YVgpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9ICh5ID09PSAwKSA/IERJUkVDVElPTl9OT05FIDogKHkgPCAwKSA/IERJUkVDVElPTl9VUCA6IERJUkVDVElPTl9ET1dOO1xyXG4gICAgICAgICAgICAgICAgICBoYXNNb3ZlZCA9IHkgIT0gdGhpcy5wWTtcclxuICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBNYXRoLmFicyhpbnB1dC5kZWx0YVkpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlucHV0LmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICAgICAgICAgIHJldHVybiBoYXNNb3ZlZCAmJiBkaXN0YW5jZSA+IG9wdGlvbnMudGhyZXNob2xkICYmIGRpcmVjdGlvbiAmIG9wdGlvbnMuZGlyZWN0aW9uO1xyXG4gICAgICB9LFxyXG4gIFxyXG4gICAgICBhdHRyVGVzdDogZnVuY3Rpb24oaW5wdXQpIHtcclxuICAgICAgICAgIHJldHVybiBBdHRyUmVjb2duaXplci5wcm90b3R5cGUuYXR0clRlc3QuY2FsbCh0aGlzLCBpbnB1dCkgJiZcclxuICAgICAgICAgICAgICAodGhpcy5zdGF0ZSAmIFNUQVRFX0JFR0FOIHx8ICghKHRoaXMuc3RhdGUgJiBTVEFURV9CRUdBTikgJiYgdGhpcy5kaXJlY3Rpb25UZXN0KGlucHV0KSkpO1xyXG4gICAgICB9LFxyXG4gIFxyXG4gICAgICBlbWl0OiBmdW5jdGlvbihpbnB1dCkge1xyXG4gIFxyXG4gICAgICAgICAgdGhpcy5wWCA9IGlucHV0LmRlbHRhWDtcclxuICAgICAgICAgIHRoaXMucFkgPSBpbnB1dC5kZWx0YVk7XHJcbiAgXHJcbiAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gZGlyZWN0aW9uU3RyKGlucHV0LmRpcmVjdGlvbik7XHJcbiAgXHJcbiAgICAgICAgICBpZiAoZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgaW5wdXQuYWRkaXRpb25hbEV2ZW50ID0gdGhpcy5vcHRpb25zLmV2ZW50ICsgZGlyZWN0aW9uO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5fc3VwZXIuZW1pdC5jYWxsKHRoaXMsIGlucHV0KTtcclxuICAgICAgfVxyXG4gIH0pO1xyXG4gIFxyXG4gIC8qKlxyXG4gICAqIFBpbmNoXHJcbiAgICogUmVjb2duaXplZCB3aGVuIHR3byBvciBtb3JlIHBvaW50ZXJzIGFyZSBtb3ZpbmcgdG93YXJkICh6b29tLWluKSBvciBhd2F5IGZyb20gZWFjaCBvdGhlciAoem9vbS1vdXQpLlxyXG4gICAqIEBjb25zdHJ1Y3RvclxyXG4gICAqIEBleHRlbmRzIEF0dHJSZWNvZ25pemVyXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gUGluY2hSZWNvZ25pemVyKCkge1xyXG4gICAgICBBdHRyUmVjb2duaXplci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gIH1cclxuICBcclxuICBpbmhlcml0KFBpbmNoUmVjb2duaXplciwgQXR0clJlY29nbml6ZXIsIHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIEBuYW1lc3BhY2VcclxuICAgICAgICogQG1lbWJlcm9mIFBpbmNoUmVjb2duaXplclxyXG4gICAgICAgKi9cclxuICAgICAgZGVmYXVsdHM6IHtcclxuICAgICAgICAgIGV2ZW50OiAncGluY2gnLFxyXG4gICAgICAgICAgdGhyZXNob2xkOiAwLFxyXG4gICAgICAgICAgcG9pbnRlcnM6IDJcclxuICAgICAgfSxcclxuICBcclxuICAgICAgZ2V0VG91Y2hBY3Rpb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcmV0dXJuIFtUT1VDSF9BQ1RJT05fTk9ORV07XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIGF0dHJUZXN0OiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3N1cGVyLmF0dHJUZXN0LmNhbGwodGhpcywgaW5wdXQpICYmXHJcbiAgICAgICAgICAgICAgKE1hdGguYWJzKGlucHV0LnNjYWxlIC0gMSkgPiB0aGlzLm9wdGlvbnMudGhyZXNob2xkIHx8IHRoaXMuc3RhdGUgJiBTVEFURV9CRUdBTik7XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIGVtaXQ6IGZ1bmN0aW9uKGlucHV0KSB7XHJcbiAgICAgICAgICBpZiAoaW5wdXQuc2NhbGUgIT09IDEpIHtcclxuICAgICAgICAgICAgICB2YXIgaW5PdXQgPSBpbnB1dC5zY2FsZSA8IDEgPyAnaW4nIDogJ291dCc7XHJcbiAgICAgICAgICAgICAgaW5wdXQuYWRkaXRpb25hbEV2ZW50ID0gdGhpcy5vcHRpb25zLmV2ZW50ICsgaW5PdXQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLl9zdXBlci5lbWl0LmNhbGwodGhpcywgaW5wdXQpO1xyXG4gICAgICB9XHJcbiAgfSk7XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogUHJlc3NcclxuICAgKiBSZWNvZ25pemVkIHdoZW4gdGhlIHBvaW50ZXIgaXMgZG93biBmb3IgeCBtcyB3aXRob3V0IGFueSBtb3ZlbWVudC5cclxuICAgKiBAY29uc3RydWN0b3JcclxuICAgKiBAZXh0ZW5kcyBSZWNvZ25pemVyXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gUHJlc3NSZWNvZ25pemVyKCkge1xyXG4gICAgICBSZWNvZ25pemVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgXHJcbiAgICAgIHRoaXMuX3RpbWVyID0gbnVsbDtcclxuICAgICAgdGhpcy5faW5wdXQgPSBudWxsO1xyXG4gIH1cclxuICBcclxuICBpbmhlcml0KFByZXNzUmVjb2duaXplciwgUmVjb2duaXplciwge1xyXG4gICAgICAvKipcclxuICAgICAgICogQG5hbWVzcGFjZVxyXG4gICAgICAgKiBAbWVtYmVyb2YgUHJlc3NSZWNvZ25pemVyXHJcbiAgICAgICAqL1xyXG4gICAgICBkZWZhdWx0czoge1xyXG4gICAgICAgICAgZXZlbnQ6ICdwcmVzcycsXHJcbiAgICAgICAgICBwb2ludGVyczogMSxcclxuICAgICAgICAgIHRpbWU6IDI1MSwgLy8gbWluaW1hbCB0aW1lIG9mIHRoZSBwb2ludGVyIHRvIGJlIHByZXNzZWRcclxuICAgICAgICAgIHRocmVzaG9sZDogOSAvLyBhIG1pbmltYWwgbW92ZW1lbnQgaXMgb2ssIGJ1dCBrZWVwIGl0IGxvd1xyXG4gICAgICB9LFxyXG4gIFxyXG4gICAgICBnZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICByZXR1cm4gW1RPVUNIX0FDVElPTl9BVVRPXTtcclxuICAgICAgfSxcclxuICBcclxuICAgICAgcHJvY2VzczogZnVuY3Rpb24oaW5wdXQpIHtcclxuICAgICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xyXG4gICAgICAgICAgdmFyIHZhbGlkUG9pbnRlcnMgPSBpbnB1dC5wb2ludGVycy5sZW5ndGggPT09IG9wdGlvbnMucG9pbnRlcnM7XHJcbiAgICAgICAgICB2YXIgdmFsaWRNb3ZlbWVudCA9IGlucHV0LmRpc3RhbmNlIDwgb3B0aW9ucy50aHJlc2hvbGQ7XHJcbiAgICAgICAgICB2YXIgdmFsaWRUaW1lID0gaW5wdXQuZGVsdGFUaW1lID4gb3B0aW9ucy50aW1lO1xyXG4gIFxyXG4gICAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcclxuICBcclxuICAgICAgICAgIC8vIHdlIG9ubHkgYWxsb3cgbGl0dGxlIG1vdmVtZW50XHJcbiAgICAgICAgICAvLyBhbmQgd2UndmUgcmVhY2hlZCBhbiBlbmQgZXZlbnQsIHNvIGEgdGFwIGlzIHBvc3NpYmxlXHJcbiAgICAgICAgICBpZiAoIXZhbGlkTW92ZW1lbnQgfHwgIXZhbGlkUG9pbnRlcnMgfHwgKGlucHV0LmV2ZW50VHlwZSAmIChJTlBVVF9FTkQgfCBJTlBVVF9DQU5DRUwpICYmICF2YWxpZFRpbWUpKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5ldmVudFR5cGUgJiBJTlBVVF9TVEFSVCkge1xyXG4gICAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgICAgICAgICAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXRDb250ZXh0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVfUkVDT0dOSVpFRDtcclxuICAgICAgICAgICAgICAgICAgdGhpcy50cnlFbWl0KCk7XHJcbiAgICAgICAgICAgICAgfSwgb3B0aW9ucy50aW1lLCB0aGlzKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoaW5wdXQuZXZlbnRUeXBlICYgSU5QVVRfRU5EKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIFNUQVRFX1JFQ09HTklaRUQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gU1RBVEVfRkFJTEVEO1xyXG4gICAgICB9LFxyXG4gIFxyXG4gICAgICByZXNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xyXG4gICAgICB9LFxyXG4gIFxyXG4gICAgICBlbWl0OiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuc3RhdGUgIT09IFNUQVRFX1JFQ09HTklaRUQpIHtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICBpZiAoaW5wdXQgJiYgKGlucHV0LmV2ZW50VHlwZSAmIElOUFVUX0VORCkpIHtcclxuICAgICAgICAgICAgICB0aGlzLm1hbmFnZXIuZW1pdCh0aGlzLm9wdGlvbnMuZXZlbnQgKyAndXAnLCBpbnB1dCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRoaXMuX2lucHV0LnRpbWVTdGFtcCA9IG5vdygpO1xyXG4gICAgICAgICAgICAgIHRoaXMubWFuYWdlci5lbWl0KHRoaXMub3B0aW9ucy5ldmVudCwgdGhpcy5faW5wdXQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgfSk7XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogUm90YXRlXHJcbiAgICogUmVjb2duaXplZCB3aGVuIHR3byBvciBtb3JlIHBvaW50ZXIgYXJlIG1vdmluZyBpbiBhIGNpcmN1bGFyIG1vdGlvbi5cclxuICAgKiBAY29uc3RydWN0b3JcclxuICAgKiBAZXh0ZW5kcyBBdHRyUmVjb2duaXplclxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIFJvdGF0ZVJlY29nbml6ZXIoKSB7XHJcbiAgICAgIEF0dHJSZWNvZ25pemVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgfVxyXG4gIFxyXG4gIGluaGVyaXQoUm90YXRlUmVjb2duaXplciwgQXR0clJlY29nbml6ZXIsIHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIEBuYW1lc3BhY2VcclxuICAgICAgICogQG1lbWJlcm9mIFJvdGF0ZVJlY29nbml6ZXJcclxuICAgICAgICovXHJcbiAgICAgIGRlZmF1bHRzOiB7XHJcbiAgICAgICAgICBldmVudDogJ3JvdGF0ZScsXHJcbiAgICAgICAgICB0aHJlc2hvbGQ6IDAsXHJcbiAgICAgICAgICBwb2ludGVyczogMlxyXG4gICAgICB9LFxyXG4gIFxyXG4gICAgICBnZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICByZXR1cm4gW1RPVUNIX0FDVElPTl9OT05FXTtcclxuICAgICAgfSxcclxuICBcclxuICAgICAgYXR0clRlc3Q6IGZ1bmN0aW9uKGlucHV0KSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5fc3VwZXIuYXR0clRlc3QuY2FsbCh0aGlzLCBpbnB1dCkgJiZcclxuICAgICAgICAgICAgICAoTWF0aC5hYnMoaW5wdXQucm90YXRpb24pID4gdGhpcy5vcHRpb25zLnRocmVzaG9sZCB8fCB0aGlzLnN0YXRlICYgU1RBVEVfQkVHQU4pO1xyXG4gICAgICB9XHJcbiAgfSk7XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogU3dpcGVcclxuICAgKiBSZWNvZ25pemVkIHdoZW4gdGhlIHBvaW50ZXIgaXMgbW92aW5nIGZhc3QgKHZlbG9jaXR5KSwgd2l0aCBlbm91Z2ggZGlzdGFuY2UgaW4gdGhlIGFsbG93ZWQgZGlyZWN0aW9uLlxyXG4gICAqIEBjb25zdHJ1Y3RvclxyXG4gICAqIEBleHRlbmRzIEF0dHJSZWNvZ25pemVyXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gU3dpcGVSZWNvZ25pemVyKCkge1xyXG4gICAgICBBdHRyUmVjb2duaXplci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gIH1cclxuICBcclxuICBpbmhlcml0KFN3aXBlUmVjb2duaXplciwgQXR0clJlY29nbml6ZXIsIHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIEBuYW1lc3BhY2VcclxuICAgICAgICogQG1lbWJlcm9mIFN3aXBlUmVjb2duaXplclxyXG4gICAgICAgKi9cclxuICAgICAgZGVmYXVsdHM6IHtcclxuICAgICAgICAgIGV2ZW50OiAnc3dpcGUnLFxyXG4gICAgICAgICAgdGhyZXNob2xkOiAxMCxcclxuICAgICAgICAgIHZlbG9jaXR5OiAwLjMsXHJcbiAgICAgICAgICBkaXJlY3Rpb246IERJUkVDVElPTl9IT1JJWk9OVEFMIHwgRElSRUNUSU9OX1ZFUlRJQ0FMLFxyXG4gICAgICAgICAgcG9pbnRlcnM6IDFcclxuICAgICAgfSxcclxuICBcclxuICAgICAgZ2V0VG91Y2hBY3Rpb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcmV0dXJuIFBhblJlY29nbml6ZXIucHJvdG90eXBlLmdldFRvdWNoQWN0aW9uLmNhbGwodGhpcyk7XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIGF0dHJUZXN0OiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgICAgICAgdmFyIGRpcmVjdGlvbiA9IHRoaXMub3B0aW9ucy5kaXJlY3Rpb247XHJcbiAgICAgICAgICB2YXIgdmVsb2NpdHk7XHJcbiAgXHJcbiAgICAgICAgICBpZiAoZGlyZWN0aW9uICYgKERJUkVDVElPTl9IT1JJWk9OVEFMIHwgRElSRUNUSU9OX1ZFUlRJQ0FMKSkge1xyXG4gICAgICAgICAgICAgIHZlbG9jaXR5ID0gaW5wdXQub3ZlcmFsbFZlbG9jaXR5O1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gJiBESVJFQ1RJT05fSE9SSVpPTlRBTCkge1xyXG4gICAgICAgICAgICAgIHZlbG9jaXR5ID0gaW5wdXQub3ZlcmFsbFZlbG9jaXR5WDtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uICYgRElSRUNUSU9OX1ZFUlRJQ0FMKSB7XHJcbiAgICAgICAgICAgICAgdmVsb2NpdHkgPSBpbnB1dC5vdmVyYWxsVmVsb2NpdHlZO1xyXG4gICAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3N1cGVyLmF0dHJUZXN0LmNhbGwodGhpcywgaW5wdXQpICYmXHJcbiAgICAgICAgICAgICAgZGlyZWN0aW9uICYgaW5wdXQub2Zmc2V0RGlyZWN0aW9uICYmXHJcbiAgICAgICAgICAgICAgaW5wdXQuZGlzdGFuY2UgPiB0aGlzLm9wdGlvbnMudGhyZXNob2xkICYmXHJcbiAgICAgICAgICAgICAgaW5wdXQubWF4UG9pbnRlcnMgPT0gdGhpcy5vcHRpb25zLnBvaW50ZXJzICYmXHJcbiAgICAgICAgICAgICAgYWJzKHZlbG9jaXR5KSA+IHRoaXMub3B0aW9ucy52ZWxvY2l0eSAmJiBpbnB1dC5ldmVudFR5cGUgJiBJTlBVVF9FTkQ7XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIGVtaXQ6IGZ1bmN0aW9uKGlucHV0KSB7XHJcbiAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gZGlyZWN0aW9uU3RyKGlucHV0Lm9mZnNldERpcmVjdGlvbik7XHJcbiAgICAgICAgICBpZiAoZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQodGhpcy5vcHRpb25zLmV2ZW50ICsgZGlyZWN0aW9uLCBpbnB1dCk7XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICB0aGlzLm1hbmFnZXIuZW1pdCh0aGlzLm9wdGlvbnMuZXZlbnQsIGlucHV0KTtcclxuICAgICAgfVxyXG4gIH0pO1xyXG4gIFxyXG4gIC8qKlxyXG4gICAqIEEgdGFwIGlzIGVjb2duaXplZCB3aGVuIHRoZSBwb2ludGVyIGlzIGRvaW5nIGEgc21hbGwgdGFwL2NsaWNrLiBNdWx0aXBsZSB0YXBzIGFyZSByZWNvZ25pemVkIGlmIHRoZXkgb2NjdXJcclxuICAgKiBiZXR3ZWVuIHRoZSBnaXZlbiBpbnRlcnZhbCBhbmQgcG9zaXRpb24uIFRoZSBkZWxheSBvcHRpb24gY2FuIGJlIHVzZWQgdG8gcmVjb2duaXplIG11bHRpLXRhcHMgd2l0aG91dCBmaXJpbmdcclxuICAgKiBhIHNpbmdsZSB0YXAuXHJcbiAgICpcclxuICAgKiBUaGUgZXZlbnREYXRhIGZyb20gdGhlIGVtaXR0ZWQgZXZlbnQgY29udGFpbnMgdGhlIHByb3BlcnR5IGB0YXBDb3VudGAsIHdoaWNoIGNvbnRhaW5zIHRoZSBhbW91bnQgb2ZcclxuICAgKiBtdWx0aS10YXBzIGJlaW5nIHJlY29nbml6ZWQuXHJcbiAgICogQGNvbnN0cnVjdG9yXHJcbiAgICogQGV4dGVuZHMgUmVjb2duaXplclxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIFRhcFJlY29nbml6ZXIoKSB7XHJcbiAgICAgIFJlY29nbml6ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICBcclxuICAgICAgLy8gcHJldmlvdXMgdGltZSBhbmQgY2VudGVyLFxyXG4gICAgICAvLyB1c2VkIGZvciB0YXAgY291bnRpbmdcclxuICAgICAgdGhpcy5wVGltZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnBDZW50ZXIgPSBmYWxzZTtcclxuICBcclxuICAgICAgdGhpcy5fdGltZXIgPSBudWxsO1xyXG4gICAgICB0aGlzLl9pbnB1dCA9IG51bGw7XHJcbiAgICAgIHRoaXMuY291bnQgPSAwO1xyXG4gIH1cclxuICBcclxuICBpbmhlcml0KFRhcFJlY29nbml6ZXIsIFJlY29nbml6ZXIsIHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIEBuYW1lc3BhY2VcclxuICAgICAgICogQG1lbWJlcm9mIFBpbmNoUmVjb2duaXplclxyXG4gICAgICAgKi9cclxuICAgICAgZGVmYXVsdHM6IHtcclxuICAgICAgICAgIGV2ZW50OiAndGFwJyxcclxuICAgICAgICAgIHBvaW50ZXJzOiAxLFxyXG4gICAgICAgICAgdGFwczogMSxcclxuICAgICAgICAgIGludGVydmFsOiAzMDAsIC8vIG1heCB0aW1lIGJldHdlZW4gdGhlIG11bHRpLXRhcCB0YXBzXHJcbiAgICAgICAgICB0aW1lOiAyNTAsIC8vIG1heCB0aW1lIG9mIHRoZSBwb2ludGVyIHRvIGJlIGRvd24gKGxpa2UgZmluZ2VyIG9uIHRoZSBzY3JlZW4pXHJcbiAgICAgICAgICB0aHJlc2hvbGQ6IDksIC8vIGEgbWluaW1hbCBtb3ZlbWVudCBpcyBvaywgYnV0IGtlZXAgaXQgbG93XHJcbiAgICAgICAgICBwb3NUaHJlc2hvbGQ6IDEwIC8vIGEgbXVsdGktdGFwIGNhbiBiZSBhIGJpdCBvZmYgdGhlIGluaXRpYWwgcG9zaXRpb25cclxuICAgICAgfSxcclxuICBcclxuICAgICAgZ2V0VG91Y2hBY3Rpb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcmV0dXJuIFtUT1VDSF9BQ1RJT05fTUFOSVBVTEFUSU9OXTtcclxuICAgICAgfSxcclxuICBcclxuICAgICAgcHJvY2VzczogZnVuY3Rpb24oaW5wdXQpIHtcclxuICAgICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xyXG4gIFxyXG4gICAgICAgICAgdmFyIHZhbGlkUG9pbnRlcnMgPSBpbnB1dC5wb2ludGVycy5sZW5ndGggPT09IG9wdGlvbnMucG9pbnRlcnM7XHJcbiAgICAgICAgICB2YXIgdmFsaWRNb3ZlbWVudCA9IGlucHV0LmRpc3RhbmNlIDwgb3B0aW9ucy50aHJlc2hvbGQ7XHJcbiAgICAgICAgICB2YXIgdmFsaWRUb3VjaFRpbWUgPSBpbnB1dC5kZWx0YVRpbWUgPCBvcHRpb25zLnRpbWU7XHJcbiAgXHJcbiAgICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgXHJcbiAgICAgICAgICBpZiAoKGlucHV0LmV2ZW50VHlwZSAmIElOUFVUX1NUQVJUKSAmJiAodGhpcy5jb3VudCA9PT0gMCkpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mYWlsVGltZW91dCgpO1xyXG4gICAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgICAgLy8gd2Ugb25seSBhbGxvdyBsaXR0bGUgbW92ZW1lbnRcclxuICAgICAgICAgIC8vIGFuZCB3ZSd2ZSByZWFjaGVkIGFuIGVuZCBldmVudCwgc28gYSB0YXAgaXMgcG9zc2libGVcclxuICAgICAgICAgIGlmICh2YWxpZE1vdmVtZW50ICYmIHZhbGlkVG91Y2hUaW1lICYmIHZhbGlkUG9pbnRlcnMpIHtcclxuICAgICAgICAgICAgICBpZiAoaW5wdXQuZXZlbnRUeXBlICE9IElOUFVUX0VORCkge1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mYWlsVGltZW91dCgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICBcclxuICAgICAgICAgICAgICB2YXIgdmFsaWRJbnRlcnZhbCA9IHRoaXMucFRpbWUgPyAoaW5wdXQudGltZVN0YW1wIC0gdGhpcy5wVGltZSA8IG9wdGlvbnMuaW50ZXJ2YWwpIDogdHJ1ZTtcclxuICAgICAgICAgICAgICB2YXIgdmFsaWRNdWx0aVRhcCA9ICF0aGlzLnBDZW50ZXIgfHwgZ2V0RGlzdGFuY2UodGhpcy5wQ2VudGVyLCBpbnB1dC5jZW50ZXIpIDwgb3B0aW9ucy5wb3NUaHJlc2hvbGQ7XHJcbiAgXHJcbiAgICAgICAgICAgICAgdGhpcy5wVGltZSA9IGlucHV0LnRpbWVTdGFtcDtcclxuICAgICAgICAgICAgICB0aGlzLnBDZW50ZXIgPSBpbnB1dC5jZW50ZXI7XHJcbiAgXHJcbiAgICAgICAgICAgICAgaWYgKCF2YWxpZE11bHRpVGFwIHx8ICF2YWxpZEludGVydmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuY291bnQgPSAxO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuY291bnQgKz0gMTtcclxuICAgICAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcclxuICBcclxuICAgICAgICAgICAgICAvLyBpZiB0YXAgY291bnQgbWF0Y2hlcyB3ZSBoYXZlIHJlY29nbml6ZWQgaXQsXHJcbiAgICAgICAgICAgICAgLy8gZWxzZSBpdCBoYXMgYmVnYW4gcmVjb2duaXppbmcuLi5cclxuICAgICAgICAgICAgICB2YXIgdGFwQ291bnQgPSB0aGlzLmNvdW50ICUgb3B0aW9ucy50YXBzO1xyXG4gICAgICAgICAgICAgIGlmICh0YXBDb3VudCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAvLyBubyBmYWlsaW5nIHJlcXVpcmVtZW50cywgaW1tZWRpYXRlbHkgdHJpZ2dlciB0aGUgdGFwIGV2ZW50XHJcbiAgICAgICAgICAgICAgICAgIC8vIG9yIHdhaXQgYXMgbG9uZyBhcyB0aGUgbXVsdGl0YXAgaW50ZXJ2YWwgdG8gdHJpZ2dlclxyXG4gICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaGFzUmVxdWlyZUZhaWx1cmVzKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBTVEFURV9SRUNPR05JWkVEO1xyXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0Q29udGV4dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVfUkVDT0dOSVpFRDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyeUVtaXQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgIH0sIG9wdGlvbnMuaW50ZXJ2YWwsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNUQVRFX0JFR0FOO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIFNUQVRFX0ZBSUxFRDtcclxuICAgICAgfSxcclxuICBcclxuICAgICAgZmFpbFRpbWVvdXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0Q29udGV4dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVfRkFJTEVEO1xyXG4gICAgICAgICAgfSwgdGhpcy5vcHRpb25zLmludGVydmFsLCB0aGlzKTtcclxuICAgICAgICAgIHJldHVybiBTVEFURV9GQUlMRUQ7XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIGVtaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuc3RhdGUgPT0gU1RBVEVfUkVDT0dOSVpFRCkge1xyXG4gICAgICAgICAgICAgIHRoaXMuX2lucHV0LnRhcENvdW50ID0gdGhpcy5jb3VudDtcclxuICAgICAgICAgICAgICB0aGlzLm1hbmFnZXIuZW1pdCh0aGlzLm9wdGlvbnMuZXZlbnQsIHRoaXMuX2lucHV0KTtcclxuICAgICAgICAgIH1cclxuICAgICAgfVxyXG4gIH0pO1xyXG4gIFxyXG4gIC8qKlxyXG4gICAqIFNpbXBsZSB3YXkgdG8gY3JlYXRlIGEgbWFuYWdlciB3aXRoIGEgZGVmYXVsdCBzZXQgb2YgcmVjb2duaXplcnMuXHJcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKiBAY29uc3RydWN0b3JcclxuICAgKi9cclxuICBmdW5jdGlvbiBIYW1tZXIoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuICAgICAgb3B0aW9ucy5yZWNvZ25pemVycyA9IGlmVW5kZWZpbmVkKG9wdGlvbnMucmVjb2duaXplcnMsIEhhbW1lci5kZWZhdWx0cy5wcmVzZXQpO1xyXG4gICAgICByZXR1cm4gbmV3IE1hbmFnZXIoZWxlbWVudCwgb3B0aW9ucyk7XHJcbiAgfVxyXG4gIFxyXG4gIC8qKlxyXG4gICAqIEBjb25zdCB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIEhhbW1lci5WRVJTSU9OID0gJzIuMC43JztcclxuICBcclxuICAvKipcclxuICAgKiBkZWZhdWx0IHNldHRpbmdzXHJcbiAgICogQG5hbWVzcGFjZVxyXG4gICAqL1xyXG4gIEhhbW1lci5kZWZhdWx0cyA9IHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIHNldCBpZiBET00gZXZlbnRzIGFyZSBiZWluZyB0cmlnZ2VyZWQuXHJcbiAgICAgICAqIEJ1dCB0aGlzIGlzIHNsb3dlciBhbmQgdW51c2VkIGJ5IHNpbXBsZSBpbXBsZW1lbnRhdGlvbnMsIHNvIGRpc2FibGVkIGJ5IGRlZmF1bHQuXHJcbiAgICAgICAqIEB0eXBlIHtCb29sZWFufVxyXG4gICAgICAgKiBAZGVmYXVsdCBmYWxzZVxyXG4gICAgICAgKi9cclxuICAgICAgZG9tRXZlbnRzOiBmYWxzZSxcclxuICBcclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRoZSB2YWx1ZSBmb3IgdGhlIHRvdWNoQWN0aW9uIHByb3BlcnR5L2ZhbGxiYWNrLlxyXG4gICAgICAgKiBXaGVuIHNldCB0byBgY29tcHV0ZWAgaXQgd2lsbCBtYWdpY2FsbHkgc2V0IHRoZSBjb3JyZWN0IHZhbHVlIGJhc2VkIG9uIHRoZSBhZGRlZCByZWNvZ25pemVycy5cclxuICAgICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAgICogQGRlZmF1bHQgY29tcHV0ZVxyXG4gICAgICAgKi9cclxuICAgICAgdG91Y2hBY3Rpb246IFRPVUNIX0FDVElPTl9DT01QVVRFLFxyXG4gIFxyXG4gICAgICAvKipcclxuICAgICAgICogQHR5cGUge0Jvb2xlYW59XHJcbiAgICAgICAqIEBkZWZhdWx0IHRydWVcclxuICAgICAgICovXHJcbiAgICAgIGVuYWJsZTogdHJ1ZSxcclxuICBcclxuICAgICAgLyoqXHJcbiAgICAgICAqIEVYUEVSSU1FTlRBTCBGRUFUVVJFIC0tIGNhbiBiZSByZW1vdmVkL2NoYW5nZWRcclxuICAgICAgICogQ2hhbmdlIHRoZSBwYXJlbnQgaW5wdXQgdGFyZ2V0IGVsZW1lbnQuXHJcbiAgICAgICAqIElmIE51bGwsIHRoZW4gaXQgaXMgYmVpbmcgc2V0IHRoZSB0byBtYWluIGVsZW1lbnQuXHJcbiAgICAgICAqIEB0eXBlIHtOdWxsfEV2ZW50VGFyZ2V0fVxyXG4gICAgICAgKiBAZGVmYXVsdCBudWxsXHJcbiAgICAgICAqL1xyXG4gICAgICBpbnB1dFRhcmdldDogbnVsbCxcclxuICBcclxuICAgICAgLyoqXHJcbiAgICAgICAqIGZvcmNlIGFuIGlucHV0IGNsYXNzXHJcbiAgICAgICAqIEB0eXBlIHtOdWxsfEZ1bmN0aW9ufVxyXG4gICAgICAgKiBAZGVmYXVsdCBudWxsXHJcbiAgICAgICAqL1xyXG4gICAgICBpbnB1dENsYXNzOiBudWxsLFxyXG4gIFxyXG4gICAgICAvKipcclxuICAgICAgICogRGVmYXVsdCByZWNvZ25pemVyIHNldHVwIHdoZW4gY2FsbGluZyBgSGFtbWVyKClgXHJcbiAgICAgICAqIFdoZW4gY3JlYXRpbmcgYSBuZXcgTWFuYWdlciB0aGVzZSB3aWxsIGJlIHNraXBwZWQuXHJcbiAgICAgICAqIEB0eXBlIHtBcnJheX1cclxuICAgICAgICovXHJcbiAgICAgIHByZXNldDogW1xyXG4gICAgICAgICAgLy8gUmVjb2duaXplckNsYXNzLCBvcHRpb25zLCBbcmVjb2duaXplV2l0aCwgLi4uXSwgW3JlcXVpcmVGYWlsdXJlLCAuLi5dXHJcbiAgICAgICAgICBbUm90YXRlUmVjb2duaXplciwge2VuYWJsZTogZmFsc2V9XSxcclxuICAgICAgICAgIFtQaW5jaFJlY29nbml6ZXIsIHtlbmFibGU6IGZhbHNlfSwgWydyb3RhdGUnXV0sXHJcbiAgICAgICAgICBbU3dpcGVSZWNvZ25pemVyLCB7ZGlyZWN0aW9uOiBESVJFQ1RJT05fSE9SSVpPTlRBTH1dLFxyXG4gICAgICAgICAgW1BhblJlY29nbml6ZXIsIHtkaXJlY3Rpb246IERJUkVDVElPTl9IT1JJWk9OVEFMfSwgWydzd2lwZSddXSxcclxuICAgICAgICAgIFtUYXBSZWNvZ25pemVyXSxcclxuICAgICAgICAgIFtUYXBSZWNvZ25pemVyLCB7ZXZlbnQ6ICdkb3VibGV0YXAnLCB0YXBzOiAyfSwgWyd0YXAnXV0sXHJcbiAgICAgICAgICBbUHJlc3NSZWNvZ25pemVyXVxyXG4gICAgICBdLFxyXG4gIFxyXG4gICAgICAvKipcclxuICAgICAgICogU29tZSBDU1MgcHJvcGVydGllcyBjYW4gYmUgdXNlZCB0byBpbXByb3ZlIHRoZSB3b3JraW5nIG9mIEhhbW1lci5cclxuICAgICAgICogQWRkIHRoZW0gdG8gdGhpcyBtZXRob2QgYW5kIHRoZXkgd2lsbCBiZSBzZXQgd2hlbiBjcmVhdGluZyBhIG5ldyBNYW5hZ2VyLlxyXG4gICAgICAgKiBAbmFtZXNwYWNlXHJcbiAgICAgICAqL1xyXG4gICAgICBjc3NQcm9wczoge1xyXG4gICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgKiBEaXNhYmxlcyB0ZXh0IHNlbGVjdGlvbiB0byBpbXByb3ZlIHRoZSBkcmFnZ2luZyBnZXN0dXJlLiBNYWlubHkgZm9yIGRlc2t0b3AgYnJvd3NlcnMuXHJcbiAgICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICAgICAgICogQGRlZmF1bHQgJ25vbmUnXHJcbiAgICAgICAgICAgKi9cclxuICAgICAgICAgIHVzZXJTZWxlY3Q6ICdub25lJyxcclxuICBcclxuICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICogRGlzYWJsZSB0aGUgV2luZG93cyBQaG9uZSBncmlwcGVycyB3aGVuIHByZXNzaW5nIGFuIGVsZW1lbnQuXHJcbiAgICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICAgICAgICogQGRlZmF1bHQgJ25vbmUnXHJcbiAgICAgICAgICAgKi9cclxuICAgICAgICAgIHRvdWNoU2VsZWN0OiAnbm9uZScsXHJcbiAgXHJcbiAgICAgICAgICAvKipcclxuICAgICAgICAgICAqIERpc2FibGVzIHRoZSBkZWZhdWx0IGNhbGxvdXQgc2hvd24gd2hlbiB5b3UgdG91Y2ggYW5kIGhvbGQgYSB0b3VjaCB0YXJnZXQuXHJcbiAgICAgICAgICAgKiBPbiBpT1MsIHdoZW4geW91IHRvdWNoIGFuZCBob2xkIGEgdG91Y2ggdGFyZ2V0IHN1Y2ggYXMgYSBsaW5rLCBTYWZhcmkgZGlzcGxheXNcclxuICAgICAgICAgICAqIGEgY2FsbG91dCBjb250YWluaW5nIGluZm9ybWF0aW9uIGFib3V0IHRoZSBsaW5rLiBUaGlzIHByb3BlcnR5IGFsbG93cyB5b3UgdG8gZGlzYWJsZSB0aGF0IGNhbGxvdXQuXHJcbiAgICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxyXG4gICAgICAgICAgICogQGRlZmF1bHQgJ25vbmUnXHJcbiAgICAgICAgICAgKi9cclxuICAgICAgICAgIHRvdWNoQ2FsbG91dDogJ25vbmUnLFxyXG4gIFxyXG4gICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgKiBTcGVjaWZpZXMgd2hldGhlciB6b29taW5nIGlzIGVuYWJsZWQuIFVzZWQgYnkgSUUxMD5cclxuICAgICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XHJcbiAgICAgICAgICAgKiBAZGVmYXVsdCAnbm9uZSdcclxuICAgICAgICAgICAqL1xyXG4gICAgICAgICAgY29udGVudFpvb21pbmc6ICdub25lJyxcclxuICBcclxuICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICogU3BlY2lmaWVzIHRoYXQgYW4gZW50aXJlIGVsZW1lbnQgc2hvdWxkIGJlIGRyYWdnYWJsZSBpbnN0ZWFkIG9mIGl0cyBjb250ZW50cy4gTWFpbmx5IGZvciBkZXNrdG9wIGJyb3dzZXJzLlxyXG4gICAgICAgICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAgICAgICAqIEBkZWZhdWx0ICdub25lJ1xyXG4gICAgICAgICAgICovXHJcbiAgICAgICAgICB1c2VyRHJhZzogJ25vbmUnLFxyXG4gIFxyXG4gICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgKiBPdmVycmlkZXMgdGhlIGhpZ2hsaWdodCBjb2xvciBzaG93biB3aGVuIHRoZSB1c2VyIHRhcHMgYSBsaW5rIG9yIGEgSmF2YVNjcmlwdFxyXG4gICAgICAgICAgICogY2xpY2thYmxlIGVsZW1lbnQgaW4gaU9TLiBUaGlzIHByb3BlcnR5IG9iZXlzIHRoZSBhbHBoYSB2YWx1ZSwgaWYgc3BlY2lmaWVkLlxyXG4gICAgICAgICAgICogQHR5cGUge1N0cmluZ31cclxuICAgICAgICAgICAqIEBkZWZhdWx0ICdyZ2JhKDAsMCwwLDApJ1xyXG4gICAgICAgICAgICovXHJcbiAgICAgICAgICB0YXBIaWdobGlnaHRDb2xvcjogJ3JnYmEoMCwwLDAsMCknXHJcbiAgICAgIH1cclxuICB9O1xyXG4gIFxyXG4gIHZhciBTVE9QID0gMTtcclxuICB2YXIgRk9SQ0VEX1NUT1AgPSAyO1xyXG4gIFxyXG4gIC8qKlxyXG4gICAqIE1hbmFnZXJcclxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqIEBjb25zdHJ1Y3RvclxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIE1hbmFnZXIoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgICB0aGlzLm9wdGlvbnMgPSBhc3NpZ24oe30sIEhhbW1lci5kZWZhdWx0cywgb3B0aW9ucyB8fCB7fSk7XHJcbiAgXHJcbiAgICAgIHRoaXMub3B0aW9ucy5pbnB1dFRhcmdldCA9IHRoaXMub3B0aW9ucy5pbnB1dFRhcmdldCB8fCBlbGVtZW50O1xyXG4gIFxyXG4gICAgICB0aGlzLmhhbmRsZXJzID0ge307XHJcbiAgICAgIHRoaXMuc2Vzc2lvbiA9IHt9O1xyXG4gICAgICB0aGlzLnJlY29nbml6ZXJzID0gW107XHJcbiAgICAgIHRoaXMub2xkQ3NzUHJvcHMgPSB7fTtcclxuICBcclxuICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgICAgdGhpcy5pbnB1dCA9IGNyZWF0ZUlucHV0SW5zdGFuY2UodGhpcyk7XHJcbiAgICAgIHRoaXMudG91Y2hBY3Rpb24gPSBuZXcgVG91Y2hBY3Rpb24odGhpcywgdGhpcy5vcHRpb25zLnRvdWNoQWN0aW9uKTtcclxuICBcclxuICAgICAgdG9nZ2xlQ3NzUHJvcHModGhpcywgdHJ1ZSk7XHJcbiAgXHJcbiAgICAgIGVhY2godGhpcy5vcHRpb25zLnJlY29nbml6ZXJzLCBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICB2YXIgcmVjb2duaXplciA9IHRoaXMuYWRkKG5ldyAoaXRlbVswXSkoaXRlbVsxXSkpO1xyXG4gICAgICAgICAgaXRlbVsyXSAmJiByZWNvZ25pemVyLnJlY29nbml6ZVdpdGgoaXRlbVsyXSk7XHJcbiAgICAgICAgICBpdGVtWzNdICYmIHJlY29nbml6ZXIucmVxdWlyZUZhaWx1cmUoaXRlbVszXSk7XHJcbiAgICAgIH0sIHRoaXMpO1xyXG4gIH1cclxuICBcclxuICBNYW5hZ2VyLnByb3RvdHlwZSA9IHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIHNldCBvcHRpb25zXHJcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICAgICAqIEByZXR1cm5zIHtNYW5hZ2VyfVxyXG4gICAgICAgKi9cclxuICAgICAgc2V0OiBmdW5jdGlvbihvcHRpb25zKSB7XHJcbiAgICAgICAgICBhc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKTtcclxuICBcclxuICAgICAgICAgIC8vIE9wdGlvbnMgdGhhdCBuZWVkIGEgbGl0dGxlIG1vcmUgc2V0dXBcclxuICAgICAgICAgIGlmIChvcHRpb25zLnRvdWNoQWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy50b3VjaEFjdGlvbi51cGRhdGUoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChvcHRpb25zLmlucHV0VGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgLy8gQ2xlYW4gdXAgZXhpc3RpbmcgZXZlbnQgbGlzdGVuZXJzIGFuZCByZWluaXRpYWxpemVcclxuICAgICAgICAgICAgICB0aGlzLmlucHV0LmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICB0aGlzLmlucHV0LnRhcmdldCA9IG9wdGlvbnMuaW5wdXRUYXJnZXQ7XHJcbiAgICAgICAgICAgICAgdGhpcy5pbnB1dC5pbml0KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfSxcclxuICBcclxuICAgICAgLyoqXHJcbiAgICAgICAqIHN0b3AgcmVjb2duaXppbmcgZm9yIHRoaXMgc2Vzc2lvbi5cclxuICAgICAgICogVGhpcyBzZXNzaW9uIHdpbGwgYmUgZGlzY2FyZGVkLCB3aGVuIGEgbmV3IFtpbnB1dF1zdGFydCBldmVudCBpcyBmaXJlZC5cclxuICAgICAgICogV2hlbiBmb3JjZWQsIHRoZSByZWNvZ25pemVyIGN5Y2xlIGlzIHN0b3BwZWQgaW1tZWRpYXRlbHkuXHJcbiAgICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZvcmNlXVxyXG4gICAgICAgKi9cclxuICAgICAgc3RvcDogZnVuY3Rpb24oZm9yY2UpIHtcclxuICAgICAgICAgIHRoaXMuc2Vzc2lvbi5zdG9wcGVkID0gZm9yY2UgPyBGT1JDRURfU1RPUCA6IFNUT1A7XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBydW4gdGhlIHJlY29nbml6ZXJzIVxyXG4gICAgICAgKiBjYWxsZWQgYnkgdGhlIGlucHV0SGFuZGxlciBmdW5jdGlvbiBvbiBldmVyeSBtb3ZlbWVudCBvZiB0aGUgcG9pbnRlcnMgKHRvdWNoZXMpXHJcbiAgICAgICAqIGl0IHdhbGtzIHRocm91Z2ggYWxsIHRoZSByZWNvZ25pemVycyBhbmQgdHJpZXMgdG8gZGV0ZWN0IHRoZSBnZXN0dXJlIHRoYXQgaXMgYmVpbmcgbWFkZVxyXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXREYXRhXHJcbiAgICAgICAqL1xyXG4gICAgICByZWNvZ25pemU6IGZ1bmN0aW9uKGlucHV0RGF0YSkge1xyXG4gICAgICAgICAgdmFyIHNlc3Npb24gPSB0aGlzLnNlc3Npb247XHJcbiAgICAgICAgICBpZiAoc2Vzc2lvbi5zdG9wcGVkKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgICAgLy8gcnVuIHRoZSB0b3VjaC1hY3Rpb24gcG9seWZpbGxcclxuICAgICAgICAgIHRoaXMudG91Y2hBY3Rpb24ucHJldmVudERlZmF1bHRzKGlucHV0RGF0YSk7XHJcbiAgXHJcbiAgICAgICAgICB2YXIgcmVjb2duaXplcjtcclxuICAgICAgICAgIHZhciByZWNvZ25pemVycyA9IHRoaXMucmVjb2duaXplcnM7XHJcbiAgXHJcbiAgICAgICAgICAvLyB0aGlzIGhvbGRzIHRoZSByZWNvZ25pemVyIHRoYXQgaXMgYmVpbmcgcmVjb2duaXplZC5cclxuICAgICAgICAgIC8vIHNvIHRoZSByZWNvZ25pemVyJ3Mgc3RhdGUgbmVlZHMgdG8gYmUgQkVHQU4sIENIQU5HRUQsIEVOREVEIG9yIFJFQ09HTklaRURcclxuICAgICAgICAgIC8vIGlmIG5vIHJlY29nbml6ZXIgaXMgZGV0ZWN0aW5nIGEgdGhpbmcsIGl0IGlzIHNldCB0byBgbnVsbGBcclxuICAgICAgICAgIHZhciBjdXJSZWNvZ25pemVyID0gc2Vzc2lvbi5jdXJSZWNvZ25pemVyO1xyXG4gIFxyXG4gICAgICAgICAgLy8gcmVzZXQgd2hlbiB0aGUgbGFzdCByZWNvZ25pemVyIGlzIHJlY29nbml6ZWRcclxuICAgICAgICAgIC8vIG9yIHdoZW4gd2UncmUgaW4gYSBuZXcgc2Vzc2lvblxyXG4gICAgICAgICAgaWYgKCFjdXJSZWNvZ25pemVyIHx8IChjdXJSZWNvZ25pemVyICYmIGN1clJlY29nbml6ZXIuc3RhdGUgJiBTVEFURV9SRUNPR05JWkVEKSkge1xyXG4gICAgICAgICAgICAgIGN1clJlY29nbml6ZXIgPSBzZXNzaW9uLmN1clJlY29nbml6ZXIgPSBudWxsO1xyXG4gICAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgICAgdmFyIGkgPSAwO1xyXG4gICAgICAgICAgd2hpbGUgKGkgPCByZWNvZ25pemVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICByZWNvZ25pemVyID0gcmVjb2duaXplcnNbaV07XHJcbiAgXHJcbiAgICAgICAgICAgICAgLy8gZmluZCBvdXQgaWYgd2UgYXJlIGFsbG93ZWQgdHJ5IHRvIHJlY29nbml6ZSB0aGUgaW5wdXQgZm9yIHRoaXMgb25lLlxyXG4gICAgICAgICAgICAgIC8vIDEuICAgYWxsb3cgaWYgdGhlIHNlc3Npb24gaXMgTk9UIGZvcmNlZCBzdG9wcGVkIChzZWUgdGhlIC5zdG9wKCkgbWV0aG9kKVxyXG4gICAgICAgICAgICAgIC8vIDIuICAgYWxsb3cgaWYgd2Ugc3RpbGwgaGF2ZW4ndCByZWNvZ25pemVkIGEgZ2VzdHVyZSBpbiB0aGlzIHNlc3Npb24sIG9yIHRoZSB0aGlzIHJlY29nbml6ZXIgaXMgdGhlIG9uZVxyXG4gICAgICAgICAgICAgIC8vICAgICAgdGhhdCBpcyBiZWluZyByZWNvZ25pemVkLlxyXG4gICAgICAgICAgICAgIC8vIDMuICAgYWxsb3cgaWYgdGhlIHJlY29nbml6ZXIgaXMgYWxsb3dlZCB0byBydW4gc2ltdWx0YW5lb3VzIHdpdGggdGhlIGN1cnJlbnQgcmVjb2duaXplZCByZWNvZ25pemVyLlxyXG4gICAgICAgICAgICAgIC8vICAgICAgdGhpcyBjYW4gYmUgc2V0dXAgd2l0aCB0aGUgYHJlY29nbml6ZVdpdGgoKWAgbWV0aG9kIG9uIHRoZSByZWNvZ25pemVyLlxyXG4gICAgICAgICAgICAgIGlmIChzZXNzaW9uLnN0b3BwZWQgIT09IEZPUkNFRF9TVE9QICYmICggLy8gMVxyXG4gICAgICAgICAgICAgICAgICAgICAgIWN1clJlY29nbml6ZXIgfHwgcmVjb2duaXplciA9PSBjdXJSZWNvZ25pemVyIHx8IC8vIDJcclxuICAgICAgICAgICAgICAgICAgICAgIHJlY29nbml6ZXIuY2FuUmVjb2duaXplV2l0aChjdXJSZWNvZ25pemVyKSkpIHsgLy8gM1xyXG4gICAgICAgICAgICAgICAgICByZWNvZ25pemVyLnJlY29nbml6ZShpbnB1dERhdGEpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHJlY29nbml6ZXIucmVzZXQoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICAgICAgLy8gaWYgdGhlIHJlY29nbml6ZXIgaGFzIGJlZW4gcmVjb2duaXppbmcgdGhlIGlucHV0IGFzIGEgdmFsaWQgZ2VzdHVyZSwgd2Ugd2FudCB0byBzdG9yZSB0aGlzIG9uZSBhcyB0aGVcclxuICAgICAgICAgICAgICAvLyBjdXJyZW50IGFjdGl2ZSByZWNvZ25pemVyLiBidXQgb25seSBpZiB3ZSBkb24ndCBhbHJlYWR5IGhhdmUgYW4gYWN0aXZlIHJlY29nbml6ZXJcclxuICAgICAgICAgICAgICBpZiAoIWN1clJlY29nbml6ZXIgJiYgcmVjb2duaXplci5zdGF0ZSAmIChTVEFURV9CRUdBTiB8IFNUQVRFX0NIQU5HRUQgfCBTVEFURV9FTkRFRCkpIHtcclxuICAgICAgICAgICAgICAgICAgY3VyUmVjb2duaXplciA9IHNlc3Npb24uY3VyUmVjb2duaXplciA9IHJlY29nbml6ZXI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgIH1cclxuICAgICAgfSxcclxuICBcclxuICAgICAgLyoqXHJcbiAgICAgICAqIGdldCBhIHJlY29nbml6ZXIgYnkgaXRzIGV2ZW50IG5hbWUuXHJcbiAgICAgICAqIEBwYXJhbSB7UmVjb2duaXplcnxTdHJpbmd9IHJlY29nbml6ZXJcclxuICAgICAgICogQHJldHVybnMge1JlY29nbml6ZXJ8TnVsbH1cclxuICAgICAgICovXHJcbiAgICAgIGdldDogZnVuY3Rpb24ocmVjb2duaXplcikge1xyXG4gICAgICAgICAgaWYgKHJlY29nbml6ZXIgaW5zdGFuY2VvZiBSZWNvZ25pemVyKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHJlY29nbml6ZXI7XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICB2YXIgcmVjb2duaXplcnMgPSB0aGlzLnJlY29nbml6ZXJzO1xyXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWNvZ25pemVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgIGlmIChyZWNvZ25pemVyc1tpXS5vcHRpb25zLmV2ZW50ID09IHJlY29nbml6ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY29nbml6ZXJzW2ldO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICB9LFxyXG4gIFxyXG4gICAgICAvKipcclxuICAgICAgICogYWRkIGEgcmVjb2duaXplciB0byB0aGUgbWFuYWdlclxyXG4gICAgICAgKiBleGlzdGluZyByZWNvZ25pemVycyB3aXRoIHRoZSBzYW1lIGV2ZW50IG5hbWUgd2lsbCBiZSByZW1vdmVkXHJcbiAgICAgICAqIEBwYXJhbSB7UmVjb2duaXplcn0gcmVjb2duaXplclxyXG4gICAgICAgKiBAcmV0dXJucyB7UmVjb2duaXplcnxNYW5hZ2VyfVxyXG4gICAgICAgKi9cclxuICAgICAgYWRkOiBmdW5jdGlvbihyZWNvZ25pemVyKSB7XHJcbiAgICAgICAgICBpZiAoaW52b2tlQXJyYXlBcmcocmVjb2duaXplciwgJ2FkZCcsIHRoaXMpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICAvLyByZW1vdmUgZXhpc3RpbmdcclxuICAgICAgICAgIHZhciBleGlzdGluZyA9IHRoaXMuZ2V0KHJlY29nbml6ZXIub3B0aW9ucy5ldmVudCk7XHJcbiAgICAgICAgICBpZiAoZXhpc3RpbmcpIHtcclxuICAgICAgICAgICAgICB0aGlzLnJlbW92ZShleGlzdGluZyk7XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICB0aGlzLnJlY29nbml6ZXJzLnB1c2gocmVjb2duaXplcik7XHJcbiAgICAgICAgICByZWNvZ25pemVyLm1hbmFnZXIgPSB0aGlzO1xyXG4gIFxyXG4gICAgICAgICAgdGhpcy50b3VjaEFjdGlvbi51cGRhdGUoKTtcclxuICAgICAgICAgIHJldHVybiByZWNvZ25pemVyO1xyXG4gICAgICB9LFxyXG4gIFxyXG4gICAgICAvKipcclxuICAgICAgICogcmVtb3ZlIGEgcmVjb2duaXplciBieSBuYW1lIG9yIGluc3RhbmNlXHJcbiAgICAgICAqIEBwYXJhbSB7UmVjb2duaXplcnxTdHJpbmd9IHJlY29nbml6ZXJcclxuICAgICAgICogQHJldHVybnMge01hbmFnZXJ9XHJcbiAgICAgICAqL1xyXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uKHJlY29nbml6ZXIpIHtcclxuICAgICAgICAgIGlmIChpbnZva2VBcnJheUFyZyhyZWNvZ25pemVyLCAncmVtb3ZlJywgdGhpcykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgIH1cclxuICBcclxuICAgICAgICAgIHJlY29nbml6ZXIgPSB0aGlzLmdldChyZWNvZ25pemVyKTtcclxuICBcclxuICAgICAgICAgIC8vIGxldCdzIG1ha2Ugc3VyZSB0aGlzIHJlY29nbml6ZXIgZXhpc3RzXHJcbiAgICAgICAgICBpZiAocmVjb2duaXplcikge1xyXG4gICAgICAgICAgICAgIHZhciByZWNvZ25pemVycyA9IHRoaXMucmVjb2duaXplcnM7XHJcbiAgICAgICAgICAgICAgdmFyIGluZGV4ID0gaW5BcnJheShyZWNvZ25pemVycywgcmVjb2duaXplcik7XHJcbiAgXHJcbiAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICByZWNvZ25pemVycy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLnRvdWNoQWN0aW9uLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICBcclxuICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICB9LFxyXG4gIFxyXG4gICAgICAvKipcclxuICAgICAgICogYmluZCBldmVudFxyXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRzXHJcbiAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcclxuICAgICAgICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gdGhpc1xyXG4gICAgICAgKi9cclxuICAgICAgb246IGZ1bmN0aW9uKGV2ZW50cywgaGFuZGxlcikge1xyXG4gICAgICAgICAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGhhbmRsZXIgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICBcclxuICAgICAgICAgIHZhciBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnM7XHJcbiAgICAgICAgICBlYWNoKHNwbGl0U3RyKGV2ZW50cyksIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgaGFuZGxlcnNbZXZlbnRdID0gaGFuZGxlcnNbZXZlbnRdIHx8IFtdO1xyXG4gICAgICAgICAgICAgIGhhbmRsZXJzW2V2ZW50XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfSxcclxuICBcclxuICAgICAgLyoqXHJcbiAgICAgICAqIHVuYmluZCBldmVudCwgbGVhdmUgZW1pdCBibGFuayB0byByZW1vdmUgYWxsIGhhbmRsZXJzXHJcbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudHNcclxuICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2hhbmRsZXJdXHJcbiAgICAgICAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IHRoaXNcclxuICAgICAgICovXHJcbiAgICAgIG9mZjogZnVuY3Rpb24oZXZlbnRzLCBoYW5kbGVyKSB7XHJcbiAgICAgICAgICBpZiAoZXZlbnRzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICB2YXIgaGFuZGxlcnMgPSB0aGlzLmhhbmRsZXJzO1xyXG4gICAgICAgICAgZWFjaChzcGxpdFN0cihldmVudHMpLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICAgIGlmICghaGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgICBkZWxldGUgaGFuZGxlcnNbZXZlbnRdO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGhhbmRsZXJzW2V2ZW50XSAmJiBoYW5kbGVyc1tldmVudF0uc3BsaWNlKGluQXJyYXkoaGFuZGxlcnNbZXZlbnRdLCBoYW5kbGVyKSwgMSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfSxcclxuICBcclxuICAgICAgLyoqXHJcbiAgICAgICAqIGVtaXQgZXZlbnQgdG8gdGhlIGxpc3RlbmVyc1xyXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuICAgICAgICovXHJcbiAgICAgIGVtaXQ6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgICAvLyB3ZSBhbHNvIHdhbnQgdG8gdHJpZ2dlciBkb20gZXZlbnRzXHJcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRvbUV2ZW50cykge1xyXG4gICAgICAgICAgICAgIHRyaWdnZXJEb21FdmVudChldmVudCwgZGF0YSk7XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICAvLyBubyBoYW5kbGVycywgc28gc2tpcCBpdCBhbGxcclxuICAgICAgICAgIHZhciBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnNbZXZlbnRdICYmIHRoaXMuaGFuZGxlcnNbZXZlbnRdLnNsaWNlKCk7XHJcbiAgICAgICAgICBpZiAoIWhhbmRsZXJzIHx8ICFoYW5kbGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICBkYXRhLnR5cGUgPSBldmVudDtcclxuICAgICAgICAgIGRhdGEucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBkYXRhLnNyY0V2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICB9O1xyXG4gIFxyXG4gICAgICAgICAgdmFyIGkgPSAwO1xyXG4gICAgICAgICAgd2hpbGUgKGkgPCBoYW5kbGVycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICBoYW5kbGVyc1tpXShkYXRhKTtcclxuICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBkZXN0cm95IHRoZSBtYW5hZ2VyIGFuZCB1bmJpbmRzIGFsbCBldmVudHNcclxuICAgICAgICogaXQgZG9lc24ndCB1bmJpbmQgZG9tIGV2ZW50cywgdGhhdCBpcyB0aGUgdXNlciBvd24gcmVzcG9uc2liaWxpdHlcclxuICAgICAgICovXHJcbiAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdGhpcy5lbGVtZW50ICYmIHRvZ2dsZUNzc1Byb3BzKHRoaXMsIGZhbHNlKTtcclxuICBcclxuICAgICAgICAgIHRoaXMuaGFuZGxlcnMgPSB7fTtcclxuICAgICAgICAgIHRoaXMuc2Vzc2lvbiA9IHt9O1xyXG4gICAgICAgICAgdGhpcy5pbnB1dC5kZXN0cm95KCk7XHJcbiAgICAgICAgICB0aGlzLmVsZW1lbnQgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgfTtcclxuICBcclxuICAvKipcclxuICAgKiBhZGQvcmVtb3ZlIHRoZSBjc3MgcHJvcGVydGllcyBhcyBkZWZpbmVkIGluIG1hbmFnZXIub3B0aW9ucy5jc3NQcm9wc1xyXG4gICAqIEBwYXJhbSB7TWFuYWdlcn0gbWFuYWdlclxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gYWRkXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gdG9nZ2xlQ3NzUHJvcHMobWFuYWdlciwgYWRkKSB7XHJcbiAgICAgIHZhciBlbGVtZW50ID0gbWFuYWdlci5lbGVtZW50O1xyXG4gICAgICBpZiAoIWVsZW1lbnQuc3R5bGUpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB2YXIgcHJvcDtcclxuICAgICAgZWFjaChtYW5hZ2VyLm9wdGlvbnMuY3NzUHJvcHMsIGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XHJcbiAgICAgICAgICBwcm9wID0gcHJlZml4ZWQoZWxlbWVudC5zdHlsZSwgbmFtZSk7XHJcbiAgICAgICAgICBpZiAoYWRkKSB7XHJcbiAgICAgICAgICAgICAgbWFuYWdlci5vbGRDc3NQcm9wc1twcm9wXSA9IGVsZW1lbnQuc3R5bGVbcHJvcF07XHJcbiAgICAgICAgICAgICAgZWxlbWVudC5zdHlsZVtwcm9wXSA9IHZhbHVlO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlW3Byb3BdID0gbWFuYWdlci5vbGRDc3NQcm9wc1twcm9wXSB8fCAnJztcclxuICAgICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIGlmICghYWRkKSB7XHJcbiAgICAgICAgICBtYW5hZ2VyLm9sZENzc1Byb3BzID0ge307XHJcbiAgICAgIH1cclxuICB9XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogdHJpZ2dlciBkb20gZXZlbnRcclxuICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHRyaWdnZXJEb21FdmVudChldmVudCwgZGF0YSkge1xyXG4gICAgICB2YXIgZ2VzdHVyZUV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XHJcbiAgICAgIGdlc3R1cmVFdmVudC5pbml0RXZlbnQoZXZlbnQsIHRydWUsIHRydWUpO1xyXG4gICAgICBnZXN0dXJlRXZlbnQuZ2VzdHVyZSA9IGRhdGE7XHJcbiAgICAgIGRhdGEudGFyZ2V0LmRpc3BhdGNoRXZlbnQoZ2VzdHVyZUV2ZW50KTtcclxuICB9XHJcbiAgXHJcbiAgYXNzaWduKEhhbW1lciwge1xyXG4gICAgICBJTlBVVF9TVEFSVDogSU5QVVRfU1RBUlQsXHJcbiAgICAgIElOUFVUX01PVkU6IElOUFVUX01PVkUsXHJcbiAgICAgIElOUFVUX0VORDogSU5QVVRfRU5ELFxyXG4gICAgICBJTlBVVF9DQU5DRUw6IElOUFVUX0NBTkNFTCxcclxuICBcclxuICAgICAgU1RBVEVfUE9TU0lCTEU6IFNUQVRFX1BPU1NJQkxFLFxyXG4gICAgICBTVEFURV9CRUdBTjogU1RBVEVfQkVHQU4sXHJcbiAgICAgIFNUQVRFX0NIQU5HRUQ6IFNUQVRFX0NIQU5HRUQsXHJcbiAgICAgIFNUQVRFX0VOREVEOiBTVEFURV9FTkRFRCxcclxuICAgICAgU1RBVEVfUkVDT0dOSVpFRDogU1RBVEVfUkVDT0dOSVpFRCxcclxuICAgICAgU1RBVEVfQ0FOQ0VMTEVEOiBTVEFURV9DQU5DRUxMRUQsXHJcbiAgICAgIFNUQVRFX0ZBSUxFRDogU1RBVEVfRkFJTEVELFxyXG4gIFxyXG4gICAgICBESVJFQ1RJT05fTk9ORTogRElSRUNUSU9OX05PTkUsXHJcbiAgICAgIERJUkVDVElPTl9MRUZUOiBESVJFQ1RJT05fTEVGVCxcclxuICAgICAgRElSRUNUSU9OX1JJR0hUOiBESVJFQ1RJT05fUklHSFQsXHJcbiAgICAgIERJUkVDVElPTl9VUDogRElSRUNUSU9OX1VQLFxyXG4gICAgICBESVJFQ1RJT05fRE9XTjogRElSRUNUSU9OX0RPV04sXHJcbiAgICAgIERJUkVDVElPTl9IT1JJWk9OVEFMOiBESVJFQ1RJT05fSE9SSVpPTlRBTCxcclxuICAgICAgRElSRUNUSU9OX1ZFUlRJQ0FMOiBESVJFQ1RJT05fVkVSVElDQUwsXHJcbiAgICAgIERJUkVDVElPTl9BTEw6IERJUkVDVElPTl9BTEwsXHJcbiAgXHJcbiAgICAgIE1hbmFnZXI6IE1hbmFnZXIsXHJcbiAgICAgIElucHV0OiBJbnB1dCxcclxuICAgICAgVG91Y2hBY3Rpb246IFRvdWNoQWN0aW9uLFxyXG4gIFxyXG4gICAgICBUb3VjaElucHV0OiBUb3VjaElucHV0LFxyXG4gICAgICBNb3VzZUlucHV0OiBNb3VzZUlucHV0LFxyXG4gICAgICBQb2ludGVyRXZlbnRJbnB1dDogUG9pbnRlckV2ZW50SW5wdXQsXHJcbiAgICAgIFRvdWNoTW91c2VJbnB1dDogVG91Y2hNb3VzZUlucHV0LFxyXG4gICAgICBTaW5nbGVUb3VjaElucHV0OiBTaW5nbGVUb3VjaElucHV0LFxyXG4gIFxyXG4gICAgICBSZWNvZ25pemVyOiBSZWNvZ25pemVyLFxyXG4gICAgICBBdHRyUmVjb2duaXplcjogQXR0clJlY29nbml6ZXIsXHJcbiAgICAgIFRhcDogVGFwUmVjb2duaXplcixcclxuICAgICAgUGFuOiBQYW5SZWNvZ25pemVyLFxyXG4gICAgICBTd2lwZTogU3dpcGVSZWNvZ25pemVyLFxyXG4gICAgICBQaW5jaDogUGluY2hSZWNvZ25pemVyLFxyXG4gICAgICBSb3RhdGU6IFJvdGF0ZVJlY29nbml6ZXIsXHJcbiAgICAgIFByZXNzOiBQcmVzc1JlY29nbml6ZXIsXHJcbiAgXHJcbiAgICAgIG9uOiBhZGRFdmVudExpc3RlbmVycyxcclxuICAgICAgb2ZmOiByZW1vdmVFdmVudExpc3RlbmVycyxcclxuICAgICAgZWFjaDogZWFjaCxcclxuICAgICAgbWVyZ2U6IG1lcmdlLFxyXG4gICAgICBleHRlbmQ6IGV4dGVuZCxcclxuICAgICAgYXNzaWduOiBhc3NpZ24sXHJcbiAgICAgIGluaGVyaXQ6IGluaGVyaXQsXHJcbiAgICAgIGJpbmRGbjogYmluZEZuLFxyXG4gICAgICBwcmVmaXhlZDogcHJlZml4ZWRcclxuICB9KTtcclxuICBcclxuICAvLyB0aGlzIHByZXZlbnRzIGVycm9ycyB3aGVuIEhhbW1lciBpcyBsb2FkZWQgaW4gdGhlIHByZXNlbmNlIG9mIGFuIEFNRFxyXG4gIC8vICBzdHlsZSBsb2FkZXIgYnV0IGJ5IHNjcmlwdCB0YWcsIG5vdCBieSB0aGUgbG9hZGVyLlxyXG4gIHZhciBmcmVlR2xvYmFsID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB7fSkpOyAvLyBqc2hpbnQgaWdub3JlOmxpbmVcclxuICBmcmVlR2xvYmFsLkhhbW1lciA9IEhhbW1lcjtcclxuICBcclxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgIGRlZmluZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHJldHVybiBIYW1tZXI7XHJcbiAgICAgIH0pO1xyXG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xyXG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IEhhbW1lcjtcclxuICB9IGVsc2Uge1xyXG4gICAgICB3aW5kb3dbZXhwb3J0TmFtZV0gPSBIYW1tZXI7XHJcbiAgfVxyXG4gIFxyXG4gIH0pKHdpbmRvdywgZG9jdW1lbnQsICdIYW1tZXInKTsiXX0=

(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(this);

// Polyfill for creating CustomEvents on IE9/10/11

// code pulled from:
// https://github.com/d4tocchini/customevent-polyfill
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent#Polyfill

try {
    var ce = new window.CustomEvent('test');
    ce.preventDefault();
    if (ce.defaultPrevented !== true) {
        // IE has problems with .preventDefault() on custom events
        // http://stackoverflow.com/questions/23349191
        throw new Error('Could not prevent default');
    }
} catch(e) {
  var CustomEvent = function(event, params) {
    var evt, origPrevent;
    params = params || {
      bubbles: false,
      cancelable: false,
      detail: undefined
    };

    evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    origPrevent = evt.preventDefault;
    evt.preventDefault = function () {
      origPrevent.call(this);
      try {
        Object.defineProperty(this, 'defaultPrevented', {
          get: function () {
            return true;
          }
        });
      } catch(e) {
        this.defaultPrevented = true;
      }
    };
    return evt;
  };

  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent; // expose definition to window
}

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module depending on jQuery.
		define(['jquery'], factory);
	} else {
		// No AMD. Register plugin with global jQuery object.
		try{
			factory(jQuery);
		}catch(e){
			// whoops no jquery..
		}
	}
	}(function ($) {
		$.fn.conversationalForm = function (options /* ConversationalFormOptions, see README */) {
			options = options || {};
			if(!options.formEl)
				options.formEl = this[0];
			return new cf.ConversationalForm(options);
		};
	}
));
// namespace
var cf;
(function (cf) {
    // interface
    // class
    var Helpers = (function () {
        function Helpers() {
        }
        Helpers.lerp = function (norm, min, max) {
            return (max - min) * norm + min;
        };
        Helpers.norm = function (value, min, max) {
            return (value - min) / (max - min);
        };
        Helpers.getXYFromMouseTouchEvent = function (event) {
            var touches = null;
            if (event.originalEvent)
                touches = event.originalEvent.touches || event.originalEvent.changedTouches;
            else if (event.changedTouches)
                touches = event.changedTouches;
            if (touches) {
                return { x: touches[0].pageX, y: touches[0].pageY, touches: touches[0] };
            }
            else {
                return { x: event.pageX, y: event.pageY, touches: null };
            }
        };
        Helpers.getInnerTextOfElement = function (element) {
            var tmp = document.createElement("DIV");
            tmp.innerHTML = element.innerHTML;
            // return 
            var text = tmp.textContent || tmp.innerText || "";
            // text = String(text).replace('\t','');
            text = String(text).replace(/^\s+|\s+$/g, '');
            return text;
        };
        Helpers.getMouseEvent = function (eventString) {
            var mappings = [];
            mappings["click"] = "ontouchstart" in window ? "touchstart" : "click";
            mappings["mousedown"] = "ontouchstart" in window ? "touchstart" : "mousedown";
            mappings["mouseup"] = "ontouchstart" in window ? "touchend" : "mouseup";
            mappings["mousemove"] = "ontouchstart" in window ? "touchmove" : "mousemove";
            return mappings[eventString];
        };
        Helpers.setEmojiLib = function (lib, scriptSrc) {
            if (lib === void 0) { lib = "emojify"; }
            if (scriptSrc === void 0) { scriptSrc = "//cdnjs.cloudflare.com/ajax/libs/emojify.js/1.1.0/js/emojify.min.js"; }
            var head = document.head || document.getElementsByTagName("head")[0];
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.onload = function () {
                // we use https://github.com/Ranks/emojify.js as a standard
                Helpers.emojilib = window[lib];
                if (Helpers.emojilib) {
                    Helpers.emojilib.setConfig({
                        img_dir: "https://cdnjs.cloudflare.com/ajax/libs/emojify.js/1.1.0/images/basic/",
                    });
                }
            };
            script.setAttribute("src", scriptSrc);
            head.appendChild(script);
        };
        Helpers.emojify = function (str) {
            if (Helpers.emojilib) {
                str = Helpers.emojilib.replace(str);
            }
            return str;
        };
        Helpers.setTransform = function (el, transformString) {
            el.style["-webkit-transform"] = transformString;
            el.style["-moz-transform"] = transformString;
            el.style["-ms-transform"] = transformString;
            el.style["transform"] = transformString;
        };
        return Helpers;
    }());
    Helpers.caniuse = {
        fileReader: function () {
            if (window.File && window.FileReader && window.FileList && window.Blob)
                return true;
            return false;
        }
    };
    Helpers.emojilib = null;
    cf.Helpers = Helpers;
})(cf || (cf = {}));

/// <reference path="../ConversationalForm.ts"/>
var cf;
(function (cf) {
    // interface
    var EventDispatcher = (function () {
        function EventDispatcher(cfRef) {
            this._cf = cfRef;
            this.target = document.createDocumentFragment();
        }
        Object.defineProperty(EventDispatcher.prototype, "cf", {
            get: function () {
                return this._cf;
            },
            enumerable: true,
            configurable: true
        });
        EventDispatcher.prototype.addEventListener = function (type, listener, useCapture) {
            return this.target.addEventListener(type, listener, useCapture);
        };
        EventDispatcher.prototype.dispatchEvent = function (event) {
            return this.target.dispatchEvent(event);
        };
        EventDispatcher.prototype.removeEventListener = function (type, listener, useCapture) {
            this.target.removeEventListener(type, listener, useCapture);
        };
        return EventDispatcher;
    }());
    cf.EventDispatcher = EventDispatcher;
})(cf || (cf = {}));

// namespace
var cf;
(function (cf) {
    // interface
    var TagsParser = (function () {
        function TagsParser() {
        }
        TagsParser.parseTag = function (element) {
            var tag = document.createElement(element.tag);
            tag.setAttribute("cf-formless", "");
            // TODO: ES6 mapping??
            for (var k in element) {
                if (k !== "tag") {
                    tag.setAttribute(k, element[k]);
                }
            }
            return tag;
        };
        TagsParser.parseGroupTag = function (groupTag) {
            var groupEl = TagsParser.parseTag(groupTag);
            var groupChildren = groupTag.children;
            for (var j = 0; j < groupChildren.length; j++) {
                var fieldSetTagData = groupChildren[j];
                var tag = TagsParser.parseTag(fieldSetTagData);
                groupEl.appendChild(tag);
            }
            return groupEl;
        };
        TagsParser.parseJSONIntoElements = function (data) {
            var formEl = document.createElement("form");
            for (var i = 0; i < data.length; i++) {
                var element = data[i];
                var tag = TagsParser.parseTag(element);
                // add sub children to tag, ex. option, checkbox, etc.
                if (element.children && element.children.length > 0) {
                    for (var j = 0; j < element.children.length; j++) {
                        var subElement = TagsParser.parseTag(element.children[j]);
                        tag.appendChild(subElement);
                    }
                }
                formEl.appendChild(tag);
            }
            return formEl;
        };
        TagsParser.isElementFormless = function (element) {
            if (element.hasAttribute("cf-formless"))
                return true;
            return false;
        };
        return TagsParser;
    }());
    cf.TagsParser = TagsParser;
})(cf || (cf = {}));

/// <reference path="../logic/EventDispatcher.ts"/>
// namespace
var cf;
(function (cf) {
    // class
    var BasicElement = (function () {
        function BasicElement(options) {
            this.eventTarget = options.eventTarget;
            // TODO: remove
            if (!this.eventTarget)
                throw new Error("this.eventTarget not set!! : " + this.constructor.name);
            this.setData(options);
            this.createElement();
        }
        BasicElement.prototype.setData = function (options) {
        };
        BasicElement.prototype.createElement = function () {
            var template = document.createElement('template');
            template.innerHTML = this.getTemplate();
            this.el = template.firstChild || template.content.firstChild;
            return this.el;
        };
        // template, should be overwritten ...
        BasicElement.prototype.getTemplate = function () { return "should be overwritten..."; };
        ;
        BasicElement.prototype.dealloc = function () {
            this.el.parentNode.removeChild(this.el);
        };
        return BasicElement;
    }());
    cf.BasicElement = BasicElement;
})(cf || (cf = {}));

/// <reference path="../../ConversationalForm.ts"/>
/// <reference path="../BasicElement.ts"/>
/// <reference path="../../form-tags/Tag.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// namespace
var cf;
(function (cf) {
    cf.ControlElementEvents = {
        SUBMIT_VALUE: "cf-basic-element-submit",
        PROGRESS_CHANGE: "cf-basic-element-progress",
        ON_FOCUS: "cf-basic-element-on-focus",
        ON_LOADED: "cf-basic-element-on-loaded",
    };
    cf.ControlElementProgressStates = {
        BUSY: "cf-control-element-progress-BUSY",
        READY: "cf-control-element-progress-READY",
    };
    // class
    var ControlElement = (function (_super) {
        __extends(ControlElement, _super);
        function ControlElement(options) {
            var _this = _super.call(this, options) || this;
            _this.animateInTimer = 0;
            _this._partOfSeveralChoices = false;
            _this._focus = false;
            _this.onFocusCallback = _this.onFocus.bind(_this);
            _this.el.addEventListener('focus', _this.onFocusCallback, false);
            _this.onBlurCallback = _this.onBlur.bind(_this);
            _this.el.addEventListener('blur', _this.onBlurCallback, false);
            return _this;
        }
        Object.defineProperty(ControlElement.prototype, "type", {
            get: function () {
                return "ControlElement";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ControlElement.prototype, "partOfSeveralChoices", {
            get: function () {
                return this._partOfSeveralChoices;
            },
            set: function (value) {
                this._partOfSeveralChoices = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ControlElement.prototype, "value", {
            get: function () {
                // value is for the chat response -->
                var hasTagImage = this.referenceTag.hasImage;
                var str;
                if (hasTagImage && !this.partOfSeveralChoices) {
                    var image = hasTagImage ? "<img src='" + this.referenceTag.domElement.getAttribute("cf-image") + "'/>" : "";
                    str = "<div class='contains-image'>";
                    str += image;
                    str += "<span>" + cf.Helpers.getInnerTextOfElement(this.el) + "</span>";
                    str += "</div>";
                }
                else {
                    str = "<div><span>" + cf.Helpers.getInnerTextOfElement(this.el) + "</span></div>";
                }
                return str;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ControlElement.prototype, "positionVector", {
            get: function () {
                return this._positionVector;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ControlElement.prototype, "tabIndex", {
            set: function (value) {
                this.el.tabIndex = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ControlElement.prototype, "highlight", {
            get: function () {
                return this.el.classList.contains("highlight");
            },
            set: function (value) {
                this.el.classList.toggle("highlight", value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ControlElement.prototype, "focus", {
            get: function () {
                return this._focus;
            },
            set: function (value) {
                this._focus = value;
                if (this._focus)
                    this.el.focus();
                else
                    this.el.blur();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ControlElement.prototype, "visible", {
            get: function () {
                return !this.el.classList.contains("hide");
            },
            set: function (value) {
                if (value) {
                    this.el.classList.remove("hide");
                }
                else {
                    this.el.classList.add("hide");
                    this.tabIndex = -1;
                    this.highlight = false;
                }
            },
            enumerable: true,
            configurable: true
        });
        ControlElement.prototype.onBlur = function (event) {
            this._focus = false;
        };
        ControlElement.prototype.onFocus = function (event) {
            this._focus = true;
            cf.ConversationalForm.illustrateFlow(this, "dispatch", cf.ControlElementEvents.ON_FOCUS, this.referenceTag);
            this.eventTarget.dispatchEvent(new CustomEvent(cf.ControlElementEvents.ON_FOCUS, {
                detail: this.positionVector
            }));
        };
        /**
        * @name hasImage
        * if control element contains an image element
        */
        ControlElement.prototype.hasImage = function () {
            return false;
        };
        ControlElement.prototype.calcPosition = function () {
            var mr = parseInt(window.getComputedStyle(this.el).getPropertyValue("margin-right"), 10);
            // try not to do this to often, re-paint whammy!
            this._positionVector = {
                height: this.el.offsetHeight,
                width: this.el.offsetWidth + mr,
                x: this.el.offsetLeft,
                y: this.el.offsetTop,
                el: this,
            };
            this._positionVector.centerX = this._positionVector.x + (this._positionVector.width * 0.5);
            this._positionVector.centerY = this._positionVector.y + (this._positionVector.height * 0.5);
        };
        ControlElement.prototype.setData = function (options) {
            this.referenceTag = options.referenceTag;
            _super.prototype.setData.call(this, options);
        };
        ControlElement.prototype.animateIn = function () {
            clearTimeout(this.animateInTimer);
            this.el.classList.add("animate-in");
        };
        ControlElement.prototype.animateOut = function () {
            this.el.classList.add("animate-out");
        };
        ControlElement.prototype.onChoose = function () {
            cf.ConversationalForm.illustrateFlow(this, "dispatch", cf.ControlElementEvents.SUBMIT_VALUE, this.referenceTag);
            this.eventTarget.dispatchEvent(new CustomEvent(cf.ControlElementEvents.SUBMIT_VALUE, {
                detail: this
            }));
        };
        ControlElement.prototype.dealloc = function () {
            this.el.removeEventListener('blur', this.onBlurCallback, false);
            this.onBlurCallback = null;
            this.el.removeEventListener('focus', this.onFocusCallback, false);
            this.onFocusCallback = null;
            _super.prototype.dealloc.call(this);
        };
        return ControlElement;
    }(cf.BasicElement));
    cf.ControlElement = ControlElement;
})(cf || (cf = {}));

/// <reference path="Button.ts"/>
/// <reference path="ControlElement.ts"/>
/// <reference path="RadioButton.ts"/>
/// <reference path="CheckboxButton.ts"/>
/// <reference path="OptionsList.ts"/>
/// <reference path="UploadFileUI.ts"/>
/// <reference path="../../logic/EventDispatcher.ts"/>
/// <reference path="../ScrollController.ts"/>
/// <reference path="../chat/ChatResponse.ts"/>
/// <reference path="../../../typings/globals/es6-promise/index.d.ts"/>
// namespace
var cf;
(function (cf) {
    var ControlElements = (function () {
        function ControlElements(options) {
            this.ignoreKeyboardInput = false;
            this.rowIndex = -1;
            this.columnIndex = 0;
            this.elementWidth = 0;
            this.filterListNumberOfVisible = 0;
            this.listWidth = 0;
            this.el = options.el;
            this.eventTarget = options.eventTarget;
            this.list = this.el.getElementsByTagName("cf-list")[0];
            this.infoElement = options.infoEl;
            this.onScrollCallback = this.onScroll.bind(this);
            this.el.addEventListener('scroll', this.onScrollCallback, false);
            this.onResizeCallback = this.onResize.bind(this);
            window.addEventListener('resize', this.onResizeCallback, false);
            this.onElementFocusCallback = this.onElementFocus.bind(this);
            this.eventTarget.addEventListener(cf.ControlElementEvents.ON_FOCUS, this.onElementFocusCallback, false);
            this.onElementLoadedCallback = this.onElementLoaded.bind(this);
            this.eventTarget.addEventListener(cf.ControlElementEvents.ON_LOADED, this.onElementLoadedCallback, false);
            this.onChatReponsesUpdatedCallback = this.onChatReponsesUpdated.bind(this);
            this.eventTarget.addEventListener(cf.ChatListEvents.CHATLIST_UPDATED, this.onChatReponsesUpdatedCallback, false);
            this.onUserInputKeyChangeCallback = this.onUserInputKeyChange.bind(this);
            this.eventTarget.addEventListener(cf.UserInputEvents.KEY_CHANGE, this.onUserInputKeyChangeCallback, false);
            // user input update
            this.userInputUpdateCallback = this.onUserInputUpdate.bind(this);
            this.eventTarget.addEventListener(cf.FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false);
            this.listScrollController = new cf.ScrollController({
                interactionListener: this.el,
                listToScroll: this.list,
                eventTarget: this.eventTarget,
                listNavButtons: this.el.getElementsByTagName("cf-list-button"),
            });
        }
        Object.defineProperty(ControlElements.prototype, "active", {
            get: function () {
                return this.elements && this.elements.length > 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ControlElements.prototype, "focus", {
            get: function () {
                if (!this.elements)
                    return false;
                var elements = this.getElements();
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    if (element.focus) {
                        return true;
                    }
                }
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ControlElements.prototype, "highlighted", {
            get: function () {
                if (!this.elements)
                    return false;
                var elements = this.getElements();
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    if (element.highlight) {
                        return true;
                    }
                }
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ControlElements.prototype, "disabled", {
            set: function (value) {
                if (value)
                    this.list.classList.add("disabled");
                else
                    this.list.classList.remove("disabled");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ControlElements.prototype, "length", {
            get: function () {
                var elements = this.getElements();
                return elements.length;
            },
            enumerable: true,
            configurable: true
        });
        ControlElements.prototype.onScroll = function (event) {
            // some times the tabbing will result in el scroll, reset this.
            this.el.scrollLeft = 0;
        };
        /**
        * @name onElementLoaded
        * when element is loaded, usally image loaded.
        */
        ControlElements.prototype.onElementLoaded = function (event) {
            this.onResize(null);
        };
        ControlElements.prototype.onElementFocus = function (event) {
            var vector = event.detail;
            var x = (vector.x + vector.width < this.elementWidth ? 0 : vector.x - vector.width);
            x *= -1;
            this.updateRowColIndexFromVector(vector);
            this.listScrollController.setScroll(x, 0);
        };
        ControlElements.prototype.updateRowColIndexFromVector = function (vector) {
            for (var i = 0; i < this.tableableRows.length; i++) {
                var items = this.tableableRows[i];
                for (var j = 0; j < items.length; j++) {
                    var item = items[j];
                    if (item == vector.el) {
                        this.rowIndex = i;
                        this.columnIndex = j;
                        break;
                    }
                }
            }
        };
        ControlElements.prototype.onChatReponsesUpdated = function (event) {
            this.animateElementsIn();
        };
        ControlElements.prototype.onUserInputKeyChange = function (event) {
            if (this.ignoreKeyboardInput) {
                this.ignoreKeyboardInput = false;
                return;
            }
            var dto = event.detail;
            var userInput = dto.dto.input;
            if (this.active) {
                var isNavKey = [cf.Dictionary.keyCodes["left"], cf.Dictionary.keyCodes["right"], cf.Dictionary.keyCodes["down"], cf.Dictionary.keyCodes["up"]].indexOf(dto.keyCode) != -1;
                var shouldFilter = dto.inputFieldActive && !isNavKey;
                if (shouldFilter) {
                    // input field is active, so we should filter..
                    var dto_1 = event.detail.dto;
                    var inputValue = dto_1.input.getInputValue();
                    this.filterElementsFrom(inputValue);
                }
                else {
                    if (dto.keyCode == cf.Dictionary.keyCodes["left"]) {
                        this.columnIndex--;
                    }
                    else if (dto.keyCode == cf.Dictionary.keyCodes["right"]) {
                        this.columnIndex++;
                    }
                    else if (dto.keyCode == cf.Dictionary.keyCodes["down"]) {
                        this.updateRowIndex(1);
                    }
                    else if (dto.keyCode == cf.Dictionary.keyCodes["up"]) {
                        this.updateRowIndex(-1);
                    }
                    else if (dto.keyCode == cf.Dictionary.keyCodes["enter"] || dto.keyCode == cf.Dictionary.keyCodes["space"]) {
                        if (this.tableableRows[this.rowIndex] && this.tableableRows[this.rowIndex][this.columnIndex]) {
                            this.tableableRows[this.rowIndex][this.columnIndex].el.click();
                        }
                        else if (this.tableableRows[0] && this.tableableRows[0].length == 1) {
                            // this is when only one element in a filter, then we click it!
                            this.tableableRows[0][0].el.click();
                        }
                    }
                    if (!this.validateRowColIndexes()) {
                        userInput.setFocusOnInput();
                    }
                }
            }
            if (!userInput.active && this.validateRowColIndexes() && this.tableableRows && (this.rowIndex == 0 || this.rowIndex == 1)) {
                this.tableableRows[this.rowIndex][this.columnIndex].focus = true;
            }
            else if (!userInput.active) {
                userInput.setFocusOnInput();
            }
        };
        ControlElements.prototype.validateRowColIndexes = function () {
            var maxRowIndex = (this.el.classList.contains("two-row") ? 1 : 0);
            if (this.rowIndex != -1 && this.tableableRows[this.rowIndex]) {
                // columnIndex is only valid if rowIndex is valid
                if (this.columnIndex < 0) {
                    this.columnIndex = this.tableableRows[this.rowIndex].length - 1;
                }
                if (this.columnIndex > this.tableableRows[this.rowIndex].length - 1) {
                    this.columnIndex = 0;
                }
                return true;
            }
            else {
                this.resetTabList();
                return false;
            }
        };
        ControlElements.prototype.updateRowIndex = function (direction) {
            var oldRowIndex = this.rowIndex;
            this.rowIndex += direction;
            if (this.tableableRows[this.rowIndex]) {
                // when row index is changed we need to find the closest column element, we cannot expect them to be indexly aligned
                var centerX = this.tableableRows[oldRowIndex] ? this.tableableRows[oldRowIndex][this.columnIndex].positionVector.centerX : 0;
                var items = this.tableableRows[this.rowIndex];
                var currentDistance = 10000000000000;
                for (var i = 0; i < items.length; i++) {
                    var element = items[i];
                    if (currentDistance > Math.abs(centerX - element.positionVector.centerX)) {
                        currentDistance = Math.abs(centerX - element.positionVector.centerX);
                        this.columnIndex = i;
                    }
                }
            }
        };
        ControlElements.prototype.resetTabList = function () {
            this.rowIndex = -1;
            this.columnIndex = -1;
        };
        ControlElements.prototype.onUserInputUpdate = function (event) {
            this.el.classList.remove("animate-in");
            this.infoElement.classList.remove("show");
            if (this.elements) {
                var elements = this.getElements();
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    element.animateOut();
                }
            }
        };
        ControlElements.prototype.filterElementsFrom = function (value) {
            var inputValuesLowerCase = value.toLowerCase().split(" ");
            if (inputValuesLowerCase.indexOf("") != -1)
                inputValuesLowerCase.splice(inputValuesLowerCase.indexOf(""), 1);
            var elements = this.getElements();
            if (elements.length > 1) {
                // the type is not strong with this one..
                var itemsVisible = [];
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    element.highlight = false;
                    var elementVisibility = true;
                    // check for all words of input
                    for (var i_1 = 0; i_1 < inputValuesLowerCase.length; i_1++) {
                        var inputWord = inputValuesLowerCase[i_1];
                        if (elementVisibility) {
                            elementVisibility = element.value.toLowerCase().indexOf(inputWord) != -1;
                        }
                    }
                    // set element visibility.
                    element.visible = elementVisibility;
                    if (elementVisibility && element.visible)
                        itemsVisible.push(element);
                }
                // set feedback text for filter..
                this.infoElement.innerHTML = itemsVisible.length == 0 ? cf.Dictionary.get("input-no-filter").split("{input-value}").join(value) : "";
                if (itemsVisible.length == 0) {
                    this.infoElement.classList.add("show");
                }
                else {
                    this.infoElement.classList.remove("show");
                }
                // crude way of checking if list has changed...
                var hasListChanged = this.filterListNumberOfVisible != itemsVisible.length;
                if (hasListChanged) {
                    this.resize();
                    this.animateElementsIn();
                }
                this.filterListNumberOfVisible = itemsVisible.length;
                // highlight first item
                if (value != "" && this.filterListNumberOfVisible > 0)
                    itemsVisible[0].highlight = true;
            }
        };
        ControlElements.prototype.clickOnHighlighted = function () {
            var elements = this.getElements();
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                if (element.highlight) {
                    element.el.click();
                    break;
                }
            }
        };
        ControlElements.prototype.animateElementsIn = function () {
            if (this.elements) {
                var elements = this.getElements();
                if (elements.length > 0) {
                    if (!this.el.classList.contains("animate-in"))
                        this.el.classList.add("animate-in");
                    for (var i = 0; i < elements.length; i++) {
                        var element = elements[i];
                        element.animateIn();
                    }
                }
            }
        };
        ControlElements.prototype.getElements = function () {
            if (this.elements && this.elements.length > 0 && this.elements[0].type == "OptionsList")
                return this.elements[0].elements;
            return this.elements;
        };
        /**
        * @name buildTabableRows
        * build the tabable array index
        */
        ControlElements.prototype.buildTabableRows = function () {
            this.tableableRows = [];
            this.resetTabList();
            var elements = this.getElements();
            if (this.el.classList.contains("two-row")) {
                // two rows
                this.tableableRows[0] = [];
                this.tableableRows[1] = [];
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    if (element.visible) {
                        // crude way of checking if element is top row or bottom row..
                        if (element.positionVector.y < 30)
                            this.tableableRows[0].push(element);
                        else
                            this.tableableRows[1].push(element);
                    }
                }
            }
            else {
                // single row
                this.tableableRows[0] = [];
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    if (element.visible)
                        this.tableableRows[0].push(element);
                }
            }
        };
        ControlElements.prototype.resetAfterErrorMessage = function () {
            if (this.currentControlElement) {
                //reverse value of currentControlElement.
                this.currentControlElement.checked = !this.currentControlElement.checked;
                this.currentControlElement = null;
            }
            this.disabled = false;
        };
        ControlElements.prototype.focusFrom = function (angle) {
            if (!this.tableableRows)
                return;
            this.columnIndex = 0;
            if (angle == "bottom") {
                this.rowIndex = this.el.classList.contains("two-row") ? 1 : 0;
            }
            else if (angle == "top") {
                this.rowIndex = 0;
            }
            if (this.tableableRows[this.rowIndex] && this.tableableRows[this.rowIndex][this.columnIndex]) {
                this.ignoreKeyboardInput = true;
                this.tableableRows[this.rowIndex][this.columnIndex].focus = true;
            }
            else {
                this.resetTabList();
            }
        };
        ControlElements.prototype.updateStateOnElementsFromTag = function (tag) {
            for (var index = 0; index < this.elements.length; index++) {
                var element = this.elements[index];
                if (element.referenceTag == tag) {
                    this.updateStateOnElements(element);
                    break;
                }
            }
        };
        ControlElements.prototype.updateStateOnElements = function (controlElement) {
            this.currentControlElement = controlElement;
            if (this.currentControlElement.type == "RadioButton") {
                // uncheck other radio buttons...
                var elements = this.getElements();
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    if (element != controlElement) {
                        element.checked = false;
                    }
                    else {
                        element.checked = true;
                    }
                }
            }
            else if (this.currentControlElement.type == "CheckboxButton") {
                // change only the changed input
                var elements = this.getElements();
                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];
                    if (element == controlElement) {
                        var isChecked = element.referenceTag.domElement.checked;
                        element.checked = isChecked;
                    }
                }
            }
        };
        ControlElements.prototype.reset = function () {
            this.el.classList.remove("one-row");
            this.el.classList.remove("two-row");
        };
        ControlElements.prototype.getElement = function (index) {
            return this.elements[index];
        };
        ControlElements.prototype.getDTO = function () {
            var dto = {
                text: undefined,
                controlElements: [],
            };
            // generate text value for ChatReponse
            if (this.elements && this.elements.length > 0) {
                switch (this.elements[0].type) {
                    case "CheckboxButton":
                        var numChecked = 0; // check if more than 1 is checked.
                        var values = [];
                        for (var i = 0; i < this.elements.length; i++) {
                            var element_1 = this.elements[i];
                            if (element_1.checked) {
                                if (numChecked++ > 1)
                                    break;
                            }
                        }
                        for (var i = 0; i < this.elements.length; i++) {
                            var element_2 = this.elements[i];
                            if (element_2.checked) {
                                if (numChecked > 1)
                                    element_2.partOfSeveralChoices = true;
                                values.push(element_2.value);
                            }
                            dto.controlElements.push(element_2);
                        }
                        dto.text = cf.Dictionary.parseAndGetMultiValueString(values);
                        break;
                    case "RadioButton":
                        for (var i = 0; i < this.elements.length; i++) {
                            var element_3 = this.elements[i];
                            if (element_3.checked) {
                                dto.text = element_3.value;
                            }
                            dto.controlElements.push(element_3);
                        }
                        break;
                    case "OptionsList":
                        var element = this.elements[0];
                        dto.controlElements = element.getValue();
                        var values = [];
                        if (dto.controlElements && dto.controlElements[0]) {
                            for (var i_2 = 0; i_2 < dto.controlElements.length; i_2++) {
                                var element_4 = dto.controlElements[i_2];
                                values.push(dto.controlElements[i_2].value);
                            }
                        }
                        // after value is created then set to all elements
                        dto.controlElements = element.elements;
                        dto.text = cf.Dictionary.parseAndGetMultiValueString(values);
                        break;
                    case "UploadFileUI":
                        dto.text = this.elements[0].getFilesAsString(); //Dictionary.parseAndGetMultiValueString(values);
                        dto.controlElements.push(this.elements[0]);
                        break;
                }
            }
            return dto;
        };
        ControlElements.prototype.clearTagsAndReset = function () {
            this.reset();
            if (this.elements) {
                while (this.elements.length > 0) {
                    this.elements.pop().dealloc();
                }
            }
        };
        ControlElements.prototype.buildTags = function (tags) {
            var _this = this;
            this.disabled = false;
            var topList = this.el.parentNode.getElementsByTagName("ul")[0];
            var bottomList = this.el.parentNode.getElementsByTagName("ul")[1];
            // remove old elements
            this.clearTagsAndReset();
            this.elements = [];
            for (var i = 0; i < tags.length; i++) {
                var tag = tags[i];
                switch (tag.type) {
                    case "radio":
                        this.elements.push(new cf.RadioButton({
                            referenceTag: tag,
                            eventTarget: this.eventTarget
                        }));
                        break;
                    case "checkbox":
                        this.elements.push(new cf.CheckboxButton({
                            referenceTag: tag,
                            eventTarget: this.eventTarget
                        }));
                        break;
                    case "select":
                        this.elements.push(new cf.OptionsList({
                            referenceTag: tag,
                            context: this.list,
                            eventTarget: this.eventTarget
                        }));
                        break;
                    case "input":
                    default:
                        if (tag.type == "file") {
                            this.elements.push(new cf.UploadFileUI({
                                referenceTag: tag,
                                eventTarget: this.eventTarget
                            }));
                        }
                        // nothing to add.
                        // console.log("UserInput buildControlElements:", "none Control UI type, only input field is needed.");
                        break;
                }
                if (tag.type != "select" && this.elements.length > 0) {
                    var element = this.elements[this.elements.length - 1];
                    this.list.appendChild(element.el);
                }
            }
            var isElementsOptionsList = this.elements[0] && this.elements[0].type == "OptionsList";
            if (isElementsOptionsList) {
                this.filterListNumberOfVisible = this.elements[0].elements.length;
            }
            else {
                this.filterListNumberOfVisible = tags.length;
            }
            new Promise(function (resolve, reject) { return _this.resize(resolve, reject); }).then(function () {
                var h = _this.el.classList.contains("one-row") ? 52 : _this.el.classList.contains("two-row") ? 102 : 0;
                var controlElementsAddedDTO = {
                    height: h,
                };
                cf.ConversationalForm.illustrateFlow(_this, "dispatch", cf.UserInputEvents.CONTROL_ELEMENTS_ADDED, controlElementsAddedDTO);
                _this.eventTarget.dispatchEvent(new CustomEvent(cf.UserInputEvents.CONTROL_ELEMENTS_ADDED, {
                    detail: controlElementsAddedDTO
                }));
            });
        };
        ControlElements.prototype.onResize = function (event) {
            this.resize();
        };
        ControlElements.prototype.resize = function (resolve, reject) {
            var _this = this;
            // scrollbar things
            // Element.offsetWidth - Element.clientWidth
            this.list.style.width = "100%";
            this.el.classList.remove("resized");
            this.el.classList.remove("one-row");
            this.el.classList.remove("two-row");
            this.elementWidth = 0;
            setTimeout(function () {
                _this.listWidth = 0;
                var elements = _this.getElements();
                if (elements && elements.length > 0) {
                    var listWidthValues = [];
                    var listWidthValues2 = [];
                    var containsElementWithImage = false;
                    for (var i = 0; i < elements.length; i++) {
                        var element = elements[i];
                        if (element.visible) {
                            element.calcPosition();
                            _this.listWidth += element.positionVector.width;
                            listWidthValues.push(element.positionVector.x + element.positionVector.width);
                            listWidthValues2.push(element);
                        }
                        if (element.hasImage())
                            containsElementWithImage = true;
                    }
                    var elOffsetWidth_1 = _this.el.offsetWidth;
                    var isListWidthOverElementWidth_1 = _this.listWidth > elOffsetWidth_1;
                    if (isListWidthOverElementWidth_1 && !containsElementWithImage) {
                        _this.el.classList.add("two-row");
                        _this.listWidth = Math.max(elOffsetWidth_1, Math.round((listWidthValues[Math.floor(listWidthValues.length / 2)]) + 50));
                        _this.list.style.width = _this.listWidth + "px";
                    }
                    else {
                        _this.el.classList.add("one-row");
                    }
                    setTimeout(function () {
                        // recalc after LIST classes has been added
                        for (var i = 0; i < elements.length; i++) {
                            var element = elements[i];
                            if (element.visible) {
                                element.calcPosition();
                            }
                        }
                        // check again after classes are set.
                        isListWidthOverElementWidth_1 = _this.listWidth > elOffsetWidth_1;
                        // sort the list so we can set tabIndex properly
                        var elementsCopyForSorting = elements.slice();
                        var tabIndexFilteredElements = elementsCopyForSorting.sort(function (a, b) {
                            var aOverB = a.positionVector.y > b.positionVector.y;
                            return a.positionVector.x == b.positionVector.x ? (aOverB ? 1 : -1) : a.positionVector.x < b.positionVector.x ? -1 : 1;
                        });
                        var tabIndex = 0;
                        for (var i = 0; i < tabIndexFilteredElements.length; i++) {
                            var element = tabIndexFilteredElements[i];
                            if (element.visible) {
                                //tabindex 1 are the UserInput element
                                element.tabIndex = 2 + (tabIndex++);
                            }
                            else {
                                element.tabIndex = -1;
                            }
                        }
                        // toggle nav button visiblity
                        cancelAnimationFrame(_this.rAF);
                        if (isListWidthOverElementWidth_1) {
                            _this.el.classList.remove("hide-nav-buttons");
                        }
                        else {
                            _this.el.classList.add("hide-nav-buttons");
                        }
                        _this.elementWidth = elOffsetWidth_1;
                        // resize scroll
                        _this.listScrollController.resize(_this.listWidth, _this.elementWidth);
                        _this.buildTabableRows();
                        _this.el.classList.add("resized");
                        if (resolve)
                            resolve();
                    }, 0);
                }
            }, 0);
        };
        ControlElements.prototype.dealloc = function () {
            this.currentControlElement = null;
            this.tableableRows = null;
            cancelAnimationFrame(this.rAF);
            this.rAF = null;
            window.removeEventListener('resize', this.onResizeCallback, false);
            this.onResizeCallback = null;
            this.el.removeEventListener('scroll', this.onScrollCallback, false);
            this.onScrollCallback = null;
            this.eventTarget.removeEventListener(cf.ControlElementEvents.ON_FOCUS, this.onElementFocusCallback, false);
            this.onElementFocusCallback = null;
            this.eventTarget.removeEventListener(cf.ChatListEvents.CHATLIST_UPDATED, this.onChatReponsesUpdatedCallback, false);
            this.onChatReponsesUpdatedCallback = null;
            this.eventTarget.removeEventListener(cf.UserInputEvents.KEY_CHANGE, this.onUserInputKeyChangeCallback, false);
            this.onUserInputKeyChangeCallback = null;
            this.eventTarget.removeEventListener(cf.FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false);
            this.userInputUpdateCallback = null;
            this.eventTarget.removeEventListener(cf.ControlElementEvents.ON_LOADED, this.onElementLoadedCallback, false);
            this.onElementLoadedCallback = null;
            this.listScrollController.dealloc();
        };
        return ControlElements;
    }());
    cf.ControlElements = ControlElements;
})(cf || (cf = {}));

/// <reference path="../logic/Helpers.ts"/>
/// <reference path="../logic/EventDispatcher.ts"/>
// namespace
var cf;
(function (cf) {
    var ScrollController = (function () {
        function ScrollController(options) {
            this.listWidth = 0;
            this.visibleAreaWidth = 0;
            this.max = 0;
            this.interacting = false;
            this.x = 0;
            this.xTarget = 0;
            this.startX = 0;
            this.startXTarget = 0;
            this.mouseSpeed = 0;
            this.mouseSpeedTarget = 0;
            this.direction = 0;
            this.directionTarget = 0;
            this.inputAccerlation = 0;
            this.inputAccerlationTarget = 0;
            this.interactionListener = options.interactionListener;
            this.eventTarget = options.eventTarget;
            this.listToScroll = options.listToScroll;
            this.prevButton = options.listNavButtons[0];
            this.nextButton = options.listNavButtons[1];
            this.onListNavButtonsClickCallback = this.onListNavButtonsClick.bind(this);
            this.prevButton.addEventListener("click", this.onListNavButtonsClickCallback, false);
            this.nextButton.addEventListener("click", this.onListNavButtonsClickCallback, false);
            this.documentLeaveCallback = this.documentLeave.bind(this);
            this.onInteractStartCallback = this.onInteractStart.bind(this);
            this.onInteractEndCallback = this.onInteractEnd.bind(this);
            this.onInteractMoveCallback = this.onInteractMove.bind(this);
            document.addEventListener("mouseleave", this.documentLeaveCallback, false);
            document.addEventListener(cf.Helpers.getMouseEvent("mouseup"), this.documentLeaveCallback, false);
            this.interactionListener.addEventListener(cf.Helpers.getMouseEvent("mousedown"), this.onInteractStartCallback, false);
            this.interactionListener.addEventListener(cf.Helpers.getMouseEvent("mouseup"), this.onInteractEndCallback, false);
            this.interactionListener.addEventListener(cf.Helpers.getMouseEvent("mousemove"), this.onInteractMoveCallback, false);
        }
        ScrollController.prototype.onListNavButtonsClick = function (event) {
            var dirClick = event.currentTarget.getAttribute("direction");
            this.pushDirection(dirClick == "next" ? -1 : 1);
        };
        ScrollController.prototype.documentLeave = function (event) {
            this.onInteractEnd(event);
        };
        ScrollController.prototype.onInteractStart = function (event) {
            var vector = cf.Helpers.getXYFromMouseTouchEvent(event);
            this.interacting = true;
            this.startX = vector.x;
            this.startXTarget = this.startX;
            this.inputAccerlation = 0;
            this.render();
        };
        ScrollController.prototype.onInteractEnd = function (event) {
            this.interacting = false;
        };
        ScrollController.prototype.onInteractMove = function (event) {
            if (this.interacting) {
                var vector = cf.Helpers.getXYFromMouseTouchEvent(event);
                var newAcc = vector.x - this.startX;
                var magnifier = 6.2;
                this.inputAccerlationTarget = newAcc * magnifier;
                this.directionTarget = this.inputAccerlationTarget < 0 ? -1 : 1;
                this.startXTarget = vector.x;
            }
        };
        ScrollController.prototype.render = function () {
            var _this = this;
            if (this.rAF)
                cancelAnimationFrame(this.rAF);
            // normalise startX
            this.startX += (this.startXTarget - this.startX) * 0.2;
            // animate accerlaration
            this.inputAccerlation += (this.inputAccerlationTarget - this.inputAccerlation) * (this.interacting ? Math.min(ScrollController.accerlation + 0.1, 1) : ScrollController.accerlation);
            var accDamping = 0.25;
            this.inputAccerlationTarget *= accDamping;
            // animate directions
            this.direction += (this.directionTarget - this.direction) * 0.2;
            // extra extra
            this.mouseSpeed += (this.mouseSpeedTarget - this.mouseSpeed) * 0.2;
            this.direction += this.mouseSpeed;
            // animate x
            this.xTarget += this.inputAccerlation * 0.05;
            // bounce back when over
            if (this.xTarget > 0)
                this.xTarget += (0 - this.xTarget) * cf.Helpers.lerp(ScrollController.accerlation, 0.3, 0.8);
            if (this.xTarget < this.max)
                this.xTarget += (this.max - this.xTarget) * cf.Helpers.lerp(ScrollController.accerlation, 0.3, 0.8);
            this.x += (this.xTarget - this.x) * 0.4;
            // toggle visibility on nav arrows
            var xRounded = Math.round(this.x);
            if (xRounded < 0) {
                if (!this.prevButton.classList.contains("active"))
                    this.prevButton.classList.add("active");
                if (!this.prevButton.classList.contains("cf-gradient"))
                    this.prevButton.classList.add("cf-gradient");
            }
            if (xRounded == 0) {
                if (this.prevButton.classList.contains("active"))
                    this.prevButton.classList.remove("active");
                if (this.prevButton.classList.contains("cf-gradient"))
                    this.prevButton.classList.remove("cf-gradient");
            }
            if (xRounded > this.max) {
                if (!this.nextButton.classList.contains("active"))
                    this.nextButton.classList.add("active");
                if (!this.nextButton.classList.contains("cf-gradient"))
                    this.nextButton.classList.add("cf-gradient");
            }
            if (xRounded <= this.max) {
                if (this.nextButton.classList.contains("active"))
                    this.nextButton.classList.remove("active");
                if (this.nextButton.classList.contains("cf-gradient"))
                    this.nextButton.classList.remove("cf-gradient");
            }
            // set css transforms
            var xx = this.x;
            cf.Helpers.setTransform(this.listToScroll, "translateX(" + xx + "px)");
            // cycle render
            if (this.interacting || (Math.abs(this.x - this.xTarget) > 0.02 && !this.interacting))
                this.rAF = window.requestAnimationFrame(function () { return _this.render(); });
        };
        ScrollController.prototype.setScroll = function (x, y) {
            this.xTarget = this.visibleAreaWidth == this.listWidth ? 0 : x;
            this.render();
        };
        ScrollController.prototype.pushDirection = function (dir) {
            this.inputAccerlationTarget += (5000) * dir;
            this.render();
        };
        ScrollController.prototype.dealloc = function () {
            this.prevButton.removeEventListener("click", this.onListNavButtonsClickCallback, false);
            this.nextButton.removeEventListener("click", this.onListNavButtonsClickCallback, false);
            this.onListNavButtonsClickCallback = null;
            this.prevButton = null;
            this.nextButton = null;
            document.removeEventListener("mouseleave", this.documentLeaveCallback, false);
            document.removeEventListener(cf.Helpers.getMouseEvent("mouseup"), this.documentLeaveCallback, false);
            this.interactionListener.removeEventListener(cf.Helpers.getMouseEvent("mousedown"), this.onInteractStartCallback, false);
            this.interactionListener.removeEventListener(cf.Helpers.getMouseEvent("mouseup"), this.onInteractEndCallback, false);
            this.interactionListener.removeEventListener(cf.Helpers.getMouseEvent("mousemove"), this.onInteractMoveCallback, false);
            this.documentLeaveCallback = null;
            this.onInteractStartCallback = null;
            this.onInteractEndCallback = null;
            this.onInteractMoveCallback = null;
        };
        ScrollController.prototype.reset = function () {
            this.interacting = false;
            this.startX = 0;
            this.startXTarget = this.startX;
            this.inputAccerlation = 0;
            this.x = 0;
            this.xTarget = 0;
            cf.Helpers.setTransform(this.listToScroll, "translateX(0px)");
            this.render();
            this.prevButton.classList.remove("active");
            this.nextButton.classList.remove("active");
        };
        ScrollController.prototype.resize = function (listWidth, visibleAreaWidth) {
            this.reset();
            this.visibleAreaWidth = visibleAreaWidth;
            this.listWidth = Math.max(visibleAreaWidth, listWidth);
            this.max = (this.listWidth - this.visibleAreaWidth) * -1;
            this.render();
        };
        return ScrollController;
    }());
    ScrollController.accerlation = 0.1;
    cf.ScrollController = ScrollController;
})(cf || (cf = {}));

// namespace
var cf;
(function (cf) {
    // class
    var Dictionary = (function () {
        function Dictionary(options) {
            // can be overwritten
            this.data = {
                "user-image": "//conversational-form-static-0iznjsw.stackpathdns.com/src/images/human.png",
                "entry-not-found": "Dictionary item not found.",
                "input-placeholder": "Type your answer here ...",
                "group-placeholder": "Type to filter list ...",
                "input-placeholder-error": "Your input is not correct ...",
                "input-placeholder-required": "Input is required ...",
                "input-placeholder-file-error": "File upload failed ...",
                "input-placeholder-file-size-error": "File size too big ...",
                "input-no-filter": "No results found for <strong>{input-value}</strong>",
                "user-reponse-and": " and ",
                "user-reponse-missing": "Missing input ...",
                "user-reponse-missing-group": "Nothing selected ...",
                "general": "General type1|General type2",
                "icon-type-file": "<svg class='cf-icon-file' viewBox='0 0 10 14' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><g stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'><g transform='translate(-756.000000, -549.000000)' fill='#0D83FF'><g transform='translate(736.000000, 127.000000)'><g transform='translate(0.000000, 406.000000)'><polygon points='20 16 26.0030799 16 30 19.99994 30 30 20 30'></polygon></g></g></g></g></svg>",
            };
            // can be overwriten
            this.robotData = {
                "robot-image": "//conversational-form-static-0iznjsw.stackpathdns.com/src/images/robot.png",
                "input": "Please write some text.",
                "text": "Please write some text.",
                "checkbox": "Select as many as you want.",
                "name": "What's your name?",
                "email": "Need your e-mail.",
                "password": "Please provide password",
                "tel": "What's your phone number?",
                "radio": "I need you to select one of these.",
                "select": "Choose any of these options.",
                "general": "General1|General2|General3.."
            };
            Dictionary.instance = this;
            // overwrite data if defined 
            if (options && options.data)
                this.data = this.validateAndSetNewData(options.data, this.data);
            // overwrite user image
            if (options.userImage)
                this.data["user-image"] = options.userImage;
            // overwrite robot image
            if (options.robotImage)
                this.robotData["robot-image"] = options.robotImage;
            // overwrite robot questions if defined
            if (options && options.robotData)
                this.robotData = this.validateAndSetNewData(options.robotData, this.robotData);
        }
        Dictionary.get = function (id) {
            var ins = Dictionary.instance;
            var value = ins.data[id];
            if (!value) {
                value = ins.data["entry-not-found"];
            }
            else {
                var values = value.split("|");
                value = values[Math.floor(Math.random() * values.length)];
            }
            return value;
        };
        /**
        * @name set
        * set a dictionary value
        *	id: string, id of the value to update
        *	type: string, "human" || "robot"
        *	value: string, value to be inserted
        */
        Dictionary.set = function (id, type, value) {
            var ins = Dictionary.instance;
            var obj = type == "robot" ? ins.robotData : ins.data;
            obj[id] = value;
            return obj[id];
        };
        Dictionary.getRobotResponse = function (tagType) {
            var ins = Dictionary.instance;
            var value = ins.robotData[tagType];
            if (!value) {
                // value not found, so pick a general one
                var generals = ins.robotData["general"].split("|");
                value = generals[Math.floor(Math.random() * generals.length)];
            }
            else {
                var values = value.split("|");
                value = values[Math.floor(Math.random() * values.length)];
            }
            return value;
        };
        Dictionary.parseAndGetMultiValueString = function (arr) {
            // check ControlElement.ts for value(s)
            var value = "";
            for (var i = 0; i < arr.length; i++) {
                var str = arr[i];
                var sym = (arr.length > 1 && i == arr.length - 2 ? Dictionary.get("user-reponse-and") : ", ");
                value += str + (i < arr.length - 1 ? sym : "");
            }
            return value;
        };
        Dictionary.prototype.validateAndSetNewData = function (newData, originalDataObject) {
            for (var key in originalDataObject) {
                if (!newData[key]) {
                    console.warn("Conversational Form Dictionary warning, '" + key + "' value is undefined, mapping '" + key + "' to default value. See Dictionary.ts for keys.");
                    newData[key] = originalDataObject[key];
                }
            }
            return newData;
        };
        return Dictionary;
    }());
    Dictionary.keyCodes = {
        "left": 37,
        "right": 39,
        "down": 40,
        "up": 38,
        "backspace": 8,
        "enter": 13,
        "space": 32,
        "shift": 16,
        "tab": 9,
    };
    cf.Dictionary = Dictionary;
})(cf || (cf = {}));

/// <reference path="../data/Dictionary.ts"/>
/// <reference path="InputTag.ts"/>
/// <reference path="ButtonTag.ts"/>
/// <reference path="SelectTag.ts"/>
/// <reference path="OptionTag.ts"/>
/// <reference path="../ConversationalForm.ts"/>
/// <reference path="../logic/EventDispatcher.ts"/>
/// <reference path="../parsing/TagsParser.ts"/>
// basic tag from form logic
// types:
// radio
// text
// email
// tel
// password
// checkbox
// radio
// select
// button
// namespace
var cf;
(function (cf) {
    cf.TagEvents = {
        ORIGINAL_ELEMENT_CHANGED: "cf-tag-dom-element-changed"
    };
    // class
    var Tag = (function () {
        function Tag(options) {
            this.domElement = options.domElement;
            this.changeCallback = this.onDomElementChange.bind(this);
            this.domElement.addEventListener("change", this.changeCallback, false);
            // remove tabIndex from the dom element.. danger zone... should we or should we not...
            this.domElement.tabIndex = -1;
            // questions array
            if (options.questions)
                this.questions = options.questions;
            // custom tag validation
            if (this.domElement.getAttribute("cf-validation")) {
                // set it through an attribute, danger land with eval
                this.validationCallback = eval(this.domElement.getAttribute("cf-validation"));
            }
            // reg ex pattern is set on the Tag, so use it in our validation
            if (this.domElement.getAttribute("pattern"))
                this.pattern = new RegExp(this.domElement.getAttribute("pattern"));
            // if(this.type == "email" && !this.pattern){
            // 	// set a standard e-mail pattern for email type input
            // 	this.pattern = new RegExp("^[^@]+@[^@]+\.[^@]+$");
            // }
            if (this.type != "group" && cf.ConversationalForm.illustrateAppFlow) {
                console.log('Conversational Form > Tag registered:', this.type, this);
            }
            this.refresh();
        }
        Object.defineProperty(Tag.prototype, "type", {
            get: function () {
                return this.domElement.getAttribute("type") || this.domElement.tagName.toLowerCase();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "name", {
            get: function () {
                return this.domElement.getAttribute("name");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "inputPlaceholder", {
            get: function () {
                return this._inputPlaceholder;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "formless", {
            get: function () {
                return cf.TagsParser.isElementFormless(this.domElement);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "label", {
            get: function () {
                return this.getLabel();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "value", {
            get: function () {
                return this.domElement.value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "hasImage", {
            get: function () {
                return this.domElement.hasAttribute("cf-image");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "disabled", {
            get: function () {
                return this.domElement.getAttribute("disabled") != undefined && this.domElement.getAttribute("disabled") != null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "required", {
            get: function () {
                return !!this.domElement.getAttribute("required") || this.domElement.getAttribute("required") == "";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "question", {
            get: function () {
                // if questions are empty, then fall back to dictionary, every time
                if (!this.questions || this.questions.length == 0)
                    return cf.Dictionary.getRobotResponse(this.type);
                else
                    return this.questions[Math.floor(Math.random() * this.questions.length)];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "eventTarget", {
            set: function (value) {
                this._eventTarget = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "errorMessage", {
            get: function () {
                if (!this.errorMessages) {
                    // custom tag error messages
                    if (this.domElement.getAttribute("cf-error")) {
                        this.errorMessages = this.domElement.getAttribute("cf-error").split("|");
                    }
                    else if (this.domElement.parentNode && this.domElement.parentNode.getAttribute("cf-error")) {
                        this.errorMessages = this.domElement.parentNode.getAttribute("cf-error").split("|");
                    }
                    else if (this.required) {
                        this.errorMessages = [cf.Dictionary.get("input-placeholder-required")];
                    }
                    else {
                        if (this.type == "file")
                            this.errorMessages = [cf.Dictionary.get("input-placeholder-file-error")];
                        else {
                            this.errorMessages = [cf.Dictionary.get("input-placeholder-error")];
                        }
                    }
                }
                return this.errorMessages[Math.floor(Math.random() * this.errorMessages.length)];
            },
            enumerable: true,
            configurable: true
        });
        Tag.prototype.dealloc = function () {
            this.domElement.removeEventListener("change", this.changeCallback, false);
            this.changeCallback = null;
            this.domElement = null;
            this.defaultValue = null;
            this.errorMessages = null;
            this.pattern = null;
            this._label = null;
            this.validationCallback = null;
            this.questions = null;
        };
        Tag.isTagValid = function (element) {
            if (element.getAttribute("type") === "hidden")
                return false;
            if (element.getAttribute("type") === "submit")
                return false;
            // ignore buttons, we submit the form automatially
            if (element.getAttribute("type") == "button")
                return false;
            if (element.style.display === "none")
                return false;
            if (element.style.visibility === "hidden")
                return false;
            var isTagFormless = cf.TagsParser.isElementFormless(element);
            var innerText = cf.Helpers.getInnerTextOfElement(element);
            if (element.tagName.toLowerCase() == "option" && (!isTagFormless && innerText == "" || innerText == " ")) {
                return false;
            }
            if (element.tagName.toLowerCase() == "select" || element.tagName.toLowerCase() == "option")
                return true;
            else if (isTagFormless) {
                return true;
            }
            else {
                return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
            }
        };
        Tag.createTag = function (element) {
            if (Tag.isTagValid(element)) {
                // ignore hidden tags
                var tag = void 0;
                if (element.tagName.toLowerCase() == "input") {
                    tag = new cf.InputTag({
                        domElement: element
                    });
                }
                else if (element.tagName.toLowerCase() == "textarea") {
                    tag = new cf.InputTag({
                        domElement: element
                    });
                }
                else if (element.tagName.toLowerCase() == "select") {
                    tag = new cf.SelectTag({
                        domElement: element
                    });
                }
                else if (element.tagName.toLowerCase() == "button") {
                    tag = new cf.ButtonTag({
                        domElement: element
                    });
                }
                else if (element.tagName.toLowerCase() == "option") {
                    tag = new cf.OptionTag({
                        domElement: element
                    });
                }
                return tag;
            }
            else {
                // console.warn("Tag is not valid!: "+ element);
                return null;
            }
        };
        Tag.prototype.refresh = function () {
            // default value of Tag, check every refresh
            this.defaultValue = this.domElement.value;
            this.questions = null;
            this.findAndSetQuestions();
        };
        Tag.prototype.setTagValueAndIsValid = function (dto) {
            // this sets the value of the tag in the DOM
            // validation
            var isValid = true;
            var valueText = dto.text;
            if (this.pattern) {
                isValid = this.pattern.test(valueText);
            }
            if (valueText == "" && this.required) {
                isValid = false;
            }
            var min = parseInt(this.domElement.getAttribute("min"), 10) || -1;
            var max = parseInt(this.domElement.getAttribute("max"), 10) || -1;
            if (min != -1 && valueText.length < min) {
                isValid = false;
            }
            if (max != -1 && valueText.length > max) {
                isValid = false;
            }
            if (isValid) {
                // we cannot set the dom element value when type is file
                if (this.type != "file")
                    this.domElement.value = valueText;
            }
            else {
                // throw new Error("cf-: value:string is not valid. Value: "+value);
            }
            return isValid;
        };
        Tag.prototype.getLabel = function () {
            if (!this._label)
                this.findAndSetLabel();
            if (this._label)
                return this._label;
            return cf.Dictionary.getRobotResponse(this.type);
        };
        Tag.prototype.findAndSetQuestions = function () {
            if (this.questions)
                return;
            // <label tag with label:for attribute to el:id
            // check for label tag, we only go 2 steps backwards..
            // from standardize markup: http://www.w3schools.com/tags/tag_label.asp
            if (this.domElement.getAttribute("cf-questions")) {
                this.questions = this.domElement.getAttribute("cf-questions").split("|");
                if (this.domElement.getAttribute("cf-input-placeholder"))
                    this._inputPlaceholder = this.domElement.getAttribute("cf-input-placeholder");
            }
            else if (this.domElement.parentNode && this.domElement.parentNode.getAttribute("cf-questions")) {
                // for groups the parentNode can have the cf-questions..
                var parent_1 = this.domElement.parentNode;
                this.questions = parent_1.getAttribute("cf-questions").split("|");
                if (parent_1.getAttribute("cf-input-placeholder"))
                    this._inputPlaceholder = parent_1.getAttribute("cf-input-placeholder");
            }
            else {
                // questions not set, so find it in the DOM
                // try a broader search using for and id attributes
                var elId = this.domElement.getAttribute("id");
                var forLabel = document.querySelector("label[for='" + elId + "']");
                if (forLabel) {
                    this.questions = [cf.Helpers.getInnerTextOfElement(forLabel)];
                }
            }
            if (!this.questions && this.domElement.getAttribute("placeholder")) {
                // check for placeholder attr if questions are still undefined
                this.questions = [this.domElement.getAttribute("placeholder")];
            }
        };
        Tag.prototype.findAndSetLabel = function () {
            // find label..
            if (this.domElement.getAttribute("cf-label")) {
                this._label = this.domElement.getAttribute("cf-label");
            }
            else {
                var parentDomNode = this.domElement.parentNode;
                if (parentDomNode) {
                    // step backwards and check for label tag.
                    var labelTags = parentDomNode.getElementsByTagName("label");
                    if (labelTags.length == 0) {
                        // check for innerText
                        var innerText = cf.Helpers.getInnerTextOfElement(parentDomNode);
                        if (innerText && innerText.length > 0)
                            labelTags = [parentDomNode];
                    }
                    if (labelTags.length > 0 && labelTags[0])
                        this._label = cf.Helpers.getInnerTextOfElement(labelTags[0]);
                }
            }
        };
        /**
        * @name onDomElementChange
        * on dom element value change event, ex. w. browser autocomplete mode
        */
        Tag.prototype.onDomElementChange = function () {
            this._eventTarget.dispatchEvent(new CustomEvent(cf.TagEvents.ORIGINAL_ELEMENT_CHANGED, {
                detail: {
                    value: this.value,
                    tag: this
                }
            }));
        };
        return Tag;
    }());
    cf.Tag = Tag;
})(cf || (cf = {}));

/// <reference path="ButtonTag.ts"/>
/// <reference path="InputTag.ts"/>
/// <reference path="SelectTag.ts"/>
/// <reference path="../ui/UserInput.ts"/>
// group tags together, this is done automatically by looking through InputTags with type radio or checkbox and same name attribute.
// single choice logic for Radio Button, <input type="radio", where name is the same
// multi choice logic for Checkboxes, <input type="checkbox", where name is the same
// namespace
var cf;
(function (cf) {
    // class
    var TagGroup = (function () {
        function TagGroup(options) {
            this.elements = options.elements;
            if (cf.ConversationalForm.illustrateAppFlow)
                console.log('Conversational Form > TagGroup registered:', this.elements[0].type, this);
        }
        Object.defineProperty(TagGroup.prototype, "required", {
            get: function () {
                for (var i = 0; i < this.elements.length; i++) {
                    var element = this.elements[i];
                    if (this.elements[i].required) {
                        return true;
                    }
                }
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "eventTarget", {
            set: function (value) {
                this._eventTarget = value;
                for (var i = 0; i < this.elements.length; i++) {
                    var tag = this.elements[i];
                    tag.eventTarget = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "type", {
            get: function () {
                return "group";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "name", {
            get: function () {
                return this.elements[0].name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "label", {
            get: function () {
                return this.elements[0].label;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "question", {
            get: function () {
                // check if elements have the questions, else fallback
                var tagQuestion = this.elements[0].question;
                if (tagQuestion) {
                    return tagQuestion;
                }
                else {
                    // fallback to robot response from dictionary
                    var robotReponse = cf.Dictionary.getRobotResponse(this.getGroupTagType());
                    return robotReponse;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "activeElements", {
            get: function () {
                return this._activeElements;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "value", {
            get: function () {
                // TODO: fix value???
                return this._values;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "disabled", {
            get: function () {
                var disabled = false;
                for (var i = 0; i < this.elements.length; i++) {
                    var element = this.elements[i];
                    if (element.disabled)
                        disabled = true;
                }
                return disabled;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "errorMessage", {
            get: function () {
                var errorMessage = cf.Dictionary.get("input-placeholder-error");
                for (var i = 0; i < this.elements.length; i++) {
                    var element = this.elements[i];
                    errorMessage = element.errorMessage;
                }
                return errorMessage;
            },
            enumerable: true,
            configurable: true
        });
        TagGroup.prototype.dealloc = function () {
            for (var i = 0; i < this.elements.length; i++) {
                var element = this.elements[i];
                element.dealloc();
            }
            this.elements = null;
        };
        TagGroup.prototype.refresh = function () {
            for (var i = 0; i < this.elements.length; i++) {
                var element = this.elements[i];
                element.refresh();
            }
        };
        TagGroup.prototype.getGroupTagType = function () {
            return this.elements[0].type;
        };
        TagGroup.prototype.setTagValueAndIsValid = function (value) {
            var isValid = false;
            var groupType = this.elements[0].type;
            this._values = [];
            this._activeElements = [];
            switch (groupType) {
                case "radio":
                    var numberRadioButtonsVisible = [];
                    var wasRadioButtonChecked = false;
                    for (var i = 0; i < value.controlElements.length; i++) {
                        var element = value.controlElements[i];
                        var tag = this.elements[this.elements.indexOf(element.referenceTag)];
                        if (element.visible) {
                            numberRadioButtonsVisible.push(element);
                            if (tag == element.referenceTag) {
                                tag.domElement.checked = element.checked;
                                if (element.checked) {
                                    this._values.push(tag.value);
                                    this._activeElements.push(tag);
                                }
                                // a radio button was checked
                                if (!wasRadioButtonChecked && element.checked)
                                    wasRadioButtonChecked = true;
                            }
                            else {
                                tag.domElement.checked = false;
                            }
                        }
                    }
                    // special case 1, only one radio button visible from a filter
                    if (!isValid && numberRadioButtonsVisible.length == 1) {
                        var element = numberRadioButtonsVisible[0];
                        var tag = this.elements[this.elements.indexOf(element.referenceTag)];
                        element.checked = true;
                        tag.domElement.checked = true;
                        isValid = true;
                        if (element.checked) {
                            this._values.push(tag.value);
                            this._activeElements.push(tag);
                        }
                    }
                    else if (!isValid && wasRadioButtonChecked) {
                        // a radio button needs to be checked of
                        isValid = wasRadioButtonChecked;
                    }
                    break;
                case "checkbox":
                    // checkbox is always valid
                    isValid = true;
                    for (var i = 0; i < value.controlElements.length; i++) {
                        var element = value.controlElements[i];
                        var tag = this.elements[this.elements.indexOf(element.referenceTag)];
                        tag.domElement.checked = element.checked;
                        if (element.checked) {
                            this._values.push(tag.value);
                            this._activeElements.push(tag);
                        }
                    }
                    break;
            }
            return isValid;
        };
        return TagGroup;
    }());
    cf.TagGroup = TagGroup;
})(cf || (cf = {}));

/// <reference path="Tag.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// namespace
var cf;
(function (cf) {
    // interface
    // class
    var InputTag = (function (_super) {
        __extends(InputTag, _super);
        function InputTag(options) {
            var _this = _super.call(this, options) || this;
            if (_this.type == "text") {
            }
            else if (_this.type == "email") {
            }
            else if (_this.type == "tel") {
            }
            else if (_this.type == "checkbox") {
            }
            else if (_this.type == "radio") {
            }
            else if (_this.type == "password") {
            }
            else if (_this.type == "file") {
                // check InputFileTag.ts
            }
            return _this;
        }
        InputTag.prototype.findAndSetQuestions = function () {
            _super.prototype.findAndSetQuestions.call(this);
            // special use cases for <input> tag add here...
        };
        InputTag.prototype.findAndSetLabel = function () {
            _super.prototype.findAndSetLabel.call(this);
            if (!this._label) {
                // special use cases for <input> tag add here...
            }
        };
        InputTag.prototype.setTagValueAndIsValid = function (value) {
            if (this.type == "checkbox") {
                // checkbox is always true..
                return true;
            }
            else {
                return _super.prototype.setTagValueAndIsValid.call(this, value);
            }
        };
        InputTag.prototype.dealloc = function () {
            _super.prototype.dealloc.call(this);
        };
        return InputTag;
    }(cf.Tag));
    cf.InputTag = InputTag;
})(cf || (cf = {}));

/// <reference path="Tag.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// namespace
var cf;
(function (cf) {
    // interface
    // class
    var SelectTag = (function (_super) {
        __extends(SelectTag, _super);
        function SelectTag(options) {
            var _this = _super.call(this, options) || this;
            // build the option tags
            _this.optionTags = [];
            var domOptionTags = _this.domElement.getElementsByTagName("option");
            for (var i = 0; i < domOptionTags.length; i++) {
                var element = domOptionTags[i];
                var tag = cf.Tag.createTag(element);
                if (tag) {
                    _this.optionTags.push(tag);
                }
                else {
                    console.warn(_this.constructor.name, 'option tag invalid:', tag);
                }
            }
            return _this;
        }
        Object.defineProperty(SelectTag.prototype, "type", {
            get: function () {
                return "select";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SelectTag.prototype, "value", {
            get: function () {
                return this._values;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SelectTag.prototype, "multipleChoice", {
            get: function () {
                return this.domElement.hasAttribute("multiple");
            },
            enumerable: true,
            configurable: true
        });
        SelectTag.prototype.setTagValueAndIsValid = function (dto) {
            var isValid = false;
            // select tag values are set via selected attribute on option tag
            var numberOptionButtonsVisible = [];
            this._values = [];
            for (var i = 0; i < this.optionTags.length; i++) {
                var tag = this.optionTags[i];
                for (var j = 0; j < dto.controlElements.length; j++) {
                    var controllerElement = dto.controlElements[j];
                    if (controllerElement.referenceTag == tag) {
                        // tag match found, so set value
                        tag.selected = controllerElement.selected;
                        // check for minimum one selected
                        if (!isValid && tag.selected)
                            isValid = true;
                        if (tag.selected)
                            this._values.push(tag.value);
                        if (controllerElement.visible)
                            numberOptionButtonsVisible.push(controllerElement);
                    }
                }
            }
            // special case 1, only one optiontag visible from a filter
            if (!isValid && numberOptionButtonsVisible.length == 1) {
                var element = numberOptionButtonsVisible[0];
                var tag = this.optionTags[this.optionTags.indexOf(element.referenceTag)];
                element.selected = true;
                tag.selected = true;
                isValid = true;
                if (tag.selected)
                    this._values.push(tag.value);
            }
            return isValid;
        };
        return SelectTag;
    }(cf.Tag));
    cf.SelectTag = SelectTag;
})(cf || (cf = {}));

/// <reference path="Tag.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// namespace
var cf;
(function (cf) {
    // interface
    // class
    var ButtonTag = (function (_super) {
        __extends(ButtonTag, _super);
        function ButtonTag(options) {
            var _this = _super.call(this, options) || this;
            if (_this.domElement.getAttribute("type") == "submit") {
            }
            else if (_this.domElement.getAttribute("type") == "button") {
                // this.onClick = eval(this.domElement.onclick);
            }
            return _this;
        }
        return ButtonTag;
    }(cf.Tag));
    cf.ButtonTag = ButtonTag;
})(cf || (cf = {}));

/// <reference path="Tag.ts"/>
/// <reference path="../parsing/TagsParser.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// namespace
var cf;
(function (cf) {
    // interface
    // class
    var OptionTag = (function (_super) {
        __extends(OptionTag, _super);
        function OptionTag() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(OptionTag.prototype, "type", {
            get: function () {
                return "option";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OptionTag.prototype, "label", {
            get: function () {
                if (this.formless) {
                    return _super.prototype.getLabel.call(this);
                }
                else {
                    return cf.Helpers.getInnerTextOfElement(this.domElement);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OptionTag.prototype, "selected", {
            get: function () {
                return this.domElement.selected;
            },
            set: function (value) {
                if (value)
                    this.domElement.setAttribute("selected", "selected");
                else
                    this.domElement.removeAttribute("selected");
            },
            enumerable: true,
            configurable: true
        });
        OptionTag.prototype.setTagValueAndIsValid = function (value) {
            var isValid = true;
            // OBS: No need to set any validation og value for this tag type ..
            // .. it is atm. only used to create pseudo elements in the OptionsList
            return isValid;
        };
        return OptionTag;
    }(cf.Tag));
    cf.OptionTag = OptionTag;
})(cf || (cf = {}));

/// <reference path="ControlElement.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// namespace
var cf;
(function (cf) {
    // interface
    // class
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(options) {
            var _this = _super.call(this, options) || this;
            _this.clickCallback = _this.onClick.bind(_this);
            _this.el.addEventListener("click", _this.clickCallback, false);
            _this.mouseDownCallback = _this.onMouseDown.bind(_this);
            _this.el.addEventListener("mousedown", _this.mouseDownCallback, false);
            //image
            _this.checkForImage();
            return _this;
        }
        Object.defineProperty(Button.prototype, "type", {
            get: function () {
                return "Button";
            },
            enumerable: true,
            configurable: true
        });
        Button.prototype.hasImage = function () {
            return this.referenceTag.hasImage;
        };
        /**
        * @name checkForImage
        * checks if element has cf-image, if it has then change UI
        */
        Button.prototype.checkForImage = function () {
            var hasImage = this.hasImage();
            if (hasImage) {
                this.el.classList.add("has-image");
                this.imgEl = document.createElement("img");
                this.imageLoadedCallback = this.onImageLoaded.bind(this);
                this.imgEl.classList.add("cf-image");
                this.imgEl.addEventListener("load", this.imageLoadedCallback, false);
                this.imgEl.src = this.referenceTag.domElement.getAttribute("cf-image");
                this.el.insertBefore(this.imgEl, this.el.children[0]);
            }
        };
        Button.prototype.onImageLoaded = function () {
            this.imgEl.classList.add("loaded");
            this.eventTarget.dispatchEvent(new CustomEvent(cf.ControlElementEvents.ON_LOADED, {}));
        };
        Button.prototype.onMouseDown = function (event) {
            event.preventDefault();
        };
        Button.prototype.onClick = function (event) {
            this.onChoose();
        };
        Button.prototype.dealloc = function () {
            this.el.removeEventListener("click", this.clickCallback, false);
            this.clickCallback = null;
            if (this.imageLoadedCallback) {
                this.imgEl.removeEventListener("load", this.imageLoadedCallback, false);
                this.imageLoadedCallback = null;
            }
            this.el.removeEventListener("mousedown", this.mouseDownCallback, false);
            this.mouseDownCallback = null;
            _super.prototype.dealloc.call(this);
        };
        // override
        Button.prototype.getTemplate = function () {
            return "<cf-button class=\"cf-button\">\n\t\t\t\t" + this.referenceTag.label + "\n\t\t\t</cf-button>\n\t\t\t";
        };
        return Button;
    }(cf.ControlElement));
    cf.Button = Button;
})(cf || (cf = {}));

/// <reference path="Button.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// namespace
var cf;
(function (cf) {
    // interface
    // class
    var RadioButton = (function (_super) {
        __extends(RadioButton, _super);
        function RadioButton() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(RadioButton.prototype, "type", {
            get: function () {
                return "RadioButton";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RadioButton.prototype, "checked", {
            get: function () {
                var _checked = this.el.hasAttribute("checked") && this.el.getAttribute("checked") == "checked";
                return _checked;
            },
            set: function (value) {
                if (!value) {
                    this.el.removeAttribute("checked");
                }
                else {
                    this.el.setAttribute("checked", "checked");
                }
            },
            enumerable: true,
            configurable: true
        });
        RadioButton.prototype.onClick = function (event) {
            this.checked = !this.checked;
            _super.prototype.onClick.call(this, event);
        };
        // override
        RadioButton.prototype.getTemplate = function () {
            var isChecked = this.referenceTag.domElement.checked || this.referenceTag.domElement.hasAttribute("checked");
            return "<cf-radio-button class=\"cf-button\" " + (isChecked ? "checked=checked" : "") + ">\n\t\t\t\t<div>\n\t\t\t\t\t<cf-radio></cf-radio>\n\t\t\t\t\t" + this.referenceTag.label + "\n\t\t\t\t</div>\n\t\t\t</cf-radio-button>\n\t\t\t";
        };
        return RadioButton;
    }(cf.Button));
    cf.RadioButton = RadioButton;
})(cf || (cf = {}));

/// <reference path="Button.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// namespace
var cf;
(function (cf) {
    // interface
    // class
    var CheckboxButton = (function (_super) {
        __extends(CheckboxButton, _super);
        function CheckboxButton() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(CheckboxButton.prototype, "type", {
            get: function () {
                return "CheckboxButton";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CheckboxButton.prototype, "checked", {
            get: function () {
                return this.el.getAttribute("checked") == "checked";
            },
            set: function (value) {
                if (!value) {
                    this.el.removeAttribute("checked");
                    this.referenceTag.domElement.removeAttribute("checked");
                }
                else {
                    this.el.setAttribute("checked", "checked");
                    this.referenceTag.domElement.setAttribute("checked", "checked");
                }
            },
            enumerable: true,
            configurable: true
        });
        CheckboxButton.prototype.onClick = function (event) {
            this.checked = !this.checked;
        };
        // override
        CheckboxButton.prototype.getTemplate = function () {
            var isChecked = this.referenceTag.domElement.checked && this.referenceTag.domElement.hasAttribute("checked");
            return "<cf-button class=\"cf-button cf-checkbox-button " + (this.referenceTag.label.trim().length == 0 ? "no-text" : "") + "\" checked=" + (isChecked ? "checked" : "") + ">\n\t\t\t\t<div>\n\t\t\t\t\t<cf-checkbox></cf-checkbox>\n\t\t\t\t\t" + this.referenceTag.label + "\n\t\t\t\t</div>\n\t\t\t</cf-button>\n\t\t\t";
        };
        return CheckboxButton;
    }(cf.Button));
    cf.CheckboxButton = CheckboxButton;
})(cf || (cf = {}));

/// <reference path="Button.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// namespace
var cf;
(function (cf) {
    // interface
    cf.OptionButtonEvents = {
        CLICK: "cf-option-button-click"
    };
    // class
    var OptionButton = (function (_super) {
        __extends(OptionButton, _super);
        function OptionButton() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.isMultiChoice = false;
            return _this;
        }
        Object.defineProperty(OptionButton.prototype, "type", {
            get: function () {
                return "OptionButton";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OptionButton.prototype, "selected", {
            get: function () {
                return this.el.hasAttribute("selected");
            },
            set: function (value) {
                if (value) {
                    this.el.setAttribute("selected", "selected");
                }
                else {
                    this.el.removeAttribute("selected");
                }
            },
            enumerable: true,
            configurable: true
        });
        OptionButton.prototype.setData = function (options) {
            this.isMultiChoice = options.isMultiChoice;
            _super.prototype.setData.call(this, options);
        };
        OptionButton.prototype.onClick = function (event) {
            cf.ConversationalForm.illustrateFlow(this, "dispatch", cf.OptionButtonEvents.CLICK, this);
            this.eventTarget.dispatchEvent(new CustomEvent(cf.OptionButtonEvents.CLICK, {
                detail: this
            }));
        };
        // override
        OptionButton.prototype.getTemplate = function () {
            // be aware that first option element on none multiple select tags will be selected by default
            var tmpl = '<cf-button class="cf-button ' + (this.isMultiChoice ? "cf-checkbox-button" : "") + '" ' + (this.referenceTag.domElement.selected ? "selected='selected'" : "") + '>';
            tmpl += "<div>";
            if (this.isMultiChoice)
                tmpl += "<cf-checkbox></cf-checkbox>";
            tmpl += this.referenceTag.label;
            tmpl += "</div>";
            tmpl += "</cf-button>";
            return tmpl;
        };
        return OptionButton;
    }(cf.Button));
    cf.OptionButton = OptionButton;
})(cf || (cf = {}));

/// <reference path="ControlElement.ts"/>
/// <reference path="OptionButton.ts"/>
// namespace
var cf;
(function (cf) {
    // interface
    // class
    // builds x OptionsButton from the registered SelectTag
    var OptionsList = (function () {
        function OptionsList(options) {
            this.context = options.context;
            this.eventTarget = options.eventTarget;
            this.referenceTag = options.referenceTag;
            // check for multi choice select tag
            this.multiChoice = this.referenceTag.domElement.hasAttribute("multiple");
            this.onOptionButtonClickCallback = this.onOptionButtonClick.bind(this);
            this.eventTarget.addEventListener(cf.OptionButtonEvents.CLICK, this.onOptionButtonClickCallback, false);
            this.createElements();
        }
        Object.defineProperty(OptionsList.prototype, "type", {
            get: function () {
                return "OptionsList";
            },
            enumerable: true,
            configurable: true
        });
        OptionsList.prototype.getValue = function () {
            var arr = [];
            for (var i = 0; i < this.elements.length; i++) {
                var element = this.elements[i];
                if (!this.multiChoice && element.selected) {
                    arr.push(element);
                    return arr;
                }
                else if (this.multiChoice && element.selected) {
                    arr.push(element);
                }
            }
            return arr;
        };
        OptionsList.prototype.onOptionButtonClick = function (event) {
            // if mutiple... then dont remove selection on other buttons
            if (!this.multiChoice) {
                // only one is selectable at the time.
                for (var i = 0; i < this.elements.length; i++) {
                    var element = this.elements[i];
                    if (element != event.detail) {
                        element.selected = false;
                    }
                    else {
                        element.selected = true;
                    }
                }
                cf.ConversationalForm.illustrateFlow(this, "dispatch", cf.ControlElementEvents.SUBMIT_VALUE, this.referenceTag);
                this.eventTarget.dispatchEvent(new CustomEvent(cf.ControlElementEvents.SUBMIT_VALUE, {
                    detail: event.detail
                }));
            }
            else {
                event.detail.selected = !event.detail.selected;
            }
        };
        OptionsList.prototype.createElements = function () {
            this.elements = [];
            var optionTags = this.referenceTag.optionTags;
            for (var i = 0; i < optionTags.length; i++) {
                var tag = optionTags[i];
                var btn = new cf.OptionButton({
                    referenceTag: tag,
                    isMultiChoice: this.referenceTag.multipleChoice,
                    eventTarget: this.eventTarget
                });
                this.elements.push(btn);
                this.context.appendChild(btn.el);
            }
        };
        OptionsList.prototype.dealloc = function () {
            this.eventTarget.removeEventListener(cf.OptionButtonEvents.CLICK, this.onOptionButtonClickCallback, false);
            this.onOptionButtonClickCallback = null;
            while (this.elements.length > 0)
                this.elements.pop().dealloc();
            this.elements = null;
        };
        return OptionsList;
    }());
    cf.OptionsList = OptionsList;
})(cf || (cf = {}));

/// <reference path="Button.ts"/>
/// <reference path="../../logic/Helpers.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// namespace
var cf;
(function (cf) {
    // interface
    // class
    var UploadFileUI = (function (_super) {
        __extends(UploadFileUI, _super);
        function UploadFileUI(options) {
            var _this = _super.call(this, options) || this;
            _this.maxFileSize = 100000000000;
            _this.loading = false;
            _this.submitTimer = 0;
            _this._fileName = "";
            _this._readerResult = "";
            if (cf.Helpers.caniuse.fileReader()) {
                var maxFileSizeStr = _this.referenceTag.domElement.getAttribute("cf-max-size") || _this.referenceTag.domElement.getAttribute("max-size");
                if (maxFileSizeStr) {
                    var maxFileSize = parseInt(maxFileSizeStr, 10);
                    _this.maxFileSize = maxFileSize;
                }
                _this.progressBar = _this.el.getElementsByTagName("cf-upload-file-progress-bar")[0];
                _this.onDomElementChangeCallback = _this.onDomElementChange.bind(_this);
                _this.referenceTag.domElement.addEventListener("change", _this.onDomElementChangeCallback, false);
            }
            else {
                throw new Error("Conversational Form Error: No FileReader available for client.");
            }
            return _this;
        }
        Object.defineProperty(UploadFileUI.prototype, "value", {
            get: function () {
                return this.referenceTag.domElement.value; //;this.readerResult || this.fileName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UploadFileUI.prototype, "readerResult", {
            get: function () {
                return this._readerResult;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UploadFileUI.prototype, "files", {
            get: function () {
                return this._files;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UploadFileUI.prototype, "fileName", {
            get: function () {
                return this._fileName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UploadFileUI.prototype, "type", {
            get: function () {
                return "UploadFileUI";
            },
            enumerable: true,
            configurable: true
        });
        UploadFileUI.prototype.getFilesAsString = function () {
            // value is for the chat response -->
            var icon = document.createElement("span");
            icon.innerHTML = cf.Dictionary.get("icon-type-file") + this.fileName;
            return icon.outerHTML;
        };
        UploadFileUI.prototype.onDomElementChange = function (event) {
            var _this = this;
            console.log("...onDomElementChange");
            var reader = new FileReader();
            this._files = this.referenceTag.domElement.files;
            reader.onerror = function (event) {
                console.log("onerror", event);
            };
            reader.onprogress = function (event) {
                console.log("onprogress", event);
                _this.progressBar.style.width = ((event.loaded / event.total) * 100) + "%";
            };
            reader.onabort = function (event) {
                console.log("onabort", event);
            };
            reader.onloadstart = function (event) {
                // check for file size
                var file = _this.files[0];
                var fileSize = file ? file.size : _this.maxFileSize + 1; // if file is undefined then abort ...
                if (fileSize > _this.maxFileSize) {
                    reader.abort();
                    var dto = {
                        errorText: cf.Dictionary.get("input-placeholder-file-size-error")
                    };
                    cf.ConversationalForm.illustrateFlow(_this, "dispatch", cf.FlowEvents.USER_INPUT_INVALID, dto);
                    _this.eventTarget.dispatchEvent(new CustomEvent(cf.FlowEvents.USER_INPUT_INVALID, {
                        detail: dto
                    }));
                }
                else {
                    // good to go
                    _this._fileName = file.name;
                    _this.loading = true;
                    _this.animateIn();
                    // set text
                    var sizeConversion = Math.floor(Math.log(fileSize) / Math.log(1024));
                    var sizeChart = ["b", "kb", "mb", "gb"];
                    sizeConversion = Math.min(sizeChart.length - 1, sizeConversion);
                    var humanSizeString = Number((fileSize / Math.pow(1024, sizeConversion)).toFixed(2)) * 1 + " " + sizeChart[sizeConversion];
                    var text = file.name + " (" + humanSizeString + ")";
                    _this.el.getElementsByTagName("cf-upload-file-text")[0].innerHTML = text;
                    _this.eventTarget.dispatchEvent(new CustomEvent(cf.ControlElementEvents.PROGRESS_CHANGE, {
                        detail: cf.ControlElementProgressStates.BUSY
                    }));
                }
            };
            reader.onload = function (event) {
                _this._readerResult = event.target.result;
                _this.progressBar.classList.add("loaded");
                _this.submitTimer = setTimeout(function () {
                    _this.el.classList.remove("animate-in");
                    _this.onChoose(); // submit the file
                    _this.eventTarget.dispatchEvent(new CustomEvent(cf.ControlElementEvents.PROGRESS_CHANGE, {
                        detail: cf.ControlElementProgressStates.READY
                    }));
                }, 0);
            };
            reader.readAsDataURL(this.files[0]);
        };
        UploadFileUI.prototype.animateIn = function () {
            if (this.loading)
                _super.prototype.animateIn.call(this);
        };
        UploadFileUI.prototype.onClick = function (event) {
            // super.onClick(event);
        };
        UploadFileUI.prototype.triggerFileSelect = function () {
            // trigger file prompt
            this.referenceTag.domElement.click();
        };
        // override
        UploadFileUI.prototype.dealloc = function () {
            clearTimeout(this.submitTimer);
            this.progressBar = null;
            if (this.onDomElementChangeCallback) {
                this.referenceTag.domElement.removeEventListener("change", this.onDomElementChangeCallback, false);
                this.onDomElementChangeCallback = null;
            }
            _super.prototype.dealloc.call(this);
        };
        UploadFileUI.prototype.getTemplate = function () {
            var isChecked = this.referenceTag.value == "1" || this.referenceTag.domElement.hasAttribute("checked");
            return "<cf-upload-file-ui>\n\t\t\t\t<cf-upload-file-text></cf-upload-file-text>\n\t\t\t\t<cf-upload-file-progress>\n\t\t\t\t\t<cf-upload-file-progress-bar></cf-upload-file-progress-bar>\n\t\t\t\t</cf-upload-file-progress>\n\t\t\t</cf-upload-file-ui>\n\t\t\t";
        };
        return UploadFileUI;
    }(cf.Button));
    cf.UploadFileUI = UploadFileUI;
})(cf || (cf = {}));

/// <reference path="BasicElement.ts"/>
/// <reference path="control-elements/ControlElements.ts"/>
/// <reference path="../logic/FlowManager.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// namespace
var cf;
(function (cf) {
    // interface
    cf.UserInputEvents = {
        SUBMIT: "cf-input-user-input-submit",
        KEY_CHANGE: "cf-input-key-change",
        CONTROL_ELEMENTS_ADDED: "cf-input-control-elements-added",
        HEIGHT_CHANGE: "cf-input-height-change",
    };
    // class
    var UserInput = (function (_super) {
        __extends(UserInput, _super);
        function UserInput(options) {
            var _this = _super.call(this, options) || this;
            _this.errorTimer = 0;
            _this.initialInputHeight = 0;
            _this.shiftIsDown = false;
            _this._disabled = false;
            //acts as a fallb ack for ex. shadow dom implementation
            _this._active = false;
            _this.cfReference = options.cfReference;
            _this.eventTarget = options.eventTarget;
            _this.inputElement = _this.el.getElementsByTagName("textarea")[0];
            _this.onInputFocusCallback = _this.onInputFocus.bind(_this);
            _this.onInputBlurCallback = _this.onInputBlur.bind(_this);
            _this.inputElement.addEventListener('focus', _this.onInputFocusCallback, false);
            _this.inputElement.addEventListener('blur', _this.onInputBlurCallback, false);
            //<cf-input-control-elements> is defined in the ChatList.ts
            _this.controlElements = new cf.ControlElements({
                el: _this.el.getElementsByTagName("cf-input-control-elements")[0],
                infoEl: _this.el.getElementsByTagName("cf-info")[0],
                eventTarget: _this.eventTarget
            });
            // setup event listeners
            _this.windowFocusCallback = _this.windowFocus.bind(_this);
            window.addEventListener('focus', _this.windowFocusCallback, false);
            _this.keyUpCallback = _this.onKeyUp.bind(_this);
            document.addEventListener("keyup", _this.keyUpCallback, false);
            _this.keyDownCallback = _this.onKeyDown.bind(_this);
            document.addEventListener("keydown", _this.keyDownCallback, false);
            _this.flowUpdateCallback = _this.onFlowUpdate.bind(_this);
            _this.eventTarget.addEventListener(cf.FlowEvents.FLOW_UPDATE, _this.flowUpdateCallback, false);
            _this.onOriginalTagChangedCallback = _this.onOriginalTagChanged.bind(_this);
            _this.eventTarget.addEventListener(cf.TagEvents.ORIGINAL_ELEMENT_CHANGED, _this.onOriginalTagChangedCallback, false);
            _this.inputInvalidCallback = _this.inputInvalid.bind(_this);
            _this.eventTarget.addEventListener(cf.FlowEvents.USER_INPUT_INVALID, _this.inputInvalidCallback, false);
            _this.onControlElementSubmitCallback = _this.onControlElementSubmit.bind(_this);
            _this.eventTarget.addEventListener(cf.ControlElementEvents.SUBMIT_VALUE, _this.onControlElementSubmitCallback, false);
            _this.onControlElementProgressChangeCallback = _this.onControlElementProgressChange.bind(_this);
            _this.eventTarget.addEventListener(cf.ControlElementEvents.PROGRESS_CHANGE, _this.onControlElementProgressChangeCallback, false);
            _this.submitButton = _this.el.getElementsByTagName("cf-input-button")[0];
            _this.onSubmitButtonClickCallback = _this.onSubmitButtonClick.bind(_this);
            _this.submitButton.addEventListener("click", _this.onSubmitButtonClickCallback, false);
            return _this;
        }
        Object.defineProperty(UserInput.prototype, "active", {
            get: function () {
                return this.inputElement === document.activeElement || this._active;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UserInput.prototype, "visible", {
            set: function (value) {
                if (!this.el.classList.contains("animate-in") && value)
                    this.el.classList.add("animate-in");
                else if (this.el.classList.contains("animate-in") && !value)
                    this.el.classList.remove("animate-in");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UserInput.prototype, "currentTag", {
            get: function () {
                return this._currentTag;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UserInput.prototype, "disabled", {
            set: function (value) {
                var hasChanged = this._disabled != value;
                if (hasChanged) {
                    this._disabled = value;
                    if (value) {
                        this.el.setAttribute("disabled", "disabled");
                        this.inputElement.blur();
                    }
                    else {
                        this.setFocusOnInput();
                        this.el.removeAttribute("disabled");
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        UserInput.prototype.getInputValue = function () {
            var str = this.inputElement.value;
            // Build-in way to handle XSS issues ->
            var div = document.createElement('div');
            div.appendChild(document.createTextNode(str));
            return div.innerHTML;
        };
        UserInput.prototype.getFlowDTO = function () {
            var value; // = this.inputElement.value;
            // check for values on control elements as they should overwrite the input value.
            if (this.controlElements && this.controlElements.active) {
                value = this.controlElements.getDTO();
            }
            else {
                value = {
                    text: this.getInputValue()
                };
            }
            value.input = this;
            return value;
        };
        UserInput.prototype.reset = function () {
            if (this.controlElements) {
                this.controlElements.clearTagsAndReset();
            }
        };
        UserInput.prototype.onFlowStopped = function () {
            if (this.controlElements)
                this.controlElements.clearTagsAndReset();
            this.disabled = true;
        };
        /**
        * @name onOriginalTagChanged
        * on domElement from a Tag value changed..
        */
        UserInput.prototype.onOriginalTagChanged = function (event) {
            if (this.currentTag == event.detail.tag) {
                this.onInputChange();
            }
            if (this.controlElements && this.controlElements.active) {
                this.controlElements.updateStateOnElementsFromTag(event.detail.tag);
            }
        };
        UserInput.prototype.onInputChange = function () {
            if (!this.active && !this.controlElements.active)
                return;
            // safari likes to jump around with the scrollHeight value, let's keep it in check with an initial height.
            var oldHeight = Math.max(this.initialInputHeight, parseInt(this.inputElement.style.height, 10));
            this.inputElement.style.height = "0px";
            this.inputElement.style.height = (this.inputElement.scrollHeight === 0 ? oldHeight : this.inputElement.scrollHeight) + "px";
            cf.ConversationalForm.illustrateFlow(this, "dispatch", cf.UserInputEvents.HEIGHT_CHANGE);
            this.eventTarget.dispatchEvent(new CustomEvent(cf.UserInputEvents.HEIGHT_CHANGE, {
                detail: this.inputElement.scrollHeight
            }));
        };
        UserInput.prototype.inputInvalid = function (event) {
            var _this = this;
            cf.ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
            var dto = event.detail;
            this.inputElement.setAttribute("data-value", this.inputElement.value);
            this.inputElement.value = "";
            this.el.setAttribute("error", "");
            this.disabled = true;
            // cf-error
            this.inputElement.setAttribute("placeholder", dto.errorText || this._currentTag.errorMessage);
            clearTimeout(this.errorTimer);
            this.errorTimer = setTimeout(function () {
                _this.disabled = false;
                _this.el.removeAttribute("error");
                _this.inputElement.value = _this.inputElement.getAttribute("data-value");
                _this.inputElement.setAttribute("data-value", "");
                _this.setPlaceholder();
                _this.setFocusOnInput();
                if (_this.controlElements)
                    _this.controlElements.resetAfterErrorMessage();
            }, UserInput.ERROR_TIME);
        };
        UserInput.prototype.setPlaceholder = function () {
            if (this._currentTag) {
                if (this._currentTag.inputPlaceholder) {
                    this.inputElement.setAttribute("placeholder", this._currentTag.inputPlaceholder);
                }
                else {
                    this.inputElement.setAttribute("placeholder", this._currentTag.type == "group" ? cf.Dictionary.get("group-placeholder") : cf.Dictionary.get("input-placeholder"));
                }
            }
            else {
                this.inputElement.setAttribute("placeholder", cf.Dictionary.get("group-placeholder"));
            }
        };
        UserInput.prototype.checkForCorrectInputTag = function () {
            // handle password natively
            var currentType = this.inputElement.getAttribute("type");
            var isCurrentInputTypeTextAreaButNewTagPassword = this._currentTag.type == "password" && currentType != "password";
            var isCurrentInputTypeInputButNewTagNotPassword = this._currentTag.type != "password" && currentType == "password";
            // remove focus and blur events, because we want to create a new element
            if (this.inputElement && (isCurrentInputTypeTextAreaButNewTagPassword || isCurrentInputTypeInputButNewTagNotPassword)) {
                this.inputElement.removeEventListener('focus', this.onInputFocusCallback, false);
                this.inputElement.removeEventListener('blur', this.onInputBlurCallback, false);
            }
            if (isCurrentInputTypeTextAreaButNewTagPassword) {
                // change to input
                var input_1 = document.createElement("input");
                Array.prototype.slice.call(this.inputElement.attributes).forEach(function (item) {
                    input_1.setAttribute(item.name, item.value);
                });
                input_1.setAttribute("autocomplete", "new-password");
                this.inputElement.parentNode.replaceChild(input_1, this.inputElement);
                this.inputElement = input_1;
            }
            else if (isCurrentInputTypeInputButNewTagNotPassword) {
                // change to textarea
                var textarea_1 = document.createElement("textarea");
                Array.prototype.slice.call(this.inputElement.attributes).forEach(function (item) {
                    textarea_1.setAttribute(item.name, item.value);
                });
                this.inputElement.parentNode.replaceChild(textarea_1, this.inputElement);
                this.inputElement = textarea_1;
            }
            // add focus and blur events to newly created input element
            if (this.inputElement && (isCurrentInputTypeTextAreaButNewTagPassword || isCurrentInputTypeInputButNewTagNotPassword)) {
                this.inputElement.addEventListener('focus', this.onInputFocusCallback, false);
                this.inputElement.addEventListener('blur', this.onInputBlurCallback, false);
            }
            if (this.initialInputHeight == 0) {
                // initial height not set
                this.initialInputHeight = this.inputElement.offsetHeight;
            }
        };
        UserInput.prototype.onFlowUpdate = function (event) {
            var _this = this;
            cf.ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
            // animate input field in
            this.visible = true;
            this._currentTag = event.detail.tag;
            this.el.setAttribute("tag-type", this._currentTag.type);
            // replace textarea and visa versa
            this.checkForCorrectInputTag();
            // set input field to type password if the dom input field is that, covering up the input
            this.inputElement.setAttribute("type", this._currentTag.type == "password" ? "password" : "input");
            clearTimeout(this.errorTimer);
            this.el.removeAttribute("error");
            this.inputElement.setAttribute("data-value", "");
            this.inputElement.value = "";
            this.setPlaceholder();
            this.resetValue();
            if (!UserInput.preventAutoFocus)
                this.setFocusOnInput();
            this.controlElements.reset();
            if (this._currentTag.type == "group") {
                this.buildControlElements(this._currentTag.elements);
            }
            else {
                this.buildControlElements([this._currentTag]);
            }
            if (this._currentTag.type == "text" || this._currentTag.type == "email") {
                this.inputElement.value = this._currentTag.defaultValue.toString();
            }
            setTimeout(function () {
                _this.disabled = false;
                _this.onInputChange();
            }, 150);
        };
        UserInput.prototype.onControlElementProgressChange = function (event) {
            var status = event.detail;
            this.disabled = status == cf.ControlElementProgressStates.BUSY;
        };
        UserInput.prototype.buildControlElements = function (tags) {
            this.controlElements.buildTags(tags);
        };
        UserInput.prototype.onControlElementSubmit = function (event) {
            cf.ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
            // when ex a RadioButton is clicked..
            var controlElement = event.detail;
            this.controlElements.updateStateOnElements(controlElement);
            this.doSubmit();
        };
        UserInput.prototype.onSubmitButtonClick = function (event) {
            this.onEnterOrSubmitButtonSubmit(event);
        };
        UserInput.prototype.isMetaKeyPressed = function (event) {
            // if any meta keys, then ignore, getModifierState, but safari does not support..
            if (event.metaKey || [91, 93].indexOf(event.keyCode) !== -1)
                return;
        };
        UserInput.prototype.onKeyDown = function (event) {
            if (!this.active && !this.controlElements.focus)
                return;
            if (this.isMetaKeyPressed(event))
                return;
            // if any meta keys, then ignore
            if (event.keyCode == cf.Dictionary.keyCodes["shift"])
                this.shiftIsDown = true;
            // prevent textarea line breaks
            if (event.keyCode == cf.Dictionary.keyCodes["enter"] && !event.shiftKey) {
                event.preventDefault();
            }
        };
        UserInput.prototype.onKeyUp = function (event) {
            if (!this.active && !this.controlElements.focus)
                return;
            if (this.isMetaKeyPressed(event))
                return;
            if (event.keyCode == cf.Dictionary.keyCodes["shift"]) {
                this.shiftIsDown = false;
            }
            else if (event.keyCode == cf.Dictionary.keyCodes["up"]) {
                event.preventDefault();
                if (this.active && !this.controlElements.focus)
                    this.controlElements.focusFrom("bottom");
            }
            else if (event.keyCode == cf.Dictionary.keyCodes["down"]) {
                event.preventDefault();
                if (this.active && !this.controlElements.focus)
                    this.controlElements.focusFrom("top");
            }
            else if (event.keyCode == cf.Dictionary.keyCodes["tab"]) {
                // tab key pressed, check if node is child of CF, if then then reset focus to input element
                var doesKeyTargetExistInCF = false;
                var node = event.target.parentNode;
                while (node != null) {
                    if (node === this.cfReference.el) {
                        doesKeyTargetExistInCF = true;
                        break;
                    }
                    node = node.parentNode;
                }
                // prevent normal behaviour, we are not here to take part, we are here to take over!
                if (!doesKeyTargetExistInCF) {
                    event.preventDefault();
                    if (!this.controlElements.active)
                        this.setFocusOnInput();
                }
            }
            if (this.el.hasAttribute("disabled"))
                return;
            var value = this.getFlowDTO();
            if ((event.keyCode == cf.Dictionary.keyCodes["enter"] && !event.shiftKey) || event.keyCode == cf.Dictionary.keyCodes["space"]) {
                if (event.keyCode == cf.Dictionary.keyCodes["enter"] && this.active) {
                    event.preventDefault();
                    this.onEnterOrSubmitButtonSubmit();
                }
                else {
                    // either click on submit button or do something with control elements
                    if (event.keyCode == cf.Dictionary.keyCodes["enter"] || event.keyCode == cf.Dictionary.keyCodes["space"]) {
                        event.preventDefault();
                        var tagType = this._currentTag.type == "group" ? this._currentTag.getGroupTagType() : this._currentTag.type;
                        if (tagType == "select" || tagType == "checkbox") {
                            var mutiTag = this._currentTag;
                            // if select or checkbox then check for multi select item
                            if (tagType == "checkbox" || mutiTag.multipleChoice) {
                                if (this.active && event.keyCode == cf.Dictionary.keyCodes["enter"]) {
                                    // click on UserInput submit button, only ENTER allowed
                                    this.submitButton.click();
                                }
                                else {
                                    // let UI know that we changed the key
                                    this.dispatchKeyChange(value, event.keyCode);
                                    if (!this.active) {
                                        // after ui has been selected we RESET the input/filter
                                        this.resetValue();
                                        this.setFocusOnInput();
                                        this.dispatchKeyChange(value, event.keyCode);
                                    }
                                }
                            }
                            else {
                                this.dispatchKeyChange(value, event.keyCode);
                            }
                        }
                        else {
                            if (this._currentTag.type == "group") {
                                // let the controlements handle action
                                this.dispatchKeyChange(value, event.keyCode);
                            }
                        }
                    }
                    else if (event.keyCode == cf.Dictionary.keyCodes["space"] && document.activeElement) {
                        this.dispatchKeyChange(value, event.keyCode);
                    }
                }
            }
            else if (event.keyCode != cf.Dictionary.keyCodes["shift"] && event.keyCode != cf.Dictionary.keyCodes["tab"]) {
                this.dispatchKeyChange(value, event.keyCode);
            }
            this.onInputChange();
        };
        UserInput.prototype.dispatchKeyChange = function (dto, keyCode) {
            cf.ConversationalForm.illustrateFlow(this, "dispatch", cf.UserInputEvents.KEY_CHANGE, dto);
            this.eventTarget.dispatchEvent(new CustomEvent(cf.UserInputEvents.KEY_CHANGE, {
                detail: {
                    dto: dto,
                    keyCode: keyCode,
                    inputFieldActive: this.active
                }
            }));
        };
        UserInput.prototype.windowFocus = function (event) {
            if (!UserInput.preventAutoFocus)
                this.setFocusOnInput();
        };
        UserInput.prototype.onInputBlur = function (event) {
            this._active = false;
        };
        UserInput.prototype.onInputFocus = function (event) {
            this._active = true;
            this.onInputChange();
        };
        UserInput.prototype.setFocusOnInput = function () {
            this.inputElement.focus();
        };
        UserInput.prototype.onEnterOrSubmitButtonSubmit = function (event) {
            if (event === void 0) { event = null; }
            if (this.active && this.controlElements.highlighted) {
                // active input field and focus on control elements happens when a control element is highlighted
                this.controlElements.clickOnHighlighted();
            }
            else {
                if (!this._currentTag) {
                    // happens when a form is empty, so just play along and submit response to chatlist..
                    this.eventTarget.cf.addUserChatResponse(this.inputElement.value);
                }
                else {
                    // we need to check if current tag is file
                    if (this._currentTag.type == "file" && event) {
                        // trigger <input type="file" but only when it's from clicking button
                        this.controlElements.getElement(0).triggerFileSelect();
                    }
                    else {
                        // for groups, we expect that there is always a default value set
                        this.doSubmit();
                    }
                }
            }
        };
        UserInput.prototype.doSubmit = function () {
            var dto = this.getFlowDTO();
            this.disabled = true;
            this.el.removeAttribute("error");
            this.inputElement.setAttribute("data-value", "");
            cf.ConversationalForm.illustrateFlow(this, "dispatch", cf.UserInputEvents.SUBMIT, dto);
            this.eventTarget.dispatchEvent(new CustomEvent(cf.UserInputEvents.SUBMIT, {
                detail: dto
            }));
        };
        UserInput.prototype.resetValue = function () {
            this.inputElement.value = "";
            this.onInputChange();
        };
        UserInput.prototype.dealloc = function () {
            this.inputElement.removeEventListener('blur', this.onInputBlurCallback, false);
            this.onInputBlurCallback = null;
            this.inputElement.removeEventListener('focus', this.onInputFocusCallback, false);
            this.onInputFocusCallback = null;
            window.removeEventListener('focus', this.windowFocusCallback, false);
            this.windowFocusCallback = null;
            document.removeEventListener("keydown", this.keyDownCallback, false);
            this.keyDownCallback = null;
            document.removeEventListener("keyup", this.keyUpCallback, false);
            this.keyUpCallback = null;
            this.eventTarget.removeEventListener(cf.FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
            this.flowUpdateCallback = null;
            this.eventTarget.removeEventListener(cf.FlowEvents.USER_INPUT_INVALID, this.inputInvalidCallback, false);
            this.inputInvalidCallback = null;
            this.eventTarget.removeEventListener(cf.ControlElementEvents.SUBMIT_VALUE, this.onControlElementSubmitCallback, false);
            this.onControlElementSubmitCallback = null;
            this.submitButton = this.el.getElementsByClassName("cf-input-button")[0];
            this.submitButton.removeEventListener("click", this.onSubmitButtonClickCallback, false);
            this.onSubmitButtonClickCallback = null;
            _super.prototype.dealloc.call(this);
        };
        // override
        UserInput.prototype.getTemplate = function () {
            return "<cf-input>\n\t\t\t\t<cf-info></cf-info>\n\t\t\t\t<cf-input-control-elements>\n\t\t\t\t\t<cf-list-button direction=\"prev\">\n\t\t\t\t\t</cf-list-button>\n\t\t\t\t\t<cf-list-button direction=\"next\">\n\t\t\t\t\t</cf-list-button>\n\t\t\t\t\t<cf-list>\n\t\t\t\t\t</cf-list>\n\t\t\t\t</cf-input-control-elements>\n\n\t\t\t\t<cf-input-button class=\"cf-input-button\">\n\t\t\t\t\t<div class=\"cf-icon-progress\"></div>\n\t\t\t\t\t<div class=\"cf-icon-attachment\"></div>\n\t\t\t\t</cf-input-button>\n\t\t\t\t\n\t\t\t\t<textarea type='input' tabindex=\"1\" rows=\"1\"></textarea>\n\n\t\t\t</cf-input>\n\t\t\t";
        };
        return UserInput;
    }(cf.BasicElement));
    UserInput.preventAutoFocus = false;
    UserInput.ERROR_TIME = 2000;
    cf.UserInput = UserInput;
})(cf || (cf = {}));

/// <reference path="../BasicElement.ts"/>
/// <reference path="../../logic/Helpers.ts"/>
/// <reference path="../../ConversationalForm.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// namespace
var cf;
(function (cf) {
    cf.ChatResponseEvents = {
        USER_ANSWER_CLICKED: "cf-on-user-answer-clicked",
    };
    // class
    var ChatResponse = (function (_super) {
        __extends(ChatResponse, _super);
        function ChatResponse(options) {
            var _this = _super.call(this, options) || this;
            _this._tag = options.tag;
            _this.textEl = _this.el.getElementsByTagName("text")[0];
            return _this;
        }
        Object.defineProperty(ChatResponse.prototype, "tag", {
            get: function () {
                return this._tag;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ChatResponse.prototype, "disabled", {
            get: function () {
                return this.el.classList.contains("disabled");
            },
            set: function (value) {
                this.el.classList.toggle("disabled", value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ChatResponse.prototype, "visible", {
            set: function (value) {
                if (value) {
                    this.el.classList.add("show");
                }
                else {
                    this.el.classList.remove("show");
                }
            },
            enumerable: true,
            configurable: true
        });
        ChatResponse.prototype.setValue = function (dto) {
            if (dto === void 0) { dto = null; }
            if (!this.visible) {
                this.visible = true;
            }
            var isThinking = this.textEl.hasAttribute("thinking");
            if (!dto) {
                this.setToThinking();
            }
            else {
                this.response = dto.text;
                var processedResponse = this.processResponseAndSetText();
                if (this.responseLink && !this.isRobotReponse) {
                    // call robot and update for binding values ->
                    this.responseLink.processResponseAndSetText();
                }
                // check for if response type is file upload...
                if (dto && dto.controlElements && dto.controlElements[0]) {
                    switch (dto.controlElements[0].type) {
                        case "UploadFileUI":
                            this.textEl.classList.add("file-icon");
                            break;
                    }
                }
                if (!this.isRobotReponse && !this.onClickCallback) {
                    this.onClickCallback = this.onClick.bind(this);
                    this.el.addEventListener(cf.Helpers.getMouseEvent("click"), this.onClickCallback, false);
                }
            }
        };
        ChatResponse.prototype.hide = function () {
            this.el.classList.remove("show");
            this.disabled = true;
        };
        ChatResponse.prototype.show = function () {
            this.el.classList.add("show");
            this.disabled = false;
            if (!this.response) {
                this.setToThinking();
            }
            else {
                this.checkForEditMode();
            }
        };
        ChatResponse.prototype.updateThumbnail = function (src) {
            this.image = src;
            var thumbEl = this.el.getElementsByTagName("thumb")[0];
            thumbEl.style.backgroundImage = "url(" + this.image + ")";
        };
        ChatResponse.prototype.setLinkToOtherReponse = function (response) {
            // link reponse to another one, keeping the update circle complete.
            this.responseLink = response;
        };
        ChatResponse.prototype.processResponseAndSetText = function () {
            var _this = this;
            var innerResponse = this.response;
            if (this._tag && this._tag.type == "password" && !this.isRobotReponse) {
                var newStr = "";
                for (var i = 0; i < innerResponse.length; i++) {
                    newStr += "*";
                }
                innerResponse = newStr;
            }
            else {
                innerResponse = cf.Helpers.emojify(innerResponse);
            }
            if (this.responseLink && this.isRobotReponse) {
                // if robot, then check linked response for binding values
                // one way data binding values:
                innerResponse = innerResponse.split("{previous-answer}").join(this.responseLink.parsedResponse);
                // add more..
                // innerResponse = innerResponse.split("{...}").join(this.responseLink.parsedResponse);
            }
            // check if response contains an image as answer
            var responseContains = innerResponse.indexOf("contains-image") != -1;
            if (responseContains)
                this.textEl.classList.add("contains-image");
            // now set it
            this.textEl.innerHTML = innerResponse;
            this.parsedResponse = innerResponse;
            // bounce
            this.textEl.removeAttribute("thinking");
            this.textEl.removeAttribute("value-added");
            setTimeout(function () {
                _this.textEl.setAttribute("value-added", "");
            }, 0);
            this.checkForEditMode();
            return innerResponse;
        };
        ChatResponse.prototype.checkForEditMode = function () {
            if (!this.isRobotReponse && !this.textEl.hasAttribute("thinking")) {
                this.el.classList.add("can-edit");
                this.disabled = false;
            }
        };
        ChatResponse.prototype.setToThinking = function () {
            this.textEl.innerHTML = ChatResponse.THINKING_MARKUP;
            this.el.classList.remove("can-edit");
            this.textEl.setAttribute("thinking", "");
        };
        /**
        * @name onClickCallback
        * click handler for el
        */
        ChatResponse.prototype.onClick = function (event) {
            this.setToThinking();
            cf.ConversationalForm.illustrateFlow(this, "dispatch", cf.ChatResponseEvents.USER_ANSWER_CLICKED, event);
            this.eventTarget.dispatchEvent(new CustomEvent(cf.ChatResponseEvents.USER_ANSWER_CLICKED, {
                detail: this._tag
            }));
        };
        ChatResponse.prototype.setData = function (options) {
            var _this = this;
            this.image = options.image;
            this.response = "";
            this.isRobotReponse = options.isRobotReponse;
            _super.prototype.setData.call(this, options);
            setTimeout(function () {
                _this.setValue();
                if (_this.isRobotReponse || options.response != null) {
                    // Robot is pseudo thinking, can also be user -->
                    // , but if addUserChatResponse is called from ConversationalForm, then the value is there, therefore skip ...
                    setTimeout(function () { return _this.setValue({ text: options.response }); }, 0); //ConversationalForm.animationsEnabled ? Helpers.lerp(Math.random(), 500, 900) : 0);
                }
                else {
                    // shows the 3 dots automatically, we expect the reponse to be empty upon creation
                    // TODO: Auto completion insertion point
                    setTimeout(function () { return _this.el.classList.add("peak-thumb"); }, cf.ConversationalForm.animationsEnabled ? 1400 : 0);
                }
            }, 0);
        };
        ChatResponse.prototype.dealloc = function () {
            if (this.onClickCallback) {
                this.el.removeEventListener(cf.Helpers.getMouseEvent("click"), this.onClickCallback, false);
                this.onClickCallback = null;
            }
            _super.prototype.dealloc.call(this);
        };
        // template, can be overwritten ...
        ChatResponse.prototype.getTemplate = function () {
            return "<cf-chat-response class=\"" + (this.isRobotReponse ? "robot" : "user") + "\">\n\t\t\t\t<thumb style=\"background-image: url(" + this.image + ")\"></thumb>\n\t\t\t\t<text>" + (!this.response ? ChatResponse.THINKING_MARKUP : this.response) + "</text>\n\t\t\t</cf-chat-response>";
        };
        return ChatResponse;
    }(cf.BasicElement));
    ChatResponse.THINKING_MARKUP = "<thinking><span>.</span><span>.</span><span>.</span></thinking>";
    cf.ChatResponse = ChatResponse;
})(cf || (cf = {}));

/// <reference path="ChatResponse.ts"/>
/// <reference path="../BasicElement.ts"/>
/// <reference path="../../logic/FlowManager.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// namespace
var cf;
(function (cf) {
    // interface
    cf.ChatListEvents = {
        CHATLIST_UPDATED: "cf-chatlist-updated"
    };
    // class
    var ChatList = (function (_super) {
        __extends(ChatList, _super);
        function ChatList(options) {
            var _this = _super.call(this, options) || this;
            _this.responses = [];
            // flow update
            _this.flowUpdateCallback = _this.onFlowUpdate.bind(_this);
            _this.eventTarget.addEventListener(cf.FlowEvents.FLOW_UPDATE, _this.flowUpdateCallback, false);
            // user input update
            _this.userInputUpdateCallback = _this.onUserInputUpdate.bind(_this);
            _this.eventTarget.addEventListener(cf.FlowEvents.USER_INPUT_UPDATE, _this.userInputUpdateCallback, false);
            // user input key change
            _this.onInputKeyChangeCallback = _this.onInputKeyChange.bind(_this);
            _this.eventTarget.addEventListener(cf.UserInputEvents.KEY_CHANGE, _this.onInputKeyChangeCallback, false);
            // user input height change
            _this.onInputHeightChangeCallback = _this.onInputHeightChange.bind(_this);
            _this.eventTarget.addEventListener(cf.UserInputEvents.HEIGHT_CHANGE, _this.onInputHeightChangeCallback, false);
            return _this;
        }
        ChatList.prototype.onInputHeightChange = function (event) {
            var dto = event.detail.dto;
            cf.ConversationalForm.illustrateFlow(this, "receive", event.type, dto);
            this.scrollListTo();
        };
        ChatList.prototype.onInputKeyChange = function (event) {
            var dto = event.detail.dto;
            cf.ConversationalForm.illustrateFlow(this, "receive", event.type, dto);
        };
        ChatList.prototype.onUserInputUpdate = function (event) {
            cf.ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
            if (this.currentUserResponse) {
                var response = event.detail;
                this.setCurrentUserResponse(response);
            }
            else {
                // this should never happen..
                throw new Error("No current response ..?");
            }
        };
        ChatList.prototype.onFlowUpdate = function (event) {
            cf.ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
            var currentTag = event.detail.tag;
            if (this.currentResponse)
                this.currentResponse.disabled = false;
            if (this.containsTagResponse(currentTag) && !event.detail.ignoreExistingTag) {
                // because user maybe have scrolled up and wants to edit
                // tag is already in list, so re-activate it
                this.onUserWantsToEditTag(currentTag);
            }
            else {
                // robot response
                var robot = this.createResponse(true, currentTag, currentTag.question);
                if (this.currentUserResponse) {
                    // linked, but only if we should not ignore existing tag
                    this.currentUserResponse.setLinkToOtherReponse(robot);
                    robot.setLinkToOtherReponse(this.currentUserResponse);
                }
                // user response, create the waiting response
                this.currentUserResponse = this.createResponse(false, currentTag);
            }
        };
        /**
        * @name containsTagResponse
        * @return boolean
        * check if tag has already been responded to
        */
        ChatList.prototype.containsTagResponse = function (tagToChange) {
            for (var i = 0; i < this.responses.length; i++) {
                var element = this.responses[i];
                if (!element.isRobotReponse && element.tag == tagToChange) {
                    return true;
                }
            }
            return false;
        };
        /**
        * @name onUserAnswerClicked
        * on user ChatReponse clicked
        */
        ChatList.prototype.onUserWantsToEditTag = function (tagToChange) {
            var oldReponse;
            for (var i = 0; i < this.responses.length; i++) {
                var element = this.responses[i];
                if (!element.isRobotReponse && element.tag == tagToChange) {
                    // update element thhat user wants to edit
                    oldReponse = element;
                    break;
                }
            }
            // reset the current user response
            this.currentUserResponse.processResponseAndSetText();
            if (oldReponse) {
                // only disable latest tag when we jump back
                if (this.currentUserResponse == this.responses[this.responses.length - 1]) {
                    this.currentUserResponse.hide();
                }
                this.currentUserResponse = oldReponse;
                this.onListUpdate(this.currentUserResponse);
            }
        };
        ChatList.prototype.onListUpdate = function (chatResponse) {
            var _this = this;
            setTimeout(function () {
                _this.eventTarget.dispatchEvent(new CustomEvent(cf.ChatListEvents.CHATLIST_UPDATED, {
                    detail: _this
                }));
                chatResponse.show();
                _this.scrollListTo(chatResponse);
            }, 0);
        };
        /**
        * @name setCurrentUserResponse
        * Update current reponse, is being called automatically from onFlowUpdate, but can also in rare cases be called automatically when flow is controlled manually.
        * reponse: FlowDTO
        */
        ChatList.prototype.setCurrentUserResponse = function (dto) {
            this.flowDTOFromUserInputUpdate = dto;
            if (!this.flowDTOFromUserInputUpdate.text && dto.tag) {
                if (dto.tag.type == "group") {
                    this.flowDTOFromUserInputUpdate.text = cf.Dictionary.get("user-reponse-missing-group");
                }
                else if (dto.tag.type != "password") {
                    this.flowDTOFromUserInputUpdate.text = cf.Dictionary.get("user-reponse-missing");
                }
            }
            this.currentUserResponse.setValue(this.flowDTOFromUserInputUpdate);
            this.scrollListTo();
        };
        ChatList.prototype.updateThumbnail = function (robot, img) {
            cf.Dictionary.set(robot ? "robot-image" : "user-image", robot ? "robot" : "human", img);
            var newImage = robot ? cf.Dictionary.getRobotResponse("robot-image") : cf.Dictionary.get("user-image");
            for (var i = 0; i < this.responses.length; i++) {
                var element = this.responses[i];
                if (robot && element.isRobotReponse) {
                    element.updateThumbnail(newImage);
                }
                else if (!robot && !element.isRobotReponse) {
                    element.updateThumbnail(newImage);
                }
            }
        };
        ChatList.prototype.createResponse = function (isRobotReponse, currentTag, value) {
            if (value === void 0) { value = null; }
            var response = new cf.ChatResponse({
                // image: null,
                tag: currentTag,
                eventTarget: this.eventTarget,
                isRobotReponse: isRobotReponse,
                response: value,
                image: isRobotReponse ? cf.Dictionary.getRobotResponse("robot-image") : cf.Dictionary.get("user-image"),
            });
            this.responses.push(response);
            this.currentResponse = response;
            var scrollable = this.el.querySelector("scrollable");
            scrollable.appendChild(this.currentResponse.el);
            this.onListUpdate(response);
            return response;
        };
        ChatList.prototype.scrollListTo = function (response) {
            if (response === void 0) { response = null; }
            try {
                var scrollable_1 = this.el.querySelector("scrollable");
                var y_1 = response ? response.el.offsetTop - 50 : 1000000000;
                scrollable_1.scrollTop = y_1;
                setTimeout(function () { return scrollable_1.scrollTop = y_1; }, 100);
            }
            catch (e) {
                // catch errors where CF have been removed
            }
        };
        ChatList.prototype.getTemplate = function () {
            return "<cf-chat type='pluto'>\n\t\t\t\t\t\t<scrollable></scrollable>\n\t\t\t\t\t</cf-chat>";
        };
        ChatList.prototype.dealloc = function () {
            this.eventTarget.removeEventListener(cf.FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
            this.flowUpdateCallback = null;
            this.eventTarget.removeEventListener(cf.FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false);
            this.userInputUpdateCallback = null;
            this.eventTarget.removeEventListener(cf.UserInputEvents.KEY_CHANGE, this.onInputKeyChangeCallback, false);
            this.onInputKeyChangeCallback = null;
            _super.prototype.dealloc.call(this);
        };
        return ChatList;
    }(cf.BasicElement));
    cf.ChatList = ChatList;
})(cf || (cf = {}));

/// <reference path="../form-tags/Tag.ts"/>
/// <reference path="../ConversationalForm.ts"/>
var cf;
(function (cf) {
    // interface
    cf.FlowEvents = {
        USER_INPUT_UPDATE: "cf-flow-user-input-update",
        USER_INPUT_INVALID: "cf-flow-user-input-invalid",
        //	detail: string
        FLOW_UPDATE: "cf-flow-update",
    };
    // class
    var FlowManager = (function () {
        function FlowManager(options) {
            this.stopped = false;
            this.maxSteps = 0;
            this.step = 0;
            this.savedStep = -1;
            this.stepTimer = 0;
            /**
            * ignoreExistingTags
            * @type boolean
            * ignore existing tags, usually this is set to true when using startFrom, where you don't want it to check for exisintg tags in the list
            */
            this.ignoreExistingTags = false;
            this.cfReference = options.cfReference;
            this.eventTarget = options.eventTarget;
            this.flowStepCallback = options.flowStepCallback;
            this.setTags(options.tags);
            this.maxSteps = this.tags.length;
            this.userInputSubmitCallback = this.userInputSubmit.bind(this);
            this.eventTarget.addEventListener(cf.UserInputEvents.SUBMIT, this.userInputSubmitCallback, false);
        }
        Object.defineProperty(FlowManager.prototype, "currentTag", {
            get: function () {
                return this.tags[this.step];
            },
            enumerable: true,
            configurable: true
        });
        FlowManager.prototype.userInputSubmit = function (event) {
            var _this = this;
            cf.ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
            var appDTO = event.detail;
            var isTagValid = this.currentTag.setTagValueAndIsValid(appDTO);
            var hasCheckedForTagSpecificValidation = false;
            var hasCheckedForGlobalFlowValidation = false;
            var onValidationCallback = function () {
                // check 1
                if (_this.currentTag.validationCallback && typeof _this.currentTag.validationCallback == "function") {
                    if (!hasCheckedForTagSpecificValidation && isTagValid) {
                        hasCheckedForTagSpecificValidation = true;
                        _this.currentTag.validationCallback(appDTO, function () {
                            isTagValid = true;
                            onValidationCallback();
                        }, function (optionalErrorMessage) {
                            isTagValid = false;
                            if (optionalErrorMessage)
                                appDTO.errorText = optionalErrorMessage;
                            onValidationCallback();
                        });
                        return;
                    }
                }
                // check 2, this.currentTag.required <- required should be handled in the callback.
                if (_this.flowStepCallback && typeof _this.flowStepCallback == "function") {
                    if (!hasCheckedForGlobalFlowValidation && isTagValid) {
                        hasCheckedForGlobalFlowValidation = true;
                        // use global validationCallback method
                        _this.flowStepCallback(appDTO, function () {
                            isTagValid = true;
                            onValidationCallback();
                        }, function (optionalErrorMessage) {
                            isTagValid = false;
                            if (optionalErrorMessage)
                                appDTO.errorText = optionalErrorMessage;
                            onValidationCallback();
                        });
                        return;
                    }
                }
                // go on with the flow
                if (isTagValid) {
                    // do the normal flow..
                    cf.ConversationalForm.illustrateFlow(_this, "dispatch", cf.FlowEvents.USER_INPUT_UPDATE, appDTO);
                    // update to latest DTO because values can be changed in validation flow...
                    appDTO = appDTO.input.getFlowDTO();
                    _this.eventTarget.dispatchEvent(new CustomEvent(cf.FlowEvents.USER_INPUT_UPDATE, {
                        detail: appDTO //UserInput value
                    }));
                    // goto next step when user has answered
                    setTimeout(function () { return _this.nextStep(); }, cf.ConversationalForm.animationsEnabled ? 250 : 0);
                }
                else {
                    cf.ConversationalForm.illustrateFlow(_this, "dispatch", cf.FlowEvents.USER_INPUT_INVALID, appDTO);
                    // Value not valid
                    _this.eventTarget.dispatchEvent(new CustomEvent(cf.FlowEvents.USER_INPUT_INVALID, {
                        detail: appDTO //UserInput value
                    }));
                }
            };
            // TODO, make into promises when IE is rolling with it..
            onValidationCallback();
        };
        FlowManager.prototype.startFrom = function (indexOrTag, ignoreExistingTags) {
            if (ignoreExistingTags === void 0) { ignoreExistingTags = false; }
            if (typeof indexOrTag == "number")
                this.step = indexOrTag;
            else {
                // find the index..
                this.step = this.tags.indexOf(indexOrTag);
            }
            this.ignoreExistingTags = ignoreExistingTags;
            if (!this.ignoreExistingTags) {
                this.editTag(this.tags[this.step]);
            }
            else {
                //validate step, and ask for skipping of current step
                this.showStep();
            }
        };
        FlowManager.prototype.start = function () {
            this.stopped = false;
            this.validateStepAndUpdate();
        };
        FlowManager.prototype.stop = function () {
            this.stopped = true;
        };
        FlowManager.prototype.nextStep = function () {
            if (this.stopped)
                return;
            if (this.savedStep != -1)
                this.step = this.savedStep;
            this.savedStep = -1; //reset saved step
            this.step++;
            this.validateStepAndUpdate();
        };
        FlowManager.prototype.previousStep = function () {
            this.step--;
            this.validateStepAndUpdate();
        };
        FlowManager.prototype.getStep = function () {
            return this.step;
        };
        FlowManager.prototype.addTags = function (tags, atIndex) {
            if (atIndex === void 0) { atIndex = -1; }
            // used to append new tag
            if (atIndex !== -1 && atIndex < this.tags.length) {
                var pre = this.tags.slice(0, atIndex);
                var post = this.tags.slice(atIndex, this.tags.length);
                this.tags = this.tags.slice(0, atIndex).concat(tags).concat(post);
            }
            else {
                this.tags.concat(tags);
            }
            this.setTags(this.tags);
            return this.tags;
        };
        FlowManager.prototype.dealloc = function () {
            this.eventTarget.removeEventListener(cf.UserInputEvents.SUBMIT, this.userInputSubmitCallback, false);
            this.userInputSubmitCallback = null;
        };
        /**
        * @name editTag
        * go back in time and edit a tag.
        */
        FlowManager.prototype.editTag = function (tag) {
            this.ignoreExistingTags = false;
            this.savedStep = this.step - 1;
            this.step = this.tags.indexOf(tag); // === this.currentTag
            this.validateStepAndUpdate();
        };
        FlowManager.prototype.setTags = function (tags) {
            this.tags = tags;
            for (var i = 0; i < this.tags.length; i++) {
                var tag = this.tags[i];
                tag.eventTarget = this.eventTarget;
            }
        };
        FlowManager.prototype.skipStep = function () {
            this.nextStep();
        };
        FlowManager.prototype.validateStepAndUpdate = function () {
            if (this.maxSteps > 0) {
                if (this.step == this.maxSteps) {
                    // console.warn("We are at the end..., submit click")
                    this.cfReference.doSubmitForm();
                }
                else {
                    this.step %= this.maxSteps;
                    if (this.currentTag.disabled) {
                        // check if current tag has become or is disabled, if it is, then skip step.
                        this.skipStep();
                    }
                    else {
                        this.showStep();
                    }
                }
            }
        };
        FlowManager.prototype.showStep = function () {
            if (this.stopped)
                return;
            cf.ConversationalForm.illustrateFlow(this, "dispatch", cf.FlowEvents.FLOW_UPDATE, this.currentTag);
            this.currentTag.refresh();
            this.eventTarget.dispatchEvent(new CustomEvent(cf.FlowEvents.FLOW_UPDATE, {
                detail: {
                    tag: this.currentTag,
                    ignoreExistingTag: this.ignoreExistingTags
                }
            }));
        };
        return FlowManager;
    }());
    FlowManager.STEP_TIME = 1000;
    cf.FlowManager = FlowManager;
})(cf || (cf = {}));

// version 0.9.0
/// <reference path="ui/UserInput.ts"/>
/// <reference path="ui/chat/ChatList.ts"/>
/// <reference path="logic/FlowManager.ts"/>
/// <reference path="logic/EventDispatcher.ts"/>
/// <reference path="form-tags/Tag.ts"/>
/// <reference path="form-tags/TagGroup.ts"/>
/// <reference path="form-tags/InputTag.ts"/>
/// <reference path="form-tags/SelectTag.ts"/>
/// <reference path="form-tags/ButtonTag.ts"/>
/// <reference path="data/Dictionary.ts"/>
/// <reference path="parsing/TagsParser.ts"/>
var cf;
(function (cf_1) {
    var ConversationalForm = (function () {
        function ConversationalForm(options) {
            this.version = "0.9.3";
            this.cdnPath = "//conversational-form-{version}-0iznjsw.stackpathdns.com/";
            this.isDevelopment = false;
            this.loadExternalStyleSheet = true;
            this.preventAutoAppend = false;
            this.preventAutoStart = false;
            window.ConversationalForm = this;
            this.cdnPath = this.cdnPath.split("{version}").join(this.version.split(".").join(""));
            console.log('Conversational Form > version:', this.version);
            window.ConversationalForm[this.createId] = this;
            // possible to create your own event dispatcher, so you can tap into the events of the app
            if (options.eventDispatcher)
                this._eventTarget = options.eventDispatcher;
            // set a general step validation callback
            if (options.flowStepCallback)
                this.flowStepCallback = options.flowStepCallback;
            this.isDevelopment = ConversationalForm.illustrateAppFlow = !!document.getElementById("conversational-form-development");
            if (this.isDevelopment || options.loadExternalStyleSheet == false) {
                this.loadExternalStyleSheet = false;
            }
            if (!isNaN(options.scrollAccerlation))
                cf_1.ScrollController.accerlation = options.scrollAccerlation;
            this.preventAutoStart = options.preventAutoStart;
            this.preventAutoAppend = options.preventAutoAppend;
            if (!options.formEl)
                throw new Error("Conversational Form error, the formEl needs to be defined.");
            this.formEl = options.formEl;
            this.formEl.setAttribute("cf-create-id", this.createId);
            // TODO: can be a string when added as formless..
            // this.validationCallback = eval(this.domElement.getAttribute("cf-validation"));
            this.submitCallback = options.submitCallback;
            if (this.submitCallback && typeof this.submitCallback === "string") {
                // a submit callback method added to json, so use eval to evaluate method
                this.submitCallback = eval(this.submitCallback);
            }
            if (this.formEl.getAttribute("cf-no-animation") == "")
                ConversationalForm.animationsEnabled = false;
            if (this.formEl.getAttribute("cf-prevent-autofocus") == "")
                cf_1.UserInput.preventAutoFocus = true;
            this.dictionary = new cf_1.Dictionary({
                data: options.dictionaryData,
                robotData: options.dictionaryRobot,
                userImage: options.userImage,
                robotImage: options.robotImage,
            });
            // emoji.. fork and set your own values..
            this.context = options.context ? options.context : document.body;
            this.tags = options.tags;
            this.init();
        }
        Object.defineProperty(ConversationalForm.prototype, "createId", {
            get: function () {
                if (!this._createId) {
                    this._createId = new Date().getTime().toString();
                }
                return this._createId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ConversationalForm.prototype, "eventTarget", {
            get: function () {
                if (!this._eventTarget) {
                    this._eventTarget = new cf_1.EventDispatcher(this);
                }
                return this._eventTarget;
            },
            enumerable: true,
            configurable: true
        });
        ConversationalForm.prototype.init = function () {
            cf_1.Helpers.setEmojiLib();
            if (this.loadExternalStyleSheet) {
                // not in development/examples, so inject production css
                var head = document.head || document.getElementsByTagName("head")[0];
                var style = document.createElement("link");
                var githubMasterUrl = this.cdnPath + "conversational-form.min.css";
                style.type = "text/css";
                style.media = "all";
                style.setAttribute("rel", "stylesheet");
                style.setAttribute("href", githubMasterUrl);
                head.appendChild(style);
            }
            else {
                // expect styles to be in the document
                this.isDevelopment = true;
            }
            // set context position to relative, else we break out of the box
            var position = window.getComputedStyle(this.context).getPropertyValue("position").toLowerCase();
            if (["fixed", "absolute", "relative"].indexOf(position) == -1) {
                this.context.style.position = "relative";
            }
            // if tags are not defined then we will try and build some tags our selves..
            if (!this.tags || this.tags.length == 0) {
                this.tags = [];
                var fields = [].slice.call(this.formEl.querySelectorAll("input, select, button, textarea"), 0);
                for (var i = 0; i < fields.length; i++) {
                    var element = fields[i];
                    if (cf_1.Tag.isTagValid(element)) {
                        // ignore hidden tags
                        this.tags.push(cf_1.Tag.createTag(element));
                    }
                }
            }
            else {
                // tags are manually setup and passed as options.tags.
            }
            // remove invalid tags if they've sneaked in.. this could happen if tags are setup manually as we don't encurage to use static Tag.isTagValid
            var indexesToRemove = [];
            for (var i = 0; i < this.tags.length; i++) {
                var element = this.tags[i];
                if (!element || !cf_1.Tag.isTagValid(element.domElement)) {
                    indexesToRemove.push(element);
                }
            }
            for (var i = 0; i < indexesToRemove.length; i++) {
                var tag = indexesToRemove[i];
                this.tags.splice(this.tags.indexOf(tag), 1);
            }
            if (!this.tags || this.tags.length == 0) {
                console.warn("Conversational Form: No tags found or registered.");
            }
            //let's start the conversation
            this.tags = this.setupTagGroups(this.tags);
            this.setupUI();
            return this;
        };
        /**
        * @name updateDictionaryValue
        * set a dictionary value at "runtime"
        *	id: string, id of the value to update
        *	type: string, "human" || "robot"
        *	value: string, value to be inserted
        */
        ConversationalForm.prototype.updateDictionaryValue = function (id, type, value) {
            cf_1.Dictionary.set(id, type, value);
            if (["robot-image", "user-image"].indexOf(id) != -1) {
                this.chatList.updateThumbnail(id == "robot-image", value);
            }
        };
        ConversationalForm.prototype.getFormData = function (serialized) {
            if (serialized === void 0) { serialized = false; }
            if (serialized) {
                var serialized_1 = {};
                for (var i = 0; i < this.tags.length; i++) {
                    var element = this.tags[i];
                    if (element.value)
                        serialized_1[element.name || "tag-" + i.toString()] = element.value;
                }
                return serialized_1;
            }
            else {
                var formData = new FormData(this.formEl);
                return formData;
            }
        };
        ConversationalForm.prototype.addRobotChatResponse = function (response) {
            this.chatList.createResponse(true, null, response);
        };
        ConversationalForm.prototype.addUserChatResponse = function (response) {
            // add a "fake" user response..
            this.chatList.createResponse(false, null, response);
        };
        ConversationalForm.prototype.stop = function (optionalStoppingMessage) {
            if (optionalStoppingMessage === void 0) { optionalStoppingMessage = ""; }
            this.flowManager.stop();
            if (optionalStoppingMessage != "")
                this.chatList.createResponse(true, null, optionalStoppingMessage);
            this.userInput.onFlowStopped();
        };
        ConversationalForm.prototype.start = function () {
            this.userInput.disabled = false;
            this.userInput.visible = true;
            this.flowManager.start();
        };
        ConversationalForm.prototype.getTag = function (nameOrIndex) {
            if (typeof nameOrIndex == "number") {
                return this.tags[nameOrIndex];
            }
            else {
                // TODO: fix so you can get a tag by its name attribute
                return null;
            }
        };
        ConversationalForm.prototype.setupTagGroups = function (tags) {
            // make groups, from input tag[type=radio | type=checkbox]
            // groups are used to bind logic like radio-button or checkbox dependencies
            var groups = [];
            for (var i = 0; i < tags.length; i++) {
                var tag = tags[i];
                if (tag.type == "radio" || tag.type == "checkbox") {
                    if (!groups[tag.name])
                        groups[tag.name] = [];
                    groups[tag.name].push(tag);
                }
            }
            if (Object.keys(groups).length > 0) {
                for (var group in groups) {
                    if (groups[group].length > 0) {
                        // always build groupd when radio or checkbox
                        var tagGroup = new cf_1.TagGroup({
                            elements: groups[group]
                        });
                        // remove the tags as they are now apart of a group
                        for (var i = 0; i < groups[group].length; i++) {
                            var tagToBeRemoved = groups[group][i];
                            if (i == 0)
                                tags.splice(tags.indexOf(tagToBeRemoved), 1, tagGroup);
                            else
                                tags.splice(tags.indexOf(tagToBeRemoved), 1);
                        }
                    }
                }
            }
            return tags;
        };
        ConversationalForm.prototype.setupUI = function () {
            // start the flow
            this.flowManager = new cf_1.FlowManager({
                cfReference: this,
                flowStepCallback: this.flowStepCallback,
                eventTarget: this.eventTarget,
                tags: this.tags
            });
            this.el = document.createElement("div");
            this.el.id = "conversational-form";
            this.el.className = "conversational-form";
            if (ConversationalForm.animationsEnabled)
                this.el.classList.add("conversational-form--enable-animation");
            // add conversational form to context
            if (!this.preventAutoAppend)
                this.context.appendChild(this.el);
            //hide until stylesheet is rendered
            this.el.style.visibility = "hidden";
            var innerWrap = document.createElement("div");
            innerWrap.className = "conversational-form-inner";
            this.el.appendChild(innerWrap);
            // Conversational Form UI
            this.chatList = new cf_1.ChatList({
                eventTarget: this.eventTarget
            });
            innerWrap.appendChild(this.chatList.el);
            this.userInput = new cf_1.UserInput({
                eventTarget: this.eventTarget,
                cfReference: this
            });
            innerWrap.appendChild(this.userInput.el);
            this.onUserAnswerClickedCallback = this.onUserAnswerClicked.bind(this);
            this.eventTarget.addEventListener(cf_1.ChatResponseEvents.USER_ANSWER_CLICKED, this.onUserAnswerClickedCallback, false);
            this.el.classList.add("conversational-form--show");
            if (!this.preventAutoStart)
                this.flowManager.start();
            if (!this.tags || this.tags.length == 0) {
                // no tags, so just so the input
                this.userInput.visible = true;
            }
        };
        /**
        * @name onUserAnswerClicked
        * on user ChatReponse clicked
        */
        ConversationalForm.prototype.onUserAnswerClicked = function (event) {
            var tag = event.detail;
            this.flowManager.editTag(tag);
        };
        /**
        * @name addTag
        * Add a tag to the conversation. This can be used to add tags at runtime
        * see examples/formless.html
        */
        ConversationalForm.prototype.addTags = function (tagsData, addAfterCurrentStep, atIndex) {
            if (addAfterCurrentStep === void 0) { addAfterCurrentStep = true; }
            if (atIndex === void 0) { atIndex = -1; }
            var tags = [];
            for (var i = 0; i < tagsData.length; i++) {
                var tagData = tagsData[i];
                if (tagData.tag === "fieldset") {
                    // group ..
                    // const fieldSetChildren: Array<DataTag> = tagData.children;
                    // parse group tag
                    var groupTag = cf_1.TagsParser.parseGroupTag(tagData);
                    for (var j = 0; j < groupTag.children.length; j++) {
                        var tag = groupTag.children[j];
                        if (cf_1.Tag.isTagValid(tag)) {
                            var tagElement = cf_1.Tag.createTag(tag);
                            // add ref for group creation
                            if (!tagElement.name) {
                                tagElement.name = "tag-ref-" + j.toString();
                            }
                            tags.push(tagElement);
                        }
                    }
                }
                else {
                    var tag = cf_1.TagsParser.parseTag(tagData);
                    if (cf_1.Tag.isTagValid(tag)) {
                        var tagElement = cf_1.Tag.createTag(tag);
                        tags.push(tagElement);
                    }
                }
            }
            // map free roaming checkbox and radio tags into groups
            tags = this.setupTagGroups(tags);
            // add new tags to the flow
            this.tags = this.flowManager.addTags(tags, addAfterCurrentStep ? this.flowManager.getStep() + 1 : atIndex);
            console.log(this.tags);
            //this.flowManager.startFrom ?
        };
        /**
        * @name remapTagsAndStartFrom
        * index: number, what index to start from
        * setCurrentTagValue: boolean, usually this method is called when wanting to loop or skip over questions, therefore it might be usefull to set the value of the current tag before changing index.
        * ignoreExistingTags: boolean, possible to ignore existing tags, to allow for the flow to just "happen"
        */
        ConversationalForm.prototype.remapTagsAndStartFrom = function (index, setCurrentTagValue, ignoreExistingTags) {
            if (index === void 0) { index = 0; }
            if (setCurrentTagValue === void 0) { setCurrentTagValue = false; }
            if (ignoreExistingTags === void 0) { ignoreExistingTags = false; }
            if (setCurrentTagValue) {
                this.chatList.setCurrentUserResponse(this.userInput.getFlowDTO());
            }
            // possibility to start the form flow over from {index}
            for (var i = 0; i < this.tags.length; i++) {
                var tag = this.tags[i];
                tag.refresh();
            }
            this.flowManager.startFrom(index, ignoreExistingTags);
        };
        /**
        * @name focus
        * Sets focus on Conversational Form
        */
        ConversationalForm.prototype.focus = function () {
            if (this.userInput)
                this.userInput.setFocusOnInput();
        };
        ConversationalForm.prototype.doSubmitForm = function () {
            this.el.classList.add("done");
            this.userInput.reset();
            if (this.submitCallback) {
                // remove should be called in the submitCallback
                this.submitCallback(this);
            }
            else {
                // this.formEl.submit();
                // doing classic .submit wont trigger onsubmit if that is present on form element
                // as described here: http://wayback.archive.org/web/20090323062817/http://blogs.vertigosoftware.com/snyholm/archive/2006/09/27/3788.aspx
                // so we mimic a click.
                var button = this.formEl.ownerDocument.createElement('input');
                button.style.display = 'none';
                button.type = 'submit';
                this.formEl.appendChild(button);
                button.click();
                this.formEl.removeChild(button);
                // remove conversational
                this.remove();
            }
        };
        ConversationalForm.prototype.remove = function () {
            if (this.onUserAnswerClickedCallback) {
                this.eventTarget.removeEventListener(cf_1.ChatResponseEvents.USER_ANSWER_CLICKED, this.onUserAnswerClickedCallback, false);
                this.onUserAnswerClickedCallback = null;
            }
            if (this.flowManager)
                this.flowManager.dealloc();
            if (this.userInput)
                this.userInput.dealloc();
            if (this.chatList)
                this.chatList.dealloc();
            this.dictionary = null;
            this.flowManager = null;
            this.userInput = null;
            this.chatList = null;
            this.context = null;
            this.formEl = null;
            this.tags = null;
            this.submitCallback = null;
            this.el.parentNode.removeChild(this.el);
            this.el = null;
            window.ConversationalForm[this.createId] = null;
        };
        // to illustrate the event flow of the app
        ConversationalForm.illustrateFlow = function (classRef, type, eventType, detail) {
            // ConversationalForm.illustrateFlow(this, "dispatch", FlowEvents.USER_INPUT_INVALID, event.detail);
            // ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
            if (detail === void 0) { detail = null; }
            if (ConversationalForm.illustrateAppFlow) {
                var highlight = "font-weight: 900; background: " + (type == "receive" ? "#e6f3fe" : "pink") + "; color: black; padding: 0px 5px;";
                console.log("%c** event flow: %c" + eventType + "%c flow type: %c" + type + "%c from: %c" + classRef.constructor.name, "font-weight: 900;", highlight, "font-weight: 400;", highlight, "font-weight: 400;", highlight);
                if (detail)
                    console.log("** event flow detail:", detail);
            }
        };
        ConversationalForm.startTheConversation = function (data) {
            var isFormless = !!data.formEl === false;
            var formlessTags;
            var constructorOptions;
            if (isFormless) {
                if (typeof data === "string") {
                    // Formless init w. string
                    isFormless = true;
                    var json = JSON.parse(data);
                    constructorOptions = json.options;
                    formlessTags = json.tags;
                }
                else {
                    // Formless init w. JSON object
                    constructorOptions = data.options;
                    formlessTags = data.tags;
                }
                // formless, so generate the pseudo tags
                var formEl = cf.TagsParser.parseJSONIntoElements(formlessTags);
                constructorOptions.formEl = formEl;
            }
            else {
                // keep it standard
                constructorOptions = data;
            }
            return new cf.ConversationalForm(constructorOptions);
        };
        ConversationalForm.autoStartTheConversation = function () {
            if (cf.ConversationalForm.hasAutoInstantiated)
                return;
            // auto start the conversation
            var formElements = document.querySelectorAll("form[cf-form]");
            // no form elements found, look for the old init attribute
            if (formElements.length === 0) {
                formElements = document.querySelectorAll("form[cf-form-element]");
            }
            var formContexts = document.querySelectorAll("*[cf-context]");
            if (formElements && formElements.length > 0) {
                for (var i = 0; i < formElements.length; i++) {
                    var form = formElements[i];
                    var context = formContexts[i];
                    cf.ConversationalForm.startTheConversation({
                        formEl: form,
                        context: context
                    });
                }
                cf.ConversationalForm.hasAutoInstantiated = true;
            }
        };
        return ConversationalForm;
    }());
    ConversationalForm.animationsEnabled = true;
    ConversationalForm.illustrateAppFlow = true;
    ConversationalForm.hasAutoInstantiated = false;
    cf_1.ConversationalForm = ConversationalForm;
})(cf || (cf = {}));
if (document.readyState == "complete") {
    // if document alread instantiated, usually this happens if Conversational Form is injected through JS
    setTimeout(function () { return cf.ConversationalForm.autoStartTheConversation(); }, 0);
}
else {
    // await for when document is ready
    window.addEventListener("load", function () {
        cf.ConversationalForm.autoStartTheConversation();
    }, false);
}

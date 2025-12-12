function _createForOfIteratorHelperLoose(o) { var i = 0; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } i = o[Symbol.iterator](); return i.next.bind(i); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/*!
 * SplitText 3.14.1
 * https://gsap.com
 *
 * @license Copyright 2025, GreenSock. All rights reserved. Subject to the terms at https://gsap.com/standard-license.
 * @author: Jack Doyle
 */
var gsap,
    _fonts,
    _coreInitted,
    _initIfNecessary = function _initIfNecessary() {
  return _coreInitted || SplitText.register(window.gsap);
},
    _charSegmenter = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter() : 0,
    _toArray2 = function _toArray(r) {
  return typeof r === "string" ? _toArray2(document.querySelectorAll(r)) : "length" in r ? Array.from(r) : [r];
},
    _elements = function _elements(targets) {
  return _toArray2(targets).filter(function (e) {
    return e instanceof HTMLElement;
  });
},
    _emptyArray = [],
    _context = function _context() {},
    _defaultContext = {
  add: function add(f) {
    return f();
  }
},
    _spacesRegEx = /\s+/g,
    _emojiSafeRegEx = new RegExp("\\p{RI}\\p{RI}|\\p{Emoji}(\\p{EMod}|\\u{FE0F}\\u{20E3}?|[\\u{E0020}-\\u{E007E}]+\\u{E007F})?(\\u{200D}\\p{Emoji}(\\p{EMod}|\\u{FE0F}\\u{20E3}?|[\\u{E0020}-\\u{E007E}]+\\u{E007F})?)*|.", "gu"),
    _emptyBounds = {
  left: 0,
  top: 0,
  width: 0,
  height: 0
},
    _findNextValidBounds = function _findNextValidBounds(allBounds, startIndex) {
  while (++startIndex < allBounds.length && allBounds[startIndex] === _emptyBounds) {}

  return allBounds[startIndex] || _emptyBounds;
},
    _stretchToFitSpecialChars = function _stretchToFitSpecialChars(collection, specialCharsRegEx) {
  if (specialCharsRegEx) {
    var charsFound = new Set(collection.join("").match(specialCharsRegEx) || _emptyArray),
        i = collection.length,
        slots,
        word,
        _char,
        combined;

    if (charsFound.size) {
      while (--i > -1) {
        word = collection[i];

        for (var _iterator = _createForOfIteratorHelperLoose(charsFound), _step; !(_step = _iterator()).done;) {
          _char = _step.value;

          if (_char.startsWith(word) && _char.length > word.length) {
            slots = 0;
            combined = word;

            while (_char.startsWith(combined += collection[i + ++slots]) && combined.length < _char.length) {}

            if (slots && combined.length === _char.length) {
              collection[i] = _char;
              collection.splice(i + 1, slots);
              break;
            }
          }
        }
      }
    }
  }

  return collection;
},
    _disallowInline = function _disallowInline(element) {
  return window.getComputedStyle(element).display === "inline" && (element.style.display = "inline-block");
},
    _insertNodeBefore = function _insertNodeBefore(newChild, parent, existingChild) {
  return parent.insertBefore(typeof newChild === "string" ? document.createTextNode(newChild) : newChild, existingChild);
},
    _getWrapper = function _getWrapper(type, config, collection) {
  var className = config[type + "sClass"] || "",
      _config$tag = config.tag,
      tag = _config$tag === void 0 ? "div" : _config$tag,
      _config$aria = config.aria,
      aria = _config$aria === void 0 ? "auto" : _config$aria,
      _config$propIndex = config.propIndex,
      propIndex = _config$propIndex === void 0 ? false : _config$propIndex,
      display = type === "line" ? "block" : "inline-block",
      incrementClass = className.indexOf("++") > -1,
      wrapper = function wrapper(text) {
    var el = document.createElement(tag),
        i = collection.length + 1;
    className && (el.className = className + (incrementClass ? " " + className + i : ""));
    propIndex && el.style.setProperty("--" + type, i + "");
    aria !== "none" && el.setAttribute("aria-hidden", "true");

    if (tag !== "span") {
      el.style.position = "relative";
      el.style.display = display;
    }

    el.textContent = text;
    collection.push(el);
    return el;
  };

  incrementClass && (className = className.replace("++", ""));
  wrapper.collection = collection;
  return wrapper;
},
    _getLineWrapper = function _getLineWrapper(element, nodes, config, collection) {
  var lineWrapper = _getWrapper("line", config, collection),
      textAlign = window.getComputedStyle(element).textAlign || "left";

  return function (startIndex, endIndex) {
    var newLine = lineWrapper("");
    newLine.style.textAlign = textAlign;
    element.insertBefore(newLine, nodes[startIndex]);

    for (; startIndex < endIndex; startIndex++) {
      newLine.appendChild(nodes[startIndex]);
    }

    newLine.normalize();
  };
},
    _splitWordsAndCharsRecursively = function _splitWordsAndCharsRecursively(element, config, wordWrapper, charWrapper, prepForCharsOnly, deepSlice, ignore, charSplitRegEx, specialCharsRegEx, isNested) {
  var _a;

  var nodes = Array.from(element.childNodes),
      i = 0,
      wordDelimiter = config.wordDelimiter,
      _config$reduceWhiteSp = config.reduceWhiteSpace,
      reduceWhiteSpace = _config$reduceWhiteSp === void 0 ? true : _config$reduceWhiteSp,
      prepareText = config.prepareText,
      elementBounds = element.getBoundingClientRect(),
      lastBounds = elementBounds,
      isPreformatted = !reduceWhiteSpace && window.getComputedStyle(element).whiteSpace.substring(0, 3) === "pre",
      ignoredPreviousSibling = 0,
      wordsCollection = wordWrapper.collection,
      wordDelimIsNotSpace,
      wordDelimString,
      wordDelimSplitter,
      curNode,
      words,
      curWordEl,
      startsWithSpace,
      endsWithSpace,
      j,
      bounds,
      curWordChars,
      clonedNode,
      curSubNode,
      tempSubNode,
      curTextContent,
      wordText,
      lastWordText,
      k;

  if (typeof wordDelimiter === "object") {
    wordDelimSplitter = wordDelimiter.delimiter || wordDelimiter;
    wordDelimString = wordDelimiter.replaceWith || "";
  } else {
    wordDelimString = wordDelimiter === "" ? "" : wordDelimiter || " ";
  }

  wordDelimIsNotSpace = wordDelimString !== " ";

  for (; i < nodes.length; i++) {
    curNode = nodes[i];

    if (curNode.nodeType === 3) {
      curTextContent = curNode.textContent || "";

      if (reduceWhiteSpace) {
        curTextContent = curTextContent.replace(_spacesRegEx, " ");
      } else if (isPreformatted) {
        curTextContent = curTextContent.replace(/\n/g, wordDelimString + "\n");
      }

      prepareText && (curTextContent = prepareText(curTextContent, element));
      curNode.textContent = curTextContent;
      words = wordDelimString || wordDelimSplitter ? curTextContent.split(wordDelimSplitter || wordDelimString) : curTextContent.match(charSplitRegEx) || _emptyArray;
      lastWordText = words[words.length - 1];
      endsWithSpace = wordDelimIsNotSpace ? lastWordText.slice(-1) === " " : !lastWordText;
      lastWordText || words.pop();
      lastBounds = elementBounds;
      startsWithSpace = wordDelimIsNotSpace ? words[0].charAt(0) === " " : !words[0];
      startsWithSpace && _insertNodeBefore(" ", element, curNode);
      words[0] || words.shift();

      _stretchToFitSpecialChars(words, specialCharsRegEx);

      deepSlice && isNested || (curNode.textContent = "");

      for (j = 1; j <= words.length; j++) {
        wordText = words[j - 1];

        if (!reduceWhiteSpace && isPreformatted && wordText.charAt(0) === "\n") {
          (_a = curNode.previousSibling) == null ? void 0 : _a.remove();

          _insertNodeBefore(document.createElement("br"), element, curNode);

          wordText = wordText.slice(1);
        }

        if (!reduceWhiteSpace && wordText === "") {
          _insertNodeBefore(wordDelimString, element, curNode);
        } else if (wordText === " ") {
          element.insertBefore(document.createTextNode(" "), curNode);
        } else {
          wordDelimIsNotSpace && wordText.charAt(0) === " " && _insertNodeBefore(" ", element, curNode);

          if (ignoredPreviousSibling && j === 1 && !startsWithSpace && wordsCollection.indexOf(ignoredPreviousSibling.parentNode) > -1) {
            curWordEl = wordsCollection[wordsCollection.length - 1];
            curWordEl.appendChild(document.createTextNode(charWrapper ? "" : wordText));
          } else {
            curWordEl = wordWrapper(charWrapper ? "" : wordText);

            _insertNodeBefore(curWordEl, element, curNode);

            ignoredPreviousSibling && j === 1 && !startsWithSpace && curWordEl.insertBefore(ignoredPreviousSibling, curWordEl.firstChild);
          }

          if (charWrapper) {
            curWordChars = _charSegmenter ? _stretchToFitSpecialChars([].concat(_charSegmenter.segment(wordText)).map(function (s) {
              return s.segment;
            }), specialCharsRegEx) : wordText.match(charSplitRegEx) || _emptyArray;

            for (k = 0; k < curWordChars.length; k++) {
              curWordEl.appendChild(curWordChars[k] === " " ? document.createTextNode(" ") : charWrapper(curWordChars[k]));
            }
          }

          if (deepSlice && isNested) {
            curTextContent = curNode.textContent = curTextContent.substring(wordText.length + 1, curTextContent.length);
            bounds = curWordEl.getBoundingClientRect();

            if (bounds.top > lastBounds.top && bounds.left <= lastBounds.left) {
              clonedNode = element.cloneNode();
              curSubNode = element.childNodes[0];

              while (curSubNode && curSubNode !== curWordEl) {
                tempSubNode = curSubNode;
                curSubNode = curSubNode.nextSibling;
                clonedNode.appendChild(tempSubNode);
              }

              element.parentNode.insertBefore(clonedNode, element);
              prepForCharsOnly && _disallowInline(clonedNode);
            }

            lastBounds = bounds;
          }

          if (j < words.length || endsWithSpace) {
            _insertNodeBefore(j >= words.length ? " " : wordDelimIsNotSpace && wordText.slice(-1) === " " ? " " + wordDelimString : wordDelimString, element, curNode);
          }
        }
      }

      element.removeChild(curNode);
      ignoredPreviousSibling = 0;
    } else if (curNode.nodeType === 1) {
      if (ignore && ignore.indexOf(curNode) > -1) {
        wordsCollection.indexOf(curNode.previousSibling) > -1 && wordsCollection[wordsCollection.length - 1].appendChild(curNode);
        ignoredPreviousSibling = curNode;
      } else {
        _splitWordsAndCharsRecursively(curNode, config, wordWrapper, charWrapper, prepForCharsOnly, deepSlice, ignore, charSplitRegEx, specialCharsRegEx, true);

        ignoredPreviousSibling = 0;
      }

      prepForCharsOnly && _disallowInline(curNode);
    }
  }
};

var _SplitText = /*#__PURE__*/function () {
  function _SplitText(elements, config) {
    var _this = this;

    this.isSplit = false;

    _initIfNecessary();

    this.elements = _elements(elements);
    this.chars = [];
    this.words = [];
    this.lines = [];
    this.masks = [];
    this.vars = config;

    this._split = function () {
      return _this.isSplit && _this.split(_this.vars);
    };

    var orig = [],
        timerId,
        checkWidths = function checkWidths() {
      var i = orig.length,
          o;

      while (i--) {
        o = orig[i];
        var w = o.element.offsetWidth;

        if (w !== o.width) {
          o.width = w;

          _this._split();

          return;
        }
      }
    };

    this._data = {
      orig: orig,
      obs: typeof ResizeObserver !== "undefined" && new ResizeObserver(function () {
        clearTimeout(timerId);
        timerId = setTimeout(checkWidths, 200);
      })
    };

    _context(this);

    this.split(config);
  }

  var _proto = _SplitText.prototype;

  _proto.split = function split(config) {
    var _this2 = this;

    (this._ctx || _defaultContext).add(function () {
      _this2.isSplit && _this2.revert();
      _this2.vars = config = config || _this2.vars || {};

      var _this2$vars = _this2.vars,
          _this2$vars$type = _this2$vars.type,
          type = _this2$vars$type === void 0 ? "chars,words,lines" : _this2$vars$type,
          _this2$vars$aria = _this2$vars.aria,
          aria = _this2$vars$aria === void 0 ? "auto" : _this2$vars$aria,
          _this2$vars$deepSlice = _this2$vars.deepSlice,
          deepSlice = _this2$vars$deepSlice === void 0 ? true : _this2$vars$deepSlice,
          smartWrap = _this2$vars.smartWrap,
          onSplit = _this2$vars.onSplit,
          _this2$vars$autoSplit = _this2$vars.autoSplit,
          autoSplit = _this2$vars$autoSplit === void 0 ? false : _this2$vars$autoSplit,
          specialChars = _this2$vars.specialChars,
          mask = _this2$vars.mask,
          splitLines = type.indexOf("lines") > -1,
          splitCharacters = type.indexOf("chars") > -1,
          splitWords = type.indexOf("words") > -1,
          onlySplitCharacters = splitCharacters && !splitWords && !splitLines,
          specialCharsRegEx = specialChars && ("push" in specialChars ? new RegExp("(?:" + specialChars.join("|") + ")", "gu") : specialChars),
          finalCharSplitRegEx = specialCharsRegEx ? new RegExp(specialCharsRegEx.source + "|" + _emojiSafeRegEx.source, "gu") : _emojiSafeRegEx,
          ignore = !!config.ignore && _elements(config.ignore),
          _this2$_data = _this2._data,
          orig = _this2$_data.orig,
          animTime = _this2$_data.animTime,
          obs = _this2$_data.obs,
          onSplitResult;

      if (splitCharacters || splitWords || splitLines) {
        var _this2$masks;

        _this2.elements.forEach(function (element, index) {
          var _this2$lines, _this2$words, _this2$chars;

          orig[index] = {
            element: element,
            html: element.innerHTML,
            ariaL: element.getAttribute("aria-label"),
            ariaH: element.getAttribute("aria-hidden")
          };
          aria === "auto" ? element.setAttribute("aria-label", (element.textContent || "").trim()) : aria === "hidden" && element.setAttribute("aria-hidden", "true");

          var chars = [],
              words = [],
              lines = [],
              charWrapper = splitCharacters ? _getWrapper("char", config, chars) : null,
              wordWrapper = _getWrapper("word", config, words),
              i,
              curWord,
              smartWrapSpan,
              nextSibling;

          _splitWordsAndCharsRecursively(element, config, wordWrapper, charWrapper, onlySplitCharacters, deepSlice && (splitLines || onlySplitCharacters), ignore, finalCharSplitRegEx, specialCharsRegEx, false);

          if (splitLines) {
            var nodes = _toArray2(element.childNodes),
                wrapLine = _getLineWrapper(element, nodes, config, lines),
                curNode,
                toRemove = [],
                lineStartIndex = 0,
                allBounds = nodes.map(function (n) {
              return n.nodeType === 1 ? n.getBoundingClientRect() : _emptyBounds;
            }),
                lastBounds = _emptyBounds,
                curBounds;

            for (i = 0; i < nodes.length; i++) {
              curNode = nodes[i];

              if (curNode.nodeType === 1) {
                if (curNode.nodeName === "BR") {
                  if (!i || nodes[i - 1].nodeName !== "BR") {
                    toRemove.push(curNode);
                    wrapLine(lineStartIndex, i + 1);
                  }

                  lineStartIndex = i + 1;
                  lastBounds = _findNextValidBounds(allBounds, i);
                } else {
                  curBounds = allBounds[i];

                  if (i && curBounds.top > lastBounds.top && curBounds.left < lastBounds.left + lastBounds.width - 1) {
                    wrapLine(lineStartIndex, i);
                    lineStartIndex = i;
                  }

                  lastBounds = curBounds;
                }
              }
            }

            lineStartIndex < i && wrapLine(lineStartIndex, i);
            toRemove.forEach(function (el) {
              var _a;

              return (_a = el.parentNode) == null ? void 0 : _a.removeChild(el);
            });
          }

          if (!splitWords) {
            for (i = 0; i < words.length; i++) {
              curWord = words[i];

              if (splitCharacters || !curWord.nextSibling || curWord.nextSibling.nodeType !== 3) {
                if (smartWrap && !splitLines) {
                  smartWrapSpan = document.createElement("span");
                  smartWrapSpan.style.whiteSpace = "nowrap";

                  while (curWord.firstChild) {
                    smartWrapSpan.appendChild(curWord.firstChild);
                  }

                  curWord.replaceWith(smartWrapSpan);
                } else {
                  var _curWord;

                  (_curWord = curWord).replaceWith.apply(_curWord, curWord.childNodes);
                }
              } else {
                nextSibling = curWord.nextSibling;

                if (nextSibling && nextSibling.nodeType === 3) {
                  nextSibling.textContent = (curWord.textContent || "") + (nextSibling.textContent || "");
                  curWord.remove();
                }
              }
            }

            words.length = 0;
            element.normalize();
          }

          (_this2$lines = _this2.lines).push.apply(_this2$lines, lines);

          (_this2$words = _this2.words).push.apply(_this2$words, words);

          (_this2$chars = _this2.chars).push.apply(_this2$chars, chars);
        });

        mask && _this2[mask] && (_this2$masks = _this2.masks).push.apply(_this2$masks, _this2[mask].map(function (el) {
          var maskEl = el.cloneNode();
          el.replaceWith(maskEl);
          maskEl.appendChild(el);
          el.className && (maskEl.className = el.className.trim() + "-mask");
          maskEl.style.overflow = "clip";
          return maskEl;
        }));
      }

      _this2.isSplit = true;
      _fonts && splitLines && (autoSplit ? _fonts.addEventListener("loadingdone", _this2._split) : _fonts.status === "loading" && console.warn("SplitText called before fonts loaded"));

      if ((onSplitResult = onSplit && onSplit(_this2)) && onSplitResult.totalTime) {
        _this2._data.anim = animTime ? onSplitResult.totalTime(animTime) : onSplitResult;
      }

      splitLines && autoSplit && _this2.elements.forEach(function (element, index) {
        orig[index].width = element.offsetWidth;
        obs && obs.observe(element);
      });
    });

    return this;
  };

  _proto.kill = function kill() {
    var obs = this._data.obs;
    obs && obs.disconnect();
    _fonts == null ? void 0 : _fonts.removeEventListener("loadingdone", this._split);
  };

  _proto.revert = function revert() {
    var _a, _b;

    var _this$_data = this._data,
        orig = _this$_data.orig,
        anim = _this$_data.anim;
    this.kill();
    orig.forEach(function (_ref) {
      var element = _ref.element,
          html = _ref.html,
          ariaL = _ref.ariaL,
          ariaH = _ref.ariaH;
      element.innerHTML = html;
      ariaL ? element.setAttribute("aria-label", ariaL) : element.removeAttribute("aria-label");
      ariaH ? element.setAttribute("aria-hidden", ariaH) : element.removeAttribute("aria-hidden");
    });
    this.chars.length = this.words.length = this.lines.length = orig.length = this.masks.length = 0;
    this.isSplit = false;

    if (anim) {
      this._data.animTime = anim.totalTime();
      anim.revert();
    }

    (_b = (_a = this.vars).onRevert) == null ? void 0 : _b.call(_a, this);
    return this;
  };

  _SplitText.create = function create(elements, config) {
    return new _SplitText(elements, config);
  };

  _SplitText.register = function register(core) {
    gsap = gsap || core || window.gsap;

    if (gsap) {
      _toArray2 = gsap.utils.toArray;
      _context = gsap.core.context || _context;
    }

    if (!_coreInitted && window.innerWidth > 0) {
      _fonts = document.fonts;
      _coreInitted = true;
    }
  };

  return _SplitText;
}();

_SplitText.version = "3.14.1";
var SplitText = _SplitText;
export { SplitText, SplitText as default };
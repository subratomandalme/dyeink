import "./chunk-EWTE5DHJ.js";

// node_modules/@fingerprintjs/fingerprintjs/dist/fp.esm.js
var version = "5.0.1";
function wait(durationMs, resolveWith) {
  return new Promise((resolve) => setTimeout(resolve, durationMs, resolveWith));
}
function releaseEventLoop() {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => resolve();
    channel.port2.postMessage(null);
  });
}
function requestIdleCallbackIfAvailable(fallbackTimeout, deadlineTimeout = Infinity) {
  const { requestIdleCallback } = window;
  if (requestIdleCallback) {
    return new Promise((resolve) => requestIdleCallback.call(window, () => resolve(), { timeout: deadlineTimeout }));
  } else {
    return wait(Math.min(fallbackTimeout, deadlineTimeout));
  }
}
function isPromise(value) {
  return !!value && typeof value.then === "function";
}
function awaitIfAsync(action, callback) {
  try {
    const returnedValue = action();
    if (isPromise(returnedValue)) {
      returnedValue.then((result) => callback(true, result), (error) => callback(false, error));
    } else {
      callback(true, returnedValue);
    }
  } catch (error) {
    callback(false, error);
  }
}
async function mapWithBreaks(items, callback, loopReleaseInterval = 16) {
  const results = Array(items.length);
  let lastLoopReleaseTime = Date.now();
  for (let i = 0; i < items.length; ++i) {
    results[i] = callback(items[i], i);
    const now = Date.now();
    if (now >= lastLoopReleaseTime + loopReleaseInterval) {
      lastLoopReleaseTime = now;
      await releaseEventLoop();
    }
  }
  return results;
}
function suppressUnhandledRejectionWarning(promise) {
  promise.then(void 0, () => void 0);
  return promise;
}
function includes(haystack, needle) {
  for (let i = 0, l = haystack.length; i < l; ++i) {
    if (haystack[i] === needle) {
      return true;
    }
  }
  return false;
}
function excludes(haystack, needle) {
  return !includes(haystack, needle);
}
function toInt(value) {
  return parseInt(value);
}
function toFloat(value) {
  return parseFloat(value);
}
function replaceNaN(value, replacement) {
  return typeof value === "number" && isNaN(value) ? replacement : value;
}
function countTruthy(values) {
  return values.reduce((sum, value) => sum + (value ? 1 : 0), 0);
}
function round(value, base = 1) {
  if (Math.abs(base) >= 1) {
    return Math.round(value / base) * base;
  } else {
    const counterBase = 1 / base;
    return Math.round(value * counterBase) / counterBase;
  }
}
function parseSimpleCssSelector(selector) {
  var _a, _b;
  const errorMessage = `Unexpected syntax '${selector}'`;
  const tagMatch = /^\s*([a-z-]*)(.*)$/i.exec(selector);
  const tag = tagMatch[1] || void 0;
  const attributes = {};
  const partsRegex = /([.:#][\w-]+|\[.+?\])/gi;
  const addAttribute = (name, value) => {
    attributes[name] = attributes[name] || [];
    attributes[name].push(value);
  };
  for (; ; ) {
    const match = partsRegex.exec(tagMatch[2]);
    if (!match) {
      break;
    }
    const part = match[0];
    switch (part[0]) {
      case ".":
        addAttribute("class", part.slice(1));
        break;
      case "#":
        addAttribute("id", part.slice(1));
        break;
      case "[": {
        const attributeMatch = /^\[([\w-]+)([~|^$*]?=("(.*?)"|([\w-]+)))?(\s+[is])?\]$/.exec(part);
        if (attributeMatch) {
          addAttribute(attributeMatch[1], (_b = (_a = attributeMatch[4]) !== null && _a !== void 0 ? _a : attributeMatch[5]) !== null && _b !== void 0 ? _b : "");
        } else {
          throw new Error(errorMessage);
        }
        break;
      }
      default:
        throw new Error(errorMessage);
    }
  }
  return [tag, attributes];
}
function getUTF8Bytes(input) {
  const result = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);
    if (charCode > 127) {
      return new TextEncoder().encode(input);
    }
    result[i] = charCode;
  }
  return result;
}
function x64Add(m, n) {
  const m0 = m[0] >>> 16, m1 = m[0] & 65535, m2 = m[1] >>> 16, m3 = m[1] & 65535;
  const n0 = n[0] >>> 16, n1 = n[0] & 65535, n2 = n[1] >>> 16, n3 = n[1] & 65535;
  let o0 = 0, o1 = 0, o2 = 0, o3 = 0;
  o3 += m3 + n3;
  o2 += o3 >>> 16;
  o3 &= 65535;
  o2 += m2 + n2;
  o1 += o2 >>> 16;
  o2 &= 65535;
  o1 += m1 + n1;
  o0 += o1 >>> 16;
  o1 &= 65535;
  o0 += m0 + n0;
  o0 &= 65535;
  m[0] = o0 << 16 | o1;
  m[1] = o2 << 16 | o3;
}
function x64Multiply(m, n) {
  const m0 = m[0] >>> 16, m1 = m[0] & 65535, m2 = m[1] >>> 16, m3 = m[1] & 65535;
  const n0 = n[0] >>> 16, n1 = n[0] & 65535, n2 = n[1] >>> 16, n3 = n[1] & 65535;
  let o0 = 0, o1 = 0, o2 = 0, o3 = 0;
  o3 += m3 * n3;
  o2 += o3 >>> 16;
  o3 &= 65535;
  o2 += m2 * n3;
  o1 += o2 >>> 16;
  o2 &= 65535;
  o2 += m3 * n2;
  o1 += o2 >>> 16;
  o2 &= 65535;
  o1 += m1 * n3;
  o0 += o1 >>> 16;
  o1 &= 65535;
  o1 += m2 * n2;
  o0 += o1 >>> 16;
  o1 &= 65535;
  o1 += m3 * n1;
  o0 += o1 >>> 16;
  o1 &= 65535;
  o0 += m0 * n3 + m1 * n2 + m2 * n1 + m3 * n0;
  o0 &= 65535;
  m[0] = o0 << 16 | o1;
  m[1] = o2 << 16 | o3;
}
function x64Rotl(m, bits) {
  const m0 = m[0];
  bits %= 64;
  if (bits === 32) {
    m[0] = m[1];
    m[1] = m0;
  } else if (bits < 32) {
    m[0] = m0 << bits | m[1] >>> 32 - bits;
    m[1] = m[1] << bits | m0 >>> 32 - bits;
  } else {
    bits -= 32;
    m[0] = m[1] << bits | m0 >>> 32 - bits;
    m[1] = m0 << bits | m[1] >>> 32 - bits;
  }
}
function x64LeftShift(m, bits) {
  bits %= 64;
  if (bits === 0) {
    return;
  } else if (bits < 32) {
    m[0] = m[1] >>> 32 - bits;
    m[1] = m[1] << bits;
  } else {
    m[0] = m[1] << bits - 32;
    m[1] = 0;
  }
}
function x64Xor(m, n) {
  m[0] ^= n[0];
  m[1] ^= n[1];
}
var F1 = [4283543511, 3981806797];
var F2 = [3301882366, 444984403];
function x64Fmix(h) {
  const shifted = [0, h[0] >>> 1];
  x64Xor(h, shifted);
  x64Multiply(h, F1);
  shifted[1] = h[0] >>> 1;
  x64Xor(h, shifted);
  x64Multiply(h, F2);
  shifted[1] = h[0] >>> 1;
  x64Xor(h, shifted);
}
var C1 = [2277735313, 289559509];
var C2 = [1291169091, 658871167];
var M$1 = [0, 5];
var N1 = [0, 1390208809];
var N2 = [0, 944331445];
function x64hash128(input, seed) {
  const key = getUTF8Bytes(input);
  seed = seed || 0;
  const length = [0, key.length];
  const remainder = length[1] % 16;
  const bytes = length[1] - remainder;
  const h1 = [0, seed];
  const h2 = [0, seed];
  const k1 = [0, 0];
  const k2 = [0, 0];
  let i;
  for (i = 0; i < bytes; i = i + 16) {
    k1[0] = key[i + 4] | key[i + 5] << 8 | key[i + 6] << 16 | key[i + 7] << 24;
    k1[1] = key[i] | key[i + 1] << 8 | key[i + 2] << 16 | key[i + 3] << 24;
    k2[0] = key[i + 12] | key[i + 13] << 8 | key[i + 14] << 16 | key[i + 15] << 24;
    k2[1] = key[i + 8] | key[i + 9] << 8 | key[i + 10] << 16 | key[i + 11] << 24;
    x64Multiply(k1, C1);
    x64Rotl(k1, 31);
    x64Multiply(k1, C2);
    x64Xor(h1, k1);
    x64Rotl(h1, 27);
    x64Add(h1, h2);
    x64Multiply(h1, M$1);
    x64Add(h1, N1);
    x64Multiply(k2, C2);
    x64Rotl(k2, 33);
    x64Multiply(k2, C1);
    x64Xor(h2, k2);
    x64Rotl(h2, 31);
    x64Add(h2, h1);
    x64Multiply(h2, M$1);
    x64Add(h2, N2);
  }
  k1[0] = 0;
  k1[1] = 0;
  k2[0] = 0;
  k2[1] = 0;
  const val = [0, 0];
  switch (remainder) {
    case 15:
      val[1] = key[i + 14];
      x64LeftShift(val, 48);
      x64Xor(k2, val);
    case 14:
      val[1] = key[i + 13];
      x64LeftShift(val, 40);
      x64Xor(k2, val);
    case 13:
      val[1] = key[i + 12];
      x64LeftShift(val, 32);
      x64Xor(k2, val);
    case 12:
      val[1] = key[i + 11];
      x64LeftShift(val, 24);
      x64Xor(k2, val);
    case 11:
      val[1] = key[i + 10];
      x64LeftShift(val, 16);
      x64Xor(k2, val);
    case 10:
      val[1] = key[i + 9];
      x64LeftShift(val, 8);
      x64Xor(k2, val);
    case 9:
      val[1] = key[i + 8];
      x64Xor(k2, val);
      x64Multiply(k2, C2);
      x64Rotl(k2, 33);
      x64Multiply(k2, C1);
      x64Xor(h2, k2);
    case 8:
      val[1] = key[i + 7];
      x64LeftShift(val, 56);
      x64Xor(k1, val);
    case 7:
      val[1] = key[i + 6];
      x64LeftShift(val, 48);
      x64Xor(k1, val);
    case 6:
      val[1] = key[i + 5];
      x64LeftShift(val, 40);
      x64Xor(k1, val);
    case 5:
      val[1] = key[i + 4];
      x64LeftShift(val, 32);
      x64Xor(k1, val);
    case 4:
      val[1] = key[i + 3];
      x64LeftShift(val, 24);
      x64Xor(k1, val);
    case 3:
      val[1] = key[i + 2];
      x64LeftShift(val, 16);
      x64Xor(k1, val);
    case 2:
      val[1] = key[i + 1];
      x64LeftShift(val, 8);
      x64Xor(k1, val);
    case 1:
      val[1] = key[i];
      x64Xor(k1, val);
      x64Multiply(k1, C1);
      x64Rotl(k1, 31);
      x64Multiply(k1, C2);
      x64Xor(h1, k1);
  }
  x64Xor(h1, length);
  x64Xor(h2, length);
  x64Add(h1, h2);
  x64Add(h2, h1);
  x64Fmix(h1);
  x64Fmix(h2);
  x64Add(h1, h2);
  x64Add(h2, h1);
  return ("00000000" + (h1[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h1[1] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[1] >>> 0).toString(16)).slice(-8);
}
function errorToObject(error) {
  var _a;
  return {
    name: error.name,
    message: error.message,
    stack: (_a = error.stack) === null || _a === void 0 ? void 0 : _a.split("\n"),
    // The fields are not enumerable, so TS is wrong saying that they will be overridden
    ...error
  };
}
function isFunctionNative(func) {
  return /^function\s.*?\{\s*\[native code]\s*}$/.test(String(func));
}
function isFinalResultLoaded(loadResult) {
  return typeof loadResult !== "function";
}
function loadSource(source, sourceOptions) {
  const sourceLoadPromise = suppressUnhandledRejectionWarning(new Promise((resolveLoad) => {
    const loadStartTime = Date.now();
    awaitIfAsync(source.bind(null, sourceOptions), (...loadArgs) => {
      const loadDuration = Date.now() - loadStartTime;
      if (!loadArgs[0]) {
        return resolveLoad(() => ({ error: loadArgs[1], duration: loadDuration }));
      }
      const loadResult = loadArgs[1];
      if (isFinalResultLoaded(loadResult)) {
        return resolveLoad(() => ({ value: loadResult, duration: loadDuration }));
      }
      resolveLoad(() => new Promise((resolveGet) => {
        const getStartTime = Date.now();
        awaitIfAsync(loadResult, (...getArgs) => {
          const duration = loadDuration + Date.now() - getStartTime;
          if (!getArgs[0]) {
            return resolveGet({ error: getArgs[1], duration });
          }
          resolveGet({ value: getArgs[1], duration });
        });
      }));
    });
  }));
  return function getComponent() {
    return sourceLoadPromise.then((finalizeSource) => finalizeSource());
  };
}
function loadSources(sources2, sourceOptions, excludeSources, loopReleaseInterval) {
  const includedSources = Object.keys(sources2).filter((sourceKey) => excludes(excludeSources, sourceKey));
  const sourceGettersPromise = suppressUnhandledRejectionWarning(mapWithBreaks(includedSources, (sourceKey) => loadSource(sources2[sourceKey], sourceOptions), loopReleaseInterval));
  return async function getComponents() {
    const sourceGetters = await sourceGettersPromise;
    const componentPromises = await mapWithBreaks(sourceGetters, (sourceGetter) => suppressUnhandledRejectionWarning(sourceGetter()), loopReleaseInterval);
    const componentArray = await Promise.all(componentPromises);
    const components = {};
    for (let index2 = 0; index2 < includedSources.length; ++index2) {
      components[includedSources[index2]] = componentArray[index2];
    }
    return components;
  };
}
function transformSource(source, transformValue) {
  const transformLoadResult = (loadResult) => {
    if (isFinalResultLoaded(loadResult)) {
      return transformValue(loadResult);
    }
    return () => {
      const getResult = loadResult();
      if (isPromise(getResult)) {
        return getResult.then(transformValue);
      }
      return transformValue(getResult);
    };
  };
  return (options) => {
    const loadResult = source(options);
    if (isPromise(loadResult)) {
      return loadResult.then(transformLoadResult);
    }
    return transformLoadResult(loadResult);
  };
}
function isTrident() {
  const w = window;
  const n = navigator;
  return countTruthy([
    "MSCSSMatrix" in w,
    "msSetImmediate" in w,
    "msIndexedDB" in w,
    "msMaxTouchPoints" in n,
    "msPointerEnabled" in n
  ]) >= 4;
}
function isEdgeHTML() {
  const w = window;
  const n = navigator;
  return countTruthy(["msWriteProfilerMark" in w, "MSStream" in w, "msLaunchUri" in n, "msSaveBlob" in n]) >= 3 && !isTrident();
}
function isChromium() {
  const w = window;
  const n = navigator;
  return countTruthy([
    "webkitPersistentStorage" in n,
    "webkitTemporaryStorage" in n,
    (n.vendor || "").indexOf("Google") === 0,
    "webkitResolveLocalFileSystemURL" in w,
    "BatteryManager" in w,
    "webkitMediaStream" in w,
    "webkitSpeechGrammar" in w
  ]) >= 5;
}
function isWebKit() {
  const w = window;
  const n = navigator;
  return countTruthy([
    "ApplePayError" in w,
    "CSSPrimitiveValue" in w,
    "Counter" in w,
    n.vendor.indexOf("Apple") === 0,
    "RGBColor" in w,
    "WebKitMediaKeys" in w
  ]) >= 4;
}
function isDesktopWebKit() {
  const w = window;
  const { HTMLElement, Document } = w;
  return countTruthy([
    "safari" in w,
    !("ongestureend" in w),
    !("TouchEvent" in w),
    !("orientation" in w),
    HTMLElement && !("autocapitalize" in HTMLElement.prototype),
    Document && "pointerLockElement" in Document.prototype
  ]) >= 4;
}
function isSafariWebKit() {
  const w = window;
  return (
    // Filters-out Chrome, Yandex, DuckDuckGo (macOS and iOS), Edge
    isFunctionNative(w.print) && // Doesn't work in Safari < 15.4
    String(w.browser) === "[object WebPageNamespace]"
  );
}
function isGecko() {
  var _a, _b;
  const w = window;
  return countTruthy([
    "buildID" in navigator,
    "MozAppearance" in ((_b = (_a = document.documentElement) === null || _a === void 0 ? void 0 : _a.style) !== null && _b !== void 0 ? _b : {}),
    "onmozfullscreenchange" in w,
    "mozInnerScreenX" in w,
    "CSSMozDocumentRule" in w,
    "CanvasCaptureMediaStream" in w
  ]) >= 4;
}
function isChromium86OrNewer() {
  const w = window;
  return countTruthy([
    !("MediaSettingsRange" in w),
    "RTCEncodedAudioFrame" in w,
    "" + w.Intl === "[object Intl]",
    "" + w.Reflect === "[object Reflect]"
  ]) >= 3;
}
function isChromium122OrNewer() {
  const w = window;
  const { URLPattern } = w;
  return countTruthy([
    "union" in Set.prototype,
    "Iterator" in w,
    URLPattern && "hasRegExpGroups" in URLPattern.prototype,
    "RGB8" in WebGLRenderingContext.prototype
  ]) >= 3;
}
function isWebKit606OrNewer() {
  const w = window;
  return countTruthy([
    "DOMRectList" in w,
    "RTCPeerConnectionIceEvent" in w,
    "SVGGeometryElement" in w,
    "ontransitioncancel" in w
  ]) >= 3;
}
function isWebKit616OrNewer() {
  const w = window;
  const n = navigator;
  const { CSS, HTMLButtonElement } = w;
  return countTruthy([
    !("getStorageUpdates" in n),
    HTMLButtonElement && "popover" in HTMLButtonElement.prototype,
    "CSSCounterStyleRule" in w,
    CSS.supports("font-size-adjust: ex-height 0.5"),
    CSS.supports("text-transform: full-width")
  ]) >= 4;
}
function isIPad() {
  if (navigator.platform === "iPad") {
    return true;
  }
  const s = screen;
  const screenRatio = s.width / s.height;
  return countTruthy([
    // Since iOS 13. Doesn't work in Chrome on iPadOS <15, but works in desktop mode.
    "MediaSource" in window,
    // Since iOS 12. Doesn't work in Chrome on iPadOS.
    !!Element.prototype.webkitRequestFullscreen,
    // iPhone 4S that runs iOS 9 matches this, but it is not supported
    // Doesn't work in incognito mode of Safari ≥17 with split screen because of tracking prevention
    screenRatio > 0.65 && screenRatio < 1.53
  ]) >= 2;
}
function getFullscreenElement() {
  const d = document;
  return d.fullscreenElement || d.msFullscreenElement || d.mozFullScreenElement || d.webkitFullscreenElement || null;
}
function exitFullscreen() {
  const d = document;
  return (d.exitFullscreen || d.msExitFullscreen || d.mozCancelFullScreen || d.webkitExitFullscreen).call(d);
}
function isAndroid() {
  const isItChromium = isChromium();
  const isItGecko = isGecko();
  const w = window;
  const n = navigator;
  const c = "connection";
  if (isItChromium) {
    return countTruthy([
      !("SharedWorker" in w),
      // `typechange` is deprecated, but it's still present on Android (tested on Chrome Mobile 117)
      // Removal proposal https://bugs.chromium.org/p/chromium/issues/detail?id=699892
      // Note: this expression returns true on ChromeOS, so additional detectors are required to avoid false-positives
      n[c] && "ontypechange" in n[c],
      !("sinkId" in new Audio())
    ]) >= 2;
  } else if (isItGecko) {
    return countTruthy(["onorientationchange" in w, "orientation" in w, /android/i.test(n.appVersion)]) >= 2;
  } else {
    return false;
  }
}
function isSamsungInternet() {
  const n = navigator;
  const w = window;
  const audioPrototype = Audio.prototype;
  const { visualViewport } = w;
  return countTruthy([
    "srLatency" in audioPrototype,
    "srChannelCount" in audioPrototype,
    "devicePosture" in n,
    visualViewport && "segments" in visualViewport,
    "getTextInformation" in Image.prototype
    // Not available in Samsung Internet 21
  ]) >= 3;
}
function getAudioFingerprint() {
  if (doesBrowserPerformAntifingerprinting$1()) {
    return -4;
  }
  return getUnstableAudioFingerprint();
}
function getUnstableAudioFingerprint() {
  const w = window;
  const AudioContext2 = w.OfflineAudioContext || w.webkitOfflineAudioContext;
  if (!AudioContext2) {
    return -2;
  }
  if (doesBrowserSuspendAudioContext()) {
    return -1;
  }
  const hashFromIndex = 4500;
  const hashToIndex = 5e3;
  const context = new AudioContext2(1, hashToIndex, 44100);
  const oscillator = context.createOscillator();
  oscillator.type = "triangle";
  oscillator.frequency.value = 1e4;
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -50;
  compressor.knee.value = 40;
  compressor.ratio.value = 12;
  compressor.attack.value = 0;
  compressor.release.value = 0.25;
  oscillator.connect(compressor);
  compressor.connect(context.destination);
  oscillator.start(0);
  const [renderPromise, finishRendering] = startRenderingAudio(context);
  const fingerprintPromise = suppressUnhandledRejectionWarning(renderPromise.then((buffer) => getHash(buffer.getChannelData(0).subarray(hashFromIndex)), (error) => {
    if (error.name === "timeout" || error.name === "suspended") {
      return -3;
    }
    throw error;
  }));
  return () => {
    finishRendering();
    return fingerprintPromise;
  };
}
function doesBrowserSuspendAudioContext() {
  return isWebKit() && !isDesktopWebKit() && !isWebKit606OrNewer();
}
function doesBrowserPerformAntifingerprinting$1() {
  return (
    // Safari ≥17
    isWebKit() && isWebKit616OrNewer() && isSafariWebKit() || // Samsung Internet ≥26
    isChromium() && isSamsungInternet() && isChromium122OrNewer()
  );
}
function startRenderingAudio(context) {
  const renderTryMaxCount = 3;
  const renderRetryDelay = 500;
  const runningMaxAwaitTime = 500;
  const runningSufficientTime = 5e3;
  let finalize = () => void 0;
  const resultPromise = new Promise((resolve, reject) => {
    let isFinalized = false;
    let renderTryCount = 0;
    let startedRunningAt = 0;
    context.oncomplete = (event) => resolve(event.renderedBuffer);
    const startRunningTimeout = () => {
      setTimeout(() => reject(makeInnerError(
        "timeout"
        /* InnerErrorName.Timeout */
      )), Math.min(runningMaxAwaitTime, startedRunningAt + runningSufficientTime - Date.now()));
    };
    const tryRender = () => {
      try {
        const renderingPromise = context.startRendering();
        if (isPromise(renderingPromise)) {
          suppressUnhandledRejectionWarning(renderingPromise);
        }
        switch (context.state) {
          case "running":
            startedRunningAt = Date.now();
            if (isFinalized) {
              startRunningTimeout();
            }
            break;
          case "suspended":
            if (!document.hidden) {
              renderTryCount++;
            }
            if (isFinalized && renderTryCount >= renderTryMaxCount) {
              reject(makeInnerError(
                "suspended"
                /* InnerErrorName.Suspended */
              ));
            } else {
              setTimeout(tryRender, renderRetryDelay);
            }
            break;
        }
      } catch (error) {
        reject(error);
      }
    };
    tryRender();
    finalize = () => {
      if (!isFinalized) {
        isFinalized = true;
        if (startedRunningAt > 0) {
          startRunningTimeout();
        }
      }
    };
  });
  return [resultPromise, finalize];
}
function getHash(signal) {
  let hash = 0;
  for (let i = 0; i < signal.length; ++i) {
    hash += Math.abs(signal[i]);
  }
  return hash;
}
function makeInnerError(name) {
  const error = new Error(name);
  error.name = name;
  return error;
}
async function withIframe(action, initialHtml, domPollInterval = 50) {
  var _a, _b, _c;
  const d = document;
  while (!d.body) {
    await wait(domPollInterval);
  }
  const iframe = d.createElement("iframe");
  try {
    await new Promise((_resolve, _reject) => {
      let isComplete = false;
      const resolve = () => {
        isComplete = true;
        _resolve();
      };
      const reject = (error) => {
        isComplete = true;
        _reject(error);
      };
      iframe.onload = resolve;
      iframe.onerror = reject;
      const { style } = iframe;
      style.setProperty("display", "block", "important");
      style.position = "absolute";
      style.top = "0";
      style.left = "0";
      style.visibility = "hidden";
      if (initialHtml && "srcdoc" in iframe) {
        iframe.srcdoc = initialHtml;
      } else {
        iframe.src = "about:blank";
      }
      d.body.appendChild(iframe);
      const checkReadyState = () => {
        var _a2, _b2;
        if (isComplete) {
          return;
        }
        if (((_b2 = (_a2 = iframe.contentWindow) === null || _a2 === void 0 ? void 0 : _a2.document) === null || _b2 === void 0 ? void 0 : _b2.readyState) === "complete") {
          resolve();
        } else {
          setTimeout(checkReadyState, 10);
        }
      };
      checkReadyState();
    });
    while (!((_b = (_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.document) === null || _b === void 0 ? void 0 : _b.body)) {
      await wait(domPollInterval);
    }
    return await action(iframe, iframe.contentWindow);
  } finally {
    (_c = iframe.parentNode) === null || _c === void 0 ? void 0 : _c.removeChild(iframe);
  }
}
function selectorToElement(selector) {
  const [tag, attributes] = parseSimpleCssSelector(selector);
  const element = document.createElement(tag !== null && tag !== void 0 ? tag : "div");
  for (const name of Object.keys(attributes)) {
    const value = attributes[name].join(" ");
    if (name === "style") {
      addStyleString(element.style, value);
    } else {
      element.setAttribute(name, value);
    }
  }
  return element;
}
function addStyleString(style, source) {
  for (const property of source.split(";")) {
    const match = /^\s*([\w-]+)\s*:\s*(.+?)(\s*!([\w-]+))?\s*$/.exec(property);
    if (match) {
      const [, name, value, , priority] = match;
      style.setProperty(name, value, priority || "");
    }
  }
}
function isAnyParentCrossOrigin() {
  let currentWindow = window;
  for (; ; ) {
    const parentWindow = currentWindow.parent;
    if (!parentWindow || parentWindow === currentWindow) {
      return false;
    }
    try {
      if (parentWindow.location.origin !== currentWindow.location.origin) {
        return true;
      }
    } catch (error) {
      if (error instanceof Error && error.name === "SecurityError") {
        return true;
      }
      throw error;
    }
    currentWindow = parentWindow;
  }
}
var testString = "mmMwWLliI0O&1";
var textSize = "48px";
var baseFonts = ["monospace", "sans-serif", "serif"];
var fontList = [
  // This is android-specific font from "Roboto" family
  "sans-serif-thin",
  "ARNO PRO",
  "Agency FB",
  "Arabic Typesetting",
  "Arial Unicode MS",
  "AvantGarde Bk BT",
  "BankGothic Md BT",
  "Batang",
  "Bitstream Vera Sans Mono",
  "Calibri",
  "Century",
  "Century Gothic",
  "Clarendon",
  "EUROSTILE",
  "Franklin Gothic",
  "Futura Bk BT",
  "Futura Md BT",
  "GOTHAM",
  "Gill Sans",
  "HELV",
  "Haettenschweiler",
  "Helvetica Neue",
  "Humanst521 BT",
  "Leelawadee",
  "Letter Gothic",
  "Levenim MT",
  "Lucida Bright",
  "Lucida Sans",
  "Menlo",
  "MS Mincho",
  "MS Outlook",
  "MS Reference Specialty",
  "MS UI Gothic",
  "MT Extra",
  "MYRIAD PRO",
  "Marlett",
  "Meiryo UI",
  "Microsoft Uighur",
  "Minion Pro",
  "Monotype Corsiva",
  "PMingLiU",
  "Pristina",
  "SCRIPTINA",
  "Segoe UI Light",
  "Serifa",
  "SimHei",
  "Small Fonts",
  "Staccato222 BT",
  "TRAJAN PRO",
  "Univers CE 55 Medium",
  "Vrinda",
  "ZWAdobeF"
];
function getFonts() {
  return withIframe(async (_, { document: document2 }) => {
    const holder = document2.body;
    holder.style.fontSize = textSize;
    const spansContainer = document2.createElement("div");
    spansContainer.style.setProperty("visibility", "hidden", "important");
    const defaultWidth = {};
    const defaultHeight = {};
    const createSpan = (fontFamily) => {
      const span = document2.createElement("span");
      const { style } = span;
      style.position = "absolute";
      style.top = "0";
      style.left = "0";
      style.fontFamily = fontFamily;
      span.textContent = testString;
      spansContainer.appendChild(span);
      return span;
    };
    const createSpanWithFonts = (fontToDetect, baseFont) => {
      return createSpan(`'${fontToDetect}',${baseFont}`);
    };
    const initializeBaseFontsSpans = () => {
      return baseFonts.map(createSpan);
    };
    const initializeFontsSpans = () => {
      const spans = {};
      for (const font of fontList) {
        spans[font] = baseFonts.map((baseFont) => createSpanWithFonts(font, baseFont));
      }
      return spans;
    };
    const isFontAvailable = (fontSpans) => {
      return baseFonts.some((baseFont, baseFontIndex) => fontSpans[baseFontIndex].offsetWidth !== defaultWidth[baseFont] || fontSpans[baseFontIndex].offsetHeight !== defaultHeight[baseFont]);
    };
    const baseFontsSpans = initializeBaseFontsSpans();
    const fontsSpans = initializeFontsSpans();
    holder.appendChild(spansContainer);
    for (let index2 = 0; index2 < baseFonts.length; index2++) {
      defaultWidth[baseFonts[index2]] = baseFontsSpans[index2].offsetWidth;
      defaultHeight[baseFonts[index2]] = baseFontsSpans[index2].offsetHeight;
    }
    return fontList.filter((font) => isFontAvailable(fontsSpans[font]));
  });
}
function getPlugins() {
  const rawPlugins = navigator.plugins;
  if (!rawPlugins) {
    return void 0;
  }
  const plugins = [];
  for (let i = 0; i < rawPlugins.length; ++i) {
    const plugin = rawPlugins[i];
    if (!plugin) {
      continue;
    }
    const mimeTypes = [];
    for (let j = 0; j < plugin.length; ++j) {
      const mimeType = plugin[j];
      mimeTypes.push({
        type: mimeType.type,
        suffixes: mimeType.suffixes
      });
    }
    plugins.push({
      name: plugin.name,
      description: plugin.description,
      mimeTypes
    });
  }
  return plugins;
}
function getCanvasFingerprint() {
  return getUnstableCanvasFingerprint(doesBrowserPerformAntifingerprinting());
}
function getUnstableCanvasFingerprint(skipImages) {
  let winding = false;
  let geometry;
  let text;
  const [canvas, context] = makeCanvasContext();
  if (!isSupported(canvas, context)) {
    geometry = text = "unsupported";
  } else {
    winding = doesSupportWinding(context);
    if (skipImages) {
      geometry = text = "skipped";
    } else {
      [geometry, text] = renderImages(canvas, context);
    }
  }
  return { winding, geometry, text };
}
function makeCanvasContext() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return [canvas, canvas.getContext("2d")];
}
function isSupported(canvas, context) {
  return !!(context && canvas.toDataURL);
}
function doesSupportWinding(context) {
  context.rect(0, 0, 10, 10);
  context.rect(2, 2, 6, 6);
  return !context.isPointInPath(5, 5, "evenodd");
}
function renderImages(canvas, context) {
  renderTextImage(canvas, context);
  const textImage1 = canvasToString(canvas);
  const textImage2 = canvasToString(canvas);
  if (textImage1 !== textImage2) {
    return [
      "unstable",
      "unstable"
      /* ImageStatus.Unstable */
    ];
  }
  renderGeometryImage(canvas, context);
  const geometryImage = canvasToString(canvas);
  return [geometryImage, textImage1];
}
function renderTextImage(canvas, context) {
  canvas.width = 240;
  canvas.height = 60;
  context.textBaseline = "alphabetic";
  context.fillStyle = "#f60";
  context.fillRect(100, 1, 62, 20);
  context.fillStyle = "#069";
  context.font = '11pt "Times New Roman"';
  const printedText = `Cwm fjordbank gly ${String.fromCharCode(55357, 56835)}`;
  context.fillText(printedText, 2, 15);
  context.fillStyle = "rgba(102, 204, 0, 0.2)";
  context.font = "18pt Arial";
  context.fillText(printedText, 4, 45);
}
function renderGeometryImage(canvas, context) {
  canvas.width = 122;
  canvas.height = 110;
  context.globalCompositeOperation = "multiply";
  for (const [color, x, y] of [
    ["#f2f", 40, 40],
    ["#2ff", 80, 40],
    ["#ff2", 60, 80]
  ]) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, 40, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();
  }
  context.fillStyle = "#f9c";
  context.arc(60, 60, 60, 0, Math.PI * 2, true);
  context.arc(60, 60, 20, 0, Math.PI * 2, true);
  context.fill("evenodd");
}
function canvasToString(canvas) {
  return canvas.toDataURL();
}
function doesBrowserPerformAntifingerprinting() {
  return isWebKit() && isWebKit616OrNewer() && isSafariWebKit();
}
function getTouchSupport() {
  const n = navigator;
  let maxTouchPoints = 0;
  let touchEvent;
  if (n.maxTouchPoints !== void 0) {
    maxTouchPoints = toInt(n.maxTouchPoints);
  } else if (n.msMaxTouchPoints !== void 0) {
    maxTouchPoints = n.msMaxTouchPoints;
  }
  try {
    document.createEvent("TouchEvent");
    touchEvent = true;
  } catch (_a) {
    touchEvent = false;
  }
  const touchStart = "ontouchstart" in window;
  return {
    maxTouchPoints,
    touchEvent,
    touchStart
  };
}
function getOsCpu() {
  return navigator.oscpu;
}
function getLanguages() {
  const n = navigator;
  const result = [];
  const language = n.language || n.userLanguage || n.browserLanguage || n.systemLanguage;
  if (language !== void 0) {
    result.push([language]);
  }
  if (Array.isArray(n.languages)) {
    if (!(isChromium() && isChromium86OrNewer())) {
      result.push(n.languages);
    }
  } else if (typeof n.languages === "string") {
    const languages = n.languages;
    if (languages) {
      result.push(languages.split(","));
    }
  }
  return result;
}
function getColorDepth() {
  return window.screen.colorDepth;
}
function getDeviceMemory() {
  return replaceNaN(toFloat(navigator.deviceMemory), void 0);
}
function getScreenResolution() {
  if (isWebKit() && isWebKit616OrNewer() && isSafariWebKit()) {
    return void 0;
  }
  return getUnstableScreenResolution();
}
function getUnstableScreenResolution() {
  const s = screen;
  const parseDimension = (value) => replaceNaN(toInt(value), null);
  const dimensions = [parseDimension(s.width), parseDimension(s.height)];
  dimensions.sort().reverse();
  return dimensions;
}
var screenFrameCheckInterval = 2500;
var roundingPrecision = 10;
var screenFrameBackup;
var screenFrameSizeTimeoutId;
function watchScreenFrame() {
  if (screenFrameSizeTimeoutId !== void 0) {
    return;
  }
  const checkScreenFrame = () => {
    const frameSize = getCurrentScreenFrame();
    if (isFrameSizeNull(frameSize)) {
      screenFrameSizeTimeoutId = setTimeout(checkScreenFrame, screenFrameCheckInterval);
    } else {
      screenFrameBackup = frameSize;
      screenFrameSizeTimeoutId = void 0;
    }
  };
  checkScreenFrame();
}
function getUnstableScreenFrame() {
  watchScreenFrame();
  return async () => {
    let frameSize = getCurrentScreenFrame();
    if (isFrameSizeNull(frameSize)) {
      if (screenFrameBackup) {
        return [...screenFrameBackup];
      }
      if (getFullscreenElement()) {
        await exitFullscreen();
        frameSize = getCurrentScreenFrame();
      }
    }
    if (!isFrameSizeNull(frameSize)) {
      screenFrameBackup = frameSize;
    }
    return frameSize;
  };
}
function getScreenFrame() {
  if (isWebKit() && isWebKit616OrNewer() && isSafariWebKit()) {
    return () => Promise.resolve(void 0);
  }
  const screenFrameGetter = getUnstableScreenFrame();
  return async () => {
    const frameSize = await screenFrameGetter();
    const processSize = (sideSize) => sideSize === null ? null : round(sideSize, roundingPrecision);
    return [processSize(frameSize[0]), processSize(frameSize[1]), processSize(frameSize[2]), processSize(frameSize[3])];
  };
}
function getCurrentScreenFrame() {
  const s = screen;
  return [
    replaceNaN(toFloat(s.availTop), null),
    replaceNaN(toFloat(s.width) - toFloat(s.availWidth) - replaceNaN(toFloat(s.availLeft), 0), null),
    replaceNaN(toFloat(s.height) - toFloat(s.availHeight) - replaceNaN(toFloat(s.availTop), 0), null),
    replaceNaN(toFloat(s.availLeft), null)
  ];
}
function isFrameSizeNull(frameSize) {
  for (let i = 0; i < 4; ++i) {
    if (frameSize[i]) {
      return false;
    }
  }
  return true;
}
function getHardwareConcurrency() {
  return replaceNaN(toInt(navigator.hardwareConcurrency), void 0);
}
function getTimezone() {
  var _a;
  const DateTimeFormat = (_a = window.Intl) === null || _a === void 0 ? void 0 : _a.DateTimeFormat;
  if (DateTimeFormat) {
    const timezone = new DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) {
      return timezone;
    }
  }
  const offset = -getTimezoneOffset();
  return `UTC${offset >= 0 ? "+" : ""}${offset}`;
}
function getTimezoneOffset() {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  return Math.max(
    // `getTimezoneOffset` returns a number as a string in some unidentified cases
    toFloat(new Date(currentYear, 0, 1).getTimezoneOffset()),
    toFloat(new Date(currentYear, 6, 1).getTimezoneOffset())
  );
}
function getSessionStorage() {
  try {
    return !!window.sessionStorage;
  } catch (error) {
    return true;
  }
}
function getLocalStorage() {
  try {
    return !!window.localStorage;
  } catch (e) {
    return true;
  }
}
function getIndexedDB() {
  if (isTrident() || isEdgeHTML()) {
    return void 0;
  }
  try {
    return !!window.indexedDB;
  } catch (e) {
    return true;
  }
}
function getOpenDatabase() {
  return !!window.openDatabase;
}
function getCpuClass() {
  return navigator.cpuClass;
}
function getPlatform() {
  const { platform } = navigator;
  if (platform === "MacIntel") {
    if (isWebKit() && !isDesktopWebKit()) {
      return isIPad() ? "iPad" : "iPhone";
    }
  }
  return platform;
}
function getVendor() {
  return navigator.vendor || "";
}
function getVendorFlavors() {
  const flavors = [];
  for (const key of [
    // Blink and some browsers on iOS
    "chrome",
    // Safari on macOS
    "safari",
    // Chrome on iOS (checked in 85 on 13 and 87 on 14)
    "__crWeb",
    "__gCrWeb",
    // Yandex Browser on iOS, macOS and Android (checked in 21.2 on iOS 14, macOS and Android)
    "yandex",
    // Yandex Browser on iOS (checked in 21.2 on 14)
    "__yb",
    "__ybro",
    // Firefox on iOS (checked in 32 on 14)
    "__firefox__",
    // Edge on iOS (checked in 46 on 14)
    "__edgeTrackingPreventionStatistics",
    "webkit",
    // Opera Touch on iOS (checked in 2.6 on 14)
    "oprt",
    // Samsung Internet on Android (checked in 11.1)
    "samsungAr",
    // UC Browser on Android (checked in 12.10 and 13.0)
    "ucweb",
    "UCShellJava",
    // Puffin on Android (checked in 9.0)
    "puffinDevice"
    // UC on iOS and Opera on Android have no specific global variables
    // Edge for Android isn't checked
  ]) {
    const value = window[key];
    if (value && typeof value === "object") {
      flavors.push(key);
    }
  }
  return flavors.sort();
}
function areCookiesEnabled() {
  const d = document;
  try {
    d.cookie = "cookietest=1; SameSite=Strict;";
    const result = d.cookie.indexOf("cookietest=") !== -1;
    d.cookie = "cookietest=1; SameSite=Strict; expires=Thu, 01-Jan-1970 00:00:01 GMT";
    return result;
  } catch (e) {
    return false;
  }
}
function getFilters() {
  const fromB64 = atob;
  return {
    abpIndo: [
      "#Iklan-Melayang",
      "#Kolom-Iklan-728",
      "#SidebarIklan-wrapper",
      '[title="ALIENBOLA" i]',
      fromB64("I0JveC1CYW5uZXItYWRz")
    ],
    abpvn: [".quangcao", "#mobileCatfish", fromB64("LmNsb3NlLWFkcw=="), '[id^="bn_bottom_fixed_"]', "#pmadv"],
    adBlockFinland: [
      ".mainostila",
      fromB64("LnNwb25zb3JpdA=="),
      ".ylamainos",
      fromB64("YVtocmVmKj0iL2NsaWNrdGhyZ2guYXNwPyJd"),
      fromB64("YVtocmVmXj0iaHR0cHM6Ly9hcHAucmVhZHBlYWsuY29tL2FkcyJd")
    ],
    adBlockPersian: [
      "#navbar_notice_50",
      ".kadr",
      'TABLE[width="140px"]',
      "#divAgahi",
      fromB64("YVtocmVmXj0iaHR0cDovL2cxLnYuZndtcm0ubmV0L2FkLyJd")
    ],
    adBlockWarningRemoval: [
      "#adblock-honeypot",
      ".adblocker-root",
      ".wp_adblock_detect",
      fromB64("LmhlYWRlci1ibG9ja2VkLWFk"),
      fromB64("I2FkX2Jsb2NrZXI=")
    ],
    adGuardAnnoyances: [
      ".hs-sosyal",
      "#cookieconsentdiv",
      'div[class^="app_gdpr"]',
      ".as-oil",
      '[data-cypress="soft-push-notification-modal"]'
    ],
    adGuardBase: [
      ".BetterJsPopOverlay",
      fromB64("I2FkXzMwMFgyNTA="),
      fromB64("I2Jhbm5lcmZsb2F0MjI="),
      fromB64("I2NhbXBhaWduLWJhbm5lcg=="),
      fromB64("I0FkLUNvbnRlbnQ=")
    ],
    adGuardChinese: [
      fromB64("LlppX2FkX2FfSA=="),
      fromB64("YVtocmVmKj0iLmh0aGJldDM0LmNvbSJd"),
      "#widget-quan",
      fromB64("YVtocmVmKj0iLzg0OTkyMDIwLnh5eiJd"),
      fromB64("YVtocmVmKj0iLjE5NTZobC5jb20vIl0=")
    ],
    adGuardFrench: [
      "#pavePub",
      fromB64("LmFkLWRlc2t0b3AtcmVjdGFuZ2xl"),
      ".mobile_adhesion",
      ".widgetadv",
      fromB64("LmFkc19iYW4=")
    ],
    adGuardGerman: ['aside[data-portal-id="leaderboard"]'],
    adGuardJapanese: [
      "#kauli_yad_1",
      fromB64("YVtocmVmXj0iaHR0cDovL2FkMi50cmFmZmljZ2F0ZS5uZXQvIl0="),
      fromB64("Ll9wb3BJbl9pbmZpbml0ZV9hZA=="),
      fromB64("LmFkZ29vZ2xl"),
      fromB64("Ll9faXNib29zdFJldHVybkFk")
    ],
    adGuardMobile: [
      fromB64("YW1wLWF1dG8tYWRz"),
      fromB64("LmFtcF9hZA=="),
      'amp-embed[type="24smi"]',
      "#mgid_iframe1",
      fromB64("I2FkX2ludmlld19hcmVh")
    ],
    adGuardRussian: [
      fromB64("YVtocmVmXj0iaHR0cHM6Ly9hZC5sZXRtZWFkcy5jb20vIl0="),
      fromB64("LnJlY2xhbWE="),
      'div[id^="smi2adblock"]',
      fromB64("ZGl2W2lkXj0iQWRGb3hfYmFubmVyXyJd"),
      "#psyduckpockeball"
    ],
    adGuardSocial: [
      fromB64("YVtocmVmXj0iLy93d3cuc3R1bWJsZXVwb24uY29tL3N1Ym1pdD91cmw9Il0="),
      fromB64("YVtocmVmXj0iLy90ZWxlZ3JhbS5tZS9zaGFyZS91cmw/Il0="),
      ".etsy-tweet",
      "#inlineShare",
      ".popup-social"
    ],
    adGuardSpanishPortuguese: ["#barraPublicidade", "#Publicidade", "#publiEspecial", "#queTooltip", ".cnt-publi"],
    adGuardTrackingProtection: [
      "#qoo-counter",
      fromB64("YVtocmVmXj0iaHR0cDovL2NsaWNrLmhvdGxvZy5ydS8iXQ=="),
      fromB64("YVtocmVmXj0iaHR0cDovL2hpdGNvdW50ZXIucnUvdG9wL3N0YXQucGhwIl0="),
      fromB64("YVtocmVmXj0iaHR0cDovL3RvcC5tYWlsLnJ1L2p1bXAiXQ=="),
      "#top100counter"
    ],
    adGuardTurkish: [
      "#backkapat",
      fromB64("I3Jla2xhbWk="),
      fromB64("YVtocmVmXj0iaHR0cDovL2Fkc2Vydi5vbnRlay5jb20udHIvIl0="),
      fromB64("YVtocmVmXj0iaHR0cDovL2l6bGVuemkuY29tL2NhbXBhaWduLyJd"),
      fromB64("YVtocmVmXj0iaHR0cDovL3d3dy5pbnN0YWxsYWRzLm5ldC8iXQ==")
    ],
    bulgarian: [fromB64("dGQjZnJlZW5ldF90YWJsZV9hZHM="), "#ea_intext_div", ".lapni-pop-over", "#xenium_hot_offers"],
    easyList: [
      ".yb-floorad",
      fromB64("LndpZGdldF9wb19hZHNfd2lkZ2V0"),
      fromB64("LnRyYWZmaWNqdW5reS1hZA=="),
      ".textad_headline",
      fromB64("LnNwb25zb3JlZC10ZXh0LWxpbmtz")
    ],
    easyListChina: [
      fromB64("LmFwcGd1aWRlLXdyYXBbb25jbGljayo9ImJjZWJvcy5jb20iXQ=="),
      fromB64("LmZyb250cGFnZUFkdk0="),
      "#taotaole",
      "#aafoot.top_box",
      ".cfa_popup"
    ],
    easyListCookie: [
      ".ezmob-footer",
      ".cc-CookieWarning",
      "[data-cookie-number]",
      fromB64("LmF3LWNvb2tpZS1iYW5uZXI="),
      ".sygnal24-gdpr-modal-wrap"
    ],
    easyListCzechSlovak: [
      "#onlajny-stickers",
      fromB64("I3Jla2xhbW5pLWJveA=="),
      fromB64("LnJla2xhbWEtbWVnYWJvYXJk"),
      ".sklik",
      fromB64("W2lkXj0ic2tsaWtSZWtsYW1hIl0=")
    ],
    easyListDutch: [
      fromB64("I2FkdmVydGVudGll"),
      fromB64("I3ZpcEFkbWFya3RCYW5uZXJCbG9jaw=="),
      ".adstekst",
      fromB64("YVtocmVmXj0iaHR0cHM6Ly94bHR1YmUubmwvY2xpY2svIl0="),
      "#semilo-lrectangle"
    ],
    easyListGermany: [
      "#SSpotIMPopSlider",
      fromB64("LnNwb25zb3JsaW5rZ3J1ZW4="),
      fromB64("I3dlcmJ1bmdza3k="),
      fromB64("I3Jla2xhbWUtcmVjaHRzLW1pdHRl"),
      fromB64("YVtocmVmXj0iaHR0cHM6Ly9iZDc0Mi5jb20vIl0=")
    ],
    easyListItaly: [
      fromB64("LmJveF9hZHZfYW5udW5jaQ=="),
      ".sb-box-pubbliredazionale",
      fromB64("YVtocmVmXj0iaHR0cDovL2FmZmlsaWF6aW9uaWFkcy5zbmFpLml0LyJd"),
      fromB64("YVtocmVmXj0iaHR0cHM6Ly9hZHNlcnZlci5odG1sLml0LyJd"),
      fromB64("YVtocmVmXj0iaHR0cHM6Ly9hZmZpbGlhemlvbmlhZHMuc25haS5pdC8iXQ==")
    ],
    easyListLithuania: [
      fromB64("LnJla2xhbW9zX3RhcnBhcw=="),
      fromB64("LnJla2xhbW9zX251b3JvZG9z"),
      fromB64("aW1nW2FsdD0iUmVrbGFtaW5pcyBza3lkZWxpcyJd"),
      fromB64("aW1nW2FsdD0iRGVkaWt1b3RpLmx0IHNlcnZlcmlhaSJd"),
      fromB64("aW1nW2FsdD0iSG9zdGluZ2FzIFNlcnZlcmlhaS5sdCJd")
    ],
    estonian: [fromB64("QVtocmVmKj0iaHR0cDovL3BheTRyZXN1bHRzMjQuZXUiXQ==")],
    fanboyAnnoyances: ["#ac-lre-player", ".navigate-to-top", "#subscribe_popup", ".newsletter_holder", "#back-top"],
    fanboyAntiFacebook: [".util-bar-module-firefly-visible"],
    fanboyEnhancedTrackers: [
      ".open.pushModal",
      "#issuem-leaky-paywall-articles-zero-remaining-nag",
      "#sovrn_container",
      'div[class$="-hide"][zoompage-fontsize][style="display: block;"]',
      ".BlockNag__Card"
    ],
    fanboySocial: ["#FollowUs", "#meteored_share", "#social_follow", ".article-sharer", ".community__social-desc"],
    frellwitSwedish: [
      fromB64("YVtocmVmKj0iY2FzaW5vcHJvLnNlIl1bdGFyZ2V0PSJfYmxhbmsiXQ=="),
      fromB64("YVtocmVmKj0iZG9rdG9yLXNlLm9uZWxpbmsubWUiXQ=="),
      "article.category-samarbete",
      fromB64("ZGl2LmhvbGlkQWRz"),
      "ul.adsmodern"
    ],
    greekAdBlock: [
      fromB64("QVtocmVmKj0iYWRtYW4ub3RlbmV0LmdyL2NsaWNrPyJd"),
      fromB64("QVtocmVmKj0iaHR0cDovL2F4aWFiYW5uZXJzLmV4b2R1cy5nci8iXQ=="),
      fromB64("QVtocmVmKj0iaHR0cDovL2ludGVyYWN0aXZlLmZvcnRobmV0LmdyL2NsaWNrPyJd"),
      "DIV.agores300",
      "TABLE.advright"
    ],
    hungarian: [
      "#cemp_doboz",
      ".optimonk-iframe-container",
      fromB64("LmFkX19tYWlu"),
      fromB64("W2NsYXNzKj0iR29vZ2xlQWRzIl0="),
      "#hirdetesek_box"
    ],
    iDontCareAboutCookies: [
      '.alert-info[data-block-track*="CookieNotice"]',
      ".ModuleTemplateCookieIndicator",
      ".o--cookies--container",
      "#cookies-policy-sticky",
      "#stickyCookieBar"
    ],
    icelandicAbp: [fromB64("QVtocmVmXj0iL2ZyYW1ld29yay9yZXNvdXJjZXMvZm9ybXMvYWRzLmFzcHgiXQ==")],
    latvian: [
      fromB64("YVtocmVmPSJodHRwOi8vd3d3LnNhbGlkemluaS5sdi8iXVtzdHlsZT0iZGlzcGxheTogYmxvY2s7IHdpZHRoOiAxMjBweDsgaGVpZ2h0OiA0MHB4OyBvdmVyZmxvdzogaGlkZGVuOyBwb3NpdGlvbjogcmVsYXRpdmU7Il0="),
      fromB64("YVtocmVmPSJodHRwOi8vd3d3LnNhbGlkemluaS5sdi8iXVtzdHlsZT0iZGlzcGxheTogYmxvY2s7IHdpZHRoOiA4OHB4OyBoZWlnaHQ6IDMxcHg7IG92ZXJmbG93OiBoaWRkZW47IHBvc2l0aW9uOiByZWxhdGl2ZTsiXQ==")
    ],
    listKr: [
      fromB64("YVtocmVmKj0iLy9hZC5wbGFuYnBsdXMuY28ua3IvIl0="),
      fromB64("I2xpdmVyZUFkV3JhcHBlcg=="),
      fromB64("YVtocmVmKj0iLy9hZHYuaW1hZHJlcC5jby5rci8iXQ=="),
      fromB64("aW5zLmZhc3R2aWV3LWFk"),
      ".revenue_unit_item.dable"
    ],
    listeAr: [
      fromB64("LmdlbWluaUxCMUFk"),
      ".right-and-left-sponsers",
      fromB64("YVtocmVmKj0iLmFmbGFtLmluZm8iXQ=="),
      fromB64("YVtocmVmKj0iYm9vcmFxLm9yZyJd"),
      fromB64("YVtocmVmKj0iZHViaXp6bGUuY29tL2FyLz91dG1fc291cmNlPSJd")
    ],
    listeFr: [
      fromB64("YVtocmVmXj0iaHR0cDovL3Byb21vLnZhZG9yLmNvbS8iXQ=="),
      fromB64("I2FkY29udGFpbmVyX3JlY2hlcmNoZQ=="),
      fromB64("YVtocmVmKj0id2Vib3JhbWEuZnIvZmNnaS1iaW4vIl0="),
      ".site-pub-interstitiel",
      'div[id^="crt-"][data-criteo-id]'
    ],
    officialPolish: [
      "#ceneo-placeholder-ceneo-12",
      fromB64("W2hyZWZePSJodHRwczovL2FmZi5zZW5kaHViLnBsLyJd"),
      fromB64("YVtocmVmXj0iaHR0cDovL2Fkdm1hbmFnZXIudGVjaGZ1bi5wbC9yZWRpcmVjdC8iXQ=="),
      fromB64("YVtocmVmXj0iaHR0cDovL3d3dy50cml6ZXIucGwvP3V0bV9zb3VyY2UiXQ=="),
      fromB64("ZGl2I3NrYXBpZWNfYWQ=")
    ],
    ro: [
      fromB64("YVtocmVmXj0iLy9hZmZ0cmsuYWx0ZXgucm8vQ291bnRlci9DbGljayJd"),
      fromB64("YVtocmVmXj0iaHR0cHM6Ly9ibGFja2ZyaWRheXNhbGVzLnJvL3Ryay9zaG9wLyJd"),
      fromB64("YVtocmVmXj0iaHR0cHM6Ly9ldmVudC4ycGVyZm9ybWFudC5jb20vZXZlbnRzL2NsaWNrIl0="),
      fromB64("YVtocmVmXj0iaHR0cHM6Ly9sLnByb2ZpdHNoYXJlLnJvLyJd"),
      'a[href^="/url/"]'
    ],
    ruAd: [
      fromB64("YVtocmVmKj0iLy9mZWJyYXJlLnJ1LyJd"),
      fromB64("YVtocmVmKj0iLy91dGltZy5ydS8iXQ=="),
      fromB64("YVtocmVmKj0iOi8vY2hpa2lkaWtpLnJ1Il0="),
      "#pgeldiz",
      ".yandex-rtb-block"
    ],
    thaiAds: [
      "a[href*=macau-uta-popup]",
      fromB64("I2Fkcy1nb29nbGUtbWlkZGxlX3JlY3RhbmdsZS1ncm91cA=="),
      fromB64("LmFkczMwMHM="),
      ".bumq",
      ".img-kosana"
    ],
    webAnnoyancesUltralist: [
      "#mod-social-share-2",
      "#social-tools",
      fromB64("LmN0cGwtZnVsbGJhbm5lcg=="),
      ".zergnet-recommend",
      ".yt.btn-link.btn-md.btn"
    ]
  };
}
async function getDomBlockers({ debug } = {}) {
  if (!isApplicable()) {
    return void 0;
  }
  const filters = getFilters();
  const filterNames = Object.keys(filters);
  const allSelectors = [].concat(...filterNames.map((filterName) => filters[filterName]));
  const blockedSelectors = await getBlockedSelectors(allSelectors);
  if (debug) {
    printDebug(filters, blockedSelectors);
  }
  const activeBlockers = filterNames.filter((filterName) => {
    const selectors = filters[filterName];
    const blockedCount = countTruthy(selectors.map((selector) => blockedSelectors[selector]));
    return blockedCount > selectors.length * 0.6;
  });
  activeBlockers.sort();
  return activeBlockers;
}
function isApplicable() {
  return isWebKit() || isAndroid();
}
async function getBlockedSelectors(selectors) {
  var _a;
  const d = document;
  const root = d.createElement("div");
  const elements = new Array(selectors.length);
  const blockedSelectors = {};
  forceShow(root);
  for (let i = 0; i < selectors.length; ++i) {
    const element = selectorToElement(selectors[i]);
    if (element.tagName === "DIALOG") {
      element.show();
    }
    const holder = d.createElement("div");
    forceShow(holder);
    holder.appendChild(element);
    root.appendChild(holder);
    elements[i] = element;
  }
  while (!d.body) {
    await wait(50);
  }
  d.body.appendChild(root);
  try {
    for (let i = 0; i < selectors.length; ++i) {
      if (!elements[i].offsetParent) {
        blockedSelectors[selectors[i]] = true;
      }
    }
  } finally {
    (_a = root.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(root);
  }
  return blockedSelectors;
}
function forceShow(element) {
  element.style.setProperty("visibility", "hidden", "important");
  element.style.setProperty("display", "block", "important");
}
function printDebug(filters, blockedSelectors) {
  let message = "DOM blockers debug:\n```";
  for (const filterName of Object.keys(filters)) {
    message += `
${filterName}:`;
    for (const selector of filters[filterName]) {
      message += `
  ${blockedSelectors[selector] ? "🚫" : "➡️"} ${selector}`;
    }
  }
  console.log(`${message}
\`\`\``);
}
function getColorGamut() {
  for (const gamut of ["rec2020", "p3", "srgb"]) {
    if (matchMedia(`(color-gamut: ${gamut})`).matches) {
      return gamut;
    }
  }
  return void 0;
}
function areColorsInverted() {
  if (doesMatch$5("inverted")) {
    return true;
  }
  if (doesMatch$5("none")) {
    return false;
  }
  return void 0;
}
function doesMatch$5(value) {
  return matchMedia(`(inverted-colors: ${value})`).matches;
}
function areColorsForced() {
  if (doesMatch$4("active")) {
    return true;
  }
  if (doesMatch$4("none")) {
    return false;
  }
  return void 0;
}
function doesMatch$4(value) {
  return matchMedia(`(forced-colors: ${value})`).matches;
}
var maxValueToCheck = 100;
function getMonochromeDepth() {
  if (!matchMedia("(min-monochrome: 0)").matches) {
    return void 0;
  }
  for (let i = 0; i <= maxValueToCheck; ++i) {
    if (matchMedia(`(max-monochrome: ${i})`).matches) {
      return i;
    }
  }
  throw new Error("Too high value");
}
function getContrastPreference() {
  if (doesMatch$3("no-preference")) {
    return 0;
  }
  if (doesMatch$3("high") || doesMatch$3("more")) {
    return 1;
  }
  if (doesMatch$3("low") || doesMatch$3("less")) {
    return -1;
  }
  if (doesMatch$3("forced")) {
    return 10;
  }
  return void 0;
}
function doesMatch$3(value) {
  return matchMedia(`(prefers-contrast: ${value})`).matches;
}
function isMotionReduced() {
  if (doesMatch$2("reduce")) {
    return true;
  }
  if (doesMatch$2("no-preference")) {
    return false;
  }
  return void 0;
}
function doesMatch$2(value) {
  return matchMedia(`(prefers-reduced-motion: ${value})`).matches;
}
function isTransparencyReduced() {
  if (doesMatch$1("reduce")) {
    return true;
  }
  if (doesMatch$1("no-preference")) {
    return false;
  }
  return void 0;
}
function doesMatch$1(value) {
  return matchMedia(`(prefers-reduced-transparency: ${value})`).matches;
}
function isHDR() {
  if (doesMatch("high")) {
    return true;
  }
  if (doesMatch("standard")) {
    return false;
  }
  return void 0;
}
function doesMatch(value) {
  return matchMedia(`(dynamic-range: ${value})`).matches;
}
var M = Math;
var fallbackFn = () => 0;
function getMathFingerprint() {
  const acos = M.acos || fallbackFn;
  const acosh = M.acosh || fallbackFn;
  const asin = M.asin || fallbackFn;
  const asinh = M.asinh || fallbackFn;
  const atanh = M.atanh || fallbackFn;
  const atan = M.atan || fallbackFn;
  const sin = M.sin || fallbackFn;
  const sinh = M.sinh || fallbackFn;
  const cos = M.cos || fallbackFn;
  const cosh = M.cosh || fallbackFn;
  const tan = M.tan || fallbackFn;
  const tanh = M.tanh || fallbackFn;
  const exp = M.exp || fallbackFn;
  const expm1 = M.expm1 || fallbackFn;
  const log1p = M.log1p || fallbackFn;
  const powPI = (value) => M.pow(M.PI, value);
  const acoshPf = (value) => M.log(value + M.sqrt(value * value - 1));
  const asinhPf = (value) => M.log(value + M.sqrt(value * value + 1));
  const atanhPf = (value) => M.log((1 + value) / (1 - value)) / 2;
  const sinhPf = (value) => M.exp(value) - 1 / M.exp(value) / 2;
  const coshPf = (value) => (M.exp(value) + 1 / M.exp(value)) / 2;
  const expm1Pf = (value) => M.exp(value) - 1;
  const tanhPf = (value) => (M.exp(2 * value) - 1) / (M.exp(2 * value) + 1);
  const log1pPf = (value) => M.log(1 + value);
  return {
    acos: acos(0.12312423423423424),
    acosh: acosh(1e308),
    acoshPf: acoshPf(1e154),
    asin: asin(0.12312423423423424),
    asinh: asinh(1),
    asinhPf: asinhPf(1),
    atanh: atanh(0.5),
    atanhPf: atanhPf(0.5),
    atan: atan(0.5),
    sin: sin(-1e300),
    sinh: sinh(1),
    sinhPf: sinhPf(1),
    cos: cos(10.000000000123),
    cosh: cosh(1),
    coshPf: coshPf(1),
    tan: tan(-1e300),
    tanh: tanh(1),
    tanhPf: tanhPf(1),
    exp: exp(1),
    expm1: expm1(1),
    expm1Pf: expm1Pf(1),
    log1p: log1p(10),
    log1pPf: log1pPf(10),
    powPI: powPI(-100)
  };
}
var defaultText = "mmMwWLliI0fiflO&1";
var presets = {
  /**
   * The default font. User can change it in desktop Chrome, desktop Firefox, IE 11,
   * Android Chrome (but only when the size is ≥ than the default) and Android Firefox.
   */
  default: [],
  /** OS font on macOS. User can change its size and weight. Applies after Safari restart. */
  apple: [{ font: "-apple-system-body" }],
  /** User can change it in desktop Chrome and desktop Firefox. */
  serif: [{ fontFamily: "serif" }],
  /** User can change it in desktop Chrome and desktop Firefox. */
  sans: [{ fontFamily: "sans-serif" }],
  /** User can change it in desktop Chrome and desktop Firefox. */
  mono: [{ fontFamily: "monospace" }],
  /**
   * Check the smallest allowed font size. User can change it in desktop Chrome, desktop Firefox and desktop Safari.
   * The height can be 0 in Chrome on a retina display.
   */
  min: [{ fontSize: "1px" }],
  /** Tells one OS from another in desktop Chrome. */
  system: [{ fontFamily: "system-ui" }]
};
function getFontPreferences() {
  return withNaturalFonts((document2, container) => {
    const elements = {};
    const sizes = {};
    for (const key of Object.keys(presets)) {
      const [style = {}, text = defaultText] = presets[key];
      const element = document2.createElement("span");
      element.textContent = text;
      element.style.whiteSpace = "nowrap";
      for (const name of Object.keys(style)) {
        const value = style[name];
        if (value !== void 0) {
          element.style[name] = value;
        }
      }
      elements[key] = element;
      container.append(document2.createElement("br"), element);
    }
    for (const key of Object.keys(presets)) {
      sizes[key] = elements[key].getBoundingClientRect().width;
    }
    return sizes;
  });
}
function withNaturalFonts(action, containerWidthPx = 4e3) {
  return withIframe((_, iframeWindow) => {
    const iframeDocument = iframeWindow.document;
    const iframeBody = iframeDocument.body;
    const bodyStyle = iframeBody.style;
    bodyStyle.width = `${containerWidthPx}px`;
    bodyStyle.webkitTextSizeAdjust = bodyStyle.textSizeAdjust = "none";
    if (isChromium()) {
      iframeBody.style.zoom = `${1 / iframeWindow.devicePixelRatio}`;
    } else if (isWebKit()) {
      iframeBody.style.zoom = "reset";
    }
    const linesOfText = iframeDocument.createElement("div");
    linesOfText.textContent = [...Array(containerWidthPx / 20 << 0)].map(() => "word").join(" ");
    iframeBody.appendChild(linesOfText);
    return action(iframeDocument, iframeBody);
  }, '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">');
}
function isPdfViewerEnabled() {
  return navigator.pdfViewerEnabled;
}
function getArchitecture() {
  const f = new Float32Array(1);
  const u8 = new Uint8Array(f.buffer);
  f[0] = Infinity;
  f[0] = f[0] - f[0];
  return u8[3];
}
function getApplePayState() {
  const { ApplePaySession } = window;
  if (typeof (ApplePaySession === null || ApplePaySession === void 0 ? void 0 : ApplePaySession.canMakePayments) !== "function") {
    return -1;
  }
  if (willPrintConsoleError()) {
    return -3;
  }
  try {
    return ApplePaySession.canMakePayments() ? 1 : 0;
  } catch (error) {
    return getStateFromError(error);
  }
}
var willPrintConsoleError = isAnyParentCrossOrigin;
function getStateFromError(error) {
  if (error instanceof Error && error.name === "InvalidAccessError" && /\bfrom\b.*\binsecure\b/i.test(error.message)) {
    return -2;
  }
  throw error;
}
function getPrivateClickMeasurement() {
  var _a;
  const link = document.createElement("a");
  const sourceId = (_a = link.attributionSourceId) !== null && _a !== void 0 ? _a : link.attributionsourceid;
  return sourceId === void 0 ? void 0 : String(sourceId);
}
var STATUS_NO_GL_CONTEXT = -1;
var STATUS_GET_PARAMETER_NOT_A_FUNCTION = -2;
var validContextParameters = /* @__PURE__ */ new Set([
  10752,
  2849,
  2884,
  2885,
  2886,
  2928,
  2929,
  2930,
  2931,
  2932,
  2960,
  2961,
  2962,
  2963,
  2964,
  2965,
  2966,
  2967,
  2968,
  2978,
  3024,
  3042,
  3088,
  3089,
  3106,
  3107,
  32773,
  32777,
  32777,
  32823,
  32824,
  32936,
  32937,
  32938,
  32939,
  32968,
  32969,
  32970,
  32971,
  3317,
  33170,
  3333,
  3379,
  3386,
  33901,
  33902,
  34016,
  34024,
  34076,
  3408,
  3410,
  3411,
  3412,
  3413,
  3414,
  3415,
  34467,
  34816,
  34817,
  34818,
  34819,
  34877,
  34921,
  34930,
  35660,
  35661,
  35724,
  35738,
  35739,
  36003,
  36004,
  36005,
  36347,
  36348,
  36349,
  37440,
  37441,
  37443,
  7936,
  7937,
  7938
  // SAMPLE_ALPHA_TO_COVERAGE (32926) and SAMPLE_COVERAGE (32928) are excluded because they trigger a console warning
  // in IE, Chrome ≤ 59 and Safari ≤ 13 and give no entropy.
]);
var validExtensionParams = /* @__PURE__ */ new Set([
  34047,
  35723,
  36063,
  34852,
  34853,
  34854,
  34229,
  36392,
  36795,
  38449
  // MAX_VIEWS_OVR
]);
var shaderTypes = ["FRAGMENT_SHADER", "VERTEX_SHADER"];
var precisionTypes = ["LOW_FLOAT", "MEDIUM_FLOAT", "HIGH_FLOAT", "LOW_INT", "MEDIUM_INT", "HIGH_INT"];
var rendererInfoExtensionName = "WEBGL_debug_renderer_info";
var polygonModeExtensionName = "WEBGL_polygon_mode";
function getWebGlBasics({ cache }) {
  var _a, _b, _c, _d, _e, _f;
  const gl = getWebGLContext(cache);
  if (!gl) {
    return STATUS_NO_GL_CONTEXT;
  }
  if (!isValidParameterGetter(gl)) {
    return STATUS_GET_PARAMETER_NOT_A_FUNCTION;
  }
  const debugExtension = shouldAvoidDebugRendererInfo() ? null : gl.getExtension(rendererInfoExtensionName);
  return {
    version: ((_a = gl.getParameter(gl.VERSION)) === null || _a === void 0 ? void 0 : _a.toString()) || "",
    vendor: ((_b = gl.getParameter(gl.VENDOR)) === null || _b === void 0 ? void 0 : _b.toString()) || "",
    vendorUnmasked: debugExtension ? (_c = gl.getParameter(debugExtension.UNMASKED_VENDOR_WEBGL)) === null || _c === void 0 ? void 0 : _c.toString() : "",
    renderer: ((_d = gl.getParameter(gl.RENDERER)) === null || _d === void 0 ? void 0 : _d.toString()) || "",
    rendererUnmasked: debugExtension ? (_e = gl.getParameter(debugExtension.UNMASKED_RENDERER_WEBGL)) === null || _e === void 0 ? void 0 : _e.toString() : "",
    shadingLanguageVersion: ((_f = gl.getParameter(gl.SHADING_LANGUAGE_VERSION)) === null || _f === void 0 ? void 0 : _f.toString()) || ""
  };
}
function getWebGlExtensions({ cache }) {
  const gl = getWebGLContext(cache);
  if (!gl) {
    return STATUS_NO_GL_CONTEXT;
  }
  if (!isValidParameterGetter(gl)) {
    return STATUS_GET_PARAMETER_NOT_A_FUNCTION;
  }
  const extensions = gl.getSupportedExtensions();
  const contextAttributes = gl.getContextAttributes();
  const unsupportedExtensions = [];
  const attributes = [];
  const parameters = [];
  const extensionParameters = [];
  const shaderPrecisions = [];
  if (contextAttributes) {
    for (const attributeName of Object.keys(contextAttributes)) {
      attributes.push(`${attributeName}=${contextAttributes[attributeName]}`);
    }
  }
  const constants = getConstantsFromPrototype(gl);
  for (const constant of constants) {
    const code = gl[constant];
    parameters.push(`${constant}=${code}${validContextParameters.has(code) ? `=${gl.getParameter(code)}` : ""}`);
  }
  if (extensions) {
    for (const name of extensions) {
      if (name === rendererInfoExtensionName && shouldAvoidDebugRendererInfo() || name === polygonModeExtensionName && shouldAvoidPolygonModeExtensions()) {
        continue;
      }
      const extension = gl.getExtension(name);
      if (!extension) {
        unsupportedExtensions.push(name);
        continue;
      }
      for (const constant of getConstantsFromPrototype(extension)) {
        const code = extension[constant];
        extensionParameters.push(`${constant}=${code}${validExtensionParams.has(code) ? `=${gl.getParameter(code)}` : ""}`);
      }
    }
  }
  for (const shaderType of shaderTypes) {
    for (const precisionType of precisionTypes) {
      const shaderPrecision = getShaderPrecision(gl, shaderType, precisionType);
      shaderPrecisions.push(`${shaderType}.${precisionType}=${shaderPrecision.join(",")}`);
    }
  }
  extensionParameters.sort();
  parameters.sort();
  return {
    contextAttributes: attributes,
    parameters,
    shaderPrecisions,
    extensions,
    extensionParameters,
    unsupportedExtensions
  };
}
function getWebGLContext(cache) {
  if (cache.webgl) {
    return cache.webgl.context;
  }
  const canvas = document.createElement("canvas");
  let context;
  canvas.addEventListener("webglCreateContextError", () => context = void 0);
  for (const type of ["webgl", "experimental-webgl"]) {
    try {
      context = canvas.getContext(type);
    } catch (_a) {
    }
    if (context) {
      break;
    }
  }
  cache.webgl = { context };
  return context;
}
function getShaderPrecision(gl, shaderType, precisionType) {
  const shaderPrecision = gl.getShaderPrecisionFormat(gl[shaderType], gl[precisionType]);
  return shaderPrecision ? [shaderPrecision.rangeMin, shaderPrecision.rangeMax, shaderPrecision.precision] : [];
}
function getConstantsFromPrototype(obj) {
  const keys = Object.keys(obj.__proto__);
  return keys.filter(isConstantLike);
}
function isConstantLike(key) {
  return typeof key === "string" && !key.match(/[^A-Z0-9_x]/);
}
function shouldAvoidDebugRendererInfo() {
  return isGecko();
}
function shouldAvoidPolygonModeExtensions() {
  return isChromium() || isWebKit();
}
function isValidParameterGetter(gl) {
  return typeof gl.getParameter === "function";
}
function getAudioContextBaseLatency() {
  const isAllowedPlatform = isAndroid() || isWebKit();
  if (!isAllowedPlatform) {
    return -2;
  }
  if (!window.AudioContext) {
    return -1;
  }
  const latency = new AudioContext().baseLatency;
  if (latency === null || latency === void 0) {
    return -1;
  }
  if (!isFinite(latency)) {
    return -3;
  }
  return latency;
}
function getDateTimeLocale() {
  if (!window.Intl) {
    return -1;
  }
  const DateTimeFormat = window.Intl.DateTimeFormat;
  if (!DateTimeFormat) {
    return -2;
  }
  const locale = DateTimeFormat().resolvedOptions().locale;
  if (!locale && locale !== "") {
    return -3;
  }
  return locale;
}
var sources = {
  // READ FIRST:
  // See https://github.com/fingerprintjs/fingerprintjs/blob/master/contributing.md#how-to-add-an-entropy-source
  // to learn how entropy source works and how to make your own.
  // The sources run in this exact order.
  // The asynchronous sources are at the start to run in parallel with other sources.
  fonts: getFonts,
  domBlockers: getDomBlockers,
  fontPreferences: getFontPreferences,
  audio: getAudioFingerprint,
  screenFrame: getScreenFrame,
  canvas: getCanvasFingerprint,
  osCpu: getOsCpu,
  languages: getLanguages,
  colorDepth: getColorDepth,
  deviceMemory: getDeviceMemory,
  screenResolution: getScreenResolution,
  hardwareConcurrency: getHardwareConcurrency,
  timezone: getTimezone,
  sessionStorage: getSessionStorage,
  localStorage: getLocalStorage,
  indexedDB: getIndexedDB,
  openDatabase: getOpenDatabase,
  cpuClass: getCpuClass,
  platform: getPlatform,
  plugins: getPlugins,
  touchSupport: getTouchSupport,
  vendor: getVendor,
  vendorFlavors: getVendorFlavors,
  cookiesEnabled: areCookiesEnabled,
  colorGamut: getColorGamut,
  invertedColors: areColorsInverted,
  forcedColors: areColorsForced,
  monochrome: getMonochromeDepth,
  contrast: getContrastPreference,
  reducedMotion: isMotionReduced,
  reducedTransparency: isTransparencyReduced,
  hdr: isHDR,
  math: getMathFingerprint,
  pdfViewerEnabled: isPdfViewerEnabled,
  architecture: getArchitecture,
  applePay: getApplePayState,
  privateClickMeasurement: getPrivateClickMeasurement,
  audioBaseLatency: getAudioContextBaseLatency,
  dateTimeLocale: getDateTimeLocale,
  // Some sources can affect other sources (e.g. WebGL can affect canvas), so it's important to run these sources
  // after other sources.
  webGlBasics: getWebGlBasics,
  webGlExtensions: getWebGlExtensions
};
function loadBuiltinSources(options) {
  return loadSources(sources, options, []);
}
var commentTemplate = "$ if upgrade to Pro: https://fpjs.dev/pro";
function getConfidence(components) {
  const openConfidenceScore = getOpenConfidenceScore(components);
  const proConfidenceScore = deriveProConfidenceScore(openConfidenceScore);
  return { score: openConfidenceScore, comment: commentTemplate.replace(/\$/g, `${proConfidenceScore}`) };
}
function getOpenConfidenceScore(components) {
  if (isAndroid()) {
    return 0.4;
  }
  if (isWebKit()) {
    return isDesktopWebKit() && !(isWebKit616OrNewer() && isSafariWebKit()) ? 0.5 : 0.3;
  }
  const platform = "value" in components.platform ? components.platform.value : "";
  if (/^Win/.test(platform)) {
    return 0.6;
  }
  if (/^Mac/.test(platform)) {
    return 0.5;
  }
  return 0.7;
}
function deriveProConfidenceScore(openConfidenceScore) {
  return round(0.99 + 0.01 * openConfidenceScore, 1e-4);
}
function componentsToCanonicalString(components) {
  let result = "";
  for (const componentKey of Object.keys(components).sort()) {
    const component = components[componentKey];
    const value = "error" in component ? "error" : JSON.stringify(component.value);
    result += `${result ? "|" : ""}${componentKey.replace(/([:|\\])/g, "\\$1")}:${value}`;
  }
  return result;
}
function componentsToDebugString(components) {
  return JSON.stringify(components, (_key, value) => {
    if (value instanceof Error) {
      return errorToObject(value);
    }
    return value;
  }, 2);
}
function hashComponents(components) {
  return x64hash128(componentsToCanonicalString(components));
}
function makeLazyGetResult(components) {
  let visitorIdCache;
  const confidence = getConfidence(components);
  return {
    get visitorId() {
      if (visitorIdCache === void 0) {
        visitorIdCache = hashComponents(this.components);
      }
      return visitorIdCache;
    },
    set visitorId(visitorId) {
      visitorIdCache = visitorId;
    },
    confidence,
    components,
    version
  };
}
function prepareForSources(delayFallback = 50) {
  return requestIdleCallbackIfAvailable(delayFallback, delayFallback * 2);
}
function makeAgent(getComponents, debug) {
  const creationTime = Date.now();
  return {
    async get(options) {
      const startTime = Date.now();
      const components = await getComponents();
      const result = makeLazyGetResult(components);
      if (debug || (options === null || options === void 0 ? void 0 : options.debug)) {
        console.log(`Copy the text below to get the debug data:

\`\`\`
version: ${result.version}
userAgent: ${navigator.userAgent}
timeBetweenLoadAndGet: ${startTime - creationTime}
visitorId: ${result.visitorId}
components: ${componentsToDebugString(components)}
\`\`\``);
      }
      return result;
    }
  };
}
function monitor() {
  if (window.__fpjs_d_m || Math.random() >= 1e-3) {
    return;
  }
  try {
    const request = new XMLHttpRequest();
    request.open("get", `https://m1.openfpcdn.io/fingerprintjs/v${version}/npm-monitoring`, true);
    request.send();
  } catch (error) {
    console.error(error);
  }
}
async function load(options = {}) {
  var _a;
  if ((_a = options.monitoring) !== null && _a !== void 0 ? _a : true) {
    monitor();
  }
  const { delayFallback, debug } = options;
  await prepareForSources(delayFallback);
  const getComponents = loadBuiltinSources({ cache: {}, debug });
  return makeAgent(getComponents, debug);
}
var index = { load, hashComponents, componentsToDebugString };
var murmurX64Hash128 = x64hash128;
export {
  componentsToDebugString,
  index as default,
  getFullscreenElement,
  getUnstableAudioFingerprint,
  getUnstableCanvasFingerprint,
  getUnstableScreenFrame,
  getUnstableScreenResolution,
  getWebGLContext,
  hashComponents,
  isAndroid,
  isChromium,
  isDesktopWebKit,
  isEdgeHTML,
  isGecko,
  isSamsungInternet,
  isTrident,
  isWebKit,
  load,
  loadSources,
  murmurX64Hash128,
  prepareForSources,
  sources,
  transformSource,
  withIframe
};
//# sourceMappingURL=@fingerprintjs_fingerprintjs.js.map

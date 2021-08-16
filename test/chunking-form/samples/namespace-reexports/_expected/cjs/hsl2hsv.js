'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var hsl2hsv = (h, s, l) => {
  const t = s * (l < 0.5 ? 1 : 1 - l),
    V = 1 + t,
    S = 2 * t / V ;
  return [h, S, V];
};

var p = 5;

exports["default"] = hsl2hsv;
exports.p = p;

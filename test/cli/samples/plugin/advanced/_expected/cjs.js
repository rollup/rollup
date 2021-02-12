"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var t = function(t) {
  console.log(t);
}, o = function() {
  function o(t) {
    this.x = t;
  }
  return o.prototype.output = function() {
    t(this.x);
  }, o;
}();

new o(123).output(), exports.Bar = o;

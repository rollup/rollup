"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var t = function() {
  function t(t) {
    this.x = t;
  }
  return t.prototype.output = function() {
    var t;
    t = this.x, console.log(t);
  }, t;
}();

new t(123).output(), exports.Bar = t;

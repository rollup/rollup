"use strict";

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

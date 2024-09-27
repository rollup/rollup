"use strict";

var t, o, n, r = {};

function u() {
  return o ? t : (o = 1, t = function(t) {
    console.log(t);
  });
}

var i = function() {
  if (n) return r;
  n = 1;
  var t = u();
  return r.Foo = function() {
    function o(t) {
      this.x = t;
    }
    return o.prototype.output = function() {
      t(this.x);
    }, o;
  }(), r;
}();

new i.Foo(123).output(), exports.Bar = i.Foo;

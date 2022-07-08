"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
}), console.log("esm-test: node_modules/print/index.js");

console.log("esm-test: node_modules/foo/index.js");

var print = function(value) {
  console.log(value);
}, Foo = function() {
  function Foo(x) {
    this.x = x;
  }
  return Foo.prototype.output = function() {
    print(this.x);
  }, Foo;
}();

console.log("esm-test: main.js"), new Foo(123).output(), exports.Bar = Foo;

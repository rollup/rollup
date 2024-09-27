"use strict";

var print, hasRequiredPrint, hasRequiredFoo, foo$1 = {};

function requirePrint() {
  return hasRequiredPrint ? print : (hasRequiredPrint = 1, print = function(value) {
    console.log(value);
  });
}

console.log("esm-test: node_modules/print/index.js"), console.log("esm-test: node_modules/foo/index.js");

var fooExports = function() {
  if (hasRequiredFoo) return foo$1;
  hasRequiredFoo = 1;
  var print = requirePrint();
  return foo$1.Foo = function() {
    function Foo(x) {
      this.x = x;
    }
    return Foo.prototype.output = function() {
      print(this.x);
    }, Foo;
  }(), foo$1;
}();

console.log("esm-test: main.js"), new fooExports.Foo(123).output(), exports.Bar = fooExports.Foo;

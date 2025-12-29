System.register(['./generated-a.js'], (function (exports) {
  'use strict';
  var A;
  return {
    setters: [function (module) {
      A = module.A;
    }],
    execute: (function () {

      class Foo extends A {
        foo() { console.log("hello"); }
      } exports("default", Foo);

    })
  };
}));

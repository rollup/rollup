System.register(['./generated-a.js', './generated-foo.js'], (function () {
  'use strict';
  var A, Foo;
  return {
    setters: [function (module) {
      A = module.A;
    }, function (module) {
      Foo = module.default;
    }],
    execute: (function () {

      class Bar extends A {
        bar() {
          return new Foo().foo();
        }
      }

      new Bar().bar();

    })
  };
}));

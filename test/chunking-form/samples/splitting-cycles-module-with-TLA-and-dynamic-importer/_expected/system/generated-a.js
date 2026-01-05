System.register([], (function (exports, module) {
  'use strict';
  return {
    execute: (async function () {

      class B {
        async foo() {
          const foo = await module.import('./generated-foo.js');
          return new foo.Foo();
        }
      }
      await Promise.resolve();

      class A extends B {} exports("A", A);

    })
  };
}));

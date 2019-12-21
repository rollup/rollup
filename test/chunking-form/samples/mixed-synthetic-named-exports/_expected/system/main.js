System.register([], function () {
  'use strict';
  return {
    execute: function () {

      const d = {
        fn: 42,
        hello: 'hola'
      };
      const foo = 100;

      var ns = /*#__PURE__*/Object.freeze(Object.assign({
        __proto__: null,
        foo: foo
      }, d));

      var fn = d.fn;

      console.log(fn);
      console.log(foo);
      console.log(ns);

    }
  };
});

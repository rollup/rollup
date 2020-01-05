System.register([], function (exports) {
  'use strict';
  return {
    execute: function () {

      const d = {
        fn: 42,
        hello: 'hola'
      };
      const foo = exports('foo', 100);

      var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign({
        __proto__: null,
        foo: foo,
        'default': d
      }, d));

      console.log(d.fn);
      console.log(foo);
      console.log(ns);

      exports('fn', d.fn);

    }
  };
});

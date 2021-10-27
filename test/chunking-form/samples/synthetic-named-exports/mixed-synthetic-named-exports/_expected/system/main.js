System.register([], (function (exports) {
  'use strict';
  return {
    execute: (function () {

      function _mergeNamespaces(n, m) {
        m.forEach(function (e) {
          e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
            if (k !== 'default' && !(k in n)) {
              var d = Object.getOwnPropertyDescriptor(e, k);
              Object.defineProperty(n, k, d.get ? d : {
                enumerable: true,
                get: function () { return e[k]; }
              });
            }
          });
        });
        return Object.freeze(n);
      }

      const d = {
        fn: 42,
        hello: 'hola'
      };
      const foo = exports('foo', 100);

      var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
        __proto__: null,
        foo: foo,
        'default': d
      }, [d]));

      const stuff = 12;
      console.log(stuff);

      console.log(d.fn);
      console.log(foo);
      console.log(ns);

      exports({
        fn: d.fn,
        stuff: d.stuff
      });

    })
  };
}));

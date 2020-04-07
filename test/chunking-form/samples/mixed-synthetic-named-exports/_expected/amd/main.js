define(['exports'], function (exports) { 'use strict';

  const d = {
    fn: 42,
    hello: 'hola'
  };
  const foo = 100;

  var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), d, {
    foo: foo,
    'default': d
  }));

  const stuff = 12;
  console.log(stuff);

  console.log(d.fn);
  console.log(foo);
  console.log(ns);

  exports.fn = d.fn;
  exports.foo = foo;
  exports.stuff = d.stuff;

  Object.defineProperty(exports, '__esModule', { value: true });

});

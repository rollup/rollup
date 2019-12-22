System.register([], function () {
  'use strict';
  return {
    execute: function () {

      const d = {
        fn: 42,
        hello: 'hola'
      };

      var ns = d;

      console.log(d.fn);
      console.log(d.foo);
      console.log(ns);

    }
  };
});

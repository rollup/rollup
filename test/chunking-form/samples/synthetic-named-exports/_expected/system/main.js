System.register([], function () {
  'use strict';
  return {
    execute: function () {

      const d = {
        fn: 42,
        hello: 'hola'
      };

      console.log(d.fn);
      console.log(d.foo);
      console.log(d["some-prop"]);

    }
  };
});

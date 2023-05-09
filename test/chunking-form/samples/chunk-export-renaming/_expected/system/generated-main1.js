System.register([], (function (exports) {
  'use strict';
  return {
    execute: (function () {

      class One {
        test() {
            return ONE_CONSTANT;
        }
      } exports('a', One);

      const ONE_CONSTANT = exports('O', 'oneconstant');

    })
  };
}));

System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      class One {
        test() {
            return ONE_CONSTANT;
        }
      } exports('b', One);

      const ONE_CONSTANT = exports('a', 'oneconstant');

    }
  };
});

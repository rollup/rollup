System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      class One {
        test() {
            return ONE_CONSTANT;
        }
      } exports('One', One);

      const ONE_CONSTANT = exports('ONE_CONSTANT', 'oneconstant');

    }
  };
});

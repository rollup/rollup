define(['exports'], function (exports) { 'use strict';

  class One {
    test() {
        return ONE_CONSTANT;
    }
  }

  const ONE_CONSTANT = 'oneconstant';

  exports.ItemOne = One;
  exports.ONE_CONSTANT = ONE_CONSTANT;

});

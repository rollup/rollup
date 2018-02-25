define(['exports'], function (exports) { 'use strict';

  var dep = 42;

  function log (x) {
    if (dep) {
      console.log(x);
    }
  }

  exports.default = log;
  exports.default$1 = dep;

});

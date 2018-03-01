define(['exports'], function (exports) { 'use strict';

  function fn () {
    console.log('dep1 fn');
  }

  exports.fn = fn;

});

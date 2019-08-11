define(['./generated-lib'], function (lib) { 'use strict';

  function fn () {
    var emptyFunction = lib.emptyFunction;
    console.log(emptyFunction);
  }

  fn();

});

define(['exports'], function (exports) { 'use strict';

  function fn$2 () {
    console.log('lib fn');
  }

  function fn$1 () {
    fn$2();
    console.log(text);
  }

  var text$1 = 'dep1 fn';

  function fn () {
    console.log(text$1);
  }

  var text = 'dep2 fn';

  exports.fn = fn;
  exports.fn$1 = fn$1;

});

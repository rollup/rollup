System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      exports('fn', fn$2);
      exports('fn$1', fn$1);
function fn () {
  console.log('lib fn');
}

function fn$1 () {
  fn();
  console.log(text$1);
  text = exports('text$1', 'dep1 fn after dep2');
}

var text = exports('text$1', 'dep1 fn');

function fn$2 () {
  console.log(text);
  text$1 = exports('text', 'dep2 fn after dep1');
}

var text$1 = exports('text', 'dep2 fn');

    }
  };
});

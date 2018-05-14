'use strict';function fn () {
  console.log('lib2 fn');
};function fn$1 () {
  fn();
  console.log('dep2 fn');
};exports.a=fn$1;
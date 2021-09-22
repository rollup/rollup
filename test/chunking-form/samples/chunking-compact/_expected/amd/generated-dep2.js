define(['exports'],(function(exports){'use strict';function fn$1 () {
  console.log('lib2 fn');
}function fn () {
  fn$1();
  console.log('dep2 fn');
}exports.f=fn;}));
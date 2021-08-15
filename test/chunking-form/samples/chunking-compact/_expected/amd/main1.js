define(['./generated-dep2'],(function(dep2){'use strict';function fn () {
  console.log('dep1 fn');
}class Main1 {
  constructor () {
    fn();
    dep2.f();
  }
}return Main1;}));
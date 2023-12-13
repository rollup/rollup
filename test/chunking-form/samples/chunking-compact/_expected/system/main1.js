System.register(['./generated-dep2.js'],(function(exports){'use strict';var fn$1;return{setters:[function(module){fn$1=module.f;}],execute:(function(){function fn () {
  console.log('dep1 fn');
}class Main1 {
  constructor () {
    fn();
    fn$1();
  }
}exports("default",Main1);})}}));
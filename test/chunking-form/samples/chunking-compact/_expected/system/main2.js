System.register(['./generated-dep2.js','external'],(function(exports){'use strict';var fn$3,fn$2;return{setters:[function(module){fn$3=module.f;},function(module){fn$2=module.fn;}],execute:(function(){function fn$1 () {
  console.log('lib1 fn');
  fn$2();
}function fn () {
  fn$1();
  console.log('dep3 fn');
}class Main2 {
  constructor () {
    fn();
    fn$3();
  }
}exports("default",Main2);})}}));
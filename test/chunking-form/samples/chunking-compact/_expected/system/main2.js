System.register(['./generated-chunk.js','external'],function(exports,module){'use strict';var fn$3,fn$2;return{setters:[function(module){fn$3=module.f;},function(module){fn$2=module.fn;}],execute:function(){function fn () {
  console.log('lib1 fn');
  fn$2();
}function fn$1 () {
  fn();
  console.log('dep3 fn');
}class Main2 {
  constructor () {
    fn$1();
    fn$3();
  }
} exports('default', Main2);}}});
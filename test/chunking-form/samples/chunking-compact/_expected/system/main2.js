System.register(['./generated-chunk.js','external'],function(exports,module){'use strict';var fn$1,fn;return{setters:[function(module){fn$1=module.a;},function(module){fn=module.fn;}],execute:function(){function fn$2 () {
  console.log('lib1 fn');
  fn();
}function fn$3 () {
  fn$2();
  console.log('dep3 fn');
}class Main2 {
  constructor () {
    fn$3();
    fn$1();
  }
} exports('default', Main2);}}});
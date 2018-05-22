System.register(['external','./chunk-ad0e6b97.js'],function(exports,module){'use strict';var fn,fn$1;return{setters:[function(module){fn=module.fn;},function(module){fn$1=module.a;}],execute:function(){function fn$2 () {
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
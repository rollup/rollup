System.register([],(function(exports){'use strict';return{execute:(function(){exports("f",fn);function fn$1 () {
  console.log('lib2 fn');
}function fn () {
  fn$1();
  console.log('dep2 fn');
}})}}));
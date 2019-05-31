define(['./generated-chunk','external'],function(__chunk_1,external){'use strict';function fn () {
  console.log('lib1 fn');
  external.fn();
}function fn$1 () {
  fn();
  console.log('dep3 fn');
}class Main2 {
  constructor () {
    fn$1();
    __chunk_1.f();
  }
}return Main2;});
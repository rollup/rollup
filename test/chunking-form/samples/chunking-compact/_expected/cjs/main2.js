'use strict';var external=require('external'),__chunk_1=require('./chunk-992f09ca.js');function fn () {
  console.log('lib1 fn');
  external.fn();
}function fn$1 () {
  fn();
  console.log('dep3 fn');
}class Main2 {
  constructor () {
    fn$1();
    __chunk_1.a();
  }
}module.exports=Main2;
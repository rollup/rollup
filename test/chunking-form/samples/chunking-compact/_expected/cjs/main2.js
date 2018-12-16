'use strict';var __chunk_1=require('./generated-chunk.js'),external=require('external');function fn () {
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
'use strict';var __chunk_1=require('./generated-chunk.js');function fn () {
  console.log('dep1 fn');
}class Main1 {
  constructor () {
    fn();
    __chunk_1.a();
  }
}module.exports=Main1;
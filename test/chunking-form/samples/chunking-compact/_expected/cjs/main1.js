'use strict';var dep2=require('./generated-chunk.js');function fn () {
  console.log('dep1 fn');
}class Main1 {
  constructor () {
    fn();
    dep2.f();
  }
}module.exports=Main1;
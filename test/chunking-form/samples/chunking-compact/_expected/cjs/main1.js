'use strict';var dep2=require('./generated-dep2.js');function fn () {
  console.log('dep1 fn');
}class Main1 {
  constructor () {
    fn();
    dep2.f();
  }
}module.exports=Main1;
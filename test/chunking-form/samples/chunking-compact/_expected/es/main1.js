import {a as fn$1}from'./generated-chunk.js';function fn () {
  console.log('dep1 fn');
}class Main1 {
  constructor () {
    fn();
    fn$1();
  }
}export default Main1;
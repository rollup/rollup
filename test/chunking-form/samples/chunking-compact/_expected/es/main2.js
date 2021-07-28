import {f as fn$3}from'./generated-dep2.js';import {fn as fn$2}from'external';function fn$1 () {
  console.log('lib1 fn');
  fn$2();
}function fn () {
  fn$1();
  console.log('dep3 fn');
}class Main2 {
  constructor () {
    fn();
    fn$3();
  }
}export{Main2 as default};
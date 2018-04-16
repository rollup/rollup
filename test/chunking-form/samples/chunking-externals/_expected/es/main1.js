import { a as fn } from './chunk-54f33655.js';

function fn$1 () {
  console.log('dep1 fn');
}

class Main1 {
  constructor () {
    fn$1();
    fn();
  }
}

export default Main1;

import { f as fn, t as text } from './generated-dep1.js';

class Main1 {
  constructor () {
    fn();
    console.log(text);
  }
}

export { Main1 as default };

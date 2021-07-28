import { a as fn, b as text } from './generated-dep1.js';

class Main2 {
  constructor () {
    fn();
    console.log(text);
  }
}

export { Main2 as default };

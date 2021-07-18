import { fn } from './deps/dep1.js';
import { fn as fn$1 } from './deps/dep2.js';

class Main1 {
  constructor () {
    fn();
    fn$1();
  }
}

export { Main1 as default };

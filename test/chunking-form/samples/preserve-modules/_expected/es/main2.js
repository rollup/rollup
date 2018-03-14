import { fn } from './deps/dep2.js';
import { fn as fn$1 } from './deps/dep3.js';

class Main2 {
  constructor () {
    fn$1();
    fn();
  }
}

export default Main2;

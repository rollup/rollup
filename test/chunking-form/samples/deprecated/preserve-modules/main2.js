import { fn } from './deps/dep2.js';
import { fn as fn2, default as treeshaked } from './deps/dep3.js';

if (false) {
  treeshaked();
}

export default class Main2 {
  constructor () {
    fn2();
    fn();
  }
}
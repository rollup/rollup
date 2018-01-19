import { fn } from './dep2.js';
import { fn as fn2, default as treeshaked } from './dep3.js';

if (false) {
  treeshaked();
}

export default class Main2 {
  constructor () {
    fn2();
    fn();
  }
}
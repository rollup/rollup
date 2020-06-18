import { fn } from './dep1.js';
import { fn as fn2 } from './dep2.js';
import { fn as fn3, default as treeshaked } from './dep3.js';

if (false) {
  treeshaked();
}

export default class Main {
  constructor () {
    fn();
    fn2();
    fn3();
  }
}
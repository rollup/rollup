import { fn as libfn, treeshaked } from '../lib/lib1.js';

export function fn () {
  libfn();
  console.log('dep3 fn');
}

export default treeshaked;
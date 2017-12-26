import { text as t } from './dep1.js';
import { fn as libfn } from './lib.js';

export function fn () {
  libfn();
  console.log(t);
}

export var text = 'dep1 fn';
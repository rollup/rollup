import { text as t } from './dep2.js';

export function fn () {
  console.log(t);
}

export var text = 'dep2 fn';
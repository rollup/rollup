import { text as t } from './dep2.js';

export function fn () {
  console.log(t);
  text = 'dep2 fn after dep1';
}

export var text = 'dep2 fn';
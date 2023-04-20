export function foo2() {
  return 'foo2';
}

export function bar2() {
  return 'bar2';
}

export function baz2() {
  return 'baz2';
}

export function qux2() {
  return 'qux2'; // this should be tree-shaken
}

export * from './sub3.js';

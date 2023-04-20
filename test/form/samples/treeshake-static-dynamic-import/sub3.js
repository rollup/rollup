export function foo3() {
  return 'foo3';
}

export function bar3() {
  return 'bar3';
}

export function baz3() {
  return 'baz3';
}

export function qux3() {
  return 'qux3'; // this should be tree-shaken
}

export function foo3() {
  return 'foo3';
}

export function bar3() {
  return 'bar3';
}

export function baz3() {
  return 'baz3'; // this should be tree-shaken
}

console.log('side-effect3')

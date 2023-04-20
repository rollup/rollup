export function foo4() {
  return 'foo4';
}

export function bar4() {
  return 'bar4'; // this should be tree-shaken
}

export function baz4() {
  return 'baz4'; // this should be tree-shaken
}

console.log('side-effect4')

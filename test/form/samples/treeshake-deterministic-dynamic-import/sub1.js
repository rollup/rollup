export function foo1() {
  return 'foo1';
}

export function bar1() {
  return 'bar1'; // this should be tree-shaken
}

console.log('side-effect1');

async function entry() {
  await Promise.resolve().then(function () { return sub1; });
  await Promise.resolve().then(function () { return sub2; });

  Promise.resolve().then(function () { return sub2; }); // this should make sub2.js not be tree-shaken
}

function foo1() {
  return 'foo1';
}

function bar1() {
  return 'bar1'; // this should be tree-shaken
}

console.log('side-effect1');

var sub1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  bar1: bar1,
  foo1: foo1
});

function foo2() {
  return 'foo2';
}

function bar2() {
  return 'bar2';
}

var sub2 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  bar2: bar2,
  foo2: foo2
});

export { entry };

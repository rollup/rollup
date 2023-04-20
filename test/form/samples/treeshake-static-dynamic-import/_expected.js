async function entry() {
  const { foo1: foo } = await Promise.resolve().then(function () { return sub1; });
  const { foo2 } = await Promise.resolve().then(function () { return sub2; });

  Promise.resolve().then(function () { return sub2; }); // this should make sub2.js not be tree-shaken

  console.log(foo(), foo2());
}

function foo1() {
  return 'foo1';
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

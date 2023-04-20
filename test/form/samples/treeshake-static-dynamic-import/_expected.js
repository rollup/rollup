async function entry() {
  // simple
  const { foo1: foo } = await Promise.resolve().then(function () { return sub1; });

  // fail out
  const { foo2 } = await Promise.resolve().then(function () { return sub2; });
  Promise.resolve().then(function () { return sub2; }) // this should make sub2.js not be tree-shaken

  // multiple
  ;(await Promise.resolve().then(function () { return sub3; })).bar3();
  const { foo3, baz3 } = await Promise.resolve().then(function () { return sub3; });
  const { foo4 } = await Promise.resolve().then(function () { return sub3; });

  console.log([
    foo(),
    foo2(),
    foo3(),
    foo4(),
    baz3(),
  ]);
}

function foo1() {
  return 'foo1';
}

console.log('side-effect1');

var sub1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
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

function foo4() {
  return 'foo4';
}

console.log('side-effect4');

function foo3() {
  return 'foo3';
}

function bar3() {
  return 'bar3';
}

function baz3() {
  return 'baz3';
}

var sub3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  bar3: bar3,
  baz3: baz3,
  foo3: foo3,
  foo4: foo4
});

export { entry };

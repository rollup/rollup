async function entry() {
  // simple
  const { foo1: foo } = await Promise.resolve().then(function () { return sub1; });
(await Promise.resolve().then(function () { return sub2; })).bar2();
  await Promise.resolve().then(function () { return sub2; });
  await Promise.resolve().then(function () { return sub2; });
  Promise.resolve().then(function () { return sub2; }).then(({ baz2 }) => baz2);
  Promise.resolve().then(function () { return sub2; }).then(function({ reexported }) { });

  // side-effect only
  Promise.resolve().then(function () { return effect1; });
  await Promise.resolve().then(function () { return effect2; });
  Promise.resolve().then(function () { return effect3; }).then(function() { });
  Promise.resolve().then(function () { return effect4; }).then();
  Promise.resolve().then(function () { return effect5; }).catch(() => {});
  Promise.resolve().then(function () { return effect6; }).finally(() => {});

  // bail out
  await Promise.resolve().then(function () { return bail1$1; });
  Promise.resolve().then(function () { return bail1$1; }); // this make it bail out

  await Promise.resolve().then(function () { return bail2$1; })

  (await Promise.resolve().then(function () { return bail3$1; }))[foo];

  await Promise.resolve().then(function () { return bail4$1; }).name4; // access on promise, not on export

  Promise.resolve().then(function () { return bail5$1; }).then(foo);

  await Promise.resolve().then(function () { return bail6$1; }).then(function({ named6, ...args }) { });

  [
    Promise.resolve().then(function () { return bail7$1; }),
    Promise.resolve().then(function () { return bail8$1; }),
  ];
}

function foo1() {
  return 'foo1';
}

console.log('side-effect1');

var sub1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  foo1: foo1
});

function foo3() {
  return 'foo3';
}

function bar3() {
  return 'bar3';
}

console.log('side-effect3');

function foo2() {
  return 'foo2';
}

function bar2() {
  return 'bar2';
}

function baz2() {
  return 'baz2';
}

var sub2 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  bar2: bar2,
  bar3: bar3,
  baz2: baz2,
  foo2: foo2,
  foo3: foo3,
  reexported: bar3
});

var effect1 = /*#__PURE__*/Object.freeze({
  __proto__: null
});

var effect2 = /*#__PURE__*/Object.freeze({
  __proto__: null
});

var effect3 = /*#__PURE__*/Object.freeze({
  __proto__: null
});

var effect4 = /*#__PURE__*/Object.freeze({
  __proto__: null
});

var effect5 = /*#__PURE__*/Object.freeze({
  __proto__: null
});

var effect6 = /*#__PURE__*/Object.freeze({
  __proto__: null
});

var bail1 = 'should be included 1';
const named1 = 'bail1';

var bail1$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail1,
  named1: named1
});

var bail2 = 'should be included 2';
const named2 = 'bail2';

var bail2$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail2,
  named2: named2
});

var bail3 = 'should be included 3';
const named3 = 'bail3';

var bail3$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail3,
  named3: named3
});

var bail4 = 'should be included 4';
const named4 = 'bail4';

var bail4$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail4,
  named4: named4
});

var bail5 = 'should be included 5';
const named5 = 'bail5';

var bail5$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail5,
  named5: named5
});

var bail6 = 'should be included 6';
const named6 = 'bail6';

var bail6$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail6,
  named6: named6
});

var bail7 = 'should be included 7';
const named7 = 'bail7';

var bail7$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail7,
  named7: named7
});

var bail8 = 'should be included 8';
const named8 = 'bail8';

var bail8$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail8,
  named8: named8
});

export { entry };

async function entry() {
  // simple
  const { foo1: foo } = await Promise.resolve().then(function () { return sub1; });
(await Promise.resolve().then(function () { return sub2; })).bar3();
  await Promise.resolve().then(function () { return sub2; });
  await Promise.resolve().then(function () { return sub2; });

  // bail out
  await Promise.resolve().then(function () { return bail1$1; });
  Promise.resolve().then(function () { return bail1$1; }); // this should make full1.js not be tree-shaken

  await Promise.resolve().then(function () { return bail2$1; })

  (await Promise.resolve().then(function () { return bail3$1; }))[foo];

  await Promise.resolve().then(function () { return bail4$1; }).bail4;
}

function foo1() {
  return 'foo1';
}

console.log('side-effect1');

var sub1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  foo1: foo1
});

function foo4() {
  return 'foo4';
}

console.log('side-effect4');

var sub2 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  foo4: foo4
});

function bail1() {
  return 'bail1';
}

function bailout1() {
  return 'bailout1';
}

var bail1$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  bail1: bail1,
  bailout1: bailout1
});

function bail2() {
  return 'bail2';
}

function bailout2() {
  return 'bailout2';
}

var bail2$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  bail2: bail2,
  bailout2: bailout2
});

function bail3() {
  return 'bail3';
}

function bailout3() {
  return 'bailout3';
}

var bail3$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  bail3: bail3,
  bailout3: bailout3
});

function bail4() {
  return 'bail4';
}

function bailout4() {
  return 'bailout4';
}

var bail4$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  bail4: bail4,
  bailout4: bailout4
});

export { entry };

import * as external from 'external';

function _mergeNamespaces(n, m) {
  m.forEach(function (e) {
    e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
      if (k !== 'default' && !(k in n)) {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  });
  return Object.freeze(n);
}

async function entry() {
  // simple
  const { foo1: foo } = await Promise.resolve().then(function () { return sub1; });
  await Promise.resolve().then(function () { return sub1; });
(await Promise.resolve().then(function () { return sub2; })).bar2();
  await Promise.resolve().then(function () { return sub2; });
  await Promise.resolve().then(function () { return sub2; });
  Promise.resolve().then(function () { return sub2; }).then(({ baz2 }) => baz2);
  Promise.resolve().then(function () { return sub2; }).then(function({ reexported }) { });

  // external with unknown namespace
  await Promise.resolve().then(function () { return sub4; });

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

  await Promise.resolve().then(function () { return bail9$1; });

  Promise.resolve().then(function () { return bail10$1; }).then(({ [foo]: bar }) => {});
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

const foo4 = 3;

var sub4 = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  foo4: foo4
}, [external]);

console.log('@included-effect-1');

var effect1 = /*#__PURE__*/Object.freeze({
  __proto__: null
});

console.log('@included-effect-2');

var effect2 = /*#__PURE__*/Object.freeze({
  __proto__: null
});

console.log('@included-effect-3');

var effect3 = /*#__PURE__*/Object.freeze({
  __proto__: null
});

console.log('@included-effect-4');

var effect4 = /*#__PURE__*/Object.freeze({
  __proto__: null
});

console.log('@included-effect-5');

var effect5 = /*#__PURE__*/Object.freeze({
  __proto__: null
});

console.log('@included-effect-6');

var effect6 = /*#__PURE__*/Object.freeze({
  __proto__: null
});

var bail1 = '@included-bail-1';
const named1 = 'bail1';

var bail1$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail1,
  named1: named1
});

var bail2 = '@included-bail-2';
const named2 = 'bail2';

var bail2$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail2,
  named2: named2
});

var bail3 = '@included-bail-3';
const named3 = 'bail3';

var bail3$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail3,
  named3: named3
});

var bail4 = '@included-bail-4';
const named4 = 'bail4';

var bail4$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail4,
  named4: named4
});

var bail5 = '@included-bail-5';
const named5 = 'bail5';

var bail5$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail5,
  named5: named5
});

var bail6 = '@included-bail-6';
const named6 = 'bail6';

var bail6$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail6,
  named6: named6
});

var bail7 = '@included-bail-7';
const named7 = 'bail7';

var bail7$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail7,
  named7: named7
});

var bail8 = '@included-bail-8';
const named8 = 'bail8';

var bail8$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail8,
  named8: named8
});

var bail9 = '@included-bail-9';
const named9 = 'bail9';

var bail9$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail9,
  named9: named9
});

var bail10 = '@included-bail-10';
const named10 = 'bail10';

var bail10$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: bail10,
  named10: named10
});

export { entry };

const d = {
  fn: 42,
  hello: 'hola'
};
const foo = 100;

var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign({
  __proto__: null,
  foo: foo,
  'default': d
}, d));

const stuff = 12;
console.log(stuff);

console.log(d.fn);
console.log(foo);
console.log(ns);

var fn = d.fn;
var stuff$1 = d.stuff;
export { fn, foo, stuff$1 as stuff };

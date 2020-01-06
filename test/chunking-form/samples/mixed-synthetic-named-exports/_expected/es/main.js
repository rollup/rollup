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

const stuff$1 = 12;
console.log(stuff$1);

console.log(d.fn);
console.log(foo);
console.log(ns);

var fn = d.fn;
var stuff = d.stuff;
export { fn, foo, stuff };

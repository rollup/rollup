var other = {
	foo: 'bar'
};

var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), other, {
	'default': other
}));

console.log(ns, other.foo, other["function"], other["some-prop"]);
console.log(import.meta['function'], import.meta['some-prop']);

let f = 1;
f++;

export { f as function };

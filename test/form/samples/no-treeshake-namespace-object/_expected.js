function foo() {}

var namespace = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
	foo: foo
}, null));

const a = 1;
const b = 2;

export { a, b, namespace as ns1, namespace as ns2 };

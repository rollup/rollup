const foo = 'foo';

var volume = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
	foo: foo
}, null));

const bar = 'bar';

var geometry = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
	bar: bar
}, null));

export { bar as b, foo as f, geometry as g, volume as v };

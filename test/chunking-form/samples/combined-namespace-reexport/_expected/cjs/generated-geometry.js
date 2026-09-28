'use strict';

const foo = 'foo';

var volume = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
	foo: foo
}, null));

const bar = 'bar';

var geometry = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
	bar: bar
}, null));

exports.bar = bar;
exports.foo = foo;
exports.geometry = geometry;
exports.volume = volume;

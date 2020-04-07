define(['exports'], function (exports) { 'use strict';

	var synthetic = {
		foo: 'synthetic-foo',
		bar: 'synthetic-bar',
		baz: 'synthetic-baz',
		default: 'not-in-namespace'
	};
	const foo = 'foo';

	var synthetic$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), synthetic, {
		'default': synthetic,
		foo: foo
	}));

	const bar = 'bar';
	var dep = 'not-overwritten';

	var dep$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), synthetic, {
		bar: bar,
		'default': dep,
		synthetic: synthetic$1,
		foo: foo
	}));

	exports.dep = dep$1;

	Object.defineProperty(exports, '__esModule', { value: true });

});

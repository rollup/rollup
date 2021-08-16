var bundle = (function (exports, external) {
	'use strict';

	var other = {
		foo: 'bar'
	};

	var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), other, {
		default: other
	}));

	console.log(ns, other.foo, other.function, other["some-prop"], external.function);
	console.log(undefined, undefined);

	exports.function = 1;
	exports.function++;

	Object.defineProperty(exports, 'bar', {
		enumerable: true,
		get: function () {
			return external.function;
		}
	});
	Object.defineProperty(exports, 'default', {
		enumerable: true,
		get: function () {
			return external.foo;
		}
	});

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, external);

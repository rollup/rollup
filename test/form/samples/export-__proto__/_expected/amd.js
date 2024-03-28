define(['exports', 'x'], (function (exports, x$1) { 'use strict';

	const __proto__ = 1;

	var x = /*#__PURE__*/Object.freeze({
		__proto__: null,
		["__proto__"]: __proto__
	});

	Object.defineProperty(exports, "__proto__", {
		enumerable: true,
		value: __proto__
	});
	exports.x = x;
	Object.prototype.hasOwnProperty.call(x$1, '__proto__') &&
		!Object.prototype.hasOwnProperty.call(exports, '__proto__') &&
		Object.defineProperty(exports, '__proto__', {
			enumerable: true,
			value: x$1['__proto__']
		});

	Object.keys(x$1).forEach(function (k) {
		if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = x$1[k];
	});

}));

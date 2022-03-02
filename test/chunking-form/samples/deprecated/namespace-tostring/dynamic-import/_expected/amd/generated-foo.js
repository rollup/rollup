define(['exports'], (function (exports) { 'use strict';

	const bar = 42;

	exports.bar = bar;

	Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

}));

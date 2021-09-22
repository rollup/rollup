define(['exports'], (function (exports) { 'use strict';

	const bar = 42;

	exports.bar = bar;

	exports[Symbol.toStringTag] = 'Module';

}));

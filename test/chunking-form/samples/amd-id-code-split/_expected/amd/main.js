define('something/main', ['exports'], function (exports) { 'use strict';

	const something = 42;

	exports.something = something;

	Object.defineProperty(exports, '__esModule', { value: true });

});

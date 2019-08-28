define(['exports', 'external'], function (exports, external) { 'use strict';

	external = external && external.hasOwnProperty('default') ? external['default'] : external;

	const value = 42;

	exports.default = external;
	exports.value = value;

	Object.defineProperty(exports, '__esModule', { value: true });

});

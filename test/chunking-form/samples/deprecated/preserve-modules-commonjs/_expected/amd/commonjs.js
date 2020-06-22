define(['exports', 'external', './other'], function (exports, external, other) { 'use strict';

	external = external && Object.prototype.hasOwnProperty.call(external, 'default') ? external['default'] : external;

	const { value } = other.default;

	console.log(external, value);

	var commonjs = 42;

	exports.__moduleExports = commonjs;
	exports.default = commonjs;

	Object.defineProperty(exports, '__esModule', { value: true });

});

define(['exports', 'external', './_virtual/_external_commonjs-external', './_virtual/other.js_commonjs-proxy'], function (exports, external, _external_commonjsExternal, other) { 'use strict';

	external = external && Object.prototype.hasOwnProperty.call(external, 'default') ? external['default'] : external;

	const { value } = other;

	console.log(_external_commonjsExternal, value);

	var commonjs = 42;

	exports.__moduleExports = commonjs;
	exports.default = commonjs;

	Object.defineProperty(exports, '__esModule', { value: true });

});

define(['exports', 'external', './other', './_virtual/_external_commonjs-external', './_virtual/other.js_commonjs-proxy'], function (exports, external, other, _external_commonjsExternal, other$1) { 'use strict';

	external = external && external.hasOwnProperty('default') ? external['default'] : external;

	const { value } = other$1;

	console.log(_external_commonjsExternal, value);

	var commonjs = 42;

	exports.__moduleExports = commonjs;
	exports.default = commonjs;

	Object.defineProperty(exports, '__esModule', { value: true });

});

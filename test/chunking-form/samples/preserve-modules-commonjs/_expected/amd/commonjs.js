define(['exports', 'external', './other', './_virtual/_commonjs-external-external', './_virtual/other'], function (exports, external, __chunk_1, __chunk_2, __chunk_3) { 'use strict';

	external = external && external.hasOwnProperty('default') ? external['default'] : external;

	const { value } = __chunk_3.default;

	console.log(__chunk_2.default, value);

	var commonjs = 42;

	exports.__moduleExports = commonjs;
	exports.default = commonjs;

});

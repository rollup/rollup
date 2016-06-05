define(['exports', 'x'], function (exports, x) { 'use strict';

	x = 'default' in x ? x['default'] : x;



	exports.x = x;

	Object.defineProperty(exports, '__esModule', { value: true });

});

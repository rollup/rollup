define(['exports', 'external'], function (exports, external) { 'use strict';

	var external__default = 'default' in external ? external['default'] : external;

	console.log(external.value);

	exports.reexported = external__default;

	Object.defineProperty(exports, '__esModule', { value: true });

});

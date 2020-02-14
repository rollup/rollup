define(['exports', 'external'], function (exports, external) { 'use strict';

	external = external && external.hasOwnProperty('default') ? external['default'] : external;

	console.log('main');

	exports.value = external;

	Object.defineProperty(exports, '__esModule', { value: true });

});

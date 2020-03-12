define(['exports', 'external'], function (exports, external) { 'use strict';

	external = external && Object.prototype.hasOwnProperty.call(external, 'default') ? external['default'] : external;

	console.log('main');

	exports.value = external;

	Object.defineProperty(exports, '__esModule', { value: true });

});

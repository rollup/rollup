define(['exports', './generated-dep2'], function (exports, dep2) { 'use strict';

	console.log('dynamic2', dep2.value2);

	exports.value2 = dep2.value2;

	Object.defineProperty(exports, '__esModule', { value: true });

});

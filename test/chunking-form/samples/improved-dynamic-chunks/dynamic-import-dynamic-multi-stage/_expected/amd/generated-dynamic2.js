define(['exports', './main'], function (exports, main) { 'use strict';

	console.log('dynamic2', main.value);

	exports.value = main.value;

	Object.defineProperty(exports, '__esModule', { value: true });

});

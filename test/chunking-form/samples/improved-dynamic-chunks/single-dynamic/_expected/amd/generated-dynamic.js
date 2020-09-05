define(['exports', './main'], function (exports, main) { 'use strict';

	console.log('dynamic', main.value);

	exports.value = main.value;

	Object.defineProperty(exports, '__esModule', { value: true });

});

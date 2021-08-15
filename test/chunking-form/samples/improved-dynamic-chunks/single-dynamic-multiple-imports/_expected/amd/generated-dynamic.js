define(['exports', './main'], (function (exports, main) { 'use strict';

	console.log('dynamic', main.value);

	exports.value = main.value;

}));

define(['exports', './third'], (function (exports, third) { 'use strict';

	console.log('other');

	console.log('main');

	exports.bar = third.bar;

}));

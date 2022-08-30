(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('https://external.com/external.js')) :
	typeof define === 'function' && define.amd ? define(['https://external.com/external.js'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.external));
})(this, (function (external) { 'use strict';

	console.log(external);

}));

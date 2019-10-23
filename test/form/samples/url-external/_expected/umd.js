(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('https://external.com/external.js')) :
	typeof define === 'function' && define.amd ? define(['https://external.com/external.js'], factory) :
	(global = global || self, factory(global.external));
}(this, (function (external) { 'use strict';

	external = external && external.hasOwnProperty('default') ? external['default'] : external;

	console.log(external);

})));

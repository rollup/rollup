(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('external')) :
	typeof define === 'function' && define.amd ? define(['external'], factory) :
	(global = global || self, factory(global.external));
}(this, function (external) { 'use strict';

	import(external.join('a', 'b'));
	console.log(external.join);

}));

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('external')) :
	typeof define === 'function' && define.amd ? define(['external'], factory) :
	(global = global || self, factory(global.external));
}(this, function (external) { 'use strict';

	external = external && external.hasOwnProperty('default') ? external['default'] : external;

	const _interopDefault = 42;
	console.log(external, _interopDefault);

}));

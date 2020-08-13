(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('factory'), require('baz'), require('shipping-port'), require('alphabet')) :
	typeof define === 'function' && define.amd ? define(['factory', 'baz', 'shipping-port', 'alphabet'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.factory, global.baz, global.containers, global.alphabet));
}(this, (function (factory, baz, containers, alphabet) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var factory__default = /*#__PURE__*/_interopDefaultLegacy(factory);
	var alphabet__default = /*#__PURE__*/_interopDefaultLegacy(alphabet);

	factory__default['default']( null );
	baz.foo( baz.bar, containers.port );
	containers.forEach( console.log, console );
	console.log( alphabet.a );
	console.log( alphabet__default['default'].length );

})));

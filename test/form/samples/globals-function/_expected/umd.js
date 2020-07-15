(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('a'), require('b')) :
	typeof define === 'function' && define.amd ? define(['a', 'b'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.thisIsA, global.thisIsB));
}(this, (function (a, b) { 'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

	var a__default = /*#__PURE__*/_interopDefault(a);
	var b__default = /*#__PURE__*/_interopDefault(b);

	console.log(a__default['default'], b__default['default']);

})));

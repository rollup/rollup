(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('https://unpkg.com/foo')) :
	typeof define === 'function' && define.amd ? define(['https://unpkg.com/foo'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.foo));
}(this, (function (foo) { 'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

	var foo__default = _interopDefault(foo);

	assert.equal( foo__default.default, 42 );

})));

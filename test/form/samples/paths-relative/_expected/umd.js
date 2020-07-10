(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('../foo')) :
	typeof define === 'function' && define.amd ? define(['../foo'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.foo));
}(this, (function (foo) { 'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

	foo = _interopDefault(foo);

	assert.equal( foo, 42 );

})));

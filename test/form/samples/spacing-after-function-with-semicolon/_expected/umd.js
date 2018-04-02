(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' && !module.nodeType ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	function x () { return 'x' }
	assert.equal( x(), 'x' );

})));

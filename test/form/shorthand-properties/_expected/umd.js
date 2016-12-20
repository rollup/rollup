(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	function x () {
		return 'foo';
	}

	var foo = { x };

	function x$1 () {
		return 'bar';
	}

	var bar = { x: x$1 };

	function x$2 () {
		return 'baz';
	}

	var baz = { x: x$2 };

	assert.equal( foo.x(), 'foo' );
	assert.equal( bar.x(), 'bar' );
	assert.equal( baz.x(), 'baz' );

})));
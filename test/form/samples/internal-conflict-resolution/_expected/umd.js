(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(typeof self !== 'undefined' ? self : this, function () { 'use strict';

	var bar = 42;

	function foo () {
		return bar;
	}

	function bar$1 () {
		alert( foo() );
	}

	bar$1();

}));

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(this || (typeof window !== 'undefined' && window), function () { 'use strict';

	var bar = 42;

	function foo () {
		return bar;
	}

	function _bar () {
		alert( foo() );
	}

	_bar();

}));

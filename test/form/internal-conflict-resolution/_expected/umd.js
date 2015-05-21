(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(this, function () { 'use strict';

	var _bar = 42;

	function foo () {
		return _bar;
	}

	function bar () {
		alert( foo() );
	}

	bar();

}));

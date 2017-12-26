(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	var bar = 42;

	function foo () {
		return bar;
	}

	function bar$2 () {
		alert( foo() );
	}

	bar$2();

})));

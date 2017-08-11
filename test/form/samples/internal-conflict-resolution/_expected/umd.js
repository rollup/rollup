(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	var bar$1 = 42;

	function foo () {
		return bar$1;
	}

	function bar () {
		alert( foo() );
	}

	bar();

})));
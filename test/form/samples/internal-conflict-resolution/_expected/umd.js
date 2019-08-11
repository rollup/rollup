(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	var bar = 42;

	function foo () {
		return bar;
	}

	function bar$1 () {
		alert( foo() );
	}

	bar$1();

}));

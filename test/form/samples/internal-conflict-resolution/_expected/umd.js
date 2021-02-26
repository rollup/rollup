(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	var bar$1 = 42;

	function foo () {
		return bar$1;
	}

	function bar () {
		alert( foo() );
	}

	bar();

})));

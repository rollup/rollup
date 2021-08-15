(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	function foo() { return true; }

	var baz = function foo$1() {
		return foo();
	};

	console.log(baz());

}));

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(this, function () { 'use strict';

	var foo = function () {
		return 42;
	};

	function bar () {
		return contrivedExample( foo );
	}

	var answer = foo();
	var somethingElse = bar();

}));

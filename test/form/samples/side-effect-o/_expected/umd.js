(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	function fn () {
		return Math.random() < 0.5 ? foo : bar;
	}

	function foo () {
		console.log( 'foo' );
	}

	function bar () {
		console.log( 'bar' );
	}

	fn()();

}));

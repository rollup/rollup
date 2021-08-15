(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	function foo () {
		console.log( 'foo' );
	}

	function bar () {
		console.log( 'bar' );
	}

	( Math.random() < 0.5 ? foo : bar )();

}));

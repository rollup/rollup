(function (global, factory) {
	typeof module === 'object' && module.exports ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	function foo () {
		console.log( 'foo' );
	}

	function bar () {
		console.log( 'bar' );
	}

	( Math.random() < 0.5 ? foo : bar )();

})));

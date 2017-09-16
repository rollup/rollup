(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	var foo = () => {};

	while ( true ) {
		var foo = () => console.log( 'effect' );
		break;
	}

	foo();

	function baz () {}

	while ( true ) {
		function baz () {
			console.log( 'effect' );
		}

		break;
	}

	baz();

})));

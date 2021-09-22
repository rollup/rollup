(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	function foo () {
		console.log( 'foo' );
	}

	function a () {
		foo();
		foo();

		var a;
		if ( a.b ) ;
	}

	a();

}));

define(function () { 'use strict';

	function foo () {
		console.log( 'foo' );
	}

	function a () {
		foo();
		foo();

		var a;
		if ( a.b ) {
			// empty
		}
	}

	a();

});

(function () {
	'use strict';

	function foo () {
		console.log( 'foo' );
	}

	function bar () {
		console.log( 'bar' );
	}

	( Math.random() < 0.5 ? foo : bar )();

}());
define(function () { 'use strict';

	// comment before 1

	console.log( 1 );
	console.log( 2 ); // comment alongside 2

	function foo () {
		return bar();
	}

	function bar () {
		return 42;
	}

	foo();
	console.log( 3 );

});

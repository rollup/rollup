var myBundle = (function () {
	'use strict';

	function foo ( ok ) {
		if ( !ok ) {
			throw new Error( 'this will be ignored' );
		}
	}

	foo();

	var main = 42;

	return main;

}());

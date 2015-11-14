var myBundle = (function () { 'use strict';

	if ( !ok ) {
		throw new Error( 'this will be included' );
	}

	var main = 42;

	return main;

})();

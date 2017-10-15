(function () {
	'use strict';

	const callArg2 = arg => arg();
	callArg2( () => console.log( 'effect' ) );

	const returnArg2 = arg => arg;
	returnArg2( () => console.log( 'effect' ) )();

}());

define(function () { 'use strict';

	const callArg2 = arg => arg();
	callArg2( () => console.log( 'effect' ) );

	const assignArg2 = arg => arg.foo.bar = 1;
	assignArg2( {} );

	const returnArg2 = arg => arg;
	returnArg2( () => console.log( 'effect' ) )();

	const returnArg4 = arg => arg;
	returnArg4( {} ).foo.bar = 1;

	const returnArg6 = arg => arg;
	returnArg6( () => () => console.log( 'effect' ) )()();

	const returnArgReturn2 = arg => arg();
	returnArgReturn2( () => () => console.log( 'effect' ) )();

	const returnArgReturn4 = arg => arg();
	returnArgReturn4( () => ({}) ).foo.bar = 1;

	const returnArgReturn6 = arg => arg();
	returnArgReturn6( () => () => () => console.log( 'effect' ) )()();

	const multiArgument2 = ( func, obj ) => func( obj );
	multiArgument2( obj => obj(), () => console.log( 'effect' ) );

	const multiArgument4 = ( func, obj ) => func( obj );
	multiArgument4( obj => obj.foo.bar = 1, {} );

});

System.register([], function () {
	'use strict';
	return {
		execute: function () {

			const callArg = arg => arg();
			callArg( () => console.log( 'effect' ) );

			const assignArg = arg => arg.foo.bar = 1;
			assignArg( {} );

			const returnArg = arg => arg;
			returnArg( () => console.log( 'effect' ) )();

			const returnArg2 = arg => arg;
			returnArg2( {} ).foo.bar = 1;

			const returnArg3 = arg => arg;
			returnArg3( () => () => console.log( 'effect' ) )()();

			const returnArgReturn = arg => arg();
			returnArgReturn( () => () => console.log( 'effect' ) )();

			const returnArgReturn2 = arg => arg();
			returnArgReturn2( () => ({}) ).foo.bar = 1;

			const returnArgReturn3 = arg => arg();
			returnArgReturn3( () => () => () => console.log( 'effect' ) )()();

			const multiArgument = ( func, obj ) => func( obj );
			multiArgument( obj => obj(), () => console.log( 'effect' ) );

			const multiArgument2 = ( func, obj ) => func( obj );
			multiArgument2( obj => obj.foo.bar = 1, {} );

		}
	};
});

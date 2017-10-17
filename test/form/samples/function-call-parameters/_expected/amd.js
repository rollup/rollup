define(function () { 'use strict';

	const multiArgument2 = function ( func, obj ) { return func( obj ); };
	multiArgument2( obj => obj(), () => () => console.log( 'effect' ) )();

	const multiArgument4 = function ( func, obj ) { return func( obj ); };
	multiArgument4( obj => ({ foo: obj }), {} ).foo.bar.baz = 1;

});

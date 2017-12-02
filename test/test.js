require( 'source-map-support' ).install();
require( 'console-group' ).install();

describe( 'rollup', function () {
	this.timeout( 10000 );

	// To quickly check the effects of potential performance improvements
	before( () => console.time( 'Total test time' ) );
	after( () => console.timeEnd( 'Total test time' ) );

	require( './misc/index.js' );
	require( './function/index.js' );
	require( './form/index.js' );
	require( './incremental/index.js' );
	require( './hooks/index.js' );
} );

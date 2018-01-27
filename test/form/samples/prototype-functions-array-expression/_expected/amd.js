define(function () { 'use strict';

	const map2 = [ 1 ].map( x => console.log( 1 ) );
	const map4 = [ 1 ].map( x => x ).map( x => console.log( 1 ) );
	const map5 = [ 1 ].map( x => console.log( 1 ) ).map( x => x );
	const map7 = [ 1 ].map( x => x ).map( x => x ).map( x => console.log( 1 ) );
	const map8 = [ 1 ].map( x => x ).map( x => console.log( 1 ) ).map( x => x );

	const _everyEffect = [ 1 ].every( () => console.log( 1 ) || true );
	const _filterEffect = [ 1 ].filter( () => console.log( 1 ) || true );
	const _findEffect = [ 1 ].find( () => console.log( 1 ) || true );
	const _findIndexEffect = [ 1 ].findIndex( () => console.log( 1 ) || true );
	const _forEachEffect = [ 1 ].forEach( () => console.log( 1 ) || true );
	const _mapEffect = [ 1 ].map( () => console.log( 1 ) || 1 );
	const _reduceEffect = [ 1 ].reduce( () => console.log( 1 ) || 1, 1 );
	const _reduceRightEffect = [ 1 ].reduceRight( () => console.log( 1 ) || 1, 1 );
	const _someEffect = [ 1 ].some( () => console.log( 1 ) || true );

});

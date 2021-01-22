[ 1 ].map( x => console.log( 1 ) );
[ 1 ].map( x => x ).map( x => console.log( 1 ) );
[ 1 ].map( x => console.log( 1 ) ).map( x => x );
[ 1 ].map( x => x ).map( x => x ).map( x => console.log( 1 ) );
[ 1 ].map( x => x ).map( x => console.log( 1 ) ).map( x => x );

[]();
[ 1 ].every( () => console.log( 1 ) || true );
[ 1 ].filter( () => console.log( 1 ) || true );
[ 1 ].find( () => console.log( 1 ) || true );
[ 1 ].findIndex( () => console.log( 1 ) || true );
[ 1 ].forEach( () => console.log( 1 ) || true );
[ 1 ].map( () => console.log( 1 ) || 1 );
[ 1 ].reduce( () => console.log( 1 ) || 1, 1 );
[ 1 ].reduceRight( () => console.log( 1 ) || 1, 1 );
[ 1 ].some( () => console.log( 1 ) || true );

// mutator methods
const exported = [ 1 ];
exported.copyWithin( 0 );
exported.fill( 0 );
exported.pop();
exported.push( 0 );
exported.reverse();
exported.shift();
[ 1 ].sort( () => console.log( 1 ) || 0 );
exported.sort();
exported.splice( 0 );
exported.unshift( 0 );

export { exported };

const array = [];
const join1 = array.join( ',' );
const join2 = [].join( ',' );
const join3 = [].join( ',' ).trim();
const map1 = [ 1 ].map( x => x );
const map2 = [ 1 ].map( x => console.log( 1 ) );
const map3 = [ 1 ].map( x => x ).map( x => x );
const map4 = [ 1 ].map( x => x ).map( x => console.log( 1 ) );
const map5 = [ 1 ].map( x => console.log( 1 ) ).map( x => x );
const map6 = [ 1 ].map( x => x ).map( x => x ).map( x => x );
const map7 = [ 1 ].map( x => x ).map( x => x ).map( x => console.log( 1 ) );
const map8 = [ 1 ].map( x => x ).map( x => console.log( 1 ) ).map( x => x );

// accessor methods
const _includes = [].includes( 1 ).valueOf();
const _indexOf = [].indexOf( 1 ).toPrecision( 1 );
const _join = [].join( ',' ).trim();
const _lastIndexOf = [].lastIndexOf( 1 ).toPrecision( 1 );
const _slice = [].slice( 1 ).concat( [] );
const _toLocaleString = [].toLocaleString().trim();
const _toString = [].toString().trim();

// iteration methods
const _every = [ 1 ].every( () => true ).valueOf();
const _everyEffect = [ 1 ].every( () => console.log( 1 ) || true );
const _filter = [ 1 ].filter( () => true ).join( ',' );
const _filterEffect = [ 1 ].filter( () => console.log( 1 ) || true );
const _find = [ 1 ].find( () => true );
const _findEffect = [ 1 ].find( () => console.log( 1 ) || true );
const _findIndex = [ 1 ].findIndex( () => true ).toPrecision( 1 );
const _findIndexEffect = [ 1 ].findIndex( () => console.log( 1 ) || true );
const _forEach = [ 1 ].forEach( () => {} );
const _forEachEffect = [ 1 ].forEach( () => console.log( 1 ) || true );
const _map = [ 1 ].map( () => 1 ).join( ',' );
const _mapEffect = [ 1 ].map( () => console.log( 1 ) || 1 );
const _reduce = [ 1 ].reduce( () => 1, 1 );
const _reduceEffect = [ 1 ].reduce( () => console.log( 1 ) || 1, 1 );
const _reduceRight = [ 1 ].reduceRight( () => 1, 1 );
const _reduceRightEffect = [ 1 ].reduceRight( () => console.log( 1 ) || 1, 1 );
const _some = [ 1 ].some( () => true ).valueOf();
const _someEffect = [ 1 ].some( () => console.log( 1 ) || true );

function foo () {
	console.log( 'this should be excluded' );
}

function bar () {
	console.log( 'this should be included' );
}

if ( 'development' === 'production' ) foo();
bar();

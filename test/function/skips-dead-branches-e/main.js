function foo () {
	console.log( 'this should be excluded' );
}

function bar () {
	console.log( 'this should be included' );
}

if ( 'production' !== 'production' ) foo();
bar();

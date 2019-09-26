for ( let i = 0; i < 2; i++ ) {
	break;
}

for ( let i = 0; i < 2; i++ ) {
	console.log( 'effect' );
	break;
}

for ( const val in { x: 1, y: 2 } ) {
	break;
}

for ( const val in { x: 1, y: 2 } ) {
	console.log( 'effect' );
	break;
}

for ( const val of { x: 1, y: 2 } ) {
	console.log( 'effect' );
	break;
}

while ( true ) {
	break;
}

while ( true ) {
	console.log( 'effect' );
	break;
}

do {
	break;
} while ( true );

do {
	console.log( 'effect' );
	break;
} while ( true );

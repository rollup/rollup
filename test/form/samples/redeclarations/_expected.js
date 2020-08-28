var foo = () => {};

while ( true ) {
	var foo = () => console.log( 'effect' );
	break;
}

foo();

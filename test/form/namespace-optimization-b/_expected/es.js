function foo$1 () {
	console.log( 'foo' );
}

function a () {
	foo$1();
	foo$1();

	var a;
	if ( a.b ) {
		// empty
	}
}

a();
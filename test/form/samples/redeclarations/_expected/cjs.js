'use strict';

var foo = () => {};

while ( true ) {
	var foo = () => console.log( 'effect' );
	break;
}

foo();

function baz () {}

while ( true ) {
	function baz () {
		console.log( 'effect' );
	}

	break;
}

baz();

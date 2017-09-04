var foo = () => {};

while ( true ) {
	var foo = () => console.log( 'effect' );
	break;
}

foo();

let bar = () => {};

while ( true ) {
	let bar = () => console.log( 'effect' );
	break;
}

bar();

function baz () {}

while ( true ) {
	function baz () {
		console.log( 'effect' );
	}

	break;
}

baz();

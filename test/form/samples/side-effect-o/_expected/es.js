function fn () {
	return Math.random() < 0.5 ? foo : bar;
}

function foo () {
	console.log( 'foo' );
}

function bar () {
	console.log( 'bar' );
}

fn()();
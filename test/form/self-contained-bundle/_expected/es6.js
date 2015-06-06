// comment before 1

console.log( 1 );
console.log( 2 ); // comment alongside 2

function bar () {
	return 42;
}

function foo () {
	return bar();
}

foo();
console.log( 3 );

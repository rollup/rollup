function x () {
	console.log( 'side-effect' );
}

x();

export function foo () {
	return 42;
}

foo.property = "Foo";
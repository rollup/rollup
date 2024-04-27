function foo ( ok ) {
	if ( !ok ) {
		throw new Error( 'this will be ignored' );
	}
}

foo();
foo(true);

export default 42;

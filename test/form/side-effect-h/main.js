function foo ( ok ) {
	if ( !ok ) {
		throw new Error( 'this will be included' );
	}
}

foo();

export default 42;

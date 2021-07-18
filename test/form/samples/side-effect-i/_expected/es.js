if ( !ok ) {
	throw new Error( 'this will be included' );
}

var main = 42;

export { main as default };

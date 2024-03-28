'use strict';

function foo ( ok ) {
	if ( !ok ) {
		throw new Error( 'this will be ignored' );
	}
}

foo();
foo(true);

var main = 42;

module.exports = main;

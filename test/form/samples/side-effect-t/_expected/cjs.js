'use strict';

function foo () {
	throw new Error( 'throw side effect' );
}

foo();

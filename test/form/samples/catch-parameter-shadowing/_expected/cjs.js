'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const e = 2.7182818284;

function something () {
	try {
		console.log( e );
	} catch ( e$$1 ) { // the catch identifier shadows the import
		console.error( e$$1 );
	}
}

exports.something = something;

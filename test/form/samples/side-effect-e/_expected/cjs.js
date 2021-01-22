'use strict';

function foo () {
	var Object = {
		keys: function () {
			console.log( 'side-effect' );
		}
	};

	var obj = { foo: 1, bar: 2 };
	Object.keys( obj );
}

foo();

var main = 42;

module.exports = main;

define(['factory', 'baz', 'alphabet'], function (factory, baz, alphabet) { 'use strict';

	var alphabet__default = 'default' in alphabet ? alphabet['default'] : alphabet;

	factory( null );
	baz.foo( baz.bar );
	console.log( alphabet.a );
	console.log( alphabet__default.length );

});

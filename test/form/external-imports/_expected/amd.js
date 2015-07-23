define(['factory', 'baz', 'shipping-port', 'alphabet'], function (factory, baz, containers, alphabet) { 'use strict';

	var alphabet__default = 'default' in alphabet ? alphabet['default'] : alphabet;

	factory( null );
	baz.foo( baz.bar );
	containers.forEach( console.log, console );
	console.log( alphabet.a );
	console.log( alphabet__default.length );

});

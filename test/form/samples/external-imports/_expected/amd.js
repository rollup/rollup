define(['factory', 'baz', 'shipping-port', 'alphabet'], function (factory, baz, containers, alphabet) { 'use strict';

	factory = factory && Object.prototype.hasOwnProperty.call(factory, 'default') ? factory['default'] : factory;
	var alphabet__default = 'default' in alphabet ? alphabet['default'] : alphabet;

	factory( null );
	baz.foo( baz.bar, containers.port );
	containers.forEach( console.log, console );
	console.log( alphabet.a );
	console.log( alphabet__default.length );

});

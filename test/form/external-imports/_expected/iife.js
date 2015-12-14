(function (factory,baz,containers,alphabet) { 'use strict';

	factory = 'default' in factory ? factory['default'] : factory;
	var alphabet__default = 'default' in alphabet ? alphabet['default'] : alphabet;

	factory( null );
	baz.foo( baz.bar, containers.port );
	containers.forEach( console.log, console );
	console.log( alphabet.a );
	console.log( alphabet__default.length );

})(factory,baz,containers,alphabet);

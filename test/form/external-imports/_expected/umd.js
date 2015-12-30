(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('factory'), require('baz'), require('shipping-port'), require('alphabet')) :
	typeof define === 'function' && define.amd ? define(['factory', 'baz', 'shipping-port', 'alphabet'], factory) :
	(factory(global.factory,global.baz,global.containers,global.alphabet));
}(this, function (factory,baz,containers,alphabet) { 'use strict';

	factory = 'default' in factory ? factory['default'] : factory;
	var alphabet__default = 'default' in alphabet ? alphabet['default'] : alphabet;

	factory( null );
	baz.foo( baz.bar, containers.port );
	containers.forEach( console.log, console );
	console.log( alphabet.a );
	console.log( alphabet__default.length );

}));
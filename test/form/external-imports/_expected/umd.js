(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('factory'), require('baz'), require('alphabet')) :
	typeof define === 'function' && define.amd ? define(['factory', 'baz', 'alphabet'], factory) :
	factory(global.factory,global.baz,global.alphabet);
}(this, function (factory,baz,alphabet) { 'use strict';

	var alphabet__default = 'default' in alphabet ? alphabet['default'] : alphabet;

	factory( null );
	baz.foo( baz.bar );
	console.log( alphabet.a );
	console.log( alphabet__default.length );

}));

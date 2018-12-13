(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(typeof self !== 'undefined' ? self : this, function () { 'use strict';

	var effect1 = () => console.log( 'effect' );
	var associated = () => {};
	for ( var associated in { x: 1 } ) {
		associated = effect1;
	}
	associated();

	var effect3 = () => console.log( 'effect' );
	for ( const foo in { x: effect3() } ) {
	}

	for ( globalVar in { x: 1 } ) {}

}));

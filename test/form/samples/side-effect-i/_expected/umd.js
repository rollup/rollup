(function (global, factory) {
	typeof module === 'object' && module.exports ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.myBundle = factory());
}(this, (function () { 'use strict';

	if ( !ok ) {
		throw new Error( 'this will be included' );
	}

	var main = 42;

	return main;

})));

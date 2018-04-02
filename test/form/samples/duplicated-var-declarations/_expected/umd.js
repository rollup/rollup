(function (global, factory) {
	typeof module === 'object' && module.exports ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	var a = 1, b = 2;

	assert.equal( a, 1 );
	assert.equal( b, 2 );

	var a = 3, b = 4, c = 5;

	assert.equal( a, 3 );
	assert.equal( b, 4 );
	assert.equal( c, 5 );

})));

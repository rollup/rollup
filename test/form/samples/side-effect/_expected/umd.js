(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	var foo = 42;

	assert.equal( foo, 42 );

}));

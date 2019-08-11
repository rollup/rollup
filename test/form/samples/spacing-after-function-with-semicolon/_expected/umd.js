(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	function x () { return 'x' }
	assert.equal( x(), 'x' );

}));

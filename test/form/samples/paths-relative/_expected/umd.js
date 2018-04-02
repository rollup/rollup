(function (global, factory) {
	typeof module === 'object' && module.exports ? factory(require('../foo')) :
	typeof define === 'function' && define.amd ? define(['../foo'], factory) :
	(factory(global.foo));
}(this, (function (foo) { 'use strict';

	foo = foo && foo.hasOwnProperty('default') ? foo['default'] : foo;

	assert.equal( foo, 42 );

})));

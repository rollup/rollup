(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('../foo')) :
	typeof define === 'function' && define.amd ? define(['../foo'], factory) :
	(factory(global.foo));
}(this, (function (foo) { 'use strict';

	foo = foo && 'default' in foo ? foo['default'] : foo;

	assert.equal( foo, 42 );

})));

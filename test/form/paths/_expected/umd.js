(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('https://unpkg.com/foo')) :
	typeof define === 'function' && define.amd ? define(['https://unpkg.com/foo'], factory) :
	(factory(global.foo));
}(this, (function (foo) { 'use strict';

	foo = foo && 'default' in foo ? foo['default'] : foo;

	assert.equal( foo, 42 );

})));

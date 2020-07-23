(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('https://unpkg.com/foo')) :
	typeof define === 'function' && define.amd ? define(['https://unpkg.com/foo'], factory) :
	factory(global.foo);
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function (foo) { 'use strict';

	foo = foo && Object.prototype.hasOwnProperty.call(foo, 'default') ? foo['default'] : foo;

	assert.equal(foo, 42);

	import('https://unpkg.com/foo').then(({ default: foo }) => assert.equal(foo, 42));

})));

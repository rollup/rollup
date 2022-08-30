(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('https://unpkg.com/foo')) :
	typeof define === 'function' && define.amd ? define(['https://unpkg.com/foo'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.foo));
})(this, (function (foo) { 'use strict';

	assert.equal(foo, 42);

	import('https://unpkg.com/foo').then(({ default: foo }) => assert.equal(foo, 42));

}));

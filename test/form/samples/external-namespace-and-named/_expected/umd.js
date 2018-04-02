(function (global, factory) {
	typeof module === 'object' && module.exports ? factory(require('foo')) :
	typeof define === 'function' && define.amd ? define(['foo'], factory) :
	(factory(global.foo));
}(this, (function (foo) { 'use strict';

	console.log(foo);
	console.log(foo.blah);
	console.log(foo.bar);

})));

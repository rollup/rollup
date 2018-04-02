(function (global, factory) {
	typeof module === 'object' && module.exports ? factory(require('foo')) :
	typeof define === 'function' && define.amd ? define(['foo'], factory) :
	(factory(global.foo));
}(this, (function (foo) { 'use strict';

	var foo__default = foo['default'];

	console.log( foo.bar );

	console.log( foo__default );

})));

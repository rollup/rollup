(function (factory) {
	typeof define === 'function' && define.amd ? define(['foo'], factory) :
	factory(global.foo);
}(function (foo) { 'use strict';

	var foo__default = 'default' in foo ? foo['default'] : foo;

	console.log( foo.bar );

	console.log( foo__default );

}));

(function (factory) {
	typeof define === 'function' && define.amd ? define(['foo'], factory) :
	factory(global.foo);
}(function (foo) { 'use strict';

	console.log(foo);
	console.log(foo.blah);
	console.log(foo.bar);

}));

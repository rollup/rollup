(function (factory) {
	typeof define === 'function' && define.amd ? define(['foo', 'bar'], factory) :
	factory(global.foo,global.bar);
}(function (foo,bar) { 'use strict';

	console.log( bar.a );

	console.log( foo.a );

}));

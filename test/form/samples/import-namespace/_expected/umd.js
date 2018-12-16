(function (factory) {
	typeof define === 'function' && define.amd ? define(['foo', 'bar'], factory) :
	factory(global.foo,global.bar);
}(function (foo,bar) { 'use strict';

	foo.x();
	console.log(bar);

}));

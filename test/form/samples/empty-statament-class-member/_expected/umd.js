(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	class Foo {
		foo() {
			console.log('foo');
		};
	}

	console.log(Foo);

}));

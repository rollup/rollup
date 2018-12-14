(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(function () { 'use strict';

	class Foo {
		constructor () {
			console.log( 'Foo' );
		}
	}

	new Foo;

}));

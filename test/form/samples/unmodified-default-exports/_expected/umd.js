(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(typeof self !== 'undefined' ? self : this, function () { 'use strict';

	var Foo = function () {
		console.log( 'side effect' );
		this.isFoo = true;
	};

	Foo.prototype = {
		answer: function () {
			return 42;
		}
	};

	var foo = new Foo();

}));

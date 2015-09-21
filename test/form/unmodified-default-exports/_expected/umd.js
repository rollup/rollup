(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(this || (typeof window !== 'undefined' && window), function () { 'use strict';

	var Foo = function () {
		this.isFoo = true;
	};

	Foo.prototype = {
		answer: function () {
			return 42;
		}
	};

	var foo = new Foo();

}));

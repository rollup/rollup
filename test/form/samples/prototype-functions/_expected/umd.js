(function (global, factory) {
	typeof module === 'object' && module.exports ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	function Foo () {
		this.doIt();
	}

	Foo.prototype.doIt = function () {
		this.foo.tooDeep = 1;
		this.foo['b' + 'ar'] = 2;
		this.doesNotExist();
	};

	const foo = new Foo();

})));

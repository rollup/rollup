(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	let a;
	a();

	let b;
	b.foo = 'bar';

	let { c } = {};
	c();

	let { d } = {};
	d.foo = 'bar';

})));

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	let a = { foo: () => {}, bar: () => () => {} };
	let b = a;
	a = b;
	a.foo = () => {};
	a.foo();

	b = b;
	b.bar = () => () => {};

	b.bar()();

})));

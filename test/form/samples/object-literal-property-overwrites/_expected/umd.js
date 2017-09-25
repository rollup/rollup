(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	const retained1 = {
		foo: () => {},
		foo: () => console.log( 'effect' )
	};
	retained1.foo();

	const retained2 = {
		foo: () => {},
		['f' + 'oo']: () => console.log( 'effect' )
	};
	retained2.foo();

	const retained3 = {
		['f' + 'oo']: () => {}
	};
	retained3.bar();

	const retained4 = {
		foo: () => {},
		foo: globalVar
	};
	retained4.foo.bar = 1;

	const retained5 = {
		foo: () => {},
		['f' + 'oo']: globalVar
	};
	retained5.foo.bar = 1;

	const retained6 = {
		['f' + 'oo']: () => {}
	};
	retained6.bar.baz = 1;

})));

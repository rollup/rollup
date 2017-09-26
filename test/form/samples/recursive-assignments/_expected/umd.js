(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	let foo = () => {};
	foo.value = foo;

	while ( foo.value ) {
		foo = foo.value;
	}

	foo();
	foo.bar = 1;
	foo['baz'] = 1;

})));

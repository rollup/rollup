(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	let foo = () => function () {};
	foo.value = foo;

	while ( foo.value ) {
		foo = foo.value;
	}

	foo();
	foo()();
	new (foo())();
	foo.bar = 1;

})));

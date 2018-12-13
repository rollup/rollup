(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(typeof self !== 'undefined' ? self : this, function () { 'use strict';

	const getter = {
		get foo () {
			console.log( 'effect' );
		}
	};
	const foo1 = getter.foo;

	const empty = {};
	const foo2 = empty.foo.tooDeep;

	function accessArg(arg) {
		const foo3 = arg.tooDeep;
	}
	accessArg(null);

	const foo4 = globalVar.unknownProperty;

}));

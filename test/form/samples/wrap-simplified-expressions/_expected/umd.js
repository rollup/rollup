(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	const wrapper = {
		foo() {
			console.log(this);
		}
	};

	// Indirectly called member expressions set the callee's context to global "this"
	(0, wrapper.foo)();
	(0, wrapper.foo)();
	(0, wrapper.foo)();
	(0, wrapper.foo)();
	(0, wrapper.foo)();
	(0, wrapper.foo)();

	// Only callees of call expressions should be wrapped
	console.log(wrapper.foo);

	// Indirectly invoked eval is executed in the global scope
	function testEval() {
		console.log((0, eval)('this'));
		console.log((0, eval)('this'));
		console.log((0, eval)('this'));
	}

	testEval.call('test');

})));

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.myBundle = {})));
}(this, (function (exports) { 'use strict';

	class MyClass {
		constructor() { }
	}

	let MyClass$1 = class MyClass {
		constructor() { }
	}; /* comment */ functionCall();
	assert.equal(MyClass$1.name, "MyClass"); // oops

	exports.MyClass = MyClass$1;
	exports.MyClass2 = MyClass;

	Object.defineProperty(exports, '__esModule', { value: true });

})));

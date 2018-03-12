var myBundle = (function (exports) {
	'use strict';

	class MyClass {
		constructor() { }
	}

	let MyClass$1 = class MyClass {
		constructor() { }
	}
	assert.equal(MyClass$1.name, "MyClass"); // oops

	exports.MyClass = MyClass$1;
	exports.MyClass2 = MyClass;

	return exports;

}({}));

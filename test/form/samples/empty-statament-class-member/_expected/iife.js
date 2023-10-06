(function (exports) {
	'use strict';

	class Foo {
		foo() {
			console.log(3);
		}
	}

	exports.Foo = Foo;

	return exports;

})({});

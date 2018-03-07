System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			class MyClass {
				constructor() { }
			} exports('MyClass2', MyClass);

			let MyClass$1 = class MyClass {
				constructor() { }
			}; exports('MyClass', MyClass$1); /* comment */ functionCall();
			assert.equal(MyClass$1.name, "MyClass"); // oops

		}
	};
});

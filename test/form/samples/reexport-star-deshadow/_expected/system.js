System.register('myBundle', [], (function () {
	'use strict';
	return {
		execute: (function () {

			function foo() { return true; }

			var baz = function foo$1() {
				return foo();
			};

			console.log(baz());

		})
	};
}));

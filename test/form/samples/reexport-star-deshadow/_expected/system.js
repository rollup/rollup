System.register('myBundle', [], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			function foo() { return true; }

			var baz = function foo$$1() {
				return foo();
			};

			console.log(baz());

		}
	};
});

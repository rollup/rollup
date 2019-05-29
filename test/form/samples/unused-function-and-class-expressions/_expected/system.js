System.register([], function () {
	'use strict';
	return {
		execute: function () {

			function foo() {
				console.log("foo");
			}

			foo();

		}
	};
});

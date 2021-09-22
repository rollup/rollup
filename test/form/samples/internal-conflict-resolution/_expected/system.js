System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			var bar$1 = 42;

			function foo () {
				return bar$1;
			}

			function bar () {
				alert( foo() );
			}

			bar();

		})
	};
}));

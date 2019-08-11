System.register([], function () {
	'use strict';
	return {
		execute: function () {

			var bar = 42;

			function foo () {
				return bar;
			}

			function bar$1 () {
				alert( foo() );
			}

			bar$1();

		}
	};
});

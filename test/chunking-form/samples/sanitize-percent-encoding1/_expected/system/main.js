System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			function module1() {
				console.log('foo%20bar');
			}

			function module2() {
				console.log('foo%bar');
			}

			function module3() {
				console.log('foo%E3%81%82bar');
			}

			function module4() {
				console.log('foo%E3%81bar');
			}

			module1();
			module2();
			module3();
			module4();

		})
	};
}));

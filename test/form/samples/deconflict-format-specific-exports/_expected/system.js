System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const exports$1 = {
				x: 42
			};
			console.log(exports$1);

			function nestedConflict() {
				const exports$1 = {
					x: 42
				};
				console.log(exports$1);
				exports("x", x + 1), x++;
			}

			function nestedNoConflict() {
				const exports$1 = {
					x: 42
				};
				console.log(exports$1);
			}

			var x = exports("x", 43);
			nestedConflict();
			nestedNoConflict();

		})
	};
}));

System.register('myBundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const foo = 1;
			const bar = 2;

			var namespace = {
				__proto__: null,
				bar: bar,
				foo: foo
			};

			console.log( Object.keys( namespace ) );

			const a = exports("a", 1);
			const b = exports("b", 2);

		})
	};
}));

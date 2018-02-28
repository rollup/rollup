System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			const _typeof = 'typeof';
			const foo = 1;


			var namespace = (Object.freeze || Object)({
				'typeof': _typeof,
				foo: foo
			});

			console.log( namespace );

		}
	};
});

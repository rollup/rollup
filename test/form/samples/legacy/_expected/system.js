System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			const foo = 1;
			const bar = 2;

			var namespace = /*#__PURE__*/(Object.freeze || Object)({
				foo: foo,
				bar: bar
			});

			console.log( Object.keys( namespace ) );

			const a = exports('a', 1);
			const b = exports('b', 2);

		}
	};
});

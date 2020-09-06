System.register('myBundle', [], function (exports) {
	'use strict';
	return {
		execute: function () {

			const foo = 1;
			const bar = 2;

			var namespace = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
				__proto__: null,
				foo: foo,
				bar: bar
			}, '__esModule', { value: true }));

			console.log( Object.keys( namespace ) );

			const a = exports('a', 1);
			const b = exports('b', 2);

		}
	};
});

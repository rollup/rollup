System.register('myBundle', ['other'], function (exports) {
	'use strict';
	var name;
	return {
		setters: [function (module) {
			name = module.name;
		}],
		execute: function () {

			const a = 1;
			const b = 2;

			const namespace = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
				__proto__: null,
				a: a,
				b: b
			}, '__esModule', { value: true }));

			console.log( Object.keys( namespace ) );
			console.log( name );

			const main = exports('default', 42);

		}
	};
});

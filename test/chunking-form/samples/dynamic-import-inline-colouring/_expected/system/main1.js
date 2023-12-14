System.register(['./generated-separate.js'], (function (exports, module) {
	'use strict';
	return {
		setters: [null],
		execute: (function () {

			var inlined$1 = 'inlined';
			const x = 1;
			console.log('inlined');

			var inlined$2 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				default: inlined$1,
				x: x
			});

			const inlined = exports("inlined", Promise.resolve().then(function () { return inlined$2; }));
			const separate = exports("separate", module.import('./generated-separate.js'));

		})
	};
}));

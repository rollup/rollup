System.register(['./generated-separate.js'], function (exports, module) {
	'use strict';
	return {
		setters: [function () {}],
		execute: function () {

			var inlined = 'inlined';
			const x = 1;

			var inlined$1 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				'default': inlined,
				x: x
			});

			const inlined$2 = exports('inlined', Promise.resolve().then(function () { return inlined$1; }));
			const separate = exports('separate', module.import('./generated-separate.js'));

		}
	};
});

System.register(['./one.js'], (function (exports) {
	'use strict';
	var __icon__$1;
	return {
		setters: [function (module) {
			__icon__$1 = module.default;
		}],
		execute: (function () {

			const __icon__ = {};

			var icons = /*#__PURE__*/Object.freeze({
				__proto__: null,
				one: __icon__$1,
				two: __icon__
			});

			const __component__ = exports("Component_one", { icons });

		})
	};
}));

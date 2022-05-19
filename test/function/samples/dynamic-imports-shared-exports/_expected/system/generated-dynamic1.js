System.register(['./main.js'], (function (exports, module) {
	'use strict';
	var shared;
	return {
		setters: [function (module) {
			shared = module.s;
		}],
		execute: (function () {

			const sharedDynamic = exports('s', true);

			module.import('./generated-dynamic2.js');
			console.log(sharedDynamic);

			var dynamic1 = /*#__PURE__*/Object.freeze({
				__proto__: null,
				shared: shared
			});
			exports('d', dynamic1);

		})
	};
}));

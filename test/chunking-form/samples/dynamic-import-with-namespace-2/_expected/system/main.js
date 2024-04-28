System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			(async () => {
				const module$1 = await module.import('./generated-module.js');
				const module1 = module$1;
				module1.foo();
			})();

		})
	};
}));

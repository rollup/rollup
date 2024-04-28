System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			(async () => {
				const module$1 = await module.import('./generated-module.js');
				const { foo, ...rest } = module$1;
				foo();
				rest.bar();
			})();

		})
	};
}));

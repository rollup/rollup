System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			(async () => {
				const module$1 = await module.import('./generated-module.js');
				readBar(module$1);
				function readBar(module1) {
					module1.foo();
				}
			})();

		})
	};
}));

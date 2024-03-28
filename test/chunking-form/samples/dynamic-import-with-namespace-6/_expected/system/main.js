System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			(async () => {
				const module$1 = await module.import('./generated-module.js');
				(module$1).bar();
				(global.unknown && module$1).foo();
				(global.unknown ? module$1 : 'foo').baz();
			})();

		})
	};
}));

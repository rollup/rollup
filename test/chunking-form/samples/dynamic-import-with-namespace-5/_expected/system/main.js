System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			(async () => {
				const module$1 = await module.import('./generated-module.js');
				readFoo({ foo: () => {} });
				readFoo(module$1);
				function readFoo(module1) {
					module1.foo();
				}
				function readBar(module2) {
					module2.bar();
				}
				readBar(module$1);
			})();

		})
	};
}));

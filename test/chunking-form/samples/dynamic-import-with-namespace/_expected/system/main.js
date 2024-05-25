System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			(async () => {
				const module$1 = await module.import('./generated-module1.js');
				module$1.foo();
				// disabled
				module$1[global.unknown]();
				module$1.baz();
			})();

			(async () => {
				const module$1 = await module.import('./generated-module2.js');
				const module1 = module$1;
				module1.foo();
			})();

			(async () => {
				const module$1 = await module.import('./generated-module3.js');
				const { foo } = module$1;
				foo();
			})();

			(async () => {
				const module$1 = await module.import('./generated-module4.js');
				// disabled
				const { foo, ...rest } = module$1;
				foo();
				rest.bar();
			})();

			(async () => {
				const module$1 = await module.import('./generated-module5.js');
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

			(async () => {
				const module$1 = await module.import('./generated-module6.js');
				function b({ foo }) {
					foo();
				}
				b(module$1);
			})();

			(async () => {
				const module$1 = await module.import('./generated-module7.js');
				// disabled
				function b({ foo, ...rest }) {
					foo();
					assert.ok(rest);
				}
				b(module$1);
			})();

			(async () => {
				const module$1 = await module.import('./generated-module8.js');
				// disabled
				function b(o1, ...rest) {
					assert.ok(rest);
				}
				b(o1, o2, module$1);
			})();

			(async () => {
				const module$1 = await module.import('./generated-module9.js');
				// disabled
				function b({ foo = 1 }) {
					assert.ok(foo);
				}
				b(module$1);
			})();

			(async () => {
				const module$1 = await module.import('./generated-module10.js');
				(module$1).bar();
				(global.unknown && module$1).foo();
				(global.unknown ? module$1 : 'foo').baz();
			})();

		})
	};
}));

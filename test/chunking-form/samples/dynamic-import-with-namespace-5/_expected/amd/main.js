define(['require'], (function (require) { 'use strict';

	(async () => {
		const module = await new Promise(function (resolve, reject) { require(['./generated-module'], resolve, reject); });
		readFoo({ foo: () => {} });
		readFoo(module);
		function readFoo(module1) {
			module1.foo();
		}
		function readBar(module2) {
			module2.bar();
		}
		readBar(module);
	})();

}));

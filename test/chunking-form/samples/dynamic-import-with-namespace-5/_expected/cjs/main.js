'use strict';

(async () => {
	const module = await Promise.resolve().then(function () { return require('./generated-module.js'); });
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

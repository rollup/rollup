'use strict';

(async () => {
	const module = await Promise.resolve().then(function () { return require('./generated-module.js'); });
	readBar(module);
	function readBar(module1) {
		module1.foo();
	}
})();

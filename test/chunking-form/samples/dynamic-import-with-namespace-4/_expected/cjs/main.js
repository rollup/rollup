'use strict';

(async () => {
	const module = await Promise.resolve().then(function () { return require('./generated-module.js'); });
	const { foo, ...rest } = module;
	foo();
	rest.bar();
})();

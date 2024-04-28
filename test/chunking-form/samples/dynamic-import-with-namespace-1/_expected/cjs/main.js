'use strict';

(async () => {
	const module = await Promise.resolve().then(function () { return require('./generated-module.js'); });
	module.foo();
	module[global.unknown]();
	module.baz();
})();

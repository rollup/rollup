'use strict';

(async () => {
	const module = await Promise.resolve().then(function () { return require('./generated-module.js'); });
	(module).bar();
	(global.unknown && module).foo();
	(global.unknown ? module : 'foo').baz();
})();

define(['require'], (function (require) { 'use strict';

	(async () => {
		const module = await new Promise(function (resolve, reject) { require(['./generated-module'], resolve, reject); });
		module.foo();
		module[global.unknown]();
		module.baz();
	})();

}));

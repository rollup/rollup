define(['require'], (function (require) { 'use strict';

	(async () => {
		const module = await new Promise(function (resolve, reject) { require(['./generated-module'], resolve, reject); });
		readBar(module);
		function readBar(module1) {
			module1.foo();
		}
	})();

}));

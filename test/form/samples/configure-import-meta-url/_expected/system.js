System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			console.log('resolved');
			console.log('resolved');
			console.log('resolved');

			console.log(module.meta.url);
			console.log(undefined);
			console.log(({ url: module.meta.url }));

			console.log('url=system.js:configure-import-meta-url/main.js');
			console.log('privateProp=system.js:configure-import-meta-url/main.js');
			console.log('null=system.js:configure-import-meta-url/main.js');

		}
	};
});

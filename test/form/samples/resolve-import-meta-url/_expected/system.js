System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			console.log('resolved');
			console.log('resolved');
			console.log('resolved');

			console.log(module.meta.url);
			console.log(module.meta.privateProp);
			console.log(module.meta);

			console.log('url=system.js:resolve-import-meta-url/main.js');
			console.log('privateProp=system.js:resolve-import-meta-url/main.js');
			console.log('null=system.js:resolve-import-meta-url/main.js');

		}
	};
});

System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			console.log('no importer', new URL('generated-lib.js', module.meta.url).href);
			console.log('from maim', new URL('generated-lib.js', module.meta.url).href);
			console.log('from nested', new URL('generated-lib2.js', module.meta.url).href);

		})
	};
}));

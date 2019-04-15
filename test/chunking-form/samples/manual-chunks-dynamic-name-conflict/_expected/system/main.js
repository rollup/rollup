System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			module.import('./generated-chunk.js').then(result => console.log(result));
			module.import('./generated-dynamic.js').then(result => console.log(result));

		}
	};
});

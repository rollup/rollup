System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			module.import('./generated-dynamic.js').then(({DYNAMIC_USED_BY_A}) => console.log(DYNAMIC_USED_BY_A));

		}
	};
});

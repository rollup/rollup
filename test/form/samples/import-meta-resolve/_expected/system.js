System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			module.meta.resolve('./foo.js');

		}
	};
});

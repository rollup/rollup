System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			document.body.innerText = module.meta.url;

		}
	};
});

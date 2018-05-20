System.register('iife', ['external-package'], function (exports, module) {
	'use strict';
	var externalPackage;
	return {
		setters: [function (module) {
			externalPackage = module;
			exports('ext', module);
		}],
		execute: function () {



		}
	};
});

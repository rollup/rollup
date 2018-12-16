System.register('iife', ['external-package'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			exports('ext', module);
		}],
		execute: function () {



		}
	};
});

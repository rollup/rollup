System.register(['./chunk1.js', 'external'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			
		}, function (module) {
			exports('dep', module.asdf);
		}],
		execute: function () {



		}
	};
});

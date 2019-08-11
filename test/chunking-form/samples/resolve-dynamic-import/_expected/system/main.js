System.register(['./generated-existing.js', './direct-relative-external', 'to-indirect-relative-external', 'direct-absolute-external', 'to-indirect-absolute-external'], function (exports, module) {
	'use strict';
	return {
		setters: [function () {}, function () {}, function () {}, function () {}, function () {}],
		execute: function () {

			// nested
			module.import('./generated-existing.js');
			module.import('./direct-relative-external');
			module.import('to-indirect-relative-external');
			module.import('direct-absolute-external');
			module.import('to-indirect-absolute-external');

			//main
			module.import('./generated-existing.js');
			module.import('./direct-relative-external');
			module.import('to-indirect-relative-external');
			module.import('direct-absolute-external');
			module.import('to-indirect-absolute-external');

			module.import('dynamic-direct-external' + unknown);
			module.import('to-dynamic-indirect-external');
			module.import('./generated-existing.js');
			module.import('my' + 'replacement');

		}
	};
});

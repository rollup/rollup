System.register(['./entry-main2-um8DK13a-system.js'], (function () {
	'use strict';
	var log;
	return {
		setters: [function (module) {
			log = module.default;
		}],
		execute: (function () {

			var dep = { x: 42 };

			log(dep);

		})
	};
}));

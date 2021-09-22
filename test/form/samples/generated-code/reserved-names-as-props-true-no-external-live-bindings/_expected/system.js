System.register('bundle', ['external'], (function () {
	'use strict';
	var ns;
	return {
		setters: [function (module) {
			ns = module.default;
		}],
		execute: (function () {

			console.log(ns);

		})
	};
}));

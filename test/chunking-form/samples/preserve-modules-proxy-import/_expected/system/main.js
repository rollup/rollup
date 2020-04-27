System.register(['external', './proxy.js'], function () {
	'use strict';
	var proxyPath;
	return {
		setters: [function (module) {
			proxyPath = module.default;
		}, function () {}],
		execute: function () {

			console.log(proxyPath.normalize('foo\\bar'));
			console.log(proxyPath.normalize('foo\\bar'));

		}
	};
});

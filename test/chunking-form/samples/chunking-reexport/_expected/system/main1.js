System.register(['external', './generated-dep.js'], function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('dep', module.asdf);
		}, function () {}],
		execute: function () {



		}
	};
});

System.register(['./generated-lib2.js', './generated-lib1.js'], function (exports) {
	'use strict';
	return {
		setters: [function () {}, function (module) {
			exports('lib1', module.l);
		}],
		execute: function () {



		}
	};
});

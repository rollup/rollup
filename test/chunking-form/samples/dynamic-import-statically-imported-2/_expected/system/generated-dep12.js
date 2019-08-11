System.register(['./generated-dep1.js'], function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('bar', module.b);
		}],
		execute: function () {



		}
	};
});

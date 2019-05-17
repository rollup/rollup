System.register(['./inner/more_inner/something.js'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			exports('Something', module.Something);
		}],
		execute: function () {



		}
	};
});

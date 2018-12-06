System.register('myBundle', ['x'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			exports('x', module.default);
		}],
		execute: function () {



		}
	};
});

System.register('myBundle', ['x'], function (exports, module) {
	'use strict';
	var x;
	return {
		setters: [function (module) {
			x = module.default;
			exports('x', module.default);
		}],
		execute: function () {



		}
	};
});

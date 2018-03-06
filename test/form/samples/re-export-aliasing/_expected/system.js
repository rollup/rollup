System.register('reexportsAliasingExternal', ['d'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			exports('b', module.d);
		}],
		execute: function () {



		}
	};
});

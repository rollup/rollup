System.register('reexportsDefaultExternal', ['external'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			exports('default', module.objAlias);
		}],
		execute: function () {



		}
	};
});

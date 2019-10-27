System.register('bundle', ['external'], function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('external', module);
			exports('indirect', module);
		}],
		execute: function () {



		}
	};
});

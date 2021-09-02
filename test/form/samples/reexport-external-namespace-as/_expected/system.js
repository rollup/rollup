System.register('bundle', ['external'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports({ external: module, indirect: module });
		}],
		execute: (function () {



		})
	};
}));

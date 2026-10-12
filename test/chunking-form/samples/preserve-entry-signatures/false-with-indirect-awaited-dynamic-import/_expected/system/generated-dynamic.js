System.register(['./generated-constants.js'], (function (exports) {
	'use strict';
	var TABLE;
	return {
		setters: [function (module) {
			TABLE = module.T;
		}],
		execute: (function () {

			exports("setup", setup);

			async function setup() {
				return TABLE;
			}

		})
	};
}));

System.register(['./mainChunk.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("value", module.value);
		}],
		execute: (function () {



		})
	};
}));

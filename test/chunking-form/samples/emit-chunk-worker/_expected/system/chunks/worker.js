System.register(['./chunk.js'], function (exports, module) {
	'use strict';
	var shared;
	return {
		setters: [function (module) {
			shared = module.s;
		}],
		execute: function () {

			postMessage(`from worker: ${shared}`);

		}
	};
});

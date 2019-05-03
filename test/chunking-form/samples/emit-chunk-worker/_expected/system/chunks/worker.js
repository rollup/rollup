System.register(['./chunk.js'], function (exports, module) {
	'use strict';
	var shared;
	return {
		setters: [function (module) {
			shared = module.a;
		}],
		execute: function () {

			postMessage(`from worker: ${shared}`);

		}
	};
});

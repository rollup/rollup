System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			module.import(
			/* webpackChunkName: "chunk-name" */
			'./foo.js'/*suffix*/);

		}
	};
});

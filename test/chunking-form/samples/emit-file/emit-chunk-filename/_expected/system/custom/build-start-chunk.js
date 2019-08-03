System.register(['../generated-dep.js'], function (exports) {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.v;
		}],
		execute: function () {

			const id = exports('id', 'startBuild');
			console.log(id, value);

		}
	};
});

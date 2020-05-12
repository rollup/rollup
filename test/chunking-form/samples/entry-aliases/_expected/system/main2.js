System.register(['./generated-dep.js'], function () {
	'use strict';
	var name;
	return {
		setters: [function (module) {
			name = module.n;
		}],
		execute: function () {

			console.log(name);

		}
	};
});

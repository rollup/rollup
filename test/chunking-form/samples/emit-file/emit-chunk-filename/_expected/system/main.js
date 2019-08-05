System.register(['./generated-dep.js', './custom/build-start-chunk.js'], function () {
	'use strict';
	var value, id;
	return {
		setters: [function (module) {
			value = module.v;
		}, function (module) {
			id = module.id;
		}],
		execute: function () {

			console.log(id);

			console.log('main', value);

		}
	};
});

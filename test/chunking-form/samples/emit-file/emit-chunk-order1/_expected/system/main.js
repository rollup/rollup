System.register(['./generated-dep.js', './generated-emitted.js'], function () {
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

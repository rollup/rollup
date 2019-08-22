System.register(['external'], function (exports, module) {
	'use strict';
	var join;
	return {
		setters: [function (module) {
			join = module.join;
		}],
		execute: function () {

			module.import(join('a', 'b'));
			console.log(join);

		}
	};
});

System.register(['./reexport.js', './dep.js'], (function () {
	'use strict';
	var value;
	return {
		setters: [null, function (module) {
			value = module.value;
		}],
		execute: (function () {

			console.log(value);

		})
	};
}));

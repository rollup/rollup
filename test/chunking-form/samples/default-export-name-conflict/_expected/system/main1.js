System.register(['./generated-module1.js'], (function () {
	'use strict';
	var firebase;
	return {
		setters: [function (module) {
			firebase = module.f;
		}],
		execute: (function () {

			console.log(firebase, firebase);

		})
	};
}));

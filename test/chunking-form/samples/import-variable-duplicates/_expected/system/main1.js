System.register(['./first.js', './head.js'], function (exports, module) {
	'use strict';
	var head2;
	return {
		setters: [function (module) {
			head2 = module.default;
		}, function (module) {
			
		}],
		execute: function () {

			console.log(head2);
			console.log(head2);

		}
	};
});

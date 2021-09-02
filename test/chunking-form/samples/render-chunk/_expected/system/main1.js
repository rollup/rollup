System.register(['./chunk-dep2.js'], (function () {
	'use strict';
	var num$1;
	return {
		setters: [function (module) {
			num$1 = module.n;
		}],
		execute: (function () {

			var num = 1;

			console.log(num + num$1);

		})
	};
}));
console.log('fileName', 'main1.js');
console.log('imports', 'chunk-dep2.js');
console.log('isEntry', true);
console.log('name', 'main1');
console.log('modules.length', 2);

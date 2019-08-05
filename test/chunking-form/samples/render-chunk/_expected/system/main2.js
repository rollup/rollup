System.register(['./chunk-dep2.js'], function () {
	'use strict';
	var num$1;
	return {
		setters: [function (module) {
			num$1 = module.n;
		}],
		execute: function () {

			var num = 3;

			console.log(num$1 + num);

		}
	};
});
console.log('fileName', 'main2.js');
console.log('imports', 'chunk-dep2.js');
console.log('isEntry', true);
console.log('name', 'main2');
console.log('modules.length', 2);

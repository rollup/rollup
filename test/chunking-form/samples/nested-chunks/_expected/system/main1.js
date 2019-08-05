System.register(['./generated-dep.js'], function (exports, module) {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.v;
		}],
		execute: function () {

			console.log('main1', value);

			module.import('./generated-dynamic.js').then(result => console.log(result));
			module.import('./external.js').then(result => console.log(result));

		}
	};
});

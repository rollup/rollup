System.register(['./generated-chunk.js'], function (exports, module) {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.a;
		}],
		execute: function () {

			console.log('virtual', value);
			new Worker(new URL('load.js', module.meta.url).href);

			console.log('main', value);

		}
	};
});

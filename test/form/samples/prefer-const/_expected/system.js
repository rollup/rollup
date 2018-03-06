System.register('myBundle', ['other'], function (exports, module) {
	'use strict';
	var name;
	return {
		setters: [function (module) {
			name = module.name;
		}],
		execute: function () {

			const a = 1;
			const b = 2;


			const namespace = Object.freeze({
				a: a,
				b: b
			});

			console.log( Object.keys( namespace ) );
			console.log( name );

			const main = exports('default', 42);

		}
	};
});

System.register(['./generated-foo-prefix.js'], (function (exports, module) {
	'use strict';
	var fooPrefix;
	return {
		setters: [function (module) {
			fooPrefix = module.f;
		}],
		execute: (async function () {

			const { foo } = await module.import('./generated-foo.js');

			function getFoo() {
				return unknownFlag ? foo : fooPrefix;
			}

			console.log(getFoo());

		})
	};
}));

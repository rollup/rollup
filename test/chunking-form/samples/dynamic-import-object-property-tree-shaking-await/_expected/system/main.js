System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			async function test() {
				const dep = await module.import('./generated-dep.js');
				console.log(dep.obj.a.a.a);
			}

			test();

		})
	};
}));

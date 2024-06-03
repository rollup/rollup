System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const lazy1 = exports("lazy1", module.import('./generated-foo_20bar.js'));
			const lazy2 = exports("lazy2", module.import('./generated-foo_bar.js'));
			const lazy3 = exports("lazy3", module.import('./generated-foo_E3_81_82bar.js'));
			const lazy4 = exports("lazy4", module.import('./generated-foo_E3_81bar.js'));

		})
	};
}));

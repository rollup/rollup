System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			class main {
				constructor() {
					console.log('class');
				}
			} exports("default", main);

		})
	};
}));

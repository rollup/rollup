System.register('bundle', [], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			exports('something', something);
			const e = 2.7182818284;

			function something () {
				try {
					console.log( e );
				} catch ( e$$1 ) { // the catch identifier shadows the import
					console.error( e$$1 );
				}
			}

		}
	};
});

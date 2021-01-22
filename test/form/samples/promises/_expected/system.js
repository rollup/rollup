System.register('bundle', [], function (exports) {
	'use strict';
	return {
		execute: function () {

			new Promise( () => {
				console.log( 'fire & forget' );
			} );

			const p2 = new Promise( () => {
				console.info( 'forget me as well' );
			} );

			const p3 = new Promise( () => {
				console.info( 'and me too' );
			} );
			Promise.reject('should be kept for uncaught rejections');
			const allExported = exports('allExported', Promise.all([p2, p3]));

		}
	};
});

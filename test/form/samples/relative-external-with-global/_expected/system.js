System.register(['../lib/throttle.js'], function (exports, module) {
	'use strict';
	var throttle;
	return {
		setters: [function (module) {
			throttle = module.default;
		}],
		execute: function () {

			const fn = throttle( () => {
				console.log( '.' );
			}, 500 );

			window.addEventListener( 'mousemove', throttle );

		}
	};
});

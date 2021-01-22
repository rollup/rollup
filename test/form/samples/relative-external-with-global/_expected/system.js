System.register(['./lib/throttle.js'], function () {
	'use strict';
	var throttle;
	return {
		setters: [function (module) {
			throttle = module.default;
		}],
		execute: function () {

			throttle( () => {
				console.log( '.' );
			}, 500 );

			window.addEventListener( 'mousemove', throttle );

		}
	};
});

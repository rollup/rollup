System.register(['jquery'], function (exports, module) {
	'use strict';
	var $;
	return {
		setters: [function (module) {
			$ = module.default;
		}],
		execute: function () {

			$( function () {
				$( 'body' ).html( '<h1>hello world!</h1>' );
			});

		}
	};
});

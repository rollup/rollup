define(function () { 'use strict';

	const retained1a = {
		get effect () {
			console.log( 'effect' );
		},
		get noEffect () {
			
		}
	};

	const retained1b = retained1a.effect;

});

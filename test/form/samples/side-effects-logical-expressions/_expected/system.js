System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			// effect
			false || console.log( 'effect' );
			true && console.log( 'effect' );
			console.log( 'effect' ) || {};
			console.log( 'effect' ) && {};

			const foo = {
				get effect () {
					console.log( 'effect' );
				},
				get noEffect () {}
			};

			// effect
			(false || foo).effect;
			(true && foo).effect;

			// effect
			(false || null).foo = 1;
			(true && null).foo = 1;

			// effect
			(true || (() => {}))();
			(false && (() => {}))();
			(false || (() => console.log( 'effect' )))();
			(true && (() => console.log( 'effect' )))();

			// effect
			(true || (() => () => {}))()();
			(false && (() => () => {}))()();
			(false || (() => () => console.log( 'effect' )))()();
			(true && (() => () => console.log( 'effect' )))()();

		}
	};
});

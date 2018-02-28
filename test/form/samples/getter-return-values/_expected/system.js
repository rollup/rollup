System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			({
				get foo () {
					console.log( 'effect' );
					return {};
				}
			}).foo.bar;
			({
				get foo () {
					return {};
				}
			}).foo.bar.baz;
			({
				get foo () {
					console.log( 'effect' );
					return () => {};
				}
			}).foo();
			({
				get foo () {
					return () => console.log( 'effect' );
				}
			}).foo();
			({
				get foo () {
					console.log( 'effect' );
					return () => () => {};
				}
			}).foo()();
			({
				get foo () {
					return () => () => console.log( 'effect' );
				}
			}).foo()();

		}
	};
});

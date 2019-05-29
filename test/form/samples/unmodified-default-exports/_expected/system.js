System.register([], function () {
	'use strict';
	return {
		execute: function () {

			var Foo = function () {
				console.log( 'side effect' );
				this.isFoo = true;
			};

			Foo.prototype = {
				answer: function () {
					return 42;
				}
			};

			var foo = new Foo();

		}
	};
});

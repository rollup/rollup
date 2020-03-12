System.register([], function () {
	'use strict';
	return {
		execute: function () {

			var dep2 = {bar: {foo: 'works'}};

			console.log(dep2.bar.foo);

		}
	};
});

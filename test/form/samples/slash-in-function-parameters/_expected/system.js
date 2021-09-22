System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			class someClass {}

			function someFunction (text = '/') {}

			console.log(someClass, someFunction);

		})
	};
}));

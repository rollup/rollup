System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			const mutateThis = () => {
				undefined.x = 1;
			};

			function Test () {
				mutateThis();
			}

			const test = new Test();

		}
	};
});

System.register(['\0do-not-sanitize'], function () {
	'use strict';
	var external;
	return {
		setters: [function (module) {
			external = module.default;
		}],
		execute: function () {

			console.log(external);

		}
	};
});

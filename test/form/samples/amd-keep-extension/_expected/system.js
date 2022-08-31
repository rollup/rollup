System.register(['./relative', 'abso/lute', './relative.js', 'abso/lute.js'], (function () {
	'use strict';
	var relative, absolute, relativeExtension, absoluteExtension;
	return {
		setters: [function (module) {
			relative = module["default"];
		}, function (module) {
			absolute = module["default"];
		}, function (module) {
			relativeExtension = module["default"];
		}, function (module) {
			absoluteExtension = module["default"];
		}],
		execute: (function () {

			console.log(relative, absolute, relativeExtension, absoluteExtension);

		})
	};
}));

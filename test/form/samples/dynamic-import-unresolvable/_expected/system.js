System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			module.import(`${globalThis.unknown}`);
			module.import(`My ${globalThis.unknown}`);
			module.import(7);

		}
	};
});

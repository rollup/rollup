var bundle = (function (exports, input) {
	'use strict';

	class Importer {
		constructor() {
			this.outputPath = input.outputPath;
		}

		getImport() {
			return import(this.outputPath);
		}
	}

	const promise = new Importer().getImport();

	exports.promise = promise;

	return exports;

})({}, input);

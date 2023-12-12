System.register('bundle', ['input'], (function (exports, module) {
	'use strict';
	var outputPath;
	return {
		setters: [function (module) {
			outputPath = module.outputPath;
		}],
		execute: (function () {

			class Importer {
				constructor() {
					this.outputPath = outputPath;
				}

				getImport() {
					return module.import(this.outputPath);
				}
			}

			const promise = exports("promise", new Importer().getImport());

		})
	};
}));

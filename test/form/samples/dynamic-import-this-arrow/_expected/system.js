System.register('bundle', ['input'], ((exports, module) => {
	'use strict';
	var outputPath;
	return {
		setters: [(module => {
			outputPath = module.outputPath;
		})],
		execute: (() => {

			class Importer {
				constructor() {
					this.outputPath = outputPath;
				}

				getImport() {
					return module.import(this.outputPath);
				}
			}

			const promise = exports('promise', new Importer().getImport());

		})
	};
}));

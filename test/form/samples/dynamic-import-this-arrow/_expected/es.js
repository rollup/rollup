import { outputPath } from 'input';

class Importer {
	constructor() {
		this.outputPath = outputPath;
	}

	getImport() {
		return import(this.outputPath);
	}
}

const promise = new Importer().getImport();

export { promise };

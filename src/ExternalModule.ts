import { blank } from './utils/object';
import { makeLegal } from './utils/identifierHelpers';
import ExternalVariable from './ast/variables/ExternalVariable';

export default class ExternalModule {
	constructor (id) {
		this.id = id;

		const parts = id.split(/[\\/]/);
		this.name = makeLegal(parts.pop());

		this.nameSuggestions = blank();
		this.mostCommonSuggestion = 0;

		this.isExternal = true;
		this.used = false;
		this.declarations = blank();

		this.exportsNames = false;
	}

	suggestName (name) {
		if (!this.nameSuggestions[name]) this.nameSuggestions[name] = 0;
		this.nameSuggestions[name] += 1;

		if (this.nameSuggestions[name] > this.mostCommonSuggestion) {
			this.mostCommonSuggestion = this.nameSuggestions[name];
			this.name = name;
		}
	}

	traceExport (name) {
		if (name !== 'default' && name !== '*') this.exportsNames = true;
		if (name === '*') this.exportsNamespace = true;

		return (
			this.declarations[name] ||
			(this.declarations[name] = new ExternalVariable(this, name))
		);
	}
}

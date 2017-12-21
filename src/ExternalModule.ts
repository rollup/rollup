import { blank } from './utils/object';
import { makeLegal } from './utils/identifierHelpers';
import ExternalVariable from './ast/variables/ExternalVariable';
import Variable from './ast/variables/Variable';

export default class ExternalModule {
	declarations: {[name: string]: Variable};
	exportsNames: boolean;
	exportsNamespace: boolean;
	id: string;
	isExternal: boolean;
	name: string;
	mostCommonSuggestion: number;
	nameSuggestions: {[name: string]: number};
	used: boolean;

	constructor (id: string) {
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

	suggestName (name: string) {
		if (!this.nameSuggestions[name]) this.nameSuggestions[name] = 0;
		this.nameSuggestions[name] += 1;

		if (this.nameSuggestions[name] > this.mostCommonSuggestion) {
			this.mostCommonSuggestion = this.nameSuggestions[name];
			this.name = name;
		}
	}

	traceExport (name: string): Variable {
		if (name !== 'default' && name !== '*') this.exportsNames = true;
		if (name === '*') this.exportsNamespace = true;

		return (
			this.declarations[name] ||
			(this.declarations[name] = new ExternalVariable(this, name))
		);
	}
}

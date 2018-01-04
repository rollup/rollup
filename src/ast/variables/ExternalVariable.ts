import Variable from './Variable';
import Identifier from '../nodes/Identifier';
import ExternalModule from '../../ExternalModule';

export function isExternalVariable (variable: Variable): variable is ExternalVariable {
	return variable.isExternal;
}

export default class ExternalVariable extends Variable {
	module: ExternalModule;
	safeName: string;
	isExternal: true;
	isNamespace: boolean;

	constructor (module: ExternalModule, name: string) {
		super(name);
		this.module = module;
		this.safeName = null;
		this.isExternal = true;
		this.isNamespace = name === '*';
	}

	addReference (identifier: Identifier) {
		if (this.name === 'default' || this.name === '*') {
			this.module.suggestName(identifier.name);
		}
	}

	getName (es: boolean) {
		if (this.name === '*') {
			return this.module.name;
		}

		if (this.name === 'default') {
			return this.module.exportsNamespace || (!es && this.module.exportsNames)
				? `${this.module.name}__default`
				: this.module.name;
		}

		return es ? this.safeName : `${this.module.name}.${this.name}`;
	}

	includeVariable () {
		if (this.included) {
			return false;
		}
		this.included = true;
		this.module.used = true;
		return true;
	}

	setSafeName (name: string) {
		this.safeName = name;
	}
}

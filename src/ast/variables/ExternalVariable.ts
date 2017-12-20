import Variable from './Variable';
import Module from '../../Module';
import Identifier from '../nodes/Identifier';

export default class ExternalVariable extends Variable {
	module: Module;
	safeName: string;
	isExternal: boolean;
	isNamespace: boolean;

	constructor (module: Module, name: string) {
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

	getName (es) {
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

import ExternalModule from '../../ExternalModule';
import Identifier from '../nodes/Identifier';
import Variable from './Variable';

export default class ExternalVariable extends Variable {
	isExternal: true;
	isNamespace: boolean;
	module: ExternalModule;
	referenced: boolean;

	constructor(module: ExternalModule, name: string) {
		super(name);
		this.module = module;
		this.isNamespace = name === '*';
		this.referenced = false;
	}

	addReference(identifier: Identifier) {
		this.referenced = true;
		if (this.name === 'default' || this.name === '*') {
			this.module.suggestName(identifier.name);
		}
	}

	include() {
		if (!this.included) {
			this.included = true;
			this.module.used = true;
		}
	}
}

ExternalVariable.prototype.isExternal = true;

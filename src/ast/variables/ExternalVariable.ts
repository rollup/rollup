import Variable from './Variable';
import Identifier from '../nodes/Identifier';
import ExternalModule from '../../ExternalModule';

export function isExternalVariable(variable: Variable): variable is ExternalVariable {
	return variable.isExternal;
}

export default class ExternalVariable extends Variable {
	module: ExternalModule;
	isExternal: true;
	isNamespace: boolean;
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
			(<ExternalModule>this.module).suggestName(identifier.name);
		}
	}

	include() {
		if (this.included) {
			return false;
		}
		this.included = true;
		this.module.used = true;
		return true;
	}
}

ExternalVariable.prototype.isExternal = true;

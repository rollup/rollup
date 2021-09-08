import ExternalModule from '../../ExternalModule';
import Identifier from '../nodes/Identifier';
import { ObjectPath } from '../utils/PathTracker';
import Variable from './Variable';

export default class ExternalVariable extends Variable {
	isNamespace: boolean;
	module: ExternalModule;
	referenced = false;

	constructor(module: ExternalModule, name: string) {
		super(name);
		this.module = module;
		this.isNamespace = name === '*';
	}

	addReference(identifier: Identifier): void {
		this.referenced = true;
		if (this.name === 'default' || this.name === '*') {
			this.module.suggestName(identifier.name);
		}
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
		return path.length > (this.isNamespace ? 1 : 0);
	}

	include(): void {
		if (!this.included) {
			this.included = true;
			this.module.used = true;
		}
	}
}

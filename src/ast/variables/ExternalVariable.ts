import type ExternalModule from '../../ExternalModule';
import type { InclusionContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { INTERACTION_ACCESSED } from '../NodeInteractions';
import type IdentifierBase from '../nodes/shared/IdentifierBase';
import { type ObjectPath } from '../utils/PathTracker';
import Variable from './Variable';

export default class ExternalVariable extends Variable {
	readonly isNamespace: boolean;
	readonly module: ExternalModule;
	referenced = false;

	constructor(module: ExternalModule, name: string) {
		super(name);
		this.module = module;
		this.isNamespace = name === '*';
	}

	addReference(identifier: IdentifierBase): void {
		this.referenced = true;
		if (this.name === 'default' || this.name === '*') {
			this.module.suggestName(identifier.name);
		}
	}

	hasEffectsOnInteractionAtPath(path: ObjectPath, { type }: NodeInteraction): boolean {
		return type !== INTERACTION_ACCESSED || path.length > (this.isNamespace ? 1 : 0);
	}

	includePath(path: ObjectPath, context: InclusionContext): void {
		super.includePath(path, context);
		this.module.used = true;
	}
}

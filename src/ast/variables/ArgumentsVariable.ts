import type { AstContext } from '../../Module';
import { UNKNOWN_EXPRESSION } from '../nodes/shared/Expression';
import type { ObjectPath } from '../utils/PathTracker';
import LocalVariable from './LocalVariable';

export default class ArgumentsVariable extends LocalVariable {
	constructor(context: AstContext) {
		super('arguments', null, UNKNOWN_EXPRESSION, context);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath(): boolean {
		return true;
	}

	hasEffectsWhenCalledAtPath(): boolean {
		return true;
	}
}

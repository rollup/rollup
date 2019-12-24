import { AstContext } from '../../Module';
import { ObjectPath } from '../utils/PathTracker';
import { UNKNOWN_EXPRESSION } from '../values';
import LocalVariable from './LocalVariable';

export default class ArgumentsVariable extends LocalVariable {
	constructor(context: AstContext) {
		super('arguments', null, UNKNOWN_EXPRESSION, context);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath() {
		return true;
	}

	hasEffectsWhenCalledAtPath(): boolean {
		return true;
	}
}

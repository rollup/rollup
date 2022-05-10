import { CallOptions } from '../CallOptions';
import { HasEffectsContext } from '../ExecutionContext';
import { getGlobalAtPath } from '../nodes/shared/knownGlobals';
import type { ObjectPath } from '../utils/PathTracker';
import { UNKNOWN_NON_ACCESSOR_PATH } from '../utils/PathTracker';
import Variable from './Variable';

export default class GlobalVariable extends Variable {
	isReassigned = true;

	hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
		if (path.length === 0) {
			return this.name !== 'undefined' && getGlobalAtPath([this.name]) === null;
		}
		return getGlobalAtPath([this.name, ...path].slice(0, -1)) === null;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		const globalAtPath = getGlobalAtPath([this.name, ...path]);
		return (
			globalAtPath === null ||
			!globalAtPath.function ||
			(globalAtPath.mutatesArg1 &&
				(!callOptions.args.length ||
					callOptions.args[0].hasEffectsWhenAssignedAtPath(UNKNOWN_NON_ACCESSOR_PATH, context)))
		);
	}
}

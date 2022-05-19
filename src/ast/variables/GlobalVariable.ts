import { CallOptions } from '../CallOptions';
import { HasEffectsContext } from '../ExecutionContext';
import { getGlobalAtPath } from '../nodes/shared/knownGlobals';
import type { ObjectPath } from '../utils/PathTracker';
import Variable from './Variable';

export default class GlobalVariable extends Variable {
	// Ensure we use live-bindings for globals as we do not know if they have
	// been reassigned
	isReassigned = true;

	hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
		if (path.length === 0) {
			// Technically, "undefined" is a global variable of sorts
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
		return globalAtPath === null || globalAtPath.hasEffectsWhenCalled(callOptions, context);
	}
}

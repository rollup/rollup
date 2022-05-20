import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext } from '../ExecutionContext';
import {
	LiteralValueOrUnknown,
	UnknownTruthyValue,
	UnknownValue
} from '../nodes/shared/Expression';
import { getGlobalAtPath } from '../nodes/shared/knownGlobals';
import type { ObjectPath } from '../utils/PathTracker';
import { PathTracker } from '../utils/PathTracker';
import Variable from './Variable';

export default class GlobalVariable extends Variable {
	// Ensure we use live-bindings for globals as we do not know if they have
	// been reassigned
	isReassigned = true;

	getLiteralValueAtPath(
		path: ObjectPath,
		_recursionTracker: PathTracker,
		_origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return getGlobalAtPath([this.name, ...path]) ? UnknownTruthyValue : UnknownValue;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
		if (path.length === 0) {
			// Technically, "undefined" is a global variable of sorts
			return this.name !== 'undefined' && !getGlobalAtPath([this.name]);
		}
		return !getGlobalAtPath([this.name, ...path].slice(0, -1));
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		const globalAtPath = getGlobalAtPath([this.name, ...path]);
		return !globalAtPath || globalAtPath.hasEffectsWhenCalled(callOptions, context);
	}
}

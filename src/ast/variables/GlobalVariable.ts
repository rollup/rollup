import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext } from '../ExecutionContext';
import {
	INTERACTION_ACCESSED,
	INTERACTION_ASSIGNED,
	INTERACTION_CALLED,
	NodeInteraction
} from '../NodeInteractions';
import { LiteralValueOrUnknown, UnknownValue } from '../nodes/shared/Expression';
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
		const globalAtPath = getGlobalAtPath([this.name, ...path]);
		return globalAtPath ? globalAtPath.getLiteralValue() : UnknownValue;
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		switch (interaction.type) {
			case INTERACTION_ACCESSED:
				if (path.length === 0) {
					// Technically, "undefined" is a global variable of sorts
					return this.name !== 'undefined' && !getGlobalAtPath([this.name]);
				}
				return !getGlobalAtPath([this.name, ...path].slice(0, -1));
			case INTERACTION_ASSIGNED:
				return true;
			case INTERACTION_CALLED: {
				const globalAtPath = getGlobalAtPath([this.name, ...path]);
				return !globalAtPath || globalAtPath.hasEffectsWhenCalled(interaction, context);
			}
		}
	}
}

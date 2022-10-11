import type { AstContext } from '../../Module';
import type { NodeInteraction } from '../NodeInteractions';
import { INTERACTION_ACCESSED } from '../NodeInteractions';
import { UNKNOWN_EXPRESSION } from '../nodes/shared/Expression';
import type { ObjectPath } from '../utils/PathTracker';
import LocalVariable from './LocalVariable';

export default class ArgumentsVariable extends LocalVariable {
	constructor(context: AstContext) {
		super('arguments', null, UNKNOWN_EXPRESSION, context);
	}

	hasEffectsOnInteractionAtPath(path: ObjectPath, { type }: NodeInteraction): boolean {
		return type !== INTERACTION_ACCESSED || path.length > 1;
	}
}

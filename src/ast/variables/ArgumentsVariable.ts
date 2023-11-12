import type { AstContext } from '../../Module';
import type { NodeInteraction } from '../NodeInteractions';
import { INTERACTION_ACCESSED } from '../NodeInteractions';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import { UNKNOWN_EXPRESSION } from '../nodes/shared/Expression';
import { VariableKind } from '../nodes/shared/VariableKinds';
import type { ObjectPath } from '../utils/PathTracker';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import LocalVariable from './LocalVariable';

export default class ArgumentsVariable extends LocalVariable {
	private deoptimizedArguments: ExpressionEntity[] = [];

	constructor(context: AstContext) {
		super('arguments', null, UNKNOWN_EXPRESSION, context, VariableKind.other);
	}

	addArgumentToBeDeoptimized(argument: ExpressionEntity): void {
		if (this.included) {
			argument.deoptimizePath(UNKNOWN_PATH);
		} else {
			this.deoptimizedArguments.push(argument);
		}
	}

	hasEffectsOnInteractionAtPath(path: ObjectPath, { type }: NodeInteraction): boolean {
		return type !== INTERACTION_ACCESSED || path.length > 1;
	}

	include() {
		super.include();
		for (const argument of this.deoptimizedArguments) {
			argument.deoptimizePath(UNKNOWN_PATH);
		}
		this.deoptimizedArguments.length = 0;
	}
}

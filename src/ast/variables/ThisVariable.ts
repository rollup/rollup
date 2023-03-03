import type { AstContext } from '../../Module';
import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { UNKNOWN_EXPRESSION } from '../nodes/shared/Expression';
import { type ObjectPath } from '../utils/PathTracker';
import ParameterVariable from './ParameterVariable';

export default class ThisVariable extends ParameterVariable {
	constructor(context: AstContext) {
		super('this', null, null, context);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		const replacedVariableInit = context.replacedVariableInits.get(this);
		if (replacedVariableInit) {
			return (
				replacedVariableInit.hasEffectsOnInteractionAtPath(path, interaction, context) ||
				// If the surrounding function is included, all mutations of "this" must
				// be counted as side effects, which is what this second line does.
				(!context.ignore.this && super.hasEffectsOnInteractionAtPath(path, interaction, context))
			);
		}
		return UNKNOWN_EXPRESSION.hasEffectsOnInteractionAtPath(path, interaction, context);
	}
}

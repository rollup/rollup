import type { AstContext } from '../../Module';
import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { UNKNOWN_EXPRESSION } from '../nodes/shared/Expression';
import { type ObjectPath } from '../utils/PathTracker';
import ParameterVariable from './ParameterVariable';

export default class ThisVariable extends ParameterVariable {
	constructor(context: AstContext) {
		super('this', null, context);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		return (
			context.replacedVariableInits.get(this) || UNKNOWN_EXPRESSION
		).hasEffectsOnInteractionAtPath(path, interaction, context);
	}
}

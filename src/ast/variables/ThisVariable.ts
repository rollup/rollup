import type { AstContext } from '../../Module';
import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { UNKNOWN_EXPRESSION } from '../nodes/shared/Expression';
import {
	EMPTY_PATH,
	IncludedFullPathTracker,
	type IncludedPathTracker,
	type ObjectPath
} from '../utils/PathTracker';
import ParameterVariable from './ParameterVariable';

export default class ThisVariable extends ParameterVariable {
	// Unlike parameters, track nested paths so receivers only keep what is accessed via "this"
	protected includedPathTracker: IncludedPathTracker = new IncludedFullPathTracker();

	constructor(context: AstContext) {
		super('this', null, EMPTY_PATH, context);
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

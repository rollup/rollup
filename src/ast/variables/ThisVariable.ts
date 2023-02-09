import type { AstContext } from '../../Module';
import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteraction, NodeInteractionWithThisArgument } from '../NodeInteractions';
import { type ExpressionEntity, UNKNOWN_EXPRESSION } from '../nodes/shared/Expression';
import {
	DiscriminatedPathTracker,
	type ObjectPath,
	SHARED_RECURSION_TRACKER
} from '../utils/PathTracker';
import LocalVariable from './LocalVariable';

interface ThisDeoptimizationInteraction {
	interaction: NodeInteractionWithThisArgument;
	path: ObjectPath;
}

export default class ThisVariable extends LocalVariable {
	private readonly deoptimizedPaths: ObjectPath[] = [];
	private readonly entitiesToBeDeoptimized = new Set<ExpressionEntity>();
	private readonly thisDeoptimizationList: ThisDeoptimizationInteraction[] = [];
	private readonly thisDeoptimizations = new DiscriminatedPathTracker();

	constructor(context: AstContext) {
		super('this', null, null, context);
	}

	addEntityToBeDeoptimized(entity: ExpressionEntity): void {
		for (const path of this.deoptimizedPaths) {
			entity.deoptimizePath(path);
		}
		for (const { interaction, path } of this.thisDeoptimizationList) {
			entity.deoptimizeThisOnInteractionAtPath(interaction, path, SHARED_RECURSION_TRACKER);
		}
		this.entitiesToBeDeoptimized.add(entity);
	}

	deoptimizePath(path: ObjectPath): void {
		if (
			path.length === 0 ||
			this.deoptimizationTracker.trackEntityAtPathAndGetIfTracked(path, this)
		) {
			return;
		}
		this.deoptimizedPaths.push(path);
		for (const entity of this.entitiesToBeDeoptimized) {
			entity.deoptimizePath(path);
		}
	}

	deoptimizeThisOnInteractionAtPath(
		interaction: NodeInteractionWithThisArgument,
		path: ObjectPath
	): void {
		const thisDeoptimization: ThisDeoptimizationInteraction = {
			interaction,
			path
		};
		if (
			!this.thisDeoptimizations.trackEntityAtPathAndGetIfTracked(
				path,
				interaction.type,
				interaction.thisArg
			)
		) {
			for (const entity of this.entitiesToBeDeoptimized) {
				entity.deoptimizeThisOnInteractionAtPath(interaction, path, SHARED_RECURSION_TRACKER);
			}
			this.thisDeoptimizationList.push(thisDeoptimization);
		}
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

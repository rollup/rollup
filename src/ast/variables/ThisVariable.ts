import type { AstContext } from '../../Module';
import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { type ExpressionEntity, UNKNOWN_EXPRESSION } from '../nodes/shared/Expression';
import {
	DiscriminatedPathTracker,
	type ObjectPath,
	SHARED_RECURSION_TRACKER
} from '../utils/PathTracker';
import LocalVariable from './LocalVariable';

interface ThisDeoptimizationInteraction {
	interaction: NodeInteraction;
	path: ObjectPath;
	thisParameter: ExpressionEntity;
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
		for (const thisDeoptimization of this.thisDeoptimizationList) {
			this.applyThisDeoptimizationInteraction(entity, thisDeoptimization);
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
		interaction: NodeInteraction,
		path: ObjectPath,
		thisParameter: ExpressionEntity
	): void {
		const thisDeoptimization: ThisDeoptimizationInteraction = {
			interaction,
			path,
			thisParameter
		};
		if (
			!this.thisDeoptimizations.trackEntityAtPathAndGetIfTracked(path, interaction, thisParameter)
		) {
			for (const entity of this.entitiesToBeDeoptimized) {
				this.applyThisDeoptimizationInteraction(entity, thisDeoptimization);
			}
			this.thisDeoptimizationList.push(thisDeoptimization);
		}
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return (
			this.getInit(context).hasEffectsWhenAccessedAtPath(path, context) ||
			super.hasEffectsWhenAccessedAtPath(path, context)
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return (
			this.getInit(context).hasEffectsWhenAssignedAtPath(path, context) ||
			super.hasEffectsWhenAssignedAtPath(path, context)
		);
	}

	private applyThisDeoptimizationInteraction(
		entity: ExpressionEntity,
		{ interaction, path, thisParameter }: ThisDeoptimizationInteraction
	) {
		entity.deoptimizeThisOnInteractionAtPath(
			interaction,
			path,
			thisParameter === this ? entity : thisParameter,
			SHARED_RECURSION_TRACKER
		);
	}

	private getInit(context: HasEffectsContext): ExpressionEntity {
		return context.replacedVariableInits.get(this) || UNKNOWN_EXPRESSION;
	}
}

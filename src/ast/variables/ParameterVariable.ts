import type { NodeInteraction } from '../NodeInteractions';
import { type ExpressionEntity } from '../nodes/shared/Expression';
import {
	DiscriminatedPathTracker,
	type ObjectPath,
	SHARED_RECURSION_TRACKER
} from '../utils/PathTracker';
import LocalVariable from './LocalVariable';

interface DeoptimizationInteraction {
	interaction: NodeInteraction;
	path: ObjectPath;
}

export default class ParameterVariable extends LocalVariable {
	private readonly deoptimizationInteractions: DeoptimizationInteraction[] = [];
	private readonly deoptimizations = new DiscriminatedPathTracker();
	private readonly deoptimizedPaths: ObjectPath[] = [];
	private readonly entitiesToBeDeoptimized = new Set<ExpressionEntity>();

	addEntityToBeDeoptimized(entity: ExpressionEntity): void {
		for (const path of this.deoptimizedPaths) {
			entity.deoptimizePath(path);
		}
		for (const { interaction, path } of this.deoptimizationInteractions) {
			entity.deoptimizeArgumentsOnInteractionAtPath(interaction, path, SHARED_RECURSION_TRACKER);
		}
		this.entitiesToBeDeoptimized.add(entity);
	}

	deoptimizeArgumentsOnInteractionAtPath(interaction: NodeInteraction, path: ObjectPath): void {
		if (
			interaction.thisArg &&
			!this.deoptimizations.trackEntityAtPathAndGetIfTracked(
				path,
				interaction.type,
				interaction.thisArg
			)
		) {
			for (const entity of this.entitiesToBeDeoptimized) {
				entity.deoptimizeArgumentsOnInteractionAtPath(interaction, path, SHARED_RECURSION_TRACKER);
			}
			this.deoptimizationInteractions.push({
				interaction,
				path
			});
		}
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
}

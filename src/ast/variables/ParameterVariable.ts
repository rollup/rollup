import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { Entity } from '../Entity';
import type { NodeInteraction, NodeInteractionCalled } from '../NodeInteractions';
import { ExpressionEntity } from '../nodes/shared/Expression';
import type { ObjectPath, PathTracker } from '../utils/PathTracker';
import {
	DiscriminatedPathTracker,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH
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
	private readonly deoptimizedReturns: {
		calledPath: ObjectPath;
		deoptimizedPath: ObjectPath;
		interaction: NodeInteractionCalled;
		origin: DeoptimizableEntity;
	}[] = [];
	private readonly entitiesToBeDeoptimized = new Set<ExpressionEntity>();
	private readonly returnTrackingEntity: Entity = {};

	addEntityToBeDeoptimized(entity: ExpressionEntity): void {
		for (const path of this.deoptimizedPaths) {
			entity.deoptimizePath(path);
		}
		for (const { interaction, path } of this.deoptimizationInteractions) {
			entity.deoptimizeArgumentsOnInteractionAtPath(interaction, path, SHARED_RECURSION_TRACKER);
		}
		for (const { calledPath, deoptimizedPath, interaction, origin } of this.deoptimizedReturns) {
			entity
				.getReturnExpressionWhenCalledAtPath(
					calledPath,
					interaction,
					SHARED_RECURSION_TRACKER,
					origin
				)[0]
				.deoptimizePath(deoptimizedPath);
		}
		this.entitiesToBeDeoptimized.add(entity);
	}

	deoptimizeArgumentsOnInteractionAtPath(interaction: NodeInteraction, path: ObjectPath): void {
		console.log(
			'deoptimizeArgumentsOnInteractionAtPath',
			this.entitiesToBeDeoptimized.size,
			this.deoptimizationInteractions.length
		);
		// TODO Lukas refine
		if ('args' in interaction) {
			for (const argument of interaction.args) {
				argument.deoptimizePath(UNKNOWN_PATH);
			}
		}
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

	// TODO Lukas we need a better path tracker per entity that just tracks deoptimized paths
	deoptimizePath(path: ObjectPath): void {
		console.log('deoptimizePath', this.entitiesToBeDeoptimized.size, this.deoptimizedPaths.length);
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

	getReturnExpressionWhenCalledAtPath(
		calledPath: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): [expression: ExpressionEntity, isPure: boolean] {
		console.log('getReturnExpressionWhenCalledAtPath');
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const parameter = this;
		return [
			new (class ReturnExpressino extends ExpressionEntity {
				deoptimizePath(deoptimizedPath: ObjectPath) {
					if (
						deoptimizedPath.length === 0 ||
						parameter.deoptimizationTracker.trackEntityAtPathAndGetIfTracked(
							deoptimizedPath,
							parameter.returnTrackingEntity
						)
					) {
						return;
					}
					console.log(
						'deoptimizePath return',
						parameter.entitiesToBeDeoptimized.size,
						parameter.deoptimizedReturns.length
					);
					parameter.deoptimizedReturns.push({ calledPath, deoptimizedPath, interaction, origin });
					for (const entity of parameter.entitiesToBeDeoptimized) {
						entity
							.getReturnExpressionWhenCalledAtPath(
								calledPath,
								interaction,
								recursionTracker,
								origin
							)[0]
							.deoptimizePath(deoptimizedPath);
					}
				}
			})(),
			false
		];
	}
}

import type { NormalizedTreeshakingOptions } from '../../rollup/types';
import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { type ObjectPath, type PathTracker, UNKNOWN_PATH, UnknownKey } from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import type { ExpressionEntity } from './shared/Expression';
import { type ExpressionNode, NodeBase } from './shared/Node';

export default class SpreadElement extends NodeBase {
	declare argument: ExpressionNode;
	declare type: NodeType.tSpreadElement;

	deoptimizeThisOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	): void {
		if (path.length > 0) {
			this.argument.deoptimizeThisOnInteractionAtPath(
				interaction,
				[UnknownKey, ...path],
				thisParameter,
				recursionTracker
			);
		}
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		const { propertyReadSideEffects } = this.context.options
			.treeshake as NormalizedTreeshakingOptions;
		return (
			this.argument.hasEffects(context) ||
			(propertyReadSideEffects &&
				(propertyReadSideEffects === 'always' ||
					this.argument.hasEffectsWhenAccessedAtPath(UNKNOWN_PATH, context)))
		);
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		// Only properties of properties of the argument could become subject to reassignment
		// This will also reassign the return values of iterators
		this.argument.deoptimizePath([UnknownKey, UnknownKey]);
		this.context.requestTreeshakingPass();
	}
}

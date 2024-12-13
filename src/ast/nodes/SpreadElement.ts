import type { NormalizedTreeshakingOptions } from '../../rollup/types';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { NODE_INTERACTION_UNKNOWN_ACCESS } from '../NodeInteractions';
import {
	type EntityPathTracker,
	type ObjectPath,
	UNKNOWN_PATH,
	UnknownKey
} from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import { type ExpressionNode, NodeBase } from './shared/Node';

export default class SpreadElement extends NodeBase {
	declare argument: ExpressionNode;
	declare type: NodeType.tSpreadElement;

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
	): void {
		if (path.length > 0) {
			this.argument.deoptimizeArgumentsOnInteractionAtPath(
				interaction,
				UNKNOWN_PATH,
				recursionTracker
			);
		}
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		const { propertyReadSideEffects } = this.scope.context.options
			.treeshake as NormalizedTreeshakingOptions;
		return (
			this.argument.hasEffects(context) ||
			(propertyReadSideEffects &&
				(propertyReadSideEffects === 'always' ||
					this.argument.hasEffectsOnInteractionAtPath(
						UNKNOWN_PATH,
						NODE_INTERACTION_UNKNOWN_ACCESS,
						context
					)))
		);
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		if (!this.deoptimized) this.applyDeoptimizations();
		this.argument.includePath(UNKNOWN_PATH, context);
	}

	applyDeoptimizations() {
		this.deoptimized = true;
		// Only properties of properties of the argument could become subject to reassignment
		// This will also reassign the return values of iterators
		this.argument.deoptimizePath([UnknownKey, UnknownKey]);
		this.scope.context.requestTreeshakingPass();
	}
}

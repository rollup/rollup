import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { InclusionContext } from '../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../NodeInteractions';
import { INTERACTION_CALLED } from '../NodeInteractions';
import type ArrowFunctionExpression from '../nodes/ArrowFunctionExpression';
import type FunctionExpression from '../nodes/FunctionExpression';
import { deoptimizeInteraction, includeInteractionWithoutThis } from '../nodes/shared/Expression';
import { isArrowFunctionExpressionNode, isFunctionExpressionNode } from '../utils/identifyNode';
import type { EntityPathTracker, ObjectPath } from '../utils/PathTracker';
import { EMPTY_PATH, SHARED_RECURSION_TRACKER, UNKNOWN_PATH } from '../utils/PathTracker';
import type Variable from './Variable';

export interface PromiseHandler {
	applyDeoptimizations(): void;

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
	): void;

	includeCallArguments(interaction: NodeInteractionCalled, context: InclusionContext): void;
}

export class ObjectPromiseHandler implements PromiseHandler, DeoptimizableEntity {
	private readonly interaction: NodeInteractionCalled;

	constructor(
		resolvedVariable: Variable,
		private readonly handler: FunctionExpression | ArrowFunctionExpression | undefined
	) {
		this.interaction = {
			args: [null, resolvedVariable],
			type: INTERACTION_CALLED,
			withNew: false
		};
	}

	applyDeoptimizations() {
		this.handler
			?.getReturnExpressionWhenCalledAtPath(
				EMPTY_PATH,
				this.interaction,
				SHARED_RECURSION_TRACKER,
				this
			)[0]
			.deoptimizePath(UNKNOWN_PATH);
	}

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
	) {
		if (
			interaction.type === INTERACTION_CALLED &&
			path.length === 0 &&
			(isFunctionExpressionNode(interaction.args[1]) ||
				isArrowFunctionExpressionNode(interaction.args[1]))
		) {
			interaction.args[1].deoptimizeArgumentsOnInteractionAtPath(
				this.interaction,
				[],
				recursionTracker
			);
		} else {
			deoptimizeInteraction(interaction);
		}
	}

	deoptimizeCache(): void {}

	includeCallArguments(interaction: NodeInteractionCalled, context: InclusionContext) {
		// This includes the function call itself
		includeInteractionWithoutThis(interaction, context);
		if (
			interaction.type === INTERACTION_CALLED &&
			(isFunctionExpressionNode(interaction.args[1]) ||
				isArrowFunctionExpressionNode(interaction.args[1]))
		) {
			interaction.args[1].includeCallArguments(this.interaction, context);
		}
	}
}

export class EmptyPromiseHandler implements PromiseHandler {
	applyDeoptimizations() {}

	deoptimizeArgumentsOnInteractionAtPath() {}

	includeCallArguments() {}
}

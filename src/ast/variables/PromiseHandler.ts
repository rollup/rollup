import type { InclusionContext } from '../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../NodeInteractions';
import { INTERACTION_CALLED } from '../NodeInteractions';
import { deoptimizeInteraction, includeInteractionWithoutThis } from '../nodes/shared/Expression';
import { isArrowFunctionExpressionNode, isFunctionExpressionNode } from '../utils/identifyNode';
import type { EntityPathTracker, ObjectPath } from '../utils/PathTracker';
import type Variable from './Variable';

export interface PromiseHandler {
	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
	): void;

	includeCallArguments(interaction: NodeInteractionCalled, context: InclusionContext): void;
}

export class ObjectPromiseHandler implements PromiseHandler {
	private readonly interaction: NodeInteractionCalled;

	constructor(resolvedVariable: Variable) {
		this.interaction = {
			args: [null, resolvedVariable],
			type: INTERACTION_CALLED,
			withNew: false
		};
	}

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
	) {
		deoptimizeInteraction(interaction);
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
		}
	}

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
	deoptimizeArgumentsOnInteractionAtPath(interaction: NodeInteraction) {
		deoptimizeInteraction(interaction);
	}

	includeCallArguments(interaction: NodeInteractionCalled, context: InclusionContext) {
		includeInteractionWithoutThis(interaction, context);
	}
}

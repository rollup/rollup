import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { HasEffectsContext } from '../../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../../NodeInteractions';
import {
	INTERACTION_ACCESSED,
	INTERACTION_ASSIGNED,
	INTERACTION_CALLED,
	NO_ARGS,
	NODE_INTERACTION_UNKNOWN_CALL
} from '../../NodeInteractions';
import {
	EMPTY_PATH,
	type ObjectPath,
	type PathTracker,
	SHARED_RECURSION_TRACKER
} from '../../utils/PathTracker';
import type PrivateIdentifier from '../PrivateIdentifier';
import {
	type ExpressionEntity,
	type LiteralValueOrUnknown,
	UNKNOWN_RETURN_EXPRESSION
} from './Expression';
import { type ExpressionNode, NodeBase } from './Node';
import type { PatternNode } from './Pattern';

export default class MethodBase extends NodeBase implements DeoptimizableEntity {
	declare computed: boolean;
	declare key: ExpressionNode | PrivateIdentifier;
	declare kind: 'constructor' | 'method' | 'init' | 'get' | 'set';
	declare value: ExpressionNode | (ExpressionNode & PatternNode);

	private accessedValue: [expression: ExpressionEntity, isPure: boolean] | null = null;

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		if (interaction.type === INTERACTION_ACCESSED && this.kind === 'get' && path.length === 0) {
			return this.value.deoptimizeArgumentsOnInteractionAtPath(
				{
					args: NO_ARGS,
					thisArg: interaction.thisArg,
					type: INTERACTION_CALLED,
					withNew: false
				},
				EMPTY_PATH,
				recursionTracker
			);
		}
		if (interaction.type === INTERACTION_ASSIGNED && this.kind === 'set' && path.length === 0) {
			return this.value.deoptimizeArgumentsOnInteractionAtPath(
				{
					args: interaction.args,
					thisArg: interaction.thisArg,
					type: INTERACTION_CALLED,
					withNew: false
				},
				EMPTY_PATH,
				recursionTracker
			);
		}
		this.getAccessedValue()[0].deoptimizeArgumentsOnInteractionAtPath(
			interaction,
			path,
			recursionTracker
		);
	}

	// As getter properties directly receive their values from fixed function
	// expressions, there is no known situation where a getter is deoptimized.
	deoptimizeCache(): void {}

	deoptimizePath(path: ObjectPath): void {
		this.getAccessedValue()[0].deoptimizePath(path);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return this.getAccessedValue()[0].getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): [expression: ExpressionEntity, isPure: boolean] {
		return this.getAccessedValue()[0].getReturnExpressionWhenCalledAtPath(
			path,
			interaction,
			recursionTracker,
			origin
		);
	}

	hasEffects(context: HasEffectsContext): boolean {
		return this.key.hasEffects(context);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		if (this.kind === 'get' && interaction.type === INTERACTION_ACCESSED && path.length === 0) {
			return this.value.hasEffectsOnInteractionAtPath(
				EMPTY_PATH,
				{
					args: NO_ARGS,
					thisArg: interaction.thisArg,
					type: INTERACTION_CALLED,
					withNew: false
				},
				context
			);
		}
		// setters are only called for empty paths
		if (this.kind === 'set' && interaction.type === INTERACTION_ASSIGNED) {
			return this.value.hasEffectsOnInteractionAtPath(
				EMPTY_PATH,
				{
					args: interaction.args,
					thisArg: interaction.thisArg,
					type: INTERACTION_CALLED,
					withNew: false
				},
				context
			);
		}
		return this.getAccessedValue()[0].hasEffectsOnInteractionAtPath(path, interaction, context);
	}

	protected applyDeoptimizations() {}

	protected getAccessedValue(): [expression: ExpressionEntity, isPure: boolean] {
		if (this.accessedValue === null) {
			if (this.kind === 'get') {
				this.accessedValue = UNKNOWN_RETURN_EXPRESSION;
				return (this.accessedValue = this.value.getReturnExpressionWhenCalledAtPath(
					EMPTY_PATH,
					NODE_INTERACTION_UNKNOWN_CALL,
					SHARED_RECURSION_TRACKER,
					this
				));
			} else {
				return (this.accessedValue = [this.value, false]);
			}
		}
		return this.accessedValue;
	}
}

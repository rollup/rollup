import { type CallOptions } from '../../CallOptions';
import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { HasEffectsContext } from '../../ExecutionContext';
import {
	INTERACTION_ACCESSED,
	INTERACTION_ASSIGNED,
	INTERACTION_CALLED,
	NO_ARGS,
	NodeInteractionCalled,
	NodeInteractionWithThisArg
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
	UNKNOWN_EXPRESSION
} from './Expression';
import { type ExpressionNode, NodeBase } from './Node';
import type { PatternNode } from './Pattern';

export default class MethodBase extends NodeBase implements DeoptimizableEntity {
	declare computed: boolean;
	declare key: ExpressionNode | PrivateIdentifier;
	declare kind: 'constructor' | 'method' | 'init' | 'get' | 'set';
	declare value: ExpressionNode | (ExpressionNode & PatternNode);

	private accessedValue: ExpressionEntity | null = null;

	// As getter properties directly receive their values from fixed function
	// expressions, there is no known situation where a getter is deoptimized.
	deoptimizeCache(): void {}

	deoptimizePath(path: ObjectPath): void {
		this.getAccessedValue().deoptimizePath(path);
	}

	deoptimizeThisOnInteractionAtPath(
		interaction: NodeInteractionWithThisArg,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		// TODO Lukas cache and share interaction with hasEffects
		if (interaction.type === INTERACTION_ACCESSED && this.kind === 'get' && path.length === 0) {
			return this.value.deoptimizeThisOnInteractionAtPath(
				{ args: NO_ARGS, thisArg: interaction.thisArg, type: INTERACTION_CALLED, withNew: false },
				EMPTY_PATH,
				recursionTracker
			);
		}
		// TODO Lukas cache and share interaction with hasEffects
		if (interaction.type === INTERACTION_ASSIGNED && this.kind === 'set' && path.length === 0) {
			return this.value.deoptimizeThisOnInteractionAtPath(
				{
					args: [interaction.value],
					thisArg: interaction.thisArg,
					type: INTERACTION_CALLED,
					withNew: false
				},
				EMPTY_PATH,
				recursionTracker
			);
		}
		this.getAccessedValue().deoptimizeThisOnInteractionAtPath(interaction, path, recursionTracker);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return this.getAccessedValue().getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		return this.getAccessedValue().getReturnExpressionWhenCalledAtPath(
			path,
			interaction,
			recursionTracker,
			origin
		);
	}

	hasEffects(context: HasEffectsContext): boolean {
		return this.key.hasEffects(context);
	}

	// TODO Lukas this should use the assigned thisArg
	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (this.kind === 'get' && path.length === 0) {
			return this.value.hasEffectsWhenCalledAtPath(
				EMPTY_PATH,
				{ args: NO_ARGS, thisArg: null, withNew: false },
				context
			);
		}
		return this.getAccessedValue().hasEffectsWhenAccessedAtPath(path, context);
	}

	// TODO Lukas this should use the assigned value and thisArg
	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (this.kind === 'set') {
			return this.value.hasEffectsWhenCalledAtPath(
				EMPTY_PATH,
				{ args: NO_ARGS, thisArg: null, withNew: false },
				context
			);
		}
		return this.getAccessedValue().hasEffectsWhenAssignedAtPath(path, context);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		return this.getAccessedValue().hasEffectsWhenCalledAtPath(path, callOptions, context);
	}

	protected applyDeoptimizations() {}

	// TODO Lukas this should get the thisArg as parameter from the interaction if accessed, null otherwise
	protected getAccessedValue(): ExpressionEntity {
		if (this.accessedValue === null) {
			if (this.kind === 'get') {
				this.accessedValue = UNKNOWN_EXPRESSION;
				return (this.accessedValue = this.value.getReturnExpressionWhenCalledAtPath(
					EMPTY_PATH,
					{ args: NO_ARGS, thisArg: null, type: INTERACTION_CALLED, withNew: false },
					SHARED_RECURSION_TRACKER,
					this
				));
			} else {
				return (this.accessedValue = this.value);
			}
		}
		return this.accessedValue;
	}
}

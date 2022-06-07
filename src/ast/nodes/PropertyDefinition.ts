import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteractionWithThisArg } from '../NodeInteractions';
import { NodeInteraction, NodeInteractionCalled } from '../NodeInteractions';
import type { ObjectPath, PathTracker } from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import type PrivateIdentifier from './PrivateIdentifier';
import {
	type ExpressionEntity,
	type LiteralValueOrUnknown,
	UNKNOWN_EXPRESSION,
	UnknownValue
} from './shared/Expression';
import { type ExpressionNode, NodeBase } from './shared/Node';

export default class PropertyDefinition extends NodeBase {
	declare computed: boolean;
	declare key: ExpressionNode | PrivateIdentifier;
	declare static: boolean;
	declare type: NodeType.tPropertyDefinition;
	declare value: ExpressionNode | null;

	deoptimizePath(path: ObjectPath): void {
		this.value?.deoptimizePath(path);
	}

	deoptimizeThisOnInteractionAtPath(
		interaction: NodeInteractionWithThisArg,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		this.value?.deoptimizeThisOnInteractionAtPath(interaction, path, recursionTracker);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return this.value
			? this.value.getLiteralValueAtPath(path, recursionTracker, origin)
			: UnknownValue;
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		return this.value
			? this.value.getReturnExpressionWhenCalledAtPath(path, interaction, recursionTracker, origin)
			: UNKNOWN_EXPRESSION;
	}

	hasEffects(context: HasEffectsContext): boolean {
		return this.key.hasEffects(context) || (this.static && !!this.value?.hasEffects(context));
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		return !this.value || this.value.hasEffectsOnInteractionAtPath(path, interaction, context);
	}

	protected applyDeoptimizations() {}
}

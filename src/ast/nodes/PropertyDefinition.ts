import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext } from '../ExecutionContext';
import { LiteralValueOrUnknown, UNKNOWN_EXPRESSION, UnknownValue } from '../unknownValues';
import { ObjectPath, PathTracker } from '../utils/PathTracker';
import * as NodeType from './NodeType';
import PrivateIdentifier from './PrivateIdentifier';
import { ExpressionEntity } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class PropertyDefinition extends NodeBase {
	computed!: boolean;
	key!: ExpressionNode | PrivateIdentifier;
	static!: boolean;
	type!: NodeType.tPropertyDefinition;
	value!: ExpressionNode | null;

	deoptimizePath(path: ObjectPath) {
		this.value?.deoptimizePath(path);
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
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		return this.value
			? this.value.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin)
			: UNKNOWN_EXPRESSION;
	}

	hasEffects(context: HasEffectsContext): boolean {
		return (
			this.key.hasEffects(context) ||
			(this.static && this.value !== null && this.value.hasEffects(context))
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	) {
		return !this.value || this.value.hasEffectsWhenCalledAtPath(path, callOptions, context);
	}

	// TODO Lukas verify this is modifying this
	mayModifyThisWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): boolean {
		return this.value?.mayModifyThisWhenCalledAtPath(path, recursionTracker, origin) || false;
	}
}

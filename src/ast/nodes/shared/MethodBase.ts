import { CallOptions, NO_ARGS } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { HasEffectsContext } from '../../ExecutionContext';
import {
	EMPTY_PATH,
	ObjectPath,
	PathTracker,
	SHARED_RECURSION_TRACKER
} from '../../utils/PathTracker';
import PrivateIdentifier from '../PrivateIdentifier';
import {
	ExpressionEntity,
	LiteralValueOrUnknown,
	NodeEvent,
	UNKNOWN_EXPRESSION
} from './Expression';
import { ExpressionNode, NodeBase } from './Node';
import { PatternNode } from './Pattern';

export default class MethodBase extends NodeBase implements DeoptimizableEntity {
	computed!: boolean;
	key!: ExpressionNode | PrivateIdentifier;
	kind!: 'constructor' | 'method' | 'init' | 'get' | 'set';
	value!: ExpressionNode | (ExpressionNode & PatternNode);

	private accessedValue: ExpressionEntity | null = null;
	private accessorCallOptions: CallOptions = {
		args: NO_ARGS,
		withNew: false
	};

	// As getter properties directly receive their values from fixed function
	// expressions, there is no known situation where a getter is deoptimized.
	deoptimizeCache(): void {}

	deoptimizePath(path: ObjectPath) {
		this.getAccessedValue().deoptimizePath(path);
	}

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	) {
		this.getAccessedValue().deoptimizeThisOnEventAtPath(
			event,
			path,
			thisParameter,
			recursionTracker
		);
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
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		return this.getAccessedValue().getReturnExpressionWhenCalledAtPath(
			path,
			recursionTracker,
			origin
		);
	}

	hasEffects(context: HasEffectsContext) {
		return this.key.hasEffects(context);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (this.kind === 'get' && path.length === 0) {
			return this.value.hasEffectsWhenCalledAtPath(EMPTY_PATH, this.accessorCallOptions, context);
		}
		return this.getAccessedValue().hasEffectsWhenAccessedAtPath(path, context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (this.kind === 'set') {
			return this.value.hasEffectsWhenCalledAtPath(EMPTY_PATH, this.accessorCallOptions, context);
		}
		return this.getAccessedValue().hasEffectsWhenAssignedAtPath(path, context);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	) {
		return this.getAccessedValue().hasEffectsWhenCalledAtPath(path, callOptions, context);
	}

	protected getAccessedValue(): ExpressionEntity {
		if (this.accessedValue === null) {
			if (this.kind === 'get') {
				this.accessedValue = UNKNOWN_EXPRESSION;
				return (this.accessedValue = this.value.getReturnExpressionWhenCalledAtPath(
					EMPTY_PATH,
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

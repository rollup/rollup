import type { CallOptions } from '../../CallOptions';
import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { HasEffectsContext } from '../../ExecutionContext';
import type { NodeInteractionWithThisArg } from '../../NodeInteractions';
import { NodeInteractionCalled } from '../../NodeInteractions';
import type { ObjectPath, PathTracker } from '../../utils/PathTracker';
import { ExpressionEntity, type LiteralValueOrUnknown } from './Expression';

export class ObjectMember extends ExpressionEntity {
	constructor(private readonly object: ExpressionEntity, private readonly key: string) {
		super();
	}

	deoptimizePath(path: ObjectPath): void {
		this.object.deoptimizePath([this.key, ...path]);
	}

	deoptimizeThisOnInteractionAtPath(
		interaction: NodeInteractionWithThisArg,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		this.object.deoptimizeThisOnInteractionAtPath(
			interaction,
			[this.key, ...path],
			recursionTracker
		);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return this.object.getLiteralValueAtPath([this.key, ...path], recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		return this.object.getReturnExpressionWhenCalledAtPath(
			[this.key, ...path],
			interaction,
			recursionTracker,
			origin
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return this.object.hasEffectsWhenAccessedAtPath([this.key, ...path], context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return this.object.hasEffectsWhenAssignedAtPath([this.key, ...path], context);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		return this.object.hasEffectsWhenCalledAtPath([this.key, ...path], callOptions, context);
	}
}

import type { CallOptions } from '../../CallOptions';
import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { HasEffectsContext } from '../../ExecutionContext';
import type { NodeEvent } from '../../NodeEvents';
import type { ObjectPath, PathTracker } from '../../utils/PathTracker';
import { ExpressionEntity, type LiteralValueOrUnknown } from './Expression';

export class ObjectMember extends ExpressionEntity {
	constructor(private readonly object: ExpressionEntity, private readonly key: string) {
		super();
	}

	deoptimizePath(path: ObjectPath): void {
		this.object.deoptimizePath([this.key, ...path]);
	}

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	): void {
		this.object.deoptimizeThisOnEventAtPath(
			event,
			[this.key, ...path],
			thisParameter,
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
		callOptions: CallOptions,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		return this.object.getReturnExpressionWhenCalledAtPath(
			[this.key, ...path],
			callOptions,
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

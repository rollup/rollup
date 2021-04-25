import { CallOptions } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { HasEffectsContext } from '../../ExecutionContext';
import { LiteralValueOrUnknown } from '../../unknownValues';
import { ObjectPath, PathTracker } from '../../utils/PathTracker';
import { ExpressionEntity } from './Expression';

export class ObjectMember implements ExpressionEntity {
	included = true;

	constructor(private readonly object: ExpressionEntity, private readonly key: string) {}

	deoptimizePath(path: ObjectPath): void {
		this.object.deoptimizePath([this.key, ...path]);
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
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		return this.object.getReturnExpressionWhenCalledAtPath(
			[this.key, ...path],
			recursionTracker,
			origin
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		if (path.length === 0) return false;
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

	include(): void {}

	includeCallArguments(): void {}

	mayModifyThisWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): boolean {
		return this.object.mayModifyThisWhenCalledAtPath([this.key, ...path], recursionTracker, origin);
	}
}

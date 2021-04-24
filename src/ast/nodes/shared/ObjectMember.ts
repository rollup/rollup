import { CallOptions } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import { LiteralValueOrUnknown } from '../../unknownValues';
import { ObjectPath, PathTracker } from '../../utils/PathTracker';
import SpreadElement from '../SpreadElement';
import { ExpressionEntity } from './Expression';
import { ExpressionNode, IncludeChildren } from './Node';

export class ObjectMember implements ExpressionEntity {
	included = false;

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

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		this.object.include(context, includeChildrenRecursively);
	}

	includeCallArguments(context: InclusionContext, args: (ExpressionNode | SpreadElement)[]): void {
		for (const arg of args) {
			arg.include(context, false);
		}
	}

	mayModifyThisWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): boolean {
		return this.object.mayModifyThisWhenCalledAtPath([this.key, ...path], recursionTracker, origin);
	}
}

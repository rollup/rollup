import { CallOptions } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { WritableEntity } from '../../Entity';
import { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import { ObjectPath, PathTracker } from '../../utils/PathTracker';
import { LiteralValueOrUnknown } from '../../values';
import SpreadElement from '../SpreadElement';
import { ExpressionNode, IncludeChildren } from './Node';

export interface ExpressionEntity extends WritableEntity {
	included: boolean;

	/**
	 * If possible it returns a stringifyable literal value for this node that can be used
	 * for inlining or comparing values.
	 * Otherwise it should return UnknownValue.
	 */
	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown;
	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity;
	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean;
	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean;
	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void;
	includeCallArguments(context: InclusionContext, args: (ExpressionNode | SpreadElement)[]): void;
	mayModifyThisWhenCalledAtPath(path: ObjectPath, recursionTracker: PathTracker): boolean;
}

import CallOptions from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { WritableEntity } from '../../Entity';
import { EffectsExecutionContext, ExecutionContext } from '../../ExecutionContext';
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
	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: EffectsExecutionContext): boolean;
	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: EffectsExecutionContext
	): boolean;
	include(includeChildrenRecursively: IncludeChildren, context: ExecutionContext): void;
	includeCallArguments(args: (ExpressionNode | SpreadElement)[]): void;
}

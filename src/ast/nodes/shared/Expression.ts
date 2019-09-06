import CallOptions from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { WritableEntity } from '../../Entity';
import { ExecutionContext } from '../../ExecutionContext';
import { PathTracker } from '../../utils/PathTracker';
import { LiteralValueOrUnknown, ObjectPath } from '../../values';
import SpreadElement from '../SpreadElement';
import { ExpressionNode, IncludeChildren } from './Node';

export interface ExpressionEntity extends WritableEntity {
	included: boolean;

	/**
	 * If possible it returns a stringifyable literal value for this node that can be used
	 * for inlining or comparing values.
	 * Otherwise it should return UNKNOWN_VALUE.
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
	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: ExecutionContext): boolean;
	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: ExecutionContext
	): boolean;
	include(includeChildrenRecursively: IncludeChildren): void;
	includeCallArguments(args: (ExpressionNode | SpreadElement)[]): void;
}

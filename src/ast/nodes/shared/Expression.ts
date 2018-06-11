import CallOptions from '../../CallOptions';
import { WritableEntity } from '../../Entity';
import { ExecutionPathOptions } from '../../ExecutionPathOptions';
import { EntityPathTracker } from '../../utils/EntityPathTracker';
import { ImmutableEntityPathTracker } from '../../utils/ImmutableEntityPathTracker';
import { LiteralValueOrUnknown, ObjectPath } from '../../values';

export type SomeReturnExpressionCallback = (
	options: ExecutionPathOptions,
	node: ExpressionEntity
) => boolean;
export type ForEachReturnExpressionCallback = (node: ExpressionEntity) => void;

export interface ExpressionEntity extends WritableEntity {
	/**
	 * Executes the callback on each possible return expression when calling this node.
	 */
	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		recursionTracker: EntityPathTracker
	): void;
	/**
	 * If possible it returns a stringifyable literal value for this node that can be used
	 * for inlining or comparing values.
	 * Otherwise it should return UNKNOWN_VALUE.
	 */
	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker
	): LiteralValueOrUnknown;
	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		calledPathTracker: ImmutableEntityPathTracker
	): ExpressionEntity;
	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean;
	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean;

	/**
	 * Should return true if some possible return expression when called at the given
	 * path returns true.
	 */
	someReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean;
}

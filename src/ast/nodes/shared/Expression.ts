import CallOptions from '../../CallOptions';
import { WritableEntity } from '../../Entity';
import { ExecutionPathOptions } from '../../ExecutionPathOptions';
import { ImmutableEntityPathTracker } from '../../utils/ImmutableEntityPathTracker';
import { LiteralValueOrUnknown, ObjectPath } from '../../values';

export interface ExpressionEntity extends WritableEntity {
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
		recursionTracker: ImmutableEntityPathTracker
	): ExpressionEntity;
	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean;
	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean;
}

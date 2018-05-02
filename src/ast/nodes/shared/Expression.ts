import { WritableEntity } from '../../Entity';
import CallOptions from '../../CallOptions';
import ExecutionPathOptions from '../../ExecutionPathOptions';
import { ObjectPath, LiteralValueOrUnknown } from '../../values';

export type PredicateFunction = (node: ExpressionEntity) => boolean;
export type SomeReturnExpressionCallback = (options: ExecutionPathOptions) => PredicateFunction;
export type ForEachReturnExpressionCallback = (
	options: ExecutionPathOptions
) => (node: ExpressionEntity) => void;

export interface ExpressionEntity extends WritableEntity {
	/**
	 * Executes the callback on each possible return expression when calling this node.
	 */
	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	): void;
	getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown;
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

import { WritableEntity } from '../../Entity';
import { NodeBase, Node } from './Node';
import { ObjectPath } from '../../variables/VariableReassignmentTracker';
import CallOptions from '../../CallOptions';
import ExecutionPathOptions from '../../ExecutionPathOptions';
import { UNKNOWN_EXPRESSION, UNKNOWN_VALUE } from '../../values';

export type PredicateFunction = (node: ExpressionEntity) => boolean;
export type SomeReturnExpressionCallback = (options: ExecutionPathOptions) => PredicateFunction;
export type ForEachReturnExpressionCallback = (options: ExecutionPathOptions) => (node: ExpressionEntity) => void

export interface ExpressionEntity extends WritableEntity {
	/**
	 * Executes the callback on each possible return expression when calling this node.
	 */
	forEachReturnExpressionWhenCalledAtPath (
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	): void;
	getValue (): any;
	hasEffectsWhenAccessedAtPath (path: ObjectPath, options: ExecutionPathOptions): boolean;
	hasEffectsWhenCalledAtPath (path: ObjectPath, callOptions: CallOptions, options: ExecutionPathOptions): boolean;

	/**
	 * Should return true if some possible return expression when called at the given
	 * path returns true.
	 */
	someReturnExpressionWhenCalledAtPath (
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean
}

export interface ExpressionNode extends ExpressionEntity, Node {}

export class ExpressionBase extends NodeBase implements ExpressionNode {
	forEachReturnExpressionWhenCalledAtPath (
		_path: ObjectPath,
		_callOptions: CallOptions,
		_callback: ForEachReturnExpressionCallback,
		_options: ExecutionPathOptions
	) { }

	getValue () {
		return UNKNOWN_VALUE;
	}

	hasEffectsWhenAccessedAtPath (path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 0;
	}

	hasEffectsWhenAssignedAtPath (_path: ObjectPath, _options: ExecutionPathOptions) {
		return true;
	}

	hasEffectsWhenCalledAtPath (_path: ObjectPath, _callOptions: CallOptions, _options: ExecutionPathOptions) {
		return true;
	}

	reassignPath (_path: ObjectPath, _options: ExecutionPathOptions) { }

	someReturnExpressionWhenCalledAtPath (
		_path: ObjectPath,
		_callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		return predicateFunction(options)(UNKNOWN_EXPRESSION);
	}
}

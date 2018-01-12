import { UNKNOWN_VALUE } from '../values';
import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { ForEachReturnExpressionCallback, PredicateFunction, SomeReturnExpressionCallback } from './shared/Expression';
import { NodeType } from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

export type LogicalOperator = '||' | '&&';

export default class LogicalExpression extends NodeBase {
	type: NodeType.LogicalExpression;
	operator: LogicalOperator;
	left: ExpressionNode;
	right: ExpressionNode;

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		path.length > 0 &&
			this._forEachRelevantBranch(node => node.reassignPath(path, options));
	}

	forEachReturnExpressionWhenCalledAtPath (
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		this._forEachRelevantBranch(node =>
			node.forEachReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				callback,
				options
			)
		);
	}

	getValue (): any {
		const leftValue = this.left.getValue();
		if (leftValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;
		if (
			(leftValue && this.operator === '||') ||
			(!leftValue && this.operator === '&&')
		) {
			return leftValue;
		}
		return this.right.getValue();
	}

	hasEffects (options: ExecutionPathOptions): boolean {
		const leftValue = this.left.getValue();
		return (
			this.left.hasEffects(options) ||
			((leftValue === UNKNOWN_VALUE ||
				(!leftValue && this.operator === '||') ||
				(leftValue && this.operator === '&&')) &&
				this.right.hasEffects(options))
		);
	}

	hasEffectsWhenAccessedAtPath (path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length > 0 &&
			this._someRelevantBranch(node =>
				node.hasEffectsWhenAccessedAtPath(path, options)
			)
		);
	}

	hasEffectsWhenAssignedAtPath (path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length === 0 ||
			this._someRelevantBranch(node =>
				node.hasEffectsWhenAssignedAtPath(path, options)
			)
		);
	}

	hasEffectsWhenCalledAtPath (path: ObjectPath, callOptions: CallOptions, options: ExecutionPathOptions): boolean {
		return this._someRelevantBranch(node =>
			node.hasEffectsWhenCalledAtPath(path, callOptions, options)
		);
	}

	someReturnExpressionWhenCalledAtPath (
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		return this._someRelevantBranch(node =>
			node.someReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				predicateFunction,
				options
			)
		);
	}

	_forEachRelevantBranch (callback: (node: ExpressionNode) => void) {
		const leftValue = this.left.getValue();
		if (leftValue === UNKNOWN_VALUE) {
			callback(this.left);
			callback(this.right);
		} else if (
			(leftValue && this.operator === '||') ||
			(!leftValue && this.operator === '&&')
		) {
			callback(this.left);
		} else {
			callback(this.right);
		}
	}

	_someRelevantBranch (predicateFunction: PredicateFunction) {
		const leftValue = this.left.getValue();
		if (leftValue === UNKNOWN_VALUE) {
			return predicateFunction(this.left) || predicateFunction(this.right);
		}
		if (
			(leftValue && this.operator === '||') ||
			(!leftValue && this.operator === '&&')
		) {
			return predicateFunction(this.left);
		}
		return predicateFunction(this.right);
	}
}

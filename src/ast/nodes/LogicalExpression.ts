import Node, { ForEachReturnExpressionCallback } from '../Node';
import { UNKNOWN_VALUE, PredicateFunction } from '../values';
import Expression from './Expression';
import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ObjectPath } from '../variables/VariableReassignmentTracker';

export type LogicalOperator = '||' | '&&';

export default class LogicalExpression extends Node {
	type: 'LogicalExpression';
	operator: LogicalOperator;
	left: Expression;
	right: Expression;

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
		// typing error resolved by ensuring forEachReturnExpressionWhenCalledAtPath
		// is on FunctionExpression, ArrowFunctionExpression
		this._forEachRelevantBranch((node: Expression) =>
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
		predicateFunction: (options: ExecutionPathOptions) => PredicateFunction,
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

	_forEachRelevantBranch (callback: (node: Expression) => void) {
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

	_someRelevantBranch (predicateFunction: (node: Expression) => boolean) {
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

import Node from '../Node';
import { UNKNOWN_VALUE } from '../values';
import Expression from './Expression';
import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';

type LogicalOperator = '||' | '&&';

export default class LogicalExpression extends Node {
	type: 'LogicalExpression';
	operator: LogicalOperator;
	left: Expression;
	right: Expression;

	reassignPath (path: string[], options: ExecutionPathOptions) {
		path.length > 0 &&
			this._forEachRelevantBranch(node => node.reassignPath(path, options));
	}

	forEachReturnExpressionWhenCalledAtPath (
		path: string[],
		callOptions: CallOptions,
		callback,
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

	hasEffectsWhenAccessedAtPath (path: string[], options: ExecutionPathOptions): boolean {
		return (
			path.length > 0 &&
			this._someRelevantBranch(node =>
				node.hasEffectsWhenAccessedAtPath(path, options)
			)
		);
	}

	hasEffectsWhenAssignedAtPath (path: string[], options: ExecutionPathOptions): boolean {
		return (
			path.length === 0 ||
			this._someRelevantBranch(node =>
				node.hasEffectsWhenAssignedAtPath(path, options)
			)
		);
	}

	hasEffectsWhenCalledAtPath (path: string[], callOptions: CallOptions, options: ExecutionPathOptions): boolean {
		return this._someRelevantBranch(node =>
			node.hasEffectsWhenCalledAtPath(path, callOptions, options)
		);
	}

	someReturnExpressionWhenCalledAtPath (
		path: string[],
		callOptions: CallOptions,
		predicateFunction,
		options: ExecutionPathOptions
	) {
		return this._someRelevantBranch(node =>
			node.someReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				predicateFunction,
				options
			)
		);
	}

	_forEachRelevantBranch (callback) {
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

	_someRelevantBranch (predicateFunction) {
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

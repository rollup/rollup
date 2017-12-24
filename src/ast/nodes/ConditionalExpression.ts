import Node, { ForEachReturnExpressionCallback } from '../Node';
import { UNKNOWN_VALUE, PredicateFunction } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Expression from './Expression';
import CallOptions from '../CallOptions';
import Scope from '../scopes/Scope';
import MagicString from 'magic-string';
import { ObjectPath } from '../variables/VariableReassignmentTracker';

export default class ConditionalExpression extends Node {
	type: 'ConditionalExpression';
	test: Expression;
	alternate: Expression;
	consequent: Expression;

	testValue: any;

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
		const testValue = this.test.getValue();
		if (testValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;

		return testValue ? this.consequent.getValue() : this.alternate.getValue();
	}

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			this.test.hasEffects(options) ||
			this._someRelevantBranch(node => node.hasEffects(options))
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

	initialiseChildren (parentScope: Scope) {
		super.initialiseChildren(parentScope);
		if (this.module.graph.treeshake) {
			this.testValue = this.test.getValue();

			if (this.testValue === UNKNOWN_VALUE) {
				return;
			} else if (this.testValue) {
				this.alternate = null;
			} else if (this.alternate) {
				this.consequent = null;
			}
		}
	}

	render (code: MagicString, es: boolean) {
		if (!this.module.graph.treeshake) {
			super.render(code, es);
		} else {
			if (this.testValue === UNKNOWN_VALUE) {
				super.render(code, es);
			} else {
				const branchToRetain = this.testValue
					? this.consequent
					: this.alternate;

				code.remove(this.start, branchToRetain.start);
				code.remove(branchToRetain.end, this.end);
				if (branchToRetain.type === 'SequenceExpression') {
					code.prependLeft(branchToRetain.start, '(');
					code.appendRight(branchToRetain.end, ')');
				}
				branchToRetain.render(code, es);
			}
		}
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

	_forEachRelevantBranch (callback: (node: Node) => void) {
		if (this.testValue === UNKNOWN_VALUE) {
			callback(this.consequent);
			callback(this.alternate);
		} else {
			this.testValue ? callback(this.consequent) : callback(this.alternate);
		}
	}

	_someRelevantBranch (predicateFunction: (node: Node) => boolean): boolean {
		return this.testValue === UNKNOWN_VALUE
			? predicateFunction(this.consequent) || predicateFunction(this.alternate)
			: this.testValue
				? predicateFunction(this.consequent)
				: predicateFunction(this.alternate);
	}
}

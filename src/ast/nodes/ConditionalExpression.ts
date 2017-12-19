import Node from '../Node';
import { UNKNOWN_VALUE } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Expression from './Expression';
import CallOptions from '../CallOptions';
import Scope from '../scopes/Scope';

export default class ConditionalExpression extends Node {
	type: 'ConditionalExpression';
	test: Expression;
	alternate: Expression;
	consequent: Expression;

	testValue: any;

	reassignPath (path: string[], options) {
		path.length > 0 &&
			this._forEachRelevantBranch(node => node.reassignPath(path, options));
	}

	forEachReturnExpressionWhenCalledAtPath (path: string[], callOptions: CallOptions, callback, options: ExecutionPathOptions) {
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

	initialiseChildren (parentScope: Scope) {
		super.initialiseChildren(parentScope);
		if (this.module.bundle.treeshake) {
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

	render (code, es) {
		if (!this.module.bundle.treeshake) {
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

	someReturnExpressionWhenCalledAtPath (path: string[], callOptions: CallOptions, predicateFunction: (node: Node) => boolean, options: ExecutionPathOptions) {
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

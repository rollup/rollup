import { ObjectPath, UNKNOWN_VALUE } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import CallOptions from '../CallOptions';
import Scope from '../scopes/Scope';
import MagicString from 'magic-string';
import { ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './shared/Expression';
import { NodeType } from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import { RenderOptions } from '../../utils/renderHelpers';

export default class ConditionalExpression extends NodeBase {
	type: NodeType.ConditionalExpression;
	test: ExpressionNode;
	alternate: ExpressionNode;
	consequent: ExpressionNode;

	testValue: any;

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		path.length > 0 && this.forEachRelevantBranch(node => node.reassignPath(path, options));
	}

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		this.forEachRelevantBranch(node =>
			node.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options)
		);
	}

	getValue(): any {
		const testValue = this.test.getValue();
		if (testValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;

		return testValue ? this.consequent.getValue() : this.alternate.getValue();
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return this.test.hasEffects(options) || this.someRelevantBranch(node => node.hasEffects(options));
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return path.length > 0 && this.someRelevantBranch(node => node.hasEffectsWhenAccessedAtPath(path, options));
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return path.length === 0 || this.someRelevantBranch(node => node.hasEffectsWhenAssignedAtPath(path, options));
	}

	hasEffectsWhenCalledAtPath(path: ObjectPath, callOptions: CallOptions, options: ExecutionPathOptions): boolean {
		return this.someRelevantBranch(node => node.hasEffectsWhenCalledAtPath(path, callOptions, options));
	}

	initialiseChildren(parentScope: Scope) {
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

	render(code: MagicString, options: RenderOptions) {
		if (!this.module.graph.treeshake) {
			super.render(code, options);
		} else {
			if (this.testValue === UNKNOWN_VALUE) {
				super.render(code, options);
			} else {
				const branchToRetain = this.testValue ? this.consequent : this.alternate;

				code.remove(this.start, branchToRetain.start);
				code.remove(branchToRetain.end, this.end);
				if (branchToRetain.type === NodeType.SequenceExpression) {
					code.prependLeft(branchToRetain.start, '(');
					code.appendRight(branchToRetain.end, ')');
				}
				branchToRetain.render(code, options);
			}
		}
	}

	someReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		return this.someRelevantBranch(node =>
			node.someReturnExpressionWhenCalledAtPath(path, callOptions, predicateFunction, options)
		);
	}

	private forEachRelevantBranch(callback: (node: ExpressionNode) => void) {
		if (this.testValue === UNKNOWN_VALUE) {
			callback(this.consequent);
			callback(this.alternate);
		} else {
			this.testValue ? callback(this.consequent) : callback(this.alternate);
		}
	}

	private someRelevantBranch(predicateFunction: (node: ExpressionNode) => boolean): boolean {
		return this.testValue === UNKNOWN_VALUE
			? predicateFunction(this.consequent) || predicateFunction(this.alternate)
			: this.testValue ? predicateFunction(this.consequent) : predicateFunction(this.alternate);
	}
}

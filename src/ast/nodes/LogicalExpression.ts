import { ObjectPath, UNKNOWN_VALUE } from '../values';
import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';
import {
	ForEachReturnExpressionCallback,
	PredicateFunction,
	SomeReturnExpressionCallback
} from './shared/Expression';
import { NodeType } from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import { RenderOptions } from '../../utils/renderHelpers';
import MagicString from 'magic-string';
import Scope from '../scopes/Scope';

export type LogicalOperator = '||' | '&&';

export default class LogicalExpression extends NodeBase {
	type: NodeType.LogicalExpression;
	operator: LogicalOperator;
	left: ExpressionNode;
	right: ExpressionNode;

	private value: any;
	private needsLeft: boolean;
	private needsRight: boolean;

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length > 0) this.forEachRelevantBranch(node => node.reassignPath(path, options));
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
		return this.value;
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return this.left.hasEffects(options) || (this.needsRight && this.right.hasEffects(options));
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length > 0 &&
			this.someRelevantBranch(node => node.hasEffectsWhenAccessedAtPath(path, options))
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length === 0 ||
			this.someRelevantBranch(node => node.hasEffectsWhenAssignedAtPath(path, options))
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		return this.someRelevantBranch(node =>
			node.hasEffectsWhenCalledAtPath(path, callOptions, options)
		);
	}

	includeInBundle() {
		let addedNewNodes = false;
		if (!this.included) addedNewNodes = this.included = true;
		if (this.needsLeft || this.left.shouldBeIncluded())
			addedNewNodes = this.left.includeInBundle() || addedNewNodes;
		if (this.needsRight) addedNewNodes = this.right.includeInBundle() || addedNewNodes;
		return addedNewNodes;
	}

	initialiseChildren(parentScope: Scope) {
		super.initialiseChildren(parentScope);
		if (this.module.graph.treeshake) {
			const leftValue = this.left.getValue();
			if (leftValue === UNKNOWN_VALUE) {
				this.value = UNKNOWN_VALUE;
				this.needsLeft = true;
				this.needsRight = true;
			} else if (!!leftValue === (this.operator === '||')) {
				this.value = leftValue;
				this.needsLeft = true;
			} else {
				this.value = this.right.getValue();
				this.needsRight = true;
			}
		}
	}

	render(code: MagicString, options: RenderOptions) {
		if (!this.module.graph.treeshake) {
			super.render(code, options);
		} else {
			if (this.left.included && this.right.included) {
				super.render(code, options);
			} else {
				const branchToRetain = this.left.included ? this.left : this.right;
				code.remove(this.start, branchToRetain.start);
				code.remove(branchToRetain.end, this.end);
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
		if (this.needsLeft) callback(this.left);
		if (this.needsRight) callback(this.right);
	}

	private someRelevantBranch(predicateFunction: PredicateFunction) {
		return (
			(this.needsLeft && predicateFunction(this.left)) ||
			(this.needsRight && predicateFunction(this.right))
		);
	}
}

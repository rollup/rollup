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
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import MagicString from 'magic-string';
import { isCallExpression } from './CallExpression';
import { BLANK } from '../../utils/blank';

export type LogicalOperator = '||' | '&&';

export default class LogicalExpression extends NodeBase {
	type: NodeType.LogicalExpression;
	operator: LogicalOperator;
	left: ExpressionNode;
	right: ExpressionNode;

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
		const leftValue = this.left.getValue();
		if (leftValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;
		if (!leftValue === (this.operator === '&&')) return leftValue;
		return this.right.getValue();
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		if (this.left.hasEffects(options)) return true;
		const leftValue = this.left.getValue();
		return (
			(leftValue === UNKNOWN_VALUE || !leftValue === (this.operator === '||')) &&
			this.right.hasEffects(options)
		);
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
		let addedNewNodes = !this.included;
		this.included = true;
		const leftValue = this.left.getValue();
		if (
			(leftValue === UNKNOWN_VALUE ||
				!leftValue === (this.operator === '&&') ||
				this.left.shouldBeIncluded()) &&
			this.left.includeInBundle()
		)
			addedNewNodes = true;
		if (
			(leftValue === UNKNOWN_VALUE || !leftValue === (this.operator === '||')) &&
			this.right.includeInBundle()
		)
			addedNewNodes = true;
		return addedNewNodes;
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length > 0) this.forEachRelevantBranch(node => node.reassignPath(path, options));
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ hasBecomeCallee }: NodeRenderOptions = BLANK
	) {
		if (!this.module.graph.treeshake || (this.left.included && this.right.included)) {
			super.render(code, options);
		} else {
			const branchToRetain = this.left.included ? this.left : this.right;
			code.remove(this.start, branchToRetain.start);
			code.remove(branchToRetain.end, this.end);
			branchToRetain.render(code, options, {
				hasBecomeCallee:
					hasBecomeCallee || (isCallExpression(this.parent) && this.parent.callee === this),
				hasDifferentParent: true
			});
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
		const leftValue = this.left.getValue();
		if (leftValue === UNKNOWN_VALUE) {
			callback(this.left);
			callback(this.right);
		} else if (!leftValue === (this.operator === '&&')) {
			callback(this.left);
		} else {
			callback(this.right);
		}
	}

	private someRelevantBranch(predicateFunction: PredicateFunction) {
		const leftValue = this.left.getValue();
		if (leftValue === UNKNOWN_VALUE) {
			return predicateFunction(this.left) || predicateFunction(this.right);
		}
		return !leftValue === (this.operator === '&&')
			? predicateFunction(this.left)
			: predicateFunction(this.right);
	}
}

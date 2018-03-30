import { ObjectPath, UNKNOWN_VALUE } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import CallOptions from '../CallOptions';
import MagicString from 'magic-string';
import { ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './shared/Expression';
import { NodeType } from './NodeType';
import { ExpressionNode, Node, NodeBase } from './shared/Node';
import { getFieldOfParent, NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { BLANK } from '../../utils/blank';

export default class ConditionalExpression extends NodeBase {
	type: NodeType.ConditionalExpression;
	test: ExpressionNode;
	alternate: ExpressionNode;
	consequent: ExpressionNode;

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
		return (
			this.test.hasEffects(options) || this.someRelevantBranch(node => node.hasEffects(options))
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
		const testValue = this.test.getValue();
		if (testValue === UNKNOWN_VALUE || this.test.shouldBeIncluded()) {
			if (this.test.includeInBundle()) addedNewNodes = true;
			if (this.consequent.includeInBundle()) addedNewNodes = true;
			if (this.alternate.includeInBundle()) addedNewNodes = true;
		} else if (testValue ? this.consequent.includeInBundle() : this.alternate.includeInBundle()) {
			addedNewNodes = true;
		}
		return addedNewNodes;
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length > 0) this.forEachRelevantBranch(node => node.reassignPath(path, options));
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParent, fieldOfRenderedParent }: NodeRenderOptions = BLANK
	) {
		if (!this.module.graph.treeshake || this.test.included) {
			super.render(code, options);
		} else {
			const branchToRetain = this.test.getValue() ? this.consequent : this.alternate;
			code.remove(this.start, branchToRetain.start);
			code.remove(branchToRetain.end, this.end);
			branchToRetain.render(code, options, {
				renderedParent: renderedParent || <Node>this.parent,
				fieldOfRenderedParent: renderedParent ? fieldOfRenderedParent : getFieldOfParent(this)
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
		const testValue = this.test.getValue();
		if (testValue === UNKNOWN_VALUE) {
			callback(this.consequent);
			callback(this.alternate);
		} else if (testValue) {
			callback(this.consequent);
		} else {
			callback(this.alternate);
		}
	}

	private someRelevantBranch(predicateFunction: (node: ExpressionNode) => boolean): boolean {
		const testValue = this.test.getValue();
		if (testValue === UNKNOWN_VALUE) {
			return predicateFunction(this.consequent) || predicateFunction(this.alternate);
		}
		return testValue ? predicateFunction(this.consequent) : predicateFunction(this.alternate);
	}
}

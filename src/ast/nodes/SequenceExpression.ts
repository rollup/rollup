import ExecutionPathOptions from '../ExecutionPathOptions';
import MagicString from 'magic-string';
import { ExpressionNode, NodeBase } from './shared/Node';
import { NodeType } from './NodeType';
import {
	getCommaSeparatedNodesWithBoundaries,
	NodeRenderOptions,
	RenderOptions
} from '../../utils/renderHelpers';
import { BLANK } from '../../utils/blank';
import { ObjectPath } from '../values';
import CallOptions from '../CallOptions';
import { ForEachReturnExpressionCallback } from './shared/Expression';
import { isCallExpression } from './CallExpression';

export default class SequenceExpression extends NodeBase {
	type: NodeType.SequenceExpression;
	expressions: ExpressionNode[];

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		this.expressions[this.expressions.length - 1].forEachReturnExpressionWhenCalledAtPath(
			path,
			callOptions,
			callback,
			options
		);
	}

	getValue(): any {
		return this.expressions[this.expressions.length - 1].getValue();
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return this.expressions.some(expression => expression.hasEffects(options));
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length > 0 &&
			this.expressions[this.expressions.length - 1].hasEffectsWhenAccessedAtPath(path, options)
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length === 0 ||
			this.expressions[this.expressions.length - 1].hasEffectsWhenAssignedAtPath(path, options)
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		return this.expressions[this.expressions.length - 1].hasEffectsWhenCalledAtPath(
			path,
			callOptions,
			options
		);
	}

	includeInBundle() {
		let addedNewNodes = !this.included;
		this.included = true;
		for (let i = 0; i < this.expressions.length - 1; i++) {
			const node = this.expressions[i];
			if (node.shouldBeIncluded() && node.includeInBundle()) addedNewNodes = true;
		}
		if (this.expressions[this.expressions.length - 1].includeInBundle()) addedNewNodes = true;
		return addedNewNodes;
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length > 0) this.expressions[this.expressions.length - 1].reassignPath(path, options);
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ hasBecomeCallee, hasDifferentParent }: NodeRenderOptions = BLANK
	) {
		if (!this.module.graph.treeshake) {
			super.render(code, options);
		} else {
			let firstStart = 0,
				lastEnd,
				includedNodes = 0;
			for (const { node, start, end } of getCommaSeparatedNodesWithBoundaries(
				this.expressions,
				code,
				this.start,
				this.end
			)) {
				if (!node.included) {
					code.remove(start, end);
					continue;
				}
				includedNodes++;
				if (firstStart === 0) firstStart = start;
				lastEnd = end;
				if (node === this.expressions[this.expressions.length - 1] && includedNodes === 1) {
					node.render(code, options, {
						hasBecomeCallee:
							hasBecomeCallee || (isCallExpression(this.parent) && this.parent.callee === this),
						hasDifferentParent: true
					});
				} else {
					node.render(code, options);
				}
			}
			if (includedNodes > 1 && hasDifferentParent) {
				code.prependRight(firstStart, '(');
				code.appendLeft(lastEnd, ')');
			}
		}
	}
}

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
import { BLANK } from '../../utils/blank';
import CallExpression from './CallExpression';

export type LogicalOperator = '||' | '&&';

export default class LogicalExpression extends NodeBase {
	type: NodeType.LogicalExpression;
	operator: LogicalOperator;
	left: ExpressionNode;
	right: ExpressionNode;

	private hasUnknownLeftValue = false;

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		if (this.hasUnknownLeftValue) {
			this.left.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
			this.right.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
		} else {
			this.forEachRelevantBranch(node =>
				node.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options)
			);
		}
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
			(this.hasUnknownLeftValue
				? this.left.hasEffectsWhenAccessedAtPath(path, options) ||
				  this.right.hasEffectsWhenAccessedAtPath(path, options)
				: this.someRelevantBranch(node => node.hasEffectsWhenAccessedAtPath(path, options)))
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length === 0 ||
			(this.hasUnknownLeftValue
				? this.left.hasEffectsWhenAssignedAtPath(path, options) ||
				  this.right.hasEffectsWhenAssignedAtPath(path, options)
				: this.someRelevantBranch(node => node.hasEffectsWhenAssignedAtPath(path, options)))
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		return this.hasUnknownLeftValue
			? this.left.hasEffectsWhenCalledAtPath(path, callOptions, options) ||
					this.right.hasEffectsWhenCalledAtPath(path, callOptions, options)
			: this.someRelevantBranch(node =>
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
		if (path.length > 0) {
			if (this.hasUnknownLeftValue) {
				this.left.reassignPath(path, options);
				this.right.reassignPath(path, options);
			} else {
				this.forEachRelevantBranch(node => node.reassignPath(path, options));
			}
		}
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent }: NodeRenderOptions = BLANK
	) {
		if (!this.module.graph.treeshake || (this.left.included && this.right.included)) {
			super.render(code, options);
		} else {
			const branchToRetain = this.left.included ? this.left : this.right;
			code.remove(this.start, branchToRetain.start);
			code.remove(branchToRetain.end, this.end);
			branchToRetain.render(code, options, {
				renderedParentType: renderedParentType || this.parent.type,
				isCalleeOfRenderedParent: renderedParentType
					? isCalleeOfRenderedParent
					: (<CallExpression>this.parent).callee === this
			});
		}
	}

	someReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		return this.hasUnknownLeftValue
			? this.left.someReturnExpressionWhenCalledAtPath(
					path,
					callOptions,
					predicateFunction,
					options
			  ) ||
					this.right.someReturnExpressionWhenCalledAtPath(
						path,
						callOptions,
						predicateFunction,
						options
					)
			: this.someRelevantBranch(node =>
					node.someReturnExpressionWhenCalledAtPath(path, callOptions, predicateFunction, options)
			  );
	}

	private forEachRelevantBranch(callback: (node: ExpressionNode) => void) {
		const leftValue = this.left.getValue();
		if (leftValue === UNKNOWN_VALUE) {
			this.hasUnknownLeftValue = true;
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
			this.hasUnknownLeftValue = true;
			return predicateFunction(this.left) || predicateFunction(this.right);
		}
		return !leftValue === (this.operator === '&&')
			? predicateFunction(this.left)
			: predicateFunction(this.right);
	}
}

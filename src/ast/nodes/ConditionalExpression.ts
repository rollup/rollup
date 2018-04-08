import { ObjectPath, UNKNOWN_VALUE } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import CallOptions from '../CallOptions';
import MagicString from 'magic-string';
import { ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './shared/Expression';
import { NodeType } from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import CallExpression from './CallExpression';
import { BLANK } from '../../utils/blank';

export default class ConditionalExpression extends NodeBase {
	type: NodeType.ConditionalExpression;
	test: ExpressionNode;
	alternate: ExpressionNode;
	consequent: ExpressionNode;

	// Not initialised during construction
	private hasUnknownTestValue = false;

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		if (this.hasUnknownTestValue) {
			this.consequent.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
			this.alternate.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
		} else {
			this.forEachRelevantBranch(node =>
				node.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options)
			);
		}
	}

	getValue(): any {
		const testValue = this.test.getValue();
		if (testValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;
		return testValue ? this.consequent.getValue() : this.alternate.getValue();
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			this.test.hasEffects(options) ||
			(this.hasUnknownTestValue
				? this.consequent.hasEffects(options) || this.alternate.hasEffects(options)
				: this.someRelevantBranch(node => node.hasEffects(options)))
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length > 0 &&
			(this.hasUnknownTestValue
				? this.consequent.hasEffectsWhenAccessedAtPath(path, options) ||
				  this.alternate.hasEffectsWhenAccessedAtPath(path, options)
				: this.someRelevantBranch(node => node.hasEffectsWhenAccessedAtPath(path, options)))
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length === 0 ||
			(this.hasUnknownTestValue
				? this.consequent.hasEffectsWhenAssignedAtPath(path, options) ||
				  this.alternate.hasEffectsWhenAssignedAtPath(path, options)
				: this.someRelevantBranch(node => node.hasEffectsWhenAssignedAtPath(path, options)))
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		return this.hasUnknownTestValue
			? this.consequent.hasEffectsWhenCalledAtPath(path, callOptions, options) ||
					this.alternate.hasEffectsWhenCalledAtPath(path, callOptions, options)
			: this.someRelevantBranch(node =>
					node.hasEffectsWhenCalledAtPath(path, callOptions, options)
			  );
	}

	include() {
		let anotherPassNeeded = false;
		this.included = true;
		const testValue = this.test.getValue();
		if (testValue === UNKNOWN_VALUE || this.test.shouldBeIncluded()) {
			if (this.test.include()) anotherPassNeeded = true;
			if (this.consequent.include()) anotherPassNeeded = true;
			if (this.alternate.include()) anotherPassNeeded = true;
		} else if (testValue ? this.consequent.include() : this.alternate.include()) {
			anotherPassNeeded = true;
		}
		return anotherPassNeeded;
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length > 0) {
			if (this.hasUnknownTestValue) {
				this.consequent.reassignPath(path, options);
				this.alternate.reassignPath(path, options);
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
		if (!this.module.graph.treeshake || this.test.included) {
			super.render(code, options);
		} else {
			const branchToRetain = this.consequent.included ? this.consequent : this.alternate;
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
		return this.hasUnknownTestValue
			? this.consequent.someReturnExpressionWhenCalledAtPath(
					path,
					callOptions,
					predicateFunction,
					options
			  ) ||
					this.alternate.someReturnExpressionWhenCalledAtPath(
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
		const testValue = this.test.getValue();
		if (testValue === UNKNOWN_VALUE) {
			this.hasUnknownTestValue = true;
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
			this.hasUnknownTestValue = true;
			return predicateFunction(this.consequent) || predicateFunction(this.alternate);
		}
		return testValue ? predicateFunction(this.consequent) : predicateFunction(this.alternate);
	}
}

import { ObjectPath, UNKNOWN_VALUE } from '../values';
import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './shared/Expression';
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

	private hasUnknownLeftValue: boolean;

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		const leftValue = this.hasUnknownLeftValue ? UNKNOWN_VALUE : this.getLeftValue();
		if (leftValue === UNKNOWN_VALUE) {
			this.left.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
			this.right.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
		} else if (leftValue === (this.operator === '||')) {
			this.left.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
		} else {
			this.right.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
		}
	}

	getPrimitiveValue(): any {
		const leftValue = this.hasUnknownLeftValue ? UNKNOWN_VALUE : this.getLeftValue();
		if (leftValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;
		if (leftValue === (this.operator === '||')) return leftValue;
		return this.right.getPrimitiveValue();
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		if (this.left.hasEffects(options)) return true;
		const leftValue = this.hasUnknownLeftValue ? UNKNOWN_VALUE : this.getLeftValue();
		return (
			(leftValue === UNKNOWN_VALUE || leftValue === (this.operator === '&&')) &&
			this.right.hasEffects(options)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (path.length === 0) return false;
		const leftValue = this.hasUnknownLeftValue ? UNKNOWN_VALUE : this.getLeftValue();
		if (leftValue === UNKNOWN_VALUE) {
			return (
				this.left.hasEffectsWhenAccessedAtPath(path, options) ||
				this.right.hasEffectsWhenAccessedAtPath(path, options)
			);
		}
		return leftValue === (this.operator === '||')
			? this.left.hasEffectsWhenAccessedAtPath(path, options)
			: this.right.hasEffectsWhenAccessedAtPath(path, options);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (path.length === 0) return true;
		const leftValue = this.hasUnknownLeftValue ? UNKNOWN_VALUE : this.getLeftValue();
		if (leftValue === UNKNOWN_VALUE) {
			return (
				this.left.hasEffectsWhenAssignedAtPath(path, options) ||
				this.right.hasEffectsWhenAssignedAtPath(path, options)
			);
		}
		return leftValue === (this.operator === '||')
			? this.left.hasEffectsWhenAssignedAtPath(path, options)
			: this.right.hasEffectsWhenAssignedAtPath(path, options);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		const leftValue = this.hasUnknownLeftValue ? UNKNOWN_VALUE : this.getLeftValue();
		if (leftValue === UNKNOWN_VALUE) {
			return (
				this.left.hasEffectsWhenCalledAtPath(path, callOptions, options) ||
				this.right.hasEffectsWhenCalledAtPath(path, callOptions, options)
			);
		}
		return leftValue === (this.operator === '||')
			? this.left.hasEffectsWhenCalledAtPath(path, callOptions, options)
			: this.right.hasEffectsWhenCalledAtPath(path, callOptions, options);
	}

	include() {
		this.included = true;
		const leftValue = this.hasUnknownLeftValue ? UNKNOWN_VALUE : this.getLeftValue();
		if (
			leftValue === UNKNOWN_VALUE ||
			leftValue === (this.operator === '||') ||
			this.left.shouldBeIncluded()
		) {
			this.left.include();
		}
		if (leftValue === UNKNOWN_VALUE || leftValue === (this.operator === '&&')) {
			this.right.include();
		}
	}

	initialise() {
		this.included = false;
		this.hasUnknownLeftValue = false;
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length > 0) {
			const leftValue = this.hasUnknownLeftValue ? UNKNOWN_VALUE : this.getLeftValue();
			if (leftValue === UNKNOWN_VALUE) {
				this.left.reassignPath(path, options);
				this.right.reassignPath(path, options);
			} else if (leftValue === (this.operator === '||')) {
				this.left.reassignPath(path, options);
			} else {
				this.right.reassignPath(path, options);
			}
		}
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent }: NodeRenderOptions = BLANK
	) {
		if (!this.left.included || !this.right.included) {
			const singleRetainedBranch = this.left.included ? this.left : this.right;
			code.remove(this.start, singleRetainedBranch.start);
			code.remove(singleRetainedBranch.end, this.end);
			singleRetainedBranch.render(code, options, {
				renderedParentType: renderedParentType || this.parent.type,
				isCalleeOfRenderedParent: renderedParentType
					? isCalleeOfRenderedParent
					: (<CallExpression>this.parent).callee === this
			});
		} else {
			super.render(code, options);
		}
	}

	someReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		const leftValue = this.hasUnknownLeftValue ? UNKNOWN_VALUE : this.getLeftValue();
		if (leftValue === UNKNOWN_VALUE) {
			return (
				this.left.someReturnExpressionWhenCalledAtPath(
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
			);
		}
		return leftValue === (this.operator === '||')
			? this.left.someReturnExpressionWhenCalledAtPath(
					path,
					callOptions,
					predicateFunction,
					options
			  )
			: this.right.someReturnExpressionWhenCalledAtPath(
					path,
					callOptions,
					predicateFunction,
					options
			  );
	}

	private getLeftValue() {
		if (this.hasUnknownLeftValue) return UNKNOWN_VALUE;
		const value = this.left.getPrimitiveValue();
		if (value === UNKNOWN_VALUE) {
			this.hasUnknownLeftValue = true;
		}
		return value;
	}
}

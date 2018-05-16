import { ObjectPath, LiteralValueOrUnknown, UNKNOWN_VALUE, EMPTY_PATH } from '../values';
import { ExecutionPathOptions, NEW_EXECUTION_PATH } from '../ExecutionPathOptions';
import CallOptions from '../CallOptions';
import MagicString from 'magic-string';
import { ForEachReturnExpressionCallback, SomeReturnExpressionCallback } from './shared/Expression';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import CallExpression from './CallExpression';
import { BLANK } from '../../utils/blank';

export default class ConditionalExpression extends NodeBase {
	type: NodeType.tConditionalExpression;
	test: ExpressionNode;
	alternate: ExpressionNode;
	consequent: ExpressionNode;

	private hasUnknownTestValue: boolean;

	forEachReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		const testValue = this.hasUnknownTestValue ? UNKNOWN_VALUE : this.getTestValue(options);
		if (testValue === UNKNOWN_VALUE || testValue) {
			this.consequent.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
		}
		if (testValue === UNKNOWN_VALUE || !testValue) {
			this.alternate.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
		}
	}

	getLiteralValueAtPath(path: ObjectPath, options: ExecutionPathOptions): LiteralValueOrUnknown {
		const testValue = this.hasUnknownTestValue ? UNKNOWN_VALUE : this.getTestValue(options);
		if (testValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;
		return testValue
			? this.consequent.getLiteralValueAtPath(path, options)
			: this.alternate.getLiteralValueAtPath(path, options);
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		if (this.test.hasEffects(options)) return true;
		const testValue = this.hasUnknownTestValue ? UNKNOWN_VALUE : this.getTestValue(options);
		if (testValue === UNKNOWN_VALUE) {
			return this.consequent.hasEffects(options) || this.alternate.hasEffects(options);
		}
		return testValue ? this.consequent.hasEffects(options) : this.alternate.hasEffects(options);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (path.length === 0) return false;
		const testValue = this.hasUnknownTestValue ? UNKNOWN_VALUE : this.getTestValue(options);
		if (testValue === UNKNOWN_VALUE) {
			return (
				this.consequent.hasEffectsWhenAccessedAtPath(path, options) ||
				this.alternate.hasEffectsWhenAccessedAtPath(path, options)
			);
		}
		return testValue
			? this.consequent.hasEffectsWhenAccessedAtPath(path, options)
			: this.alternate.hasEffectsWhenAccessedAtPath(path, options);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (path.length === 0) return true;
		const testValue = this.hasUnknownTestValue ? UNKNOWN_VALUE : this.getTestValue(options);
		if (testValue === UNKNOWN_VALUE) {
			return (
				this.consequent.hasEffectsWhenAssignedAtPath(path, options) ||
				this.alternate.hasEffectsWhenAssignedAtPath(path, options)
			);
		}
		return testValue
			? this.consequent.hasEffectsWhenAssignedAtPath(path, options)
			: this.alternate.hasEffectsWhenAssignedAtPath(path, options);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		const testValue = this.hasUnknownTestValue ? UNKNOWN_VALUE : this.getTestValue(options);
		if (testValue === UNKNOWN_VALUE) {
			return (
				this.consequent.hasEffectsWhenCalledAtPath(path, callOptions, options) ||
				this.alternate.hasEffectsWhenCalledAtPath(path, callOptions, options)
			);
		}
		return testValue
			? this.consequent.hasEffectsWhenCalledAtPath(path, callOptions, options)
			: this.alternate.hasEffectsWhenCalledAtPath(path, callOptions, options);
	}

	initialise() {
		this.included = false;
		this.hasUnknownTestValue = false;
	}

	include() {
		this.included = true;
		const testValue = this.hasUnknownTestValue
			? UNKNOWN_VALUE
			: this.getTestValue(NEW_EXECUTION_PATH);
		if (testValue === UNKNOWN_VALUE || this.test.shouldBeIncluded()) {
			this.test.include();
			this.consequent.include();
			this.alternate.include();
		} else if (testValue) {
			this.consequent.include();
		} else {
			this.alternate.include();
		}
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length > 0) {
			const testValue = this.hasUnknownTestValue ? UNKNOWN_VALUE : this.getTestValue(options);
			if (testValue === UNKNOWN_VALUE || testValue) {
				this.consequent.reassignPath(path, options);
			}
			if (testValue === UNKNOWN_VALUE || !testValue) {
				this.alternate.reassignPath(path, options);
			}
		}
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedParentType, isCalleeOfRenderedParent }: NodeRenderOptions = BLANK
	) {
		if (!this.test.included) {
			const singleRetainedBranch = this.consequent.included ? this.consequent : this.alternate;
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
		const testValue = this.hasUnknownTestValue ? UNKNOWN_VALUE : this.getTestValue(options);
		if (testValue === UNKNOWN_VALUE) {
			return (
				this.consequent.someReturnExpressionWhenCalledAtPath(
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
			);
		}
		return testValue
			? this.consequent.someReturnExpressionWhenCalledAtPath(
					path,
					callOptions,
					predicateFunction,
					options
			  )
			: this.alternate.someReturnExpressionWhenCalledAtPath(
					path,
					callOptions,
					predicateFunction,
					options
			  );
	}

	private getTestValue(options: ExecutionPathOptions) {
		if (this.hasUnknownTestValue) return UNKNOWN_VALUE;
		const value = this.test.getLiteralValueAtPath(EMPTY_PATH, options);
		if (value === UNKNOWN_VALUE) {
			this.hasUnknownTestValue = true;
		}
		return value;
	}
}

import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import {
	EMPTY_IMMUTABLE_TRACKER,
	ImmutableEntityPathTracker
} from '../utils/ImmutableEntityPathTracker';
import {
	EMPTY_PATH,
	LiteralValueOrUnknown,
	ObjectPath,
	UNKNOWN_EXPRESSION,
	UNKNOWN_VALUE
} from '../values';
import CallExpression from './CallExpression';
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class ConditionalExpression extends NodeBase {
	type: NodeType.tConditionalExpression;
	test: ExpressionNode;
	alternate: ExpressionNode;
	consequent: ExpressionNode;

	private hasUnknownTestValue: boolean;

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker
	): LiteralValueOrUnknown {
		const testValue = this.hasUnknownTestValue
			? UNKNOWN_VALUE
			: this.getTestValue(recursionTracker);
		if (testValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;
		return testValue
			? this.consequent.getLiteralValueAtPath(path, recursionTracker)
			: this.alternate.getLiteralValueAtPath(path, recursionTracker);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker
	): ExpressionEntity {
		const testValue = this.hasUnknownTestValue
			? UNKNOWN_VALUE
			: this.getTestValue(EMPTY_IMMUTABLE_TRACKER);
		if (testValue === UNKNOWN_VALUE) return UNKNOWN_EXPRESSION;
		return testValue
			? this.consequent.getReturnExpressionWhenCalledAtPath(path, recursionTracker)
			: this.alternate.getReturnExpressionWhenCalledAtPath(path, recursionTracker);
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		if (this.test.hasEffects(options)) return true;
		const testValue = this.hasUnknownTestValue
			? UNKNOWN_VALUE
			: this.getTestValue(EMPTY_IMMUTABLE_TRACKER);
		if (testValue === UNKNOWN_VALUE) {
			return this.consequent.hasEffects(options) || this.alternate.hasEffects(options);
		}
		return testValue ? this.consequent.hasEffects(options) : this.alternate.hasEffects(options);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		if (path.length === 0) return false;
		const testValue = this.hasUnknownTestValue
			? UNKNOWN_VALUE
			: this.getTestValue(EMPTY_IMMUTABLE_TRACKER);
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
		const testValue = this.hasUnknownTestValue
			? UNKNOWN_VALUE
			: this.getTestValue(EMPTY_IMMUTABLE_TRACKER);
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
		const testValue = this.hasUnknownTestValue
			? UNKNOWN_VALUE
			: this.getTestValue(EMPTY_IMMUTABLE_TRACKER);
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
			: this.getTestValue(EMPTY_IMMUTABLE_TRACKER);
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

	reassignPath(path: ObjectPath) {
		if (path.length > 0) {
			const testValue = this.hasUnknownTestValue
				? UNKNOWN_VALUE
				: this.getTestValue(EMPTY_IMMUTABLE_TRACKER);
			if (testValue === UNKNOWN_VALUE || testValue) {
				this.consequent.reassignPath(path);
			}
			if (testValue === UNKNOWN_VALUE || !testValue) {
				this.alternate.reassignPath(path);
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

	private getTestValue(recursionTracker: ImmutableEntityPathTracker) {
		if (this.hasUnknownTestValue) return UNKNOWN_VALUE;
		const value = this.test.getLiteralValueAtPath(EMPTY_PATH, recursionTracker);
		if (value === UNKNOWN_VALUE) {
			this.hasUnknownTestValue = true;
		}
		return value;
	}
}

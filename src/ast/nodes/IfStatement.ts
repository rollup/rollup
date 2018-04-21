import { UNKNOWN_VALUE } from '../values';
import { ExpressionNode, StatementBase, StatementNode } from './shared/Node';
import MagicString from 'magic-string';
import { NodeType } from './NodeType';
import { RenderOptions } from '../../utils/renderHelpers';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class IfStatement extends StatementBase {
	type: NodeType.IfStatement;
	test: ExpressionNode;
	consequent: StatementNode;
	alternate: StatementNode | null;

	private hasUnknownTestValue: boolean;

	hasEffects(options: ExecutionPathOptions): boolean {
		if (this.test.hasEffects(options)) return true;
		const testValue = this.hasUnknownTestValue ? UNKNOWN_VALUE : this.getTestValue();
		if (testValue === UNKNOWN_VALUE) {
			return (
				this.consequent.hasEffects(options) ||
				(this.alternate !== null && this.alternate.hasEffects(options))
			);
		}
		return testValue
			? this.consequent.hasEffects(options)
			: this.alternate !== null && this.alternate.hasEffects(options);
	}

	include() {
		this.included = true;
		const testValue = this.hasUnknownTestValue ? UNKNOWN_VALUE : this.getTestValue();
		if (testValue === UNKNOWN_VALUE || this.test.shouldBeIncluded()) {
			this.test.include();
		}
		if ((testValue === UNKNOWN_VALUE || testValue) && this.consequent.shouldBeIncluded()) {
			this.consequent.include();
		}
		if (
			this.alternate !== null &&
			((testValue === UNKNOWN_VALUE || !testValue) && this.alternate.shouldBeIncluded())
		) {
			this.alternate.include();
		}
	}

	initialise() {
		this.included = false;
		this.hasUnknownTestValue = false;
	}

	render(code: MagicString, options: RenderOptions) {
		const testValue = this.hasUnknownTestValue ? UNKNOWN_VALUE : this.test.getValue();
		if (
			!this.context.treeshake ||
			this.test.included ||
			(testValue ? this.alternate !== null && this.alternate.included : this.consequent.included)
		) {
			this.test.render(code, options);
			if (this.consequent.included) {
				this.consequent.render(code, options);
			} else {
				code.overwrite(this.consequent.start, this.consequent.end, '{}');
			}
			if (this.alternate !== null) {
				if (this.alternate.included) {
					this.alternate.render(code, options);
				} else {
					code.remove(this.consequent.end, this.alternate.end);
				}
			}
		} else {
			// if test is not included, then the if statement is included because
			// there is exactly one included branch
			const branchToRetain = testValue ? this.consequent : this.alternate;
			code.remove(this.start, branchToRetain.start);
			code.remove(branchToRetain.end, this.end);
			branchToRetain.render(code, options);
		}
	}

	private getTestValue() {
		if (this.hasUnknownTestValue) return UNKNOWN_VALUE;
		const value = this.test.getValue();
		if (value === UNKNOWN_VALUE) {
			this.hasUnknownTestValue = true;
		}
		return value;
	}
}

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

	private hasUnknownTestValue = false;

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			this.test.hasEffects(options) ||
			(this.hasUnknownTestValue
				? this.consequent.hasEffects(options) ||
				  (this.alternate !== null && this.alternate.hasEffects(options))
				: this.someRelevantBranch(node => node.hasEffects(options)))
		);
	}

	includeInBundle() {
		let addedNewNodes = !this.included;
		this.included = true;
		const testValue = this.test.getValue();
		if (
			(testValue === UNKNOWN_VALUE || this.test.shouldBeIncluded()) &&
			this.test.includeInBundle()
		) {
			addedNewNodes = true;
		}
		if (testValue === UNKNOWN_VALUE) {
			if (this.consequent.includeInBundle()) addedNewNodes = true;
			if (this.alternate !== null && this.alternate.includeInBundle()) addedNewNodes = true;
		} else if (
			testValue
				? this.consequent.includeInBundle()
				: this.alternate !== null && this.alternate.includeInBundle()
		) {
			addedNewNodes = true;
		}
		return addedNewNodes;
	}

	render(code: MagicString, options: RenderOptions) {
		const testValue = this.test.getValue();
		if (
			!this.module.graph.treeshake ||
			this.test.included ||
			(testValue ? this.alternate !== null && this.alternate.included : this.consequent.included)
		) {
			super.render(code, options);
		} else {
			// if test is not included, it is impossible that alternate===null even though it is the retained branch
			const branchToRetain = testValue ? this.consequent : this.alternate;
			code.remove(this.start, branchToRetain.start);
			code.remove(branchToRetain.end, this.end);
			branchToRetain.render(code, options);
		}
	}

	private someRelevantBranch(predicateFunction: (node: StatementNode) => boolean): boolean {
		const testValue = this.test.getValue();
		if (testValue === UNKNOWN_VALUE) {
			this.hasUnknownTestValue = true;
			return (
				predicateFunction(this.consequent) ||
				(this.alternate !== null && predicateFunction(this.alternate))
			);
		}
		return testValue
			? predicateFunction(this.consequent)
			: this.alternate !== null && predicateFunction(this.alternate);
	}
}

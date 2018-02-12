import { ExpressionNode, NodeBase, StatementNode } from './shared/Node';
import { NodeType } from './NodeType';
import { findFirstOccurrenceOutsideComment, renderStatementList } from '../../utils/renderHelpers';
import { RenderOptions } from '../../Module';
import MagicString from 'magic-string';

export default class SwitchCase extends NodeBase {
	type: NodeType.SwitchCase;
	test: ExpressionNode | null;
	consequent: StatementNode[];

	includeInBundle () {
		let addedNewNodes = !this.included;
		this.included = true;
		if (this.test && this.test.includeInBundle()) {
			addedNewNodes = true;
		}
		this.consequent.forEach(node => {
			if (node.shouldBeIncluded()) {
				if (node.includeInBundle()) {
					addedNewNodes = true;
				}
			}
		});
		return addedNewNodes;
	}

	render (code: MagicString, options: RenderOptions) {
		if (this.consequent.length) {
			const testEnd = this.test
				? this.test.end
				: this.start + findFirstOccurrenceOutsideComment(code.original.slice(this.start, this.end), 'default') + 7;
			const consequentStart = testEnd + findFirstOccurrenceOutsideComment(code.original.slice(testEnd, this.end), ':') + 1;
			renderStatementList(this.consequent, code, consequentStart, this.end, options);
		} else {
			super.render(code, options);
		}
	}
}

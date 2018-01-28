import { ExpressionNode, NodeBase } from './shared/Node';
import { StatementNode } from './shared/Statement';
import { NodeType } from './NodeType';
import { renderStatementBlock } from '../../utils/renderHelpers';
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
			const firstNodeStart = this.consequent[0].start;
			const firstLeadingLineBreakPos = code.slice(this.start, firstNodeStart).indexOf('\n');
			const start = firstLeadingLineBreakPos === -1 ? firstNodeStart : firstLeadingLineBreakPos + this.start;
			renderStatementBlock(this.consequent, code, start, this.end, options);
		} else {
			super.render(code, options);
		}
	}
}

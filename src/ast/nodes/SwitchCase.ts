import { ExpressionNode, NodeBase } from './shared/Node';
import { StatementNode } from './shared/Statement';
import { NodeType } from './index';

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
}

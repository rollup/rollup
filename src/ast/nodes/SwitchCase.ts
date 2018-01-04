import { BasicNode } from './shared/Node';
import { ExpressionNode } from './shared/Expression';
import { StatementNode } from './shared/Statement';

export default class SwitchCase extends BasicNode {
	type: 'SwitchCase';
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

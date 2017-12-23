import Node from '../Node';
import Statement from './Statement';
import Expression from './Expression';

export default class SwitchCase extends Node {
	type: 'SwitchCase';
	test: Expression | null;
	consequent: Statement[];

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

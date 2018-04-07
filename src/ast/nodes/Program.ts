import MagicString from 'magic-string';
import { NodeBase, StatementNode } from './shared/Node';
import { NodeType } from './NodeType';
import { RenderOptions, renderStatementList } from '../../utils/renderHelpers';

export default class Program extends NodeBase {
	type: NodeType.Program;
	body: StatementNode[];
	sourceType: 'module';

	include() {
		let addedNewNodes = !this.included;
		this.included = true;
		for (const node of this.body) {
			if (node.shouldBeIncluded() && node.include()) {
				addedNewNodes = true;
			}
		}
		return addedNewNodes;
	}

	render(code: MagicString, options: RenderOptions) {
		if (this.body.length) {
			renderStatementList(this.body, code, this.start, this.end, options);
		} else {
			super.render(code, options);
		}
	}
}

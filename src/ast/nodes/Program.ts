import MagicString from 'magic-string';
import { NodeBase, Node } from './shared/Node';
import { NodeType } from './NodeType';
import { RenderOptions } from '../../Module';
import { renderStatementBlock } from '../../utils/renderHelpers';

export default class Program extends NodeBase {
	type: NodeType.Program;
	body: Node[];

	render (code: MagicString, options: RenderOptions) {
		if (this.body.length) {
			renderStatementBlock(this.body, code, this.start, this.end, options);
		} else {
			super.render(code, options);
		}
	}
}

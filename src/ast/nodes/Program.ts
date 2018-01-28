import MagicString from 'magic-string';
import { NodeBase } from './shared/Node';
import { StatementNode } from './shared/Statement';
import { NodeType } from './NodeType';
import { RenderOptions } from '../../Module';
import { renderStatementBlock } from '../../utils/renderHelpers';

export default class Program extends NodeBase {
  type: NodeType.Program;
  body: StatementNode[];

	render (code: MagicString, options: RenderOptions) {
		if (this.body.length) {
			const lastNodeEnd = this.body[this.body.length - 1].end;
			const firstTrailingLineBreakPos = code.slice(lastNodeEnd, this.end).indexOf('\n');
			const end = firstTrailingLineBreakPos === -1 ? this.end : lastNodeEnd + firstTrailingLineBreakPos + 1;
			renderStatementBlock(this.body, code, this.start, end, options);
		} else {
			super.render(code, options);
		}
	}
}

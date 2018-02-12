import MagicString from 'magic-string';
import { NodeType } from './NodeType';
import { RenderOptions } from '../../Module';
import { StatementBase } from './shared/Node';

export default class EmptyStatement extends StatementBase {
	type: NodeType.EmptyStatement;

	render (code: MagicString, _options: RenderOptions) {
		if (
			this.parent.type === NodeType.BlockStatement ||
			this.parent.type === NodeType.Program
		) {
			code.remove(this.start, this.end);
		}
	}
}

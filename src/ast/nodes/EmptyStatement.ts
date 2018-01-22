import MagicString from 'magic-string';
import { StatementBase } from './shared/Statement';
import { NodeType } from './NodeType';
import { RenderOptions } from '../../Module';

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

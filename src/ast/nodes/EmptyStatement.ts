import MagicString from 'magic-string';
import { StatementBase } from './shared/Statement';
import { NodeType } from './index';
import { RenderOptions } from '../../rollup';

export default class EmptyStatement extends StatementBase {
	type: NodeType.EmptyStatement;

	render (code: MagicString, _es: boolean, _options: RenderOptions) {
		if (
			this.parent.type === NodeType.BlockStatement ||
			this.parent.type === NodeType.Program
		) {
			code.remove(this.start, this.end);
		}
	}
}

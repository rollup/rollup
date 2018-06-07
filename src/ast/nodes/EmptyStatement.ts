import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import * as NodeType from './NodeType';
import { StatementBase } from './shared/Node';

export default class EmptyStatement extends StatementBase {
	type: NodeType.tEmptyStatement;

	render(code: MagicString, _options: RenderOptions) {
		if (this.parent.type === NodeType.BlockStatement || this.parent.type === NodeType.Program) {
			code.remove(this.start, this.end);
		}
	}
}

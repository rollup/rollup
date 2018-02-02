import MagicString from 'magic-string';
import { NodeType } from './NodeType';
import { RenderOptions } from '../../Module';
import { NodeBase } from './shared/Node';

export default class EmptyStatement extends NodeBase {
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

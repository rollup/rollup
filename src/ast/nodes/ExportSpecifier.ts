import { NodeBase } from './shared/Node';
import Identifier from './Identifier';
import { NodeType } from './index';
import MagicString from 'magic-string';
import { RenderOptions } from '../../rollup';

export default class ExportSpecifier extends NodeBase {
	type: NodeType.ExportSpecifier;
	local: Identifier;
	exported: Identifier;

	render (code: MagicString, _es: boolean, _options: RenderOptions) {
		if (!this.included) {
			code.remove(this.start, this.end);
		}
	}
}

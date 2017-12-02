import { NodeBase } from './shared/Node';
import Literal from './Literal';
import MagicString from 'magic-string';
import { NodeType } from './index';
import { RenderOptions } from '../../rollup';

export default class ExportAllDeclaration extends NodeBase {
	type: NodeType.ExportAllDeclaration;
	source: Literal<string>;
	isExportDeclaration: true;

	initialiseNode () {
		this.isExportDeclaration = true;
	}

	render (code: MagicString, _es: boolean, options: RenderOptions) {
		if (!options.preserveModules || !this.included) {
			code.remove(this.leadingCommentStart || this.start, this.next || this.end);
		}
	}
}

import { NodeBase } from './shared/Node';
import Literal from './Literal';
import MagicString from 'magic-string';
import { NodeType } from './NodeType';
import { NodeRenderOptions, RenderOptions } from '../../Module';

export default class ExportAllDeclaration extends NodeBase {
	type: NodeType.ExportAllDeclaration;
	source: Literal<string>;
	isExportDeclaration: true;
	needsBoundaries: true;

	initialiseNode () {
		this.isExportDeclaration = true;
		this.needsBoundaries = true;
	}

	render (code: MagicString, _options: RenderOptions, { start, end }: NodeRenderOptions = {}) {
		code.remove(start, end);
	}
}

import { NodeBase } from './shared/Node';
import Literal from './Literal';
import MagicString from 'magic-string';
import { NodeType } from './NodeType';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { BLANK } from '../../utils/blank';

export default class ExportAllDeclaration extends NodeBase {
	type: NodeType.ExportAllDeclaration;
	source: Literal<string>;

	needsBoundaries: true;

	initialise() {
		this.module.addExport(this);
	}

	render(code: MagicString, _options: RenderOptions, { start, end }: NodeRenderOptions = BLANK) {
		code.remove(start, end);
	}
}

ExportAllDeclaration.prototype.needsBoundaries = true;

import { NodeBase } from './shared/Node';
import Literal from './Literal';
import MagicString from 'magic-string';
import * as NodeType from './NodeType';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { BLANK } from '../../utils/blank';

export default class ExportAllDeclaration extends NodeBase {
	type: NodeType.tExportAllDeclaration;
	source: Literal<string>;

	needsBoundaries: true;

	initialise() {
		this.included = false;
		this.context.addExport(this);
	}

	render(code: MagicString, _options: RenderOptions, { start, end }: NodeRenderOptions = BLANK) {
		code.remove(start, end);
	}
}

ExportAllDeclaration.prototype.needsBoundaries = true;

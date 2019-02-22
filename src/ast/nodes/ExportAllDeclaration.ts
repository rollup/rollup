import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import Literal from './Literal';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ExportAllDeclaration extends NodeBase {
	type: NodeType.tExportAllDeclaration;
	source: Literal<string>;

	needsBoundaries: true;

	hasEffects() {
		return false;
	}

	initialise() {
		this.included = false;
		this.context.addExport(this);
	}

	render(code: MagicString, _options: RenderOptions, { start, end }: NodeRenderOptions = BLANK) {
		code.remove(start, end);
	}
}

ExportAllDeclaration.prototype.needsBoundaries = true;

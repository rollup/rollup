import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import Literal from './Literal';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ExportAllDeclaration extends NodeBase {
	needsBoundaries!: true;
	source!: Literal<string>;
	type!: NodeType.tExportAllDeclaration;

	hasEffects() {
		return false;
	}

	initialise() {
		this.context.addExport(this);
	}

	render(code: MagicString, _options: RenderOptions, { start, end }: NodeRenderOptions = BLANK) {
		code.remove(start as number, end as number);
	}
}

ExportAllDeclaration.prototype.needsBoundaries = true;

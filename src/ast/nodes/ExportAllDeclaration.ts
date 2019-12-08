import MagicString from 'magic-string';
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

	render(code: MagicString, _options: RenderOptions, nodeRenderOptions?: NodeRenderOptions) {
		code.remove(
			(nodeRenderOptions as NodeRenderOptions).start as number,
			(nodeRenderOptions as NodeRenderOptions).end as number
		);
	}
}

ExportAllDeclaration.prototype.needsBoundaries = true;

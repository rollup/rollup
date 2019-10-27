import Literal from './Literal';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ExportAllDeclaration extends NodeBase {
	source!: Literal<string>;
	type!: NodeType.tExportAllDeclaration;

	hasEffects() {
		return false;
	}

	initialise() {
		this.context.addExport(this);
	}
}

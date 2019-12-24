import MagicString from 'magic-string';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import ImportDefaultSpecifier from './ImportDefaultSpecifier';
import ImportNamespaceSpecifier from './ImportNamespaceSpecifier';
import ImportSpecifier from './ImportSpecifier';
import Literal from './Literal';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ImportDeclaration extends NodeBase {
	needsBoundaries!: true;
	source!: Literal<string>;
	specifiers!: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[];
	type!: NodeType.tImportDeclaration;

	bind() {}

	hasEffects() {
		return false;
	}

	initialise() {
		this.context.addImport(this);
	}

	render(code: MagicString, _options: RenderOptions, nodeRenderOptions?: NodeRenderOptions) {
		code.remove(nodeRenderOptions!.start!, nodeRenderOptions!.end!);
	}
}

ImportDeclaration.prototype.needsBoundaries = true;

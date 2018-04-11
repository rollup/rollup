import { NodeBase } from './shared/Node';
import Literal from './Literal';
import ImportSpecifier from './ImportSpecifier';
import ImportDefaultSpecifier from './ImportDefaultSpecifier';
import ImportNamespaceSpecifier from './ImportNamespaceSpecifier';
import MagicString from 'magic-string';
import { NodeType } from './NodeType';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { BLANK } from '../../utils/blank';

export default class ImportDeclaration extends NodeBase {
	type: NodeType.ImportDeclaration;
	specifiers: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[];
	source: Literal<string>;

	needsBoundaries: true;

	bind() {}

	initialise() {
		this.included = false;
		this.module.addImport(this);
	}

	render(code: MagicString, _options: RenderOptions, { start, end }: NodeRenderOptions = BLANK) {
		code.remove(start, end);
	}
}

ImportDeclaration.prototype.needsBoundaries = true;

import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import ImportDefaultSpecifier from './ImportDefaultSpecifier';
import ImportNamespaceSpecifier from './ImportNamespaceSpecifier';
import ImportSpecifier from './ImportSpecifier';
import Literal from './Literal';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ImportDeclaration extends NodeBase {
	type: NodeType.tImportDeclaration;
	specifiers: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[];
	source: Literal<string>;

	needsBoundaries: true;

	bind() {}

	initialise() {
		this.included = false;
		this.context.addImport(this);
	}

	hasEffects() {
		return false;
	}

	render(code: MagicString, _options: RenderOptions, { start, end }: NodeRenderOptions = BLANK) {
		code.remove(start, end);
	}
}

ImportDeclaration.prototype.needsBoundaries = true;

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
	needsBoundaries: true;
	source: Literal<string>;
	specifiers: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[];
	type: NodeType.tImportDeclaration;

	bind() {}

	hasEffects() {
		return false;
	}

	initialise() {
		this.included = false;
		this.context.addImport(this);
	}

	render(code: MagicString, _options: RenderOptions, { start, end }: NodeRenderOptions = BLANK) {
		code.remove(start as number, end as number);
	}
}

ImportDeclaration.prototype.needsBoundaries = true;

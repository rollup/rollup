import { NodeBase } from './shared/Node';
import Literal from './Literal';
import ImportSpecifier from './ImportSpecifier';
import ImportDefaultSpecifier from './ImportDefaultSpecifier';
import ImportNamespaceSpecifier from './ImportNamespaceSpecifier';
import MagicString from 'magic-string';
import { NodeType } from './NodeType';
import { NodeRenderOptions, RenderOptions } from '../../Module';

export default class ImportDeclaration extends NodeBase {
	type: NodeType.ImportDeclaration;
	isImportDeclaration: true;
	specifiers: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[];
	source: Literal<string>;
	needsBoundaries: true;

	bindChildren () { }

	initialiseNode () {
		this.isImportDeclaration = true;
		this.needsBoundaries = true;
	}

	render (code: MagicString, _options: RenderOptions, { start, end }: NodeRenderOptions = {}) {
		code.remove(start, end);
	}
}

import { NodeBase } from './shared/Node';
import Literal from './Literal';
import ImportSpecifier from './ImportSpecifier';
import MagicString from 'magic-string';
import { NodeType } from './index';
import { RenderOptions } from '../../rollup';

export default class ImportNamedDeclaration extends NodeBase {
	type: NodeType.ImportNamedDeclaration;
	isImportDeclaration: true;
	specifiers: ImportSpecifier[];
	source: Literal;

	bindChildren () {}

	initialiseNode () {
		this.isImportDeclaration = true;
	}

	includeInBundle () {
		if ( this.included ) return false;
		this.included = true;
		this.specifiers.forEach(specifier => {
			specifier.includeInBundle();
		});
	}

	render (code: MagicString, es: boolean, options: RenderOptions) {
		this.specifiers.forEach(specifier => {
			specifier.render(code, es, options);
		});
	}
}

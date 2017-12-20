import Node from '../Node';
import Literal from './Literal';
import ImportSpecifier from './ImportSpecifier';
import ImportDefaultSpecifier from './ImportDefaultSpecifier';
import ImportNamespaceSpecifier from './ImportNamespaceSpecifier';

export default class ImportDeclaration extends Node {
	type: 'ImportDeclaration';
	isImportDeclaration: true;
	specifiers: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[];
	source: Literal;

	bindChildren () { }

	initialiseNode () {
		this.isImportDeclaration = true;
	}

	render (code) {
		code.remove(this.start, this.next || this.end);
	}
}

import Node from '../Node';

export default class ImportDeclaration extends Node {
	type: 'ImportDeclaration';
	isImportDeclaration: true;

	bindChildren () { }

	initialiseNode () {
		this.isImportDeclaration = true;
	}

	render (code) {
		code.remove(this.start, this.next || this.end);
	}
}

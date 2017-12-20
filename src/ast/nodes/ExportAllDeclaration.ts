import Node from '../Node';
import Literal from './Literal';

export default class ExportAllDeclaration extends Node {
	type: 'ExportAllDeclaration';
	source: Literal;
	isExportDeclaration: true;

	initialiseNode () {
		this.isExportDeclaration = true;
	}

	render (code) {
		code.remove(this.leadingCommentStart || this.start, this.next || this.end);
	}
}

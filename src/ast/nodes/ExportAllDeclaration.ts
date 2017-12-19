import Node from '../Node';

export default class ExportAllDeclaration extends Node {
	initialiseNode () {
		this.isExportDeclaration = true;
	}

	render (code) {
		code.remove(this.leadingCommentStart || this.start, this.next || this.end);
	}
}

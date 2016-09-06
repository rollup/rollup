import Node from '../Node.js';

export default class ExportAllDeclaration extends Node {
	initialise ( scope ) {
		this.isExportDeclaration = true;
	}

	render ( code, es ) {
		code.remove( this.leadingCommentStart || this.start, this.next || this.end );
	}
}

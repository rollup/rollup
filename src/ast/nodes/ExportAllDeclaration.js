import Node from '../Node.js';

export default class ExportAllDeclaration extends Node {
	initialise () {
		this.isExportDeclaration = true;
	}

	render ( code ) {
		code.remove( this.leadingCommentStart || this.start, this.next || this.end );
	}
}

import Node from '../Node.js';

export default class ExportNamedDeclaration extends Node {
	initialise ( scope ) {
		this.isExportDeclaration = true;
		if ( this.declaration ) {
			this.declaration.initialise( scope );
		}
	}

	bind ( scope ) {
		if ( this.declaration ) {
			this.declaration.bind( scope );
		}
	}

	render ( code, es ) {
		if ( this.declaration ) {
			code.remove( this.start, this.declaration.start );
			this.declaration.render( code, es );
		} else {
			code.remove( this.leadingCommentStart || this.start, this.next || this.end );
		}
	}
}

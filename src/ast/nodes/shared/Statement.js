import Node from '../../Node.js';

export default class Statement extends Node {
	mark () {
		if ( this.isMarked ) return;
		this.isMarked = true;

		if ( this.parent.mark ) this.parent.mark();
		this.markChildren();
	}

	render ( code, es ) {
		if ( !this.module.bundle.treeshake || this.isMarked ) {
			super.render( code, es );
		} else {
			code.remove( this.leadingCommentStart || this.start, this.next || this.end );
		}
	}
}

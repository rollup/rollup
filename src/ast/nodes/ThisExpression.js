import Node from '../Node.js';

export default class ThisExpression extends Node {
	initialise ( scope ) {
		const lexicalBoundary = scope.findLexicalBoundary();

		if ( lexicalBoundary.isModuleScope ) {
			this.alias = this.module.bundle.context;
			if ( this.alias === 'undefined' ) {
				this.module.bundle.onwarn( 'The `this` keyword is equivalent to `undefined` at the top level of an ES module, and has been rewritten' );
			}
		}
	}

	render ( code ) {
		if ( this.alias ) {
			code.overwrite( this.start, this.end, this.alias, true );
		}
	}
}

import Node from '../Node.js';

export default class ThisExpression extends Node {
	initialiseNode () {
		const lexicalBoundary = this.scope.findLexicalBoundary();

		if ( lexicalBoundary.isModuleScope ) {
			this.alias = this.module.context;
			if ( this.alias === 'undefined' ) {
				this.module.warn( {
					code: 'THIS_IS_UNDEFINED',
					message: `The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten`,
					url: `https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined`
				}, this.start );
			}
		}
	}

	hasEffectsWhenAccessedAtPath ( path, options ) {
		return !(path.length === 0
			|| (path.length === 1 && options.hasSafeThis()));
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return !(path.length === 1 && options.hasSafeThis());
	}

	hasEffectsWhenMutatedAtPath ( path, options ) {
		return !(path.length === 0 && options.hasSafeThis());
	}

	render ( code ) {
		if ( this.alias ) {
			code.overwrite( this.start, this.end, this.alias, { storeName: true, contentOnly: false } );
		}
	}
}

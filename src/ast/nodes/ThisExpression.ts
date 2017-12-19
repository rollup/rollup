import Node from '../Node';

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

	bindNode () {
		this.variable = this.scope.findVariable( 'this' );
	}

	hasEffectsWhenAccessedAtPath ( path, options ) {
		return path.length > 0
			&& this.variable.hasEffectsWhenAccessedAtPath( path, options );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return this.variable.hasEffectsWhenAssignedAtPath( path, options );
	}

	render ( code ) {
		if ( this.alias ) {
			code.overwrite( this.start, this.end, this.alias, { storeName: true, contentOnly: false } );
		}
	}
}

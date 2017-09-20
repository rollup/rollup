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

	bind () {
		this.variable = this.scope.findVariable( 'this' );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		if ( path.length === 0 ) {
			return true;
		}
		return this.hasEffectsWhenMutatedAtPath( path.slice(1), options );
	}

	hasEffectsWhenMutatedAtPath ( path, options ) {
		if ( path.length === 0 ) {
			return !options.ignoreSafeThisMutations() || this.variable.hasEffectsWhenMutatedAtPath( [], options );
		}
		return this.variable.hasEffectsWhenMutatedAtPath( path, options );
	}

	render ( code ) {
		if ( this.alias ) {
			code.overwrite( this.start, this.end, this.alias, { storeName: true, contentOnly: false } );
		}
	}
}

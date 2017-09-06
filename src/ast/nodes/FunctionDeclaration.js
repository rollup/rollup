import Node from '../Node.js';
import Scope from '../scopes/Scope.js';
import FunctionBodyScope from '../scopes/FunctionBodyScope';

export default class FunctionDeclaration extends Node {
	hasEffects ( options ) {
		return this.included || (this.id && this.id.hasEffects( options ));
	}

	hasEffectsWhenCalled ( options ) {
		return this.params.some( param => param.hasEffects( options ) )
			|| this.body.hasEffects( options );
	}

	initialiseChildren ( parentScope ) {
		this.id && this.id.initialiseAndDeclare( parentScope, 'function', this );
		this.params.forEach( param => param.initialiseAndDeclare( this.scope, 'parameter' ) );
		this.body.initialiseAndReplaceScope( new FunctionBodyScope( { parent: this.scope } ) );
	}

	initialiseScope ( parentScope ) {
		this.scope = new Scope( {
			parent: parentScope,
			isLexicalBoundary: true
		} );
	}

	hasEffectsWhenMutated () {
		return this.included;
	}

	render ( code, es ) {
		if ( !this.module.bundle.treeshake || this.included ) {
			super.render( code, es );
		} else {
			code.remove( this.leadingCommentStart || this.start, this.next || this.end );
		}
	}
}

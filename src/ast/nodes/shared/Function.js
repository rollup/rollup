import Node from '../../Node.js';
import Scope from '../../scopes/Scope.js';
import extractNames from '../../utils/extractNames.js';

export default class Function extends Node {
	bind () {
		if ( this.id ) this.id.bind();
		this.params.forEach( param => param.bind() );
		this.body.bind();
	}

	hasEffects () {
		return this.included;
	}

	initialiseChildren () {
		this.params.forEach( param => {
			param.initialise( this.scope );
			extractNames( param ).forEach( name => this.scope.addDeclaration( name, null, false, true ) );
		} );
		this.body.initialiseAndReplaceScope ?
			this.body.initialiseAndReplaceScope( this.scope ) :
			this.body.initialise( this.scope );
	}

	initialiseScope ( parentScope ) {
		this.scope = new Scope( {
			parent: parentScope,
			isBlockScope: false,
			isLexicalBoundary: true
		} );
	}
}

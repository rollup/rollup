import Statement from './shared/Statement.js';
import Scope from '../scopes/Scope.js';

export default class ForInStatement extends Statement {
	hasEffects ( options ) {
		return (
			this.included
			|| this.left && this.left.hasEffects( options )
			|| this.right && this.right.hasEffects( options )
			|| this.body.hasEffects( Object.assign( {}, options, { inNestedBreakableStatement: true } ) )
		);
	}

	initialiseChildren () {
		this.left.initialise( this.scope );
		this.right.initialise( this.scope.parent );
		this.body.initialiseAndReplaceScope ?
			this.body.initialiseAndReplaceScope( this.scope ) :
			this.body.initialise( this.scope );
	}

	includeInBundle () {
		let addedNewNodes = super.includeInBundle();
		if ( this.left.includeDeclaration() ) {
			addedNewNodes = true;
		}
		return addedNewNodes;
	}

	initialiseScope ( parentScope ) {
		this.scope = new Scope( {
			parent: parentScope,
			isBlockScope: true,
			isLexicalBoundary: false
		} );
	}
}

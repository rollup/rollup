import Statement from './shared/Statement.js';
import BlockScope from '../scopes/BlockScope';

export default class ForInStatement extends Statement {
	hasEffects ( options ) {
		return (
			this.left && (this.left.hasEffects( options ) || this.left.hasEffectsWhenAssignedAtPath( [], options ))
			|| this.right && this.right.hasEffects( options )
			|| this.body.hasEffects( options.setIgnoreBreakStatements() )
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
		if ( this.left.includeWithAllDeclarations() ) {
			addedNewNodes = true;
		}
		return addedNewNodes;
	}

	initialiseScope ( parentScope ) {
		this.scope = new BlockScope( { parent: parentScope } );
	}
}

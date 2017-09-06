import Statement from './shared/Statement.js';
import BlockScope from '../scopes/BlockScope';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class ForOfStatement extends Statement {
	bind () {
		super.bind();
		this.left.bindAssignment( UNKNOWN_ASSIGNMENT );
	}

	hasEffects ( options ) {
		return (
			this.included
			|| this.left && this.left.hasEffects( options )
			|| this.right && this.right.hasEffects( options )
			|| this.body.hasEffects( options.setIgnoreBreakStatements() )
		);
	}

	includeInBundle () {
		let addedNewNodes = super.includeInBundle();
		if ( this.left.includeWithAllDeclarations() ) {
			addedNewNodes = true;
		}
		return addedNewNodes;
	}

	initialiseChildren () {
		this.left.initialise( this.scope );
		this.right.initialise( this.scope.parent );
		this.body.initialiseAndReplaceScope ?
			this.body.initialiseAndReplaceScope( this.scope ) :
			this.body.initialise( this.scope );
	}

	initialiseScope ( parentScope ) {
		this.scope = new BlockScope( { parent: parentScope } );
	}
}

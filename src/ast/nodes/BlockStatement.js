import Statement from './shared/Statement.js';
import BlockScope from '../scopes/BlockScope';
import UndefinedIdentifier from './shared/UndefinedIdentifier';

export default class BlockStatement extends Statement {
	bindImplicitReturnExpressionToScope () {
		const lastStatement = this.body[ this.body.length - 1 ];
		if ( !lastStatement || lastStatement.type !== 'ReturnStatement' ) {
			this.scope.addReturnExpression( new UndefinedIdentifier() );
		}
	}

	hasEffects ( options ) {
		return this.body.some( child => child.hasEffects( options ) );
	}

	includeInBundle () {
		let addedNewNodes = !this.included;
		this.included = true;
		this.body.forEach( node => {
			if ( node.shouldBeIncluded() ) {
				if ( node.includeInBundle() ) {
					addedNewNodes = true;
				}
			}
		} );
		return addedNewNodes;
	}

	initialiseAndReplaceScope ( scope ) {
		this.scope = scope;
		this.initialiseNode();
		this.initialiseChildren( scope );
	}

	initialiseChildren () {
		let lastNode;
		for ( const node of this.body ) {
			node.initialise( this.scope );

			if ( lastNode ) lastNode.next = node.start;
			lastNode = node;
		}
	}

	initialiseScope ( parentScope ) {
		this.scope = new BlockScope( { parent: parentScope } );
	}

	render ( code, es ) {
		if ( this.body.length ) {
			for ( const node of this.body ) {
				node.render( code, es );
			}
		} else {
			Statement.prototype.render.call( this, code, es );
		}
	}
}

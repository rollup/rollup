import Node from '../Node.js';
import Scope from '../scopes/Scope.js';
import extractNames from '../utils/extractNames.js';

export default class BlockStatement extends Node {
	bind () {
		for ( const node of this.body ) {
			node.bind( this.scope );
		}
	}

	createScope ( parent ) {
		this.parentIsFunction = /Function/.test( this.parent.type );
		this.isFunctionBlock = this.parentIsFunction || this.parent.type === 'Module';

		this.scope = new Scope({
			isBlockScope: !this.isFunctionBlock,
			isLexicalBoundary: this.isFunctionBlock && this.parent.type !== 'ArrowFunctionExpression',
			parent: parent || this.parent.findScope( false ), // TODO always supply parent
			owner: this // TODO is this used anywhere?
		});

		const params = this.parent.params || ( this.parent.type === 'CatchClause' && [ this.parent.param ] );

		if ( params && params.length ) {
			params.forEach( node => {
				extractNames( node ).forEach( name => {
					this.scope.addDeclaration( name, node, false, true );
				});
			});
		}
	}

	findScope ( functionScope ) {
		return functionScope && !this.isFunctionBlock ? this.parent.findScope( functionScope ) : this.scope;
	}

	hasEffects () {
		for ( const node of this.body ) {
			if ( node.hasEffects( this.scope ) ) return true;
		}
	}

	initialise () {
		if ( !this.scope ) this.createScope(); // scope can be created early in some cases, e.g for (let i... )

		let lastNode;
		for ( const node of this.body ) {
			node.initialise( this.scope );

			if ( lastNode ) lastNode.next = node.start;
			lastNode = node;
		}
	}

	render ( code, es ) {
		for ( const node of this.body ) {
			node.render( code, es );
		}
	}

	run () {
		if ( this.ran ) return;
		this.ran = true;

		for ( const node of this.body ) {
			// TODO only include non-top-level statements if necessary
			node.run( this.scope );
		}
	}
}

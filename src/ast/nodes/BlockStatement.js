import Statement from './shared/Statement.js';
import Scope from '../scopes/Scope.js';
import extractNames from '../utils/extractNames.js';

export default class BlockStatement extends Statement {
	bind () {
		for ( const node of this.body ) {
			node.bind( this.scope );
		}
	}

	createScope ( parent ) {
		this.parentIsFunction = /Function/.test( this.parent.type );
		this.isFunctionBlock = this.parentIsFunction || this.parent.type === 'Module';

		this.scope = new Scope({
			parent,
			isBlockScope: !this.isFunctionBlock,
			isLexicalBoundary: this.isFunctionBlock && this.parent.type !== 'ArrowFunctionExpression',
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

	initialise ( scope ) {
		if ( !this.scope ) this.createScope( scope ); // scope can be created early in some cases, e.g for (let i... )

		let lastNode;
		for ( const node of this.body ) {
			node.initialise( this.scope );

			if ( lastNode ) lastNode.next = node.start;
			lastNode = node;
		}
	}

	render ( code, es ) {
		if (this.body.length) {
			for ( const node of this.body ) {
				node.render( code, es );
			}
		} else {
			Statement.prototype.render.call(this, code, es);
		}
	}
}

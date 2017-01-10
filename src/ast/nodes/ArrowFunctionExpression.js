import Node from '../Node.js';
import Scope from '../scopes/Scope.js';
import extractNames from '../utils/extractNames.js';

export default class ArrowFunctionExpression extends Node {
	bind ( scope ) {
		super.bind( this.scope || scope );
	}

	call ( context, args ) {
		// TODO account for `this` and `arguments`
		if ( this.isCalling ) return; // recursive functions
		this.isCalling = true;

		this.body.scope.initialise();

		args.forEach( ( arg, i ) => {
			const param = this.params[i];

			if ( param.type !== 'Identifier' ) {
				throw new Error( 'TODO desctructuring' );
			}

			throw new Error( 'TODO setValue' );
		});

		for ( const node of this.body.body ) {
			node.run();
		}

		this.isCalling = false;
	}

	findScope ( functionScope ) {
		return this.scope || this.parent.findScope( functionScope );
	}

	hasEffects () {
		return false;
	}

	initialise ( scope ) {
		if ( this.body.type === 'BlockStatement' ) {
			this.body.createScope( scope );
			this.scope = this.body.scope;
		} else {
			this.scope = new Scope({
				parent: scope,
				isBlockScope: false,
				isLexicalBoundary: false
			});

			for ( const param of this.params ) {
				for ( const name of extractNames( param ) ) {
					this.scope.addDeclaration( name, null, null, true ); // TODO ugh
				}
			}
		}

		this.returnStatements = [];

		super.initialise( this.scope );
	}

	markReturnStatements () {
		// TODO implicit returns
		this.returnStatements.forEach( statement => statement.mark() );
	}
}

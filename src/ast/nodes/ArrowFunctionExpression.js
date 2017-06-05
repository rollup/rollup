import Node from '../Node.js';
import Scope from '../scopes/Scope.js';
import { FUNCTION } from '../values.js';
import extractNames from '../utils/extractNames.js';

export default class ArrowFunctionExpression extends Node {
	bind ( scope ) {
		super.bind( this.scope || scope );
	}

	findScope ( functionScope ) {
		return this.scope || this.parent.findScope( functionScope );
	}

	gatherPossibleValues ( values ) {
		values.add( FUNCTION );
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

		super.initialise( this.scope );
	}
}

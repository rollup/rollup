import Node from '../Node.js';
import Scope from '../scopes/Scope.js';
import extractNames from '../utils/extractNames.js';
import FunctionValue from './shared/FunctionValue.js';

export default class ArrowFunctionExpression extends Node {
	bind ( scope ) {
		super.bind( this.scope || scope );
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

	run () {
		return new FunctionValue( this );
	}
}

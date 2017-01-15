import Statement from './shared/Statement.js';
import assignTo from './shared/assignTo.js';
import Scope from '../scopes/Scope.js';
import { unknown } from '../values.js';

export default class ForOfStatement extends Statement {
	initialise ( scope ) {
		if ( this.body.type === 'BlockStatement' ) {
			this.body.createScope( scope );
			this.scope = this.body.scope;
		} else {
			this.scope = new Scope({
				parent: scope,
				isBlockScope: true,
				isLexicalBoundary: false
			});
		}

		super.initialise( this.scope );
		assignTo( this.left, this.scope, unknown );
	}

	run () {
		if ( this.left.type === 'VariableDeclaration' ) {
			const declarator = this.left.declarations[0];
			if ( declarator.id.type !== 'Identifier' ) {
				throw new Error( 'TODO destructuring' );
			}

			this.scope.setValue( declarator.id.name, unknown );
		}

		else if ( this.left.type === 'Identifier' ) {
			this.scope.parent.setValue( this.left.name, unknown );
		}

		else {
			throw new Error( 'TODO destructuring and member expressions' );
		}

		this.right.run();
		this.body.run();
	}
}

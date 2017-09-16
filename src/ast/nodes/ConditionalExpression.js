import Node from '../Node.js';
import { UNKNOWN_VALUE } from '../values.js';

export default class ConditionalExpression extends Node {
	initialiseChildren ( parentScope ) {
		if ( this.module.bundle.treeshake ) {
			this.testValue = this.test.getValue();

			if ( this.testValue === UNKNOWN_VALUE ) {
				super.initialiseChildren( parentScope );
			} else if ( this.testValue ) {
				this.consequent.initialise( this.scope );
				this.alternate = null;
			} else if ( this.alternate ) {
				this.alternate.initialise( this.scope );
				this.consequent = null;
			}
		} else {
			super.initialiseChildren( parentScope );
		}
	}

	getValue () {
		const testValue = this.test.getValue();
		if ( testValue === UNKNOWN_VALUE ) return UNKNOWN_VALUE;

		return testValue ? this.consequent.getValue() : this.alternate.getValue();
	}

	render ( code, es ) {
		if ( !this.module.bundle.treeshake ) {
			super.render( code, es );
		}

		else {
			if ( this.testValue === UNKNOWN_VALUE ) {
				super.render( code, es );
			}

			else if ( this.testValue ) {
				code.remove( this.start, this.consequent.start );
				code.remove( this.consequent.end, this.end );
				if ( this.consequent.type === 'SequenceExpression' ) {
					code.prependRight( this.consequent.start, '(' );
					code.appendLeft( this.consequent.end, ')' );
				}
				this.consequent.render( code, es );
			} else {
				code.remove( this.start, this.alternate.start );
				code.remove( this.alternate.end, this.end );
				if ( this.alternate.type === 'SequenceExpression' ) {
					code.prependRight( this.alternate.start, '(' );
					code.appendLeft( this.alternate.end, ')' );
				}
				this.alternate.render( code, es );
			}
		}
	}
}

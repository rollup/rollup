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

	hasEffects ( options ) {
		return (
			this.included
			|| this.test.hasEffects( options )
			|| (this.testValue === UNKNOWN_VALUE && (this.consequent.hasEffects( options ) || this.alternate.hasEffects( options )))
			|| (this.testValue ? this.consequent.hasEffects( options ) : this.alternate.hasEffects( options ))
		);
	}

	render ( code, es ) {
		if ( !this.module.bundle.treeshake ) {
			super.render( code, es );
		}

		else {
			if ( this.testValue === UNKNOWN_VALUE ) {
				super.render( code, es );
			}

			else {
				const branchToRetain = this.testValue ? this.consequent : this.alternate;

				code.remove( this.start, branchToRetain.start );
				code.remove( branchToRetain.end, this.end );
				if ( branchToRetain.type === 'SequenceExpression' ) {
					code.prependRight( branchToRetain.start, '(' );
					code.appendLeft( branchToRetain.end, ')' );
				}
				branchToRetain.render( code, es );
			}
		}
	}
}

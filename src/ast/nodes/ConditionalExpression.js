import Node from '../Node.js';
import { UNKNOWN } from '../values.js';

export default class ConditionalExpression extends Node {
	initialise ( scope ) {
		if ( this.module.bundle.treeshake ) {
			const testValue = this.test.getValue();

			if ( testValue === UNKNOWN	 ) {
				super.initialise( scope );
			}

			else if ( testValue ) {
				this.consequent.initialise( scope );
				this.alternate = null;
			} else if ( this.alternate ) {
				this.alternate.initialise( scope );
				this.consequent = null;
			}
		}

		else {
			super.initialise( scope );
		}
	}

	gatherPossibleValues ( values ) {
		const testValue = this.test.getValue();

		if ( testValue === UNKNOWN ) {
			values.add( this.consequent ).add( this.alternate );
		} else {
			values.add( testValue ? this.consequent : this.alternate );
		}
	}

	getValue () {
		const testValue = this.test.getValue();
		if ( testValue === UNKNOWN ) return UNKNOWN;

		return testValue ? this.consequent.getValue() : this.alternate.getValue();
	}

	render ( code, es ) {
		if ( !this.module.bundle.treeshake ) {
			super.render( code, es );
		}

		else {
			const testValue = this.test.getValue();

			if ( testValue === UNKNOWN ) {
				super.render( code, es );
			}

			else if ( testValue ) {
				code.remove( this.start, this.consequent.start );
				code.remove( this.consequent.end, this.end );
			} else {
				code.remove( this.start, this.alternate.start );
				code.remove( this.alternate.end, this.end );
			}
		}
	}
}

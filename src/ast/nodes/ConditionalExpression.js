import Node from '../Node.js';
import { unknown } from '../values.js';

export default class ConditionalExpression extends Node {
	initialise ( scope ) {
		if ( this.module.bundle.treeshake ) {
			this.testValue = this.test.run();

			if ( this.testValue === unknown	 ) {
				super.initialise( scope );
			}

			else if ( this.testValue ) {
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
		const testValue = this.test.run();

		if ( testValue === unknown ) {
			values.add( this.consequent ).add( this.alternate );
		} else {
			values.add( testValue ? this.consequent : this.alternate );
		}
	}

	render ( code, es ) {
		if ( !this.module.bundle.treeshake ) {
			super.render( code, es );
		}

		else {
			if ( this.testValue === unknown ) {
				super.render( code, es );
			}

			else if ( this.testValue ) {
				code.remove( this.start, this.consequent.start );
				code.remove( this.consequent.end, this.end );
				this.consequent.render( code, es );
			} else {
				code.remove( this.start, this.alternate.start );
				code.remove( this.alternate.end, this.end );
				this.alternate.render( code, es );
			}
		}
	}

	run () {
		const testValue = this.test.run();
		if ( testValue === unknown ) return unknown;

		return testValue ? this.consequent.run() : this.alternate.run();
	}
}

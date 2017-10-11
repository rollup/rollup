import Node from '../Node.js';
import { UNKNOWN_VALUE } from '../values.js';

export default class ConditionalExpression extends Node {
	bindAssignmentAtPath ( path, expression ) {
		if ( this.testValue === UNKNOWN_VALUE ) {
			this.consequent.bindAssignmentAtPath( path, expression );
			this.alternate.bindAssignmentAtPath( path, expression );
		} else {
			this.testValue
				? this.consequent.bindAssignmentAtPath( path, expression )
				: this.alternate.bindAssignmentAtPath( path, expression );
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

	hasEffectsWhenAccessedAtPath ( path, options ) {
		return (
			this.testValue === UNKNOWN_VALUE && (
				this.consequent.hasEffectsWhenAccessedAtPath( path, options )
				|| this.alternate.hasEffectsWhenAccessedAtPath( path, options )
			)
		) || (
			this.testValue
				? this.consequent.hasEffectsWhenAccessedAtPath( path, options )
				: this.alternate.hasEffectsWhenAccessedAtPath( path, options )
		);
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return (
			this.testValue === UNKNOWN_VALUE && (
				this.consequent.hasEffectsWhenAssignedAtPath( path, options )
				|| this.alternate.hasEffectsWhenAssignedAtPath( path, options )
			)
		) || (
			this.testValue
				? this.consequent.hasEffectsWhenAssignedAtPath( path, options )
				: this.alternate.hasEffectsWhenAssignedAtPath( path, options )
		);
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		return (
			this.testValue === UNKNOWN_VALUE && (
				this.consequent.hasEffectsWhenCalledAtPath( path, callOptions, options )
				|| this.alternate.hasEffectsWhenCalledAtPath( path, callOptions, options )
			)
		) || (
			this.testValue
				? this.consequent.hasEffectsWhenCalledAtPath( path, callOptions, options )
				: this.alternate.hasEffectsWhenCalledAtPath( path, callOptions, options )
		);
	}

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
					code.prependLeft( branchToRetain.start, '(' );
					code.appendRight( branchToRetain.end, ')' );
				}
				branchToRetain.render( code, es );
			}
		}
	}
}

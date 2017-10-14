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
			|| this._someRelevantBranch( node => node.hasEffects( options ) )
		);
	}

	hasEffectsWhenAccessedAtPath ( path, options ) {
		return this._someRelevantBranch( node =>
			node.hasEffectsWhenAccessedAtPath( path, options ) );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return this._someRelevantBranch( node =>
			node.hasEffectsWhenAssignedAtPath( path, options ) );
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		return this._someRelevantBranch( node =>
			node.hasEffectsWhenCalledAtPath( path, callOptions, options ) );
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

	someReturnExpressionWhenCalledAtPath ( path, callOptions, predicateFunction, options ) {
		return this._someRelevantBranch( node =>
			node.someReturnExpressionWhenCalledAtPath( path, callOptions, predicateFunction, options ) );
	}

	_someRelevantBranch ( predicateFunction ) {
		return this.testValue === UNKNOWN_VALUE
			? predicateFunction( this.consequent ) || predicateFunction( this.alternate )
			: this.testValue
				? predicateFunction( this.consequent )
				: predicateFunction( this.alternate );
	}
}

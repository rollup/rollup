import Node from '../../Node.js';
import FunctionScope from '../../scopes/FunctionScope';
import { UNKNOWN_ASSIGNMENT, UNKNOWN_OBJECT_LITERAL } from '../../values';

export default class FunctionNode extends Node {
	bindCall ( { withNew } ) {
		const thisVariable = this.scope.findVariable( 'this' );

		if ( withNew ) {
			thisVariable.assignExpressionAtPath( [], UNKNOWN_OBJECT_LITERAL );
		} else {
			thisVariable.assignExpressionAtPath( [], UNKNOWN_ASSIGNMENT );
		}
	}

	hasEffects ( options ) {
		return this.included || (this.id && this.id.hasEffects( options ));
	}

	hasEffectsAsExpressionStatement ( options ) {
		return this.hasEffects( options );
	}

	hasEffectsWhenCalled ( options ) {
		const innerOptions = options.setIgnoreSafeThisMutations();
		return this.params.some( param => param.hasEffects( innerOptions ) )
			|| this.body.hasEffects( innerOptions );
	}

	hasEffectsWhenMutatedAtPath ( path ) {
		return this.included || path.length > 0;
	}

	initialiseScope ( parentScope ) {
		this.scope = new FunctionScope( { parent: parentScope } );
	}
}

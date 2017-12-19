import LocalVariable from './LocalVariable';
import { UNDEFINED_ASSIGNMENT, UNKNOWN_ASSIGNMENT } from '../values';

const getParameterVariable = ( path, options ) =>
	(path[ 0 ] < options.getArgumentsVariables().length && options.getArgumentsVariables()[ path[ 0 ] ] )
	|| UNDEFINED_ASSIGNMENT;

export default class ArgumentsVariable extends LocalVariable {
	constructor ( parameters ) {
		super( 'arguments', null, UNKNOWN_ASSIGNMENT );
		this._parameters = parameters;
	}

	reassignPath ( path, options ) {
		if ( path.length > 0 ) {
			if ( path[ 0 ] >= 0 && this._parameters[ path[ 0 ] ] ) {
				this._parameters[ path[ 0 ] ].reassignPath( path.slice( 1 ), options );
			}
		}
	}

	hasEffectsWhenAccessedAtPath ( path, options ) {
		return path.length > 1
			&& getParameterVariable( path, options )
				.hasEffectsWhenAccessedAtPath( path.slice( 1 ), options );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return path.length === 0
			|| this.included
			|| getParameterVariable( path, options )
				.hasEffectsWhenAssignedAtPath( path.slice( 1 ), options );
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		if ( path.length === 0 ) {
			return true;
		}
		return getParameterVariable( path, options )
			.hasEffectsWhenCalledAtPath( path.slice( 1 ), callOptions, options );
	}

	someReturnExpressionWhenCalledAtPath ( path, callOptions, predicateFunction, options ) {
		if ( path.length === 0 ) {
			return true;
		}
		return getParameterVariable( path, options )
			.someReturnExpressionWhenCalledAtPath( path.slice( 1 ), callOptions, predicateFunction, options );
	}
}

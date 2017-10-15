import LocalVariable from './LocalVariable';
import ReplaceableInitStructuredAssignmentTracker from './ReplaceableInitStructuredAssignmentTracker';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class ParameterVariable extends LocalVariable {
	constructor ( identifier ) {
		super( identifier.name, identifier, null );
		this.assignedExpressions = new ReplaceableInitStructuredAssignmentTracker( UNKNOWN_ASSIGNMENT );
	}

	getName () {
		return this.name;
	}

	hasEffectsWhenAccessedAtPath ( path, options ) {
		this._updateInit( options );
		return super.hasEffectsWhenAccessedAtPath( path, options );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		this._updateInit( options );
		return super.hasEffectsWhenAssignedAtPath( path, options );
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		this._updateInit( options );
		return super.hasEffectsWhenCalledAtPath( path, callOptions, options );
	}

	_updateInit ( options ) {
		this.assignedExpressions.setInit( options.getReplacedVariableInit( this ) || UNKNOWN_ASSIGNMENT );
	}
}

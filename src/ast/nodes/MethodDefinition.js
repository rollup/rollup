import Node from '../Node';

export default class MethodDefinition extends Node {
	bindCallAtPath ( path, callOptions ) {
		this.value.bindCallAtPath( path, callOptions );
	}

	hasEffects ( options ) {
		return this.key.hasEffects( options );
	}

	hasEffectsWhenCalledAtPath ( path, options ) {
		if ( path.length > 0 ) {
			return true;
		}
		return this.value.hasEffectsWhenCalledAtPath( [], options );
	}
}

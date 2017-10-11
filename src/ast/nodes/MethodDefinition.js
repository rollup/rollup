import Node from '../Node';

export default class MethodDefinition extends Node {
	hasEffects ( options ) {
		return this.key.hasEffects( options );
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		if ( path.length > 0 ) {
			return true;
		}
		return this.value.hasEffectsWhenCalledAtPath( [], callOptions, options );
	}
}

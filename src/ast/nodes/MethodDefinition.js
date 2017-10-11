import Node from '../Node';

export default class MethodDefinition extends Node {
	hasEffects ( options ) {
		return this.key.hasEffects( options );
	}

	hasEffectsWhenCalledAtPath ( path, options, callOptions ) {
		if ( path.length > 0 ) {
			return true;
		}
		return this.value.hasEffectsWhenCalledAtPath( [], options, callOptions );
	}
}

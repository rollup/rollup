import Node from '../Node';

export default class ClassBody extends Node {
	bindCallAtPath ( path, callOptions ) {
		if ( this.classConstructor && path.length === 0 ) {
			this.classConstructor.bindCallAtPath( [], callOptions );
		}
	}

	hasEffectsWhenCalledAtPath ( path, options ) {
		if ( path.length > 0 ) {
			return true;
		}
		if ( this.classConstructor ) {
			return this.classConstructor.hasEffectsWhenCalledAtPath( [], options );
		}
		return false;
	}

	initialiseNode () {
		this.classConstructor = this.body.find( method => method.kind === 'constructor' );
	}
}

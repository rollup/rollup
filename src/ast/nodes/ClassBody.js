import Node from '../Node';

export default class ClassBody extends Node {
	bindCallAtPath ( path, callOptions ) {
		if ( path.length === 0 && this.classConstructor ) {
			this.classConstructor.bindCallAtPath( path, callOptions );
		}
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		if ( path.length > 0 ) {
			return true;
		}
		if ( this.classConstructor ) {
			return this.classConstructor.hasEffectsWhenCalledAtPath( [], callOptions, options );
		}
		return false;
	}

	initialiseNode () {
		this.classConstructor = this.body.find( method => method.kind === 'constructor' );
	}
}

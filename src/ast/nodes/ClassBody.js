import Node from '../Node';

export default class ClassBody extends Node {
	bindCallAtPath ( path, callOptions, options ) {
		path.length === 0
		&& this.classConstructor
		&& this.classConstructor.bindCallAtPath( path, callOptions, options );
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		if ( path.length > 0 ) {
			return true;
		}
		return this.classConstructor
			&& this.classConstructor.hasEffectsWhenCalledAtPath( [], callOptions, options );
	}

	initialiseNode () {
		this.classConstructor = this.body.find( method => method.kind === 'constructor' );
	}
}

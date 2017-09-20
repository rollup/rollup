import Node from '../Node.js';

export default class ObjectExpression extends Node {
	hasEffectsWhenAssignedAtPath ( path, options ) {
		if ( path.length <= 1 ) {
			return false;
		}
		const accessedProperty = this.properties.find( property => !property.computed && property.key.name === path[ 0 ] );

		return !accessedProperty
			|| accessedProperty.hasEffectsWhenAssignedAtPath( path.slice( 1 ), options );
	}

	hasEffectsWhenMutatedAtPath ( path ) {
		return path.length > 1;
	}
}

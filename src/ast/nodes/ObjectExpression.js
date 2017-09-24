import Node from '../Node.js';

export default class ObjectExpression extends Node {
	bindAssignmentAtPath ( path, expression ) {
		if ( path.length === 0 ) {
			return;
		}
		const accessedProperty = this.properties.find( property => !property.computed && property.key.name === path[ 0 ] );
		if ( accessedProperty ) {
			accessedProperty.bindAssignmentAtPath( path.slice( 1 ), expression );
		}
	}

	bindCallAtPath ( path, callOptions ) {
		if ( path.length === 0 ) {
			return;
		}
		const accessedProperty = this.properties.find( property => !property.computed && property.key.name === path[ 0 ] );

		if ( accessedProperty ) {
			accessedProperty.bindCallAtPath( path.slice( 1 ), callOptions );
		}
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		if ( path.length <= 1 ) {
			return false;
		}
		const accessedProperty = this.properties.find( property => !property.computed && property.key.name === path[ 0 ] );

		return !accessedProperty
			|| accessedProperty.hasEffectsWhenAssignedAtPath( path.slice( 1 ), options );
	}

	hasEffectsWhenCalledAtPath ( path, options ) {
		if ( path.length === 0 ) {
			return true;
		}
		const accessedProperty = this.properties.find( property => !property.computed && property.key.name === path[ 0 ] );

		return !accessedProperty
			|| accessedProperty.hasEffectsWhenCalledAtPath( path.slice( 1 ), options );
	}

	hasEffectsWhenMutatedAtPath ( path ) {
		return path.length > 1;
	}
}

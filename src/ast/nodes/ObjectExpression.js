import Node from '../Node.js';

export default class ObjectExpression extends Node {
	bindAssignmentAtPath ( path, expression ) {
		if ( path.length === 0 ) {
			return;
		}
		this._getPossiblePropertiesWithName( path[ 0 ] ).properties.forEach( property =>
			property.bindAssignmentAtPath( path.slice( 1 ), expression ) );
	}

	bindCallAtPath ( path, callOptions ) {
		if ( path.length === 0 ) {
			return;
		}
		this._getPossiblePropertiesWithName( path[ 0 ] ).properties.forEach( property =>
			property.bindCallAtPath( path.slice( 1 ), callOptions ) );
	}

	_getPossiblePropertiesWithName ( name ) {
		const properties = [];
		let hasComputed = false;

		for ( let index = this.properties.length - 1; index >= 0; index-- ) {
			const property = this.properties[ index ];
			if ( property.computed ) {
				if ( !hasComputed ) {
					properties.push( property );
					hasComputed = true;
				}
			} else if ( property.key.name === name ) {
				properties.push( property );
				break;
			}
		}
		return { properties, onlyComputed: properties.length === 0 || (hasComputed && properties.length === 1) };
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		if ( path.length <= 1 ) {
			return false;
		}
		const { properties, onlyComputed } = this._getPossiblePropertiesWithName( path[ 0 ] );

		return onlyComputed || properties.some( property =>
			property.hasEffectsWhenAssignedAtPath( path.slice( 1 ), options ) );
	}

	hasEffectsWhenCalledAtPath ( path, options ) {
		if ( path.length === 0 ) {
			return true;
		}
		const { properties, onlyComputed } = this._getPossiblePropertiesWithName( path[ 0 ] );

		return onlyComputed || properties.some( property =>
			property.hasEffectsWhenCalledAtPath( path.slice( 1 ), options ) );
	}

	hasEffectsWhenMutatedAtPath ( path, options ) {
		if ( path.length === 0 ) {
			return false;
		}
		const { properties, onlyComputed } = this._getPossiblePropertiesWithName( path[ 0 ] );

		return onlyComputed || properties.some( property =>
			property.hasEffectsWhenMutatedAtPath( path.slice( 1 ), options ) );
	}
}

import Node from '../Node.js';
import { blank } from '../../utils/object.js';
import { OBJECT, unknown } from '../values.js';

class ObjectValue {
	constructor ( node ) {
		this.node = node;
		this.values = blank();

		node.properties.forEach( prop => {
			let key = prop.key;

			if ( prop.computed ) {
				key = key.run();

				if ( key === unknown ) {
					throw new Error( 'TODO unknown computed props' );
				}
			}

			this.values[ key ] = prop.value.run();
		});
	}

	getProperty ( name ) {
		return this.values[ name ];
	}

	setProperty ( name, value ) {
		this.values[ name ] = value;
	}
}

export default class ObjectExpression extends Node {
	gatherPossibleValues ( values ) {
		values.add( OBJECT );
	}

	getProperty ( name ) {
		// TODO handle unknowns
		for ( const prop of this.properties ) {
			// TODO handle computed properties
			if ( prop.key.name === name && !prop.computed ) {
				return prop.value;
			}
		}
	}

	run () {
		return new ObjectValue( this );
	}
}

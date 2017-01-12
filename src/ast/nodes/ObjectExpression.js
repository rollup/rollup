import Node from '../Node.js';
import { OBJECT } from '../values.js';

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
}

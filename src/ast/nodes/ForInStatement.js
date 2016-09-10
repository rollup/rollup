import Node from '../Node.js';
import { STRING } from '../values.js';

export default class ForInStatement extends Node {
	initialise ( scope ) {
		super.initialise( scope );

		// special case
		if ( this.left.type === 'VariableDeclaration' ) {
			for ( const proxy of this.left.declarations[0].proxies.values() ) {
				proxy.possibleValues.add( STRING );
			}
		}
	}
}

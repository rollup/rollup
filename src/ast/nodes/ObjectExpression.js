import Node from '../Node.js';
import { OBJECT } from '../values.js';

export default class ObjectExpression extends Node {
	gatherPossibleValues ( values ) {
		values.add( OBJECT );
	}
}

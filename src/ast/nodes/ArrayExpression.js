import Node from '../Node.js';
import { ARRAY } from '../values.js';

export default class ArrayExpression extends Node {
	gatherPossibleValues ( values ) {
		values.add( ARRAY );
	}
}

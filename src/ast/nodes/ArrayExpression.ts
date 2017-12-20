import Node from '../Node';
import Expression from './Expression';
import SpreadElement from './SpreadElement';

export default class ArrayExpression extends Node {
	type: 'ArrayExpression';
	elements: (Expression | SpreadElement | null)[]

	hasEffectsWhenAccessedAtPath (path: string[]) {
		return path.length > 1;
	}
}

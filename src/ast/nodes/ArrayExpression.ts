import Node from '../Node';
import Expression from './Expression';
import SpreadElement from './SpreadElement';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class ArrayExpression extends Node {
	type: 'ArrayExpression';
	elements: (Expression | SpreadElement | null)[]

	hasEffectsWhenAccessedAtPath (path: string[], _options: ExecutionPathOptions) {
		return path.length > 1;
	}
}

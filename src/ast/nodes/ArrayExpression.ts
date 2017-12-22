import Node from '../Node';
import Expression from './Expression';
import SpreadElement from './SpreadElement';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ObjectPath } from '../variables/VariableReassignmentTracker';

export default class ArrayExpression extends Node {
	type: 'ArrayExpression';
	elements: (Expression | SpreadElement | null)[];

	hasEffectsWhenAccessedAtPath (path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 1;
	}
}

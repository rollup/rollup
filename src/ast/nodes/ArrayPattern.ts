import Node from '../Node';
import { UNKNOWN_ASSIGNMENT } from '../values';
import Scope from '../Scopes/Scope';
import Identifier from './Identifier';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class ArrayPattern extends Node {
	type: 'ArrayPattern';

	reassignPath (path: string[], options: ExecutionPathOptions) {
		path.length === 0 &&
			this.eachChild(child => child.reassignPath([], options));
	}

	hasEffectsWhenAssignedAtPath (path: string[], options: ExecutionPathOptions) {
		return (
			path.length > 0 ||
			this.someChild(child => child.hasEffectsWhenAssignedAtPath([], options))
		);
	}

	initialiseAndDeclare (parentScope: Scope, kind: string, init) {
		this.initialiseScope(parentScope);
		this.eachChild((child: Identifier | ArrayPattern) =>
			child.initialiseAndDeclare(parentScope, kind, UNKNOWN_ASSIGNMENT)
		);
	}
}

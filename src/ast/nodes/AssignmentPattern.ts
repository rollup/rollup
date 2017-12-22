import Node from '../Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Pattern from './Pattern';
import Expression from './Expression';
import Scope from '../Scopes/Scope';
import { UnknownAssignment } from '../values';
import Declaration from './Declaration';

export default class AssignmentPattern extends Node {
	type: 'AssignmentPattern';
	left: Pattern;
	right: Expression;

	bindNode () {
		this.left.reassignPath([], ExecutionPathOptions.create());
	}

	reassignPath (path: string[], options: ExecutionPathOptions) {
		path.length === 0 && this.left.reassignPath(path, options);
	}

	hasEffectsWhenAssignedAtPath (path: string[], options: ExecutionPathOptions): boolean {
		return (
			path.length > 0 || this.left.hasEffectsWhenAssignedAtPath([], options)
		);
	}

	initialiseAndDeclare (parentScope: Scope, kind: string, init: Declaration | Expression | UnknownAssignment | null) {
		this.initialiseScope(parentScope);
		this.right.initialise(parentScope);
		this.left.initialiseAndDeclare(parentScope, kind, init);
	}
}

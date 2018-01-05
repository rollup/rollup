import AssignmentProperty from './AssignmentProperty';
import Scope from '../scopes/Scope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { Expression } from './shared/Expression';
import { BasicPatternNode } from './shared/Pattern';

export default class ObjectPattern extends BasicPatternNode {
	type: 'ObjectPattern';
	properties: AssignmentProperty[];

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		path.length === 0 &&
		this.properties.forEach(child => child.reassignPath(path, options));
	}

	hasEffectsWhenAssignedAtPath (path: ObjectPath, options: ExecutionPathOptions) {
		return (
			path.length > 0 ||
			this.someChild(child => child.hasEffectsWhenAssignedAtPath([], options))
		);
	}

	initialiseAndDeclare (parentScope: Scope, kind: string, init: Expression | null) {
		this.initialiseScope(parentScope);
		this.properties.forEach(child =>
			child.initialiseAndDeclare(parentScope, kind, init)
		);
	}
}

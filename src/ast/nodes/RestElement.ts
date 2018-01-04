import { BasicNode } from './shared/Node';
import { UNKNOWN_EXPRESSION } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { Pattern, PatternNode } from './shared/Pattern';
import { Expression } from './shared/Expression';

export default class RestElement extends BasicNode implements Pattern {
	type: 'RestElement';
	argument: PatternNode;

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		path.length === 0 && this.argument.reassignPath([], options);
	}

	hasEffectsWhenAssignedAtPath (path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length > 0 || this.argument.hasEffectsWhenAssignedAtPath([], options)
		);
	}

	initialiseAndDeclare (
		parentScope: Scope, kind: string, _init: Expression | null) {
		this.initialiseScope(parentScope);
		this.argument.initialiseAndDeclare(parentScope, kind, UNKNOWN_EXPRESSION);
	}
}

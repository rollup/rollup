import { UNKNOWN_EXPRESSION } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { GenericPatternNode, PatternNode } from './shared/Pattern';
import { ExpressionEntity } from './shared/Expression';

export default class RestElement extends GenericPatternNode {
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
		parentScope: Scope, kind: string, _init: ExpressionEntity | null) {
		this.initialiseScope(parentScope);
		this.argument.initialiseAndDeclare(parentScope, kind, UNKNOWN_EXPRESSION);
	}
}

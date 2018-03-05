import AssignmentProperty from './AssignmentProperty';
import Scope from '../scopes/Scope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ExpressionEntity } from './shared/Expression';
import { PatternNode } from './shared/Pattern';
import { NodeBase } from './shared/Node';
import { NodeType } from './NodeType';
import { ObjectPath } from '../values';

export default class ObjectPattern extends NodeBase implements PatternNode {
	type: NodeType.ObjectPattern;
	properties: AssignmentProperty[];

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		path.length === 0 &&
		this.properties.forEach(child => child.reassignPath(path, options));
	}

	hasEffectsWhenAssignedAtPath (path: ObjectPath, options: ExecutionPathOptions) {
		return (
			path.length > 0 ||
			this.properties.some(child => child.hasEffectsWhenAssignedAtPath([], options))
		);
	}

	initialiseAndDeclare (parentScope: Scope, kind: string, init: ExpressionEntity | null) {
		this.initialiseScope(parentScope);
		this.properties.forEach(child =>
			child.initialiseAndDeclare(parentScope, kind, init)
		);
	}
}

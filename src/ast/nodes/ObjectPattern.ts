import AssignmentProperty from './AssignmentProperty';
import Scope from '../scopes/Scope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ExpressionEntity } from './shared/Expression';
import { PatternNode } from './shared/Pattern';
import { NodeBase } from './shared/Node';
import { NodeType } from './NodeType';
import { ObjectPath } from '../values';
import Import from './Import';

export default class ObjectPattern extends NodeBase implements PatternNode {
	type: NodeType.ObjectPattern;
	properties: AssignmentProperty[];

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length === 0) {
			for (const property of this.properties) {
				property.reassignPath(path, options);
			}
		}
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		return (
			path.length > 0 ||
			this.properties.some(child => child.hasEffectsWhenAssignedAtPath([], options))
		);
	}

	initialiseAndDeclare(
		parentScope: Scope,
		dynamicImportReturnList: Import[],
		kind: string,
		init: ExpressionEntity | null
	) {
		this.scope = parentScope;
		for (const property of this.properties) {
			property.initialiseAndDeclare(parentScope, dynamicImportReturnList, kind, init);
		}
	}
}

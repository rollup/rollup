import ExecutionPathOptions from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';
import { PatternNode } from './shared/Pattern';
import { ExpressionEntity } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';
import { NodeType } from './NodeType';
import { ObjectPath } from '../values';
import Import from './Import';

export default class AssignmentPattern extends NodeBase implements PatternNode {
	type: NodeType.AssignmentPattern;
	left: PatternNode;
	right: ExpressionNode;

	bindNode() {
		this.left.reassignPath([], ExecutionPathOptions.create());
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		path.length === 0 && this.left.reassignPath(path, options);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		return path.length > 0 || this.left.hasEffectsWhenAssignedAtPath([], options);
	}

	initialiseAndDeclare(
		parentScope: Scope,
		dynamicImportReturnList: Import[],
		kind: string,
		init: ExpressionEntity | null
	) {
		this.initialiseScope(parentScope);
		this.right.initialise(parentScope, dynamicImportReturnList);
		this.left.initialiseAndDeclare(parentScope, dynamicImportReturnList, kind, init);
	}
}

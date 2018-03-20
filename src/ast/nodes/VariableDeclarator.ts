import { ExpressionNode, NodeBase } from './shared/Node';
import Scope from '../scopes/Scope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { PatternNode } from './shared/Pattern';
import { NodeType } from './NodeType';
import { ObjectPath } from '../values';
import Import from './Import';

export default class VariableDeclarator extends NodeBase {
	type: NodeType.VariableDeclarator;
	id: PatternNode;
	init: ExpressionNode | null;

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		this.id.reassignPath(path, options);
	}

	initialiseDeclarator(parentScope: Scope, dynamicImportReturnList: Import[], kind: string) {
		this.initialiseScope(parentScope);
		this.init && this.init.initialise(this.scope, dynamicImportReturnList);
		this.id.initialiseAndDeclare(this.scope, dynamicImportReturnList, kind, this.init);
	}
}

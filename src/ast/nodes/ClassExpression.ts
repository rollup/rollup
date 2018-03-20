import ClassNode from './shared/ClassNode';
import Scope from '../scopes/Scope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { NodeType } from './NodeType';
import { ObjectPath } from '../values';
import Import from './Import';

export default class ClassExpression extends ClassNode {
	type: NodeType.ClassExpression;

	initialiseChildren(parentScope: Scope, dynamicImportReturnList: Import[]) {
		this.id && this.id.initialiseAndDeclare(this.scope, dynamicImportReturnList, 'class', this);
		super.initialiseChildren(parentScope, dynamicImportReturnList);
	}

	reassignPath(_path: ObjectPath, _options: ExecutionPathOptions): void {}
}

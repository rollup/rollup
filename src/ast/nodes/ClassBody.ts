import { InclusionContext } from '../ExecutionContext';
import ClassBodyScope from '../scopes/ClassBodyScope';
import Scope from '../scopes/Scope';
import MethodDefinition from './MethodDefinition';
import * as NodeType from './NodeType';
import PropertyDefinition from './PropertyDefinition';
import ClassNode from './shared/ClassNode';
import { GenericEsTreeNode, IncludeChildren, NodeBase } from './shared/Node';

export default class ClassBody extends NodeBase {
	declare body: (MethodDefinition | PropertyDefinition)[];
	declare scope: ClassBodyScope;
	declare type: NodeType.tClassBody;

	createScope(parentScope: Scope): void {
		this.scope = new ClassBodyScope(parentScope, this.parent as ClassNode, this.context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		this.context.includeVariableInModule(this.scope.thisVariable);
		for (const definition of this.body) {
			definition.include(context, includeChildrenRecursively);
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode): void {
		const body: NodeBase[] = (this.body = []);
		for (const definition of esTreeNode.body) {
			body.push(
				new (this.context.getNodeConstructor(definition.type))(
					definition,
					this,
					definition.static ? this.scope : this.scope.instanceScope
				)
			);
		}
		super.parseNode(esTreeNode);
	}
}

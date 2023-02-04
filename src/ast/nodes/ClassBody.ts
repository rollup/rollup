import type { InclusionContext } from '../ExecutionContext';
import ClassBodyScope from '../scopes/ClassBodyScope';
import type Scope from '../scopes/Scope';
import type MethodDefinition from './MethodDefinition';
import type * as NodeType from './NodeType';
import type PropertyDefinition from './PropertyDefinition';
import type ClassNode from './shared/ClassNode';
import { type GenericEsTreeNode, type IncludeChildren, NodeBase } from './shared/Node';

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

	protected applyDeoptimizations() {}
}

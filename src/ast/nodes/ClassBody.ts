import type { InclusionContext } from '../ExecutionContext';
import type ChildScope from '../scopes/ChildScope';
import ClassBodyScope from '../scopes/ClassBodyScope';
import { UNKNOWN_PATH } from '../utils/PathTracker';

import type MethodDefinition from './MethodDefinition';
import type * as NodeType from './NodeType';
import type PropertyDefinition from './PropertyDefinition';
import type ClassNode from './shared/ClassNode';
import {
	doNotDeoptimize,
	type GenericEsTreeNode,
	type IncludeChildren,
	NodeBase,
	onlyIncludeSelfNoDeoptimize
} from './shared/Node';
import type StaticBlock from './StaticBlock';

export default class ClassBody extends NodeBase {
	declare body: (MethodDefinition | PropertyDefinition | StaticBlock)[];
	declare scope: ClassBodyScope;
	declare type: NodeType.tClassBody;

	createScope(parentScope: ChildScope): void {
		this.scope = new ClassBodyScope(parentScope, this.parent as ClassNode);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		this.scope.context.includeVariableInModule(this.scope.thisVariable, UNKNOWN_PATH, context);
		for (const definition of this.body) {
			definition.include(context, includeChildrenRecursively);
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode): this {
		const body: NodeBase[] = (this.body = new Array(esTreeNode.body.length));
		let index = 0;
		for (const definition of esTreeNode.body) {
			body[index++] = new (this.scope.context.getNodeConstructor(definition.type))(
				this,
				definition.static ? this.scope : this.scope.instanceScope
			).parseNode(definition);
		}
		return super.parseNode(esTreeNode);
	}
}

ClassBody.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ClassBody.prototype.applyDeoptimizations = doNotDeoptimize;
